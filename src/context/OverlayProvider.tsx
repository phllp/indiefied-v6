import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Playlist } from '@/types/database';

export type AlbumOverlayData = {
  id: string;
  title: string;
  cover_url: string | null;
  artist_name?: string | null;
};

type OverlayState =
  | { kind: 'playlist'; playlist: Playlist }
  | { kind: 'album'; album: AlbumOverlayData }
  | null;

type Ctx = {
  state: OverlayState;
  isOpen: boolean;
  openPlaylist: (pl: Playlist) => void;
  openAlbum: (album: AlbumOverlayData) => void;
  close: () => void;
};

const OverlayContext = createContext<Ctx | null>(null);

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlay must be used within OverlayProvider');
  return ctx;
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OverlayState>(null);
  const isOpen = state !== null;

  const openPlaylist = useCallback((pl: Playlist) => {
    setState({ kind: 'playlist', playlist: pl });
  }, []);

  const openAlbum = useCallback((album: AlbumOverlayData) => {
    setState({ kind: 'album', album });
  }, []);

  const close = useCallback(() => {
    setState(null);
  }, []);

  return (
    <OverlayContext.Provider value={{ state, isOpen, openPlaylist, openAlbum, close }}>
      {children}
    </OverlayContext.Provider>
  );
}
