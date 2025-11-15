import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import palette from '@/styles/colors';
import { getPlaylistCoverPublicUrl, listPlaylists } from '@/services/supabase/playlists';
import { Playlist } from '@/types/database';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (pl: Playlist) => void;
};

export default function SelectPlaylistModal({ visible, onClose, onSelect }: Props) {
  const [items, setItems] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoading(true);
      try {
        const data = await listPlaylists();
        setItems(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        {/* sheet */}
        <View className="max-h-[70%] rounded-t-2xl bg-bg p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-content">Adicionar à playlist</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={20} color={palette.content} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator color={palette.primary} />
            </View>
          ) : items.length === 0 ? (
            <View className="items-center py-10">
              <Ionicons name="albums-outline" size={36} color={palette.muted} />
              <Text className="mt-2 text-muted">Nenhuma playlist encontrada</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(it) => it.id}
              ItemSeparatorComponent={() => <View className="h-[1px] bg-border" />}
              renderItem={({ item }) => {
                const cover = getPlaylistCoverPublicUrl(item.cover_url);
                return (
                  <TouchableOpacity
                    onPress={() => onSelect(item)}
                    className="flex-row items-center gap-3 py-3 active:opacity-90">
                    <View className="h-10 w-10 overflow-hidden rounded-md border border-border bg-surface">
                      {cover ? (
                        <Image
                          source={{ uri: cover }}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Ionicons name="albums-outline" size={18} color={palette.muted} />
                        </View>
                      )}
                    </View>
                    <Text className="flex-1 text-content" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={palette.muted} />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
