import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export type TrackMeta = {
  id: string;
  title: string;
  artist?: string;
  coverUrl?: string;
  audioUrl: string;
};

type Ctx = {
  current?: TrackMeta;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  progress: number;
  status: ReturnType<typeof useAudioPlayerStatus> | null;

  playTrack: (t: TrackMeta) => Promise<void>;
  togglePlayPause: () => void;
  seekTo: (ms: number) => void;

  isPlayerOpen: boolean;
  openPlayer: () => void;
  closePlayer: () => void;
};

const PlayerContext = createContext<Ctx | null>(null);
export const usePlayer = () => {
  const v = useContext(PlayerContext);
  if (!v) throw new Error('usePlayer must be used within PlayerProvider');
  return v;
};

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  // fonte atual - música sendo reproduzida
  const [source, setSource] = useState<{ uri: string } | undefined>();
  const [current, setCurrent] = useState<TrackMeta | undefined>();

  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const openPlayer = useCallback(() => setIsPlayerOpen(true), []);
  const closePlayer = useCallback(() => setIsPlayerOpen(false), []);

  // cria o player com base na fonte
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  // controle de corrida: versão do "load"
  const loadVersion = useRef(0);
  const pendingAutoplayFor = useRef<number | null>(null);

  const playTrack = useCallback(async (t: TrackMeta) => {
    setCurrent(t);
    // cada troca de source incrementa a versão
    const v = ++loadVersion.current;
    setSource({ uri: t.audioUrl });

    // sinaliza que queremos autoplay quando o novo player estiver pronto
    pendingAutoplayFor.current = v;
  }, []);

  // dispara autoplay **apenas quando** o hook sinaliza que pode tocar
  useEffect(() => {
    if (!status?.isLoaded) return;
    const v = loadVersion.current;
    if (pendingAutoplayFor.current !== v) return; // já não é o load atual

    try {
      player.play?.(); // sem argumentos!
      player.setPlaybackRate(1.0, 'high');
    } catch (e) {
      // Se o player foi liberado entre o status e o play, só ignore
      // (em prática não deve acontecer com o token acima)
      // console.log('play ignored', e)
    } finally {
      pendingAutoplayFor.current = null;
    }
  }, [status?.isLoaded, player]);

  const togglePlayPause = useCallback(() => {
    if (!status) return;
    try {
      if (status.playing) player.pause?.();
      else {
        player.play?.();
        player.setPlaybackRate(1.0, 'high');
      }
    } catch {
      // evita crash caso o player tenha sido liberado por troca de fonte
    }
  }, [player, status]);

  const seekTo = useCallback(
    (ms: number) => {
      try {
        player.seekTo?.(ms);
      } catch {}
    },
    [player]
  );

  const { isPlaying, positionMillis, durationMillis, progress } = useMemo(() => {
    const pos = status?.currentTime ?? 0;
    const dur = status?.duration ?? 0;
    return {
      isPlaying: !!status?.playing,
      positionMillis: pos,
      durationMillis: dur,
      progress: dur > 0 ? Math.min(1, Math.max(0, pos / dur)) : 0,
    };
  }, [status]);

  const value: Ctx = {
    current,
    isPlaying,
    positionMillis,
    durationMillis,
    progress,
    status: status ?? null,
    playTrack,
    togglePlayPause,
    seekTo,
    isPlayerOpen,
    openPlayer,
    closePlayer,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
