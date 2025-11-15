import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import palette from '@/styles/colors';
import type { PlaylistTrackItem, TrackWithDetails } from '@/types/database';
import {
  getPlaylistCoverPublicUrl,
  listPlaylistTracks,
  removeTrackFromPlaylist,
} from '@/services/supabase/playlists';
import { useOverlay } from '@/context/OverlayProvider';
import { usePlayer } from '@/context/PlayerProvider';
import { getAlbumCoverUrl, getTrackPublicUrl } from '@/services/supabase-storage';

interface Props {
  bottomOffset?: number;
}

export function PlaylistDetailOverlay({ bottomOffset }: Props) {
  const { state, isOpen, close } = useOverlay();

  const playlist = state?.kind === 'playlist' ? state.playlist : null;

  const [items, setItems] = useState<PlaylistTrackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<PlaylistTrackItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { playTrack } = usePlayer();

  useEffect(() => {
    if (!isOpen || !playlist) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listPlaylistTracks(playlist.id);
        setItems(data);
      } catch (e) {
        console.error(e);
        setError('Erro ao carregar músicas da playlist');
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, playlist?.id]);

  if (!isOpen || !playlist) return null;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete || !playlist) return;
    setDeleting(true);
    try {
      await removeTrackFromPlaylist({
        playlistId: playlist.id,
        trackId: pendingDelete.track_id,
      });

      setItems((prev) => prev.filter((it) => it.track_id !== pendingDelete.track_id));
      setPendingDelete(null);
    } catch (e) {
      console.error(e);
      setError('Falha ao remover música da playlist');
    } finally {
      setDeleting(false);
    }
  };

  const renderItem = ({ item }: { item: PlaylistTrackItem }) => {
    const track = item.tracks as TrackWithDetails | null;
    if (!track) return null;

    const audioUrl = getTrackPublicUrl('tracks', track.albums!.id, track.remote_url!);
    const coverUrl = track.albums?.cover_url ?? null;

    return (
      <View className="flex-row items-center gap-3 py-3">
        {/* tocar música ao clicar na área principal */}
        <TouchableOpacity
          className="flex-1 flex-row items-center gap-3 active:opacity-90"
          onPress={() =>
            playTrack({
              id: track.id,
              title: track.title,
              artist: track.artists?.name,
              coverUrl: coverUrl ?? undefined,
              audioUrl,
            })
          }>
          <View className="h-12 w-12 overflow-hidden rounded-md border border-border bg-surface">
            {coverUrl ? (
              <Image
                source={{
                  uri: getAlbumCoverUrl({
                    bucket: 'album_covers',
                    artistUuid: item.artist_id!,
                    albumUrl: item.album_url!,
                  }),
                }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="musical-note" size={18} color={palette.muted} />
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-content" numberOfLines={1}>
              {track.title}
            </Text>
            <Text className="text-xs text-muted" numberOfLines={1}>
              {track.artists?.name || '—'}
            </Text>
          </View>

          <Text className="text-xs text-muted">
            {formatDuration(track.duration_seconds ?? null)}
          </Text>
        </TouchableOpacity>

        {/* botão de excluir */}
        <TouchableOpacity
          onPress={() => setPendingDelete(item)}
          className="ml-2 p-2 active:opacity-70">
          <Ionicons name="trash-outline" size={18} color={palette.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: bottomOffset ?? 0,
        zIndex: 45,
        elevation: 45,
      }}
      className="bg-bg">
      {/* header */}
      <View className="flex-row items-center justify-between px-4 pb-2 pt-10">
        <TouchableOpacity onPress={close} className="rounded-full p-2 active:opacity-80">
          <Ionicons name="chevron-down" size={24} color={palette.content} />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-content">Playlist</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* capa + nome */}
      <View className="items-center px-6">
        <View className="aspect-square w-[60%] overflow-hidden rounded-3xl border border-border bg-surface">
          {playlist.cover_url ? (
            <Image
              source={{ uri: getPlaylistCoverPublicUrl(playlist.cover_url) ?? '' }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="albums-outline" size={32} color={palette.muted} />
            </View>
          )}
        </View>

        <Text className="mt-4 text-center text-2xl font-bold text-content" numberOfLines={2}>
          {playlist.name}
        </Text>
      </View>

      {/* lista de músicas */}
      <View className="mt-6 flex-1 px-4">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={palette.primary} />
            <Text className="mt-2 text-muted">Carregando músicas…</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-danger">{error}</Text>
          </View>
        ) : items.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="musical-notes-outline" size={40} color={palette.muted} />
            <Text className="mt-2 text-muted">Nenhuma música nesta playlist ainda</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(it) => `${it.track_id}-${it.added_at}`}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View className="h-[1px] bg-border/60" />}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>

      {/* modal de confirmação de remoção */}
      <Modal
        visible={!!pendingDelete}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setPendingDelete(null)}>
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="w-[80%] rounded-2xl border border-border bg-bg p-4">
            <Text className="text-base font-semibold text-content">Remover da playlist?</Text>
            <Text className="mt-2 text-sm text-muted">
              {pendingDelete?.tracks?.title ?? 'Esta música'} será removida de "{playlist.name}".
            </Text>

            <View className="mt-4 flex-row justify-end gap-3">
              <TouchableOpacity
                disabled={deleting}
                onPress={() => setPendingDelete(null)}
                className="rounded-lg border border-border bg-surface px-4 py-2 active:opacity-80">
                <Text className="text-content">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={deleting}
                onPress={handleConfirmDelete}
                className="rounded-lg bg-danger px-4 py-2 active:opacity-80">
                <Text className="font-semibold text-content">
                  {deleting ? 'Removendo…' : 'Remover'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
