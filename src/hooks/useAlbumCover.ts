// src/hooks/useAlbumCover.ts
import { useMemo } from 'react';
import { getAlbumCoverUrl } from '@/services/supabase-storage';

export function useAlbumCover(
  bucket: string,
  artistUuid: string | undefined,
  albumUrl: string | undefined,
  transform?: Parameters<typeof getAlbumCoverUrl>[0]['transform']
) {
  return useMemo(() => {
    if (!artistUuid || !albumUrl) return null;
    return getAlbumCoverUrl({ bucket, artistUuid, albumUrl, transform });
  }, [
    bucket,
    artistUuid,
    albumUrl,
    transform?.width,
    transform?.height,
    transform?.quality,
    transform?.resize,
    transform?.format,
  ]);
}
