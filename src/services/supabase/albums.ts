import { supabase } from '@/services/supabase';
import { ArtistWithAlbums } from '@/types/database';
import { getAlbumCoverUrl } from '../supabase-storage';

export async function listArtistsWithAlbums(): Promise<ArtistWithAlbums[]> {
  const { data, error } = await supabase
    .from('artists')
    .select(
      `
      id,
      name,
      albums (
        id,
        title,
        cover_url
      )
    `
    )
    .order('name', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    albums: (row.albums ?? []).map((a: any) => ({
      id: a.id,
      title: a.title,
      cover_url: getAlbumCoverUrl({
        bucket: 'album_covers',
        artistUuid: row.id,
        albumUrl: a.cover_url!,
      }),
      artist_id: row.id,
    })),
  }));
}
