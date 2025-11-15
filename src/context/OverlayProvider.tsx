import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Playlist } from '@/types/database';

type Ctx = {
  playlist: Playlist | null;
  isOpen: boolean;
  open: (pl: Playlist) => void;
  close: () => void;
};

const OverlayContext = createContext<Ctx | null>(null);

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlay must be used within OverlayProvider');
  return ctx;
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  // Por hora só é usado para playlist details, então só tem esse estado
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((pl: Playlist) => {
    setPlaylist(pl);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <OverlayContext.Provider value={{ playlist, isOpen, open, close }}>
      {children}
    </OverlayContext.Provider>
  );
}
