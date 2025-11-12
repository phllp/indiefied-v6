import { supabase } from '@/services/supabase';

type TransformOpts = {
  width?: number;
  height?: number;
  quality?: number; // 1..100
  resize?: 'contain' | 'cover' | 'fill' | undefined;
  format?: 'origin';
};

/**
 * Retorna a URL pública da capa do álbum no Supabase Storage (bucket público).
 * Aarquivo em: artist_uuid/album_url
 */
export function getAlbumCoverUrl(params: {
  bucket: string;
  artistUuid: string;
  albumUrl: string;
  transform?: TransformOpts;
}): string {
  const { bucket, artistUuid, albumUrl, transform } = params;
  const path = `${artistUuid}/${albumUrl}`.replace(/^\/+/, '');

  /**
   * Path Errado: status code 404
   */
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path, transform ? { transform } : undefined);

  return data.publicUrl;
}
