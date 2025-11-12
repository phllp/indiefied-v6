import { useAlbumCover } from '@/hooks/useAlbumCover';
import { TrackWithDetails } from '@/types/database';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import palette from '@/styles/colors';

export default function ListTrackItem({
  item,
  onPressed,
}: {
  item: TrackWithDetails;
  onPressed: () => void;
}) {
  const coverUri = useAlbumCover('album_covers', item.artists.id, item.albums.cover_url!);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      className="border-border active:bg-primary-soft/10 flex-row items-center border-b px-4 py-3"
      onPress={onPressed}>
      <View className="bg-surface border-border mr-3 h-12 w-12 overflow-hidden rounded-lg border">
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <Ionicons name="musical-note" size={20} color={palette.muted} style={{ margin: 10 }} />
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-content text-base font-semibold" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-muted text-sm" numberOfLines={1}>
          {item.artists?.name || 'Artista desconhecido'}
        </Text>
      </View>

      {/* Duração */}
      <View className="ml-2 items-end">
        <Text className="text-muted text-sm">{formatDuration(item.duration_seconds)}</Text>
      </View>
    </TouchableOpacity>
  );
}
