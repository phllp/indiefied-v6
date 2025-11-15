import * as FileSystem from 'expo-file-system';
import * as mime from 'react-native-mime-types';
import { supabase } from '@/services/supabase';
import { decode as atob } from 'base-64';
import { Playlist, PlaylistTrackItem, TrackWithDetails } from '@/types/database';

const PLAYLIST_BUCKET = 'playlist_covers';
const DEFAULT_USER_ID = '5e9df724-5e75-45f2-99a1-6035ce41ab35';

/** Gera um nome de arquivo a partir da URI local */
function inferFileName(uri: string) {
  const last = uri.split('/').pop() || `cover_${Date.now()}`;
  return last.includes('.') ? last : `${last}.jpg`;
}

/** Descobre o contentType (fallback para image/jpeg) */
function inferContentType(uri: string) {
  return mime.lookup(uri) || 'image/jpeg';
}

/** Lê arquivo local (file://) como ArrayBuffer */
async function readAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  // 1) tenta via fetch
  try {
    const res = await fetch(uri);
    if ('arrayBuffer' in res) {
      return await res.arrayBuffer();
    }
  } catch {
    // ignora e cai no fallback
  }

  // 2) Fallback: lê como base64 pelo FileSystem (API nova usa 'base64' string)
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/** Sobe a capa para: playlist_covers/{userId}/{fileName} e retorna a KEY */
export async function uploadPlaylistCover(userId: string, fileUri: string): Promise<string> {
  const fileName = inferFileName(fileUri);
  const objectKey = `${userId}/${fileName}`;
  const contentType = inferContentType(fileUri);

  const buffer = await readAsArrayBuffer(fileUri);

  const { error } = await supabase.storage.from(PLAYLIST_BUCKET).upload(objectKey, buffer, {
    contentType, // e.g. image/jpeg, image/png
    cacheControl: '3600',
    upsert: true,
  });

  if (error) throw error;
  return objectKey;
}

export async function createPlaylist(params: {
  name: string;
  coverFileUri?: string | null;
  userId?: string;
}) {
  const userId = params.userId ?? DEFAULT_USER_ID;

  let coverKey: string | null = null;
  if (params.coverFileUri) {
    coverKey = await uploadPlaylistCover(userId, params.coverFileUri);
  }

  const { data, error } = await supabase
    .from('playlists')
    .insert({ user_id: userId, name: params.name, cover_url: coverKey })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export function getPlaylistCoverPublicUrl(coverKey: string | null) {
  if (!coverKey) return null;
  const { data } = supabase.storage.from(PLAYLIST_BUCKET).getPublicUrl(coverKey);
  return data.publicUrl;
}

/** Lista playlists do usuário (ou de todos se quiser tirar o filtro) */
export async function listPlaylists(userId: string = DEFAULT_USER_ID): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

type AddTrackToPlaylistOpts = {
  playlistId: string;
  trackId: string;
};

export async function addTrackToPlaylist(opts: AddTrackToPlaylistOpts) {
  const { playlistId, trackId } = opts;

  // pega próxima posição
  const { data: maxRow, error: maxErr } = await supabase
    .from('playlist_items')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxErr) throw maxErr;
  const nextPos = (maxRow?.position ?? 0) + 1;

  const { error: insErr } = await supabase.from('playlist_items').insert({
    playlist_id: playlistId,
    track_id: trackId,
    position: nextPos,
  });

  if (insErr) throw insErr;
}

/**
 * Lista as músicas de uma playlist,
 * ordenadas pelas adicionadas mais recentemente.
 */
export async function listPlaylistTracks(playlistId: string): Promise<PlaylistTrackItem[]> {
  const { data, error } = await supabase
    .from('playlist_items')
    .select(
      `
      track_id,
      added_at,
      tracks (
        id,
        title,
        duration_seconds,
        remote_url,
        albums (
          id,
          title,
          cover_url
        ),
        artists (
          id,
          name
        )
      )
    `
    )
    .eq('playlist_id', playlistId)
    .order('added_at', { ascending: false });

  if (error) throw error;

  // dados brutos vindos do Supabase
  const rows = (data ?? []) as {
    track_id: string;
    added_at: string;
    tracks:
      | (TrackWithDetails & {
          artists?: { id: string | null; name: string | null } | null;
          albums?: { id: string | null; title: string | null; cover_url: string | null } | null;
        })
      | null;
  }[];

  // monta o formato esperado, preenchendo artist_id e album_url
  return rows.map((row) => ({
    track_id: row.track_id,
    added_at: row.added_at,
    tracks: row.tracks ?? null,
    artist_id: row.tracks?.artists?.id ?? null,
    album_url: row.tracks?.albums?.cover_url ?? null,
  }));
}

export async function removeTrackFromPlaylist(params: { playlistId: string; trackId: string }) {
  const { playlistId, trackId } = params;

  const { error } = await supabase
    .from('playlist_items')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('track_id', trackId);

  if (error) throw error;
}
