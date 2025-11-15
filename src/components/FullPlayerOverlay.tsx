import { View, Text, TouchableOpacity } from 'react-native';
import { usePlayer } from '@/context/PlayerProvider';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import palette from '@/styles/colors';
import { addTrackToPlaylist } from '@/services/supabase/playlists';
import { useState } from 'react';
import SelectPlaylistModal from './SelectPlaylistModal';

interface FullPlayerOverlayProps {
  bottomOffset?: number;
}

export function FullPlayerOverlay({ bottomOffset }: FullPlayerOverlayProps) {
  const {
    current,
    isPlayerOpen,
    closePlayer,
    isPlaying,
    togglePlayPause,
    positionMillis,
    durationMillis,
    seekTo,
    progress,
  } = usePlayer();

  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const [barWidth, setBarWidth] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0);
  const [scrubPositionMs, setScrubPositionMs] = useState(0);

  if (!isPlayerOpen || !current) return null;

  const effectiveProgress = isScrubbing ? scrubProgress : progress;
  const effectivePosition = isScrubbing ? scrubPositionMs : positionMillis;

  const format = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  function progressFromX(x: number) {
    if (!durationMillis || barWidth <= 0) {
      return { p: 0, ms: 0 };
    }
    const clampedX = Math.max(0, Math.min(barWidth, x));
    const p = clampedX / barWidth;
    const ms = p * durationMillis;
    return { p, ms };
  }

  async function handleSelectPlaylist(pl: { id: string; name: string }) {
    setSaving(true);
    try {
      if (!current) throw new Error('Nenhuma faixa selecionada');
      await addTrackToPlaylist({ playlistId: pl.id, trackId: current.id });
      setPickerOpen(false);
      setBanner({ type: 'ok', msg: `Adicionada em “${pl.name}”` });
    } catch (e: any) {
      setPickerOpen(false);
      const msg = e?.message || 'Falha ao adicionar à playlist';
      setBanner({ type: 'err', msg });
    } finally {
      setSaving(false);
      setTimeout(() => setBanner(null), 2000);
    }
  }

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: bottomOffset ?? 0,
        zIndex: 50,
        elevation: 50,
      }}
      // @ts-ignore
      className="bg-bg">
      {/* botão fechar && adicionar a playlist */}
      <View className="mt-10 flex-row items-center justify-between px-4 pt-4">
        <TouchableOpacity onPress={closePlayer} className="rounded-full p-2 active:opacity-80">
          <Ionicons name="chevron-down" size={24} color={palette.content} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          className="rounded-full p-2 active:opacity-80"
          disabled={saving}>
          <Ionicons name="add-circle-outline" size={24} color={palette.primary} />
        </TouchableOpacity>
      </View>

      {/* capa */}
      <View className="mt-2 items-center">
        <View className="aspect-square w-[80%] overflow-hidden rounded-3xl border border-border bg-surface">
          {current.coverUrl ? (
            <Image
              source={{ uri: current.coverUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center" />
          )}
        </View>
      </View>

      {/* títulos */}
      <View className="mt-6 px-6">
        <Text className="text-center text-2xl font-bold text-content" numberOfLines={1}>
          {current.title}
        </Text>
        <Text className="text-center text-base text-muted" numberOfLines={1}>
          {current.artist || '—'}
        </Text>
      </View>

      {/* progresso com seek */}
      <View className="mt-8 px-6">
        <View
          className="h-2 w-full overflow-hidden rounded-full border border-border bg-surface"
          onLayout={(e) => {
            setBarWidth(e.nativeEvent.layout.width);
          }}
          // transforma a barra em área de toque/arraste
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => {
            const { p, ms } = progressFromX(e.nativeEvent.locationX);
            setIsScrubbing(true);
            setScrubProgress(p);
            setScrubPositionMs(ms);
          }}
          onResponderMove={(e) => {
            const { p, ms } = progressFromX(e.nativeEvent.locationX);
            setIsScrubbing(true);
            setScrubProgress(p);
            setScrubPositionMs(ms);
          }}
          onResponderRelease={async (e) => {
            const { p, ms } = progressFromX(e.nativeEvent.locationX);
            setIsScrubbing(false);
            setScrubProgress(p);
            setScrubPositionMs(ms);
            if (durationMillis && durationMillis > 0) {
              seekTo(ms);
            }
          }}
          onResponderTerminate={() => {
            // gestos cancelados
            setIsScrubbing(false);
          }}>
          <View style={{ width: `${effectiveProgress * 100}%` }} className="h-full bg-primary" />
        </View>

        <View className="mt-2 flex-row justify-between">
          <Text className="text-sm text-muted">{format(effectivePosition)}</Text>
          <Text className="text-sm text-muted">{format(durationMillis)}</Text>
        </View>

        <View className="mt-3 flex-row justify-between">
          <TouchableOpacity
            onPress={() => seekTo(Math.max(0, positionMillis - 15000))}
            className="px-3 py-2">
            <Ionicons name="play-back" size={24} color={palette.content} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => seekTo(Math.min(durationMillis, positionMillis + 15000))}
            className="px-3 py-2">
            <Ionicons name="play-forward" size={24} color={palette.content} />
          </TouchableOpacity>
        </View>
      </View>

      {/* play/pause */}
      <View className="mt-6 items-center">
        <TouchableOpacity
          onPress={togglePlayPause}
          className="h-16 w-16 items-center justify-center rounded-full bg-primary active:opacity-90">
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={'#000'} />
        </TouchableOpacity>
      </View>

      {/* Banner de feedback */}
      {banner && (
        <View className="absolute bottom-4 left-4 right-4 items-center">
          <View
            className={`rounded-md px-3 py-2 ${banner.type === 'ok' ? 'bg-primary' : 'bg-danger'}`}
            style={{ opacity: 0.95 }}>
            <Text
              className={`${banner.type === 'ok' ? 'text-black' : 'text-content'} font-semibold`}>
              {banner.msg}
            </Text>
          </View>
        </View>
      )}

      {/* Modal de seleção */}
      <SelectPlaylistModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectPlaylist}
      />
    </View>
  );
}
