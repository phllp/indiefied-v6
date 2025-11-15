import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import palette from '@/styles/colors';
import { useOverlay } from '@/context/OverlayProvider';
import { usePlayer } from '@/context/PlayerProvider';
import { listAlbumTracks } from '@/services/supabase/albums';
import type { TrackWithDetails } from '@/types/database';
import { getTrackPublicUrl } from '@/services/supabase-storage';

interface Props {
  bottomOffset?: number;
}

export function AlbumTracksOverlay({ bottomOffset }: Props) {
  const { state, isOpen, close } = useOverlay();
  const albumState = state?.kind === 'album' ? state.album : null;

  const [tracks, setTracks] = useState<TrackWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { playTrack } = usePlayer();

  useEffect(() => {
    if (!isOpen || !albumState) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listAlbumTracks(albumState.id);
        setTracks(data);
      } catch (e) {
        console.error(e);
        setError('Erro ao carregar faixas do álbum');
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, albumState?.id]);

  if (!isOpen || !albumState) return null;

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderItem = ({ item }: { item: TrackWithDetails }) => {
    const coverUrl = albumState.cover_url;

    const audioUrl = getTrackPublicUrl('tracks', item.albums!.id, item.remote_url!);

    return (
      <TouchableOpacity
        className="flex-row items-center gap-3 py-3 active:opacity-90"
        onPress={() =>
          playTrack({
            id: item.id,
            title: item.title,
            artist: item.artists?.name,
            coverUrl: coverUrl ?? undefined,
            audioUrl,
          })
        }>
        {/* mini capa */}
        <View className="h-12 w-12 overflow-hidden rounded-md border border-border bg-surface">
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="musical-note" size={18} color={palette.muted} />
            </View>
          )}
        </View>

        {/* info */}
        <View className="flex-1">
          <Text className="text-content" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-xs text-muted" numberOfLines={1}>
            {item.artists?.name || albumState.artist_name || '—'}
          </Text>
        </View>

        {/* duração */}
        <Text className="text-xs text-muted">{formatDuration(item.duration_seconds)}</Text>
      </TouchableOpacity>
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
        zIndex: 46,
        elevation: 46,
      }}
      className="bg-bg">
      {/* header */}
      <View className="flex-row items-center justify-between px-4 pb-2 pt-10">
        <TouchableOpacity onPress={close} className="rounded-full p-2 active:opacity-80">
          <Ionicons name="chevron-down" size={24} color={palette.content} />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-content">Álbum</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* capa + nome */}
      <View className="items-center px-6">
        <View className="aspect-square w-[60%] overflow-hidden rounded-3xl border border-border bg-surface">
          {albumState.cover_url ? (
            <Image
              source={{ uri: albumState.cover_url }}
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
          {albumState.title}
        </Text>
        {albumState.artist_name && (
          <Text className="mt-1 text-center text-sm text-muted" numberOfLines={1}>
            {albumState.artist_name}
          </Text>
        )}
      </View>

      {/* lista de faixas */}
      <View className="mt-6 flex-1 px-4">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={palette.primary} />
            <Text className="mt-2 text-muted">Carregando faixas…</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-danger">{error}</Text>
          </View>
        ) : tracks.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="musical-notes-outline" size={40} color={palette.muted} />
            <Text className="mt-2 text-muted">Nenhuma faixa neste álbum ainda</Text>
          </View>
        ) : (
          <FlatList
            data={tracks}
            keyExtractor={(it) => it.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View className="h-[1px] bg-border/60" />}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
    </View>
  );
}
