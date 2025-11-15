import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { getPlaylistCoverPublicUrl } from '@/services/supabase/playlists';
import palette from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { Playlist } from '@/types/database';

type Props = {
  item: Playlist;
  onPress?: () => void;
};

export default function PlaylistCard({ item, onPress }: Props) {
  const coverUri = getPlaylistCoverPublicUrl(item.cover_url);

  return (
    <TouchableOpacity onPress={onPress} className="mb-4 w-[48%]" activeOpacity={0.9}>
      <View className="border-border bg-surface aspect-square w-full overflow-hidden rounded-xl border">
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="albums-outline" size={28} color={palette.muted} />
          </View>
        )}
      </View>
      <Text className="text-content mt-2 font-semibold" numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}
