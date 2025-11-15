import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import palette from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import PlaylistCard from '@/components/PlaylistCard';
import { CreatePlaylistOverlay } from '@/components/CreatePlaylistOverlay';
import { createPlaylist, listPlaylists } from '@/services/supabase/playlists';
import { Playlist } from '@/types/database';
import { useOverlay } from '@/context/OverlayProvider';

export default function PlaylistsScreen() {
  const [items, setItems] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { open: openPlaylist } = useOverlay();

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await listPlaylists();
      setItems(data);
    } catch (e) {
      setError('Erro ao carregar playlists');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (p: { name: string; coverFileUri?: string | null }) => {
    await createPlaylist({ name: p.name, coverFileUri: p.coverFileUri ?? undefined });
    await load();
  };

  return (
    <View className="flex-1 bg-bg px-4 pt-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-content">Playlists</Text>
        <TouchableOpacity
          onPress={() => setCreateOpen(true)}
          className="flex-row items-center gap-2 rounded-lg bg-primary px-3 py-2 active:opacity-90">
          <Ionicons name="add" size={18} color="#000" />
          <Text className="font-semibold text-black">Nova</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text className="text-muted">Carregando…</Text>
      ) : error ? (
        <Text className="text-danger">{error}</Text>
      ) : items.length === 0 ? (
        <View className="mt-10 items-center">
          <Ionicons name="albums-outline" size={48} color={palette.muted} />
          <Text className="mt-2 text-muted">Nenhuma playlist ainda</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <PlaylistCard
              item={item}
              onPress={() => {
                openPlaylist(item);
              }}
            />
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}

      {/* Overlay de criação */}
      <CreatePlaylistOverlay
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
      />
    </View>
  );
}
