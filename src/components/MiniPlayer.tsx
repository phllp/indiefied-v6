import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerProvider';
import palette from '@/styles/colors';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';

interface MiniPlayerProps {
  bottomOffset: number;
}

export function MiniPlayer({ bottomOffset }: MiniPlayerProps) {
  const nav = useNavigation<any>();
  const {
    current,
    isPlaying,
    togglePlayPause,
    positionMillis,
    durationMillis,
    isPlayerOpen,
    openPlayer,
  } = usePlayer();
  if (!current || isPlayerOpen) return null;

  const progress = durationMillis ? positionMillis / durationMillis : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={openPlayer}
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: bottomOffset + 6, // espaço extra
        zIndex: 60,
        elevation: 40,
        borderRadius: 12,
      }}
      // @ts-ignore
      className="mx-3 mb-3 rounded-xl border border-border bg-surface">
      <View className="flex-row items-center px-3 py-2">
        <View className="mr-3 h-10 w-10 overflow-hidden rounded-md border border-border bg-surface">
          {current.coverUrl ? (
            <Image
              source={{ uri: current.coverUrl }}
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
            {current.title}
          </Text>
          <Text className="text-xs text-muted" numberOfLines={1}>
            {current.artist || '—'}
          </Text>
        </View>

        <TouchableOpacity onPress={togglePlayPause} className="ml-3 px-2 py-2 active:opacity-80">
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color={palette.primary} />
        </TouchableOpacity>
      </View>

      <View className="h-1 w-full overflow-hidden rounded-b-xl bg-border">
        <View
          style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }}
          className="h-full bg-primary"
        />
      </View>
    </TouchableOpacity>
  );
}
