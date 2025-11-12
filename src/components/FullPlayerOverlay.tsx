import { View, Text, TouchableOpacity } from 'react-native';
import { usePlayer } from '@/context/PlayerProvider';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import palette from '@/styles/colors';
import { useAlbumCover } from '@/hooks/useAlbumCover';

interface FullPlayerOverlayProps {
  bottomOffset: number;
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

  if (!isPlayerOpen || !current) return null;

  const format = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: bottomOffset,
        zIndex: 50,
        elevation: 50,
      }}
      // @ts-ignore
      className="bg-bg">
      {/* botão fechar */}
      <View className="mt-10 px-4 pt-4">
        <TouchableOpacity
          onPress={closePlayer}
          className="self-start rounded-full p-2 active:opacity-80">
          <Ionicons name="chevron-down" size={24} color={palette.content} />
        </TouchableOpacity>
      </View>

      {/* capa */}
      <View className="mt-2 items-center">
        <View className="bg-surface border-border aspect-square w-[80%] overflow-hidden rounded-3xl border">
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
        <Text className="text-content text-center text-2xl font-bold" numberOfLines={1}>
          {current.title}
        </Text>
        <Text className="text-muted text-center text-base" numberOfLines={1}>
          {current.artist || '—'}
        </Text>
      </View>

      {/* progresso */}
      <View className="mt-8 px-6">
        <View className="border-border bg-surface h-2 w-full overflow-hidden rounded-full border">
          <View style={{ width: `${progress * 100}%` }} className="bg-primary h-full" />
        </View>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-muted text-sm">{format(positionMillis)}</Text>
          <Text className="text-muted text-sm">{format(durationMillis)}</Text>
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
          className="bg-primary h-16 w-16 items-center justify-center rounded-full active:opacity-90">
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={'#000'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
