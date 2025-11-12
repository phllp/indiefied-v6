import { View, Text, FlatList, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabaseService } from '../services/supabase';
import { TrackWithDetails } from '../types/database';

export default function SearchScreen() {
  const [tracks, setTracks] = useState<TrackWithDetails[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<TrackWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  useEffect(() => {
    filterTracks();
  }, [searchQuery, tracks]);

  const loadTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseService.getTracks();
      setTracks(data || []);
      setFilteredTracks(data || []);
    } catch (err) {
      setError('Erro ao carregar músicas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterTracks = () => {
    if (!searchQuery.trim()) {
      setFilteredTracks(tracks);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = tracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.artists?.name.toLowerCase().includes(query) ||
        track.albums?.title.toLowerCase().includes(query)
    );
    setFilteredTracks(filtered);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTrackItem = ({ item }: { item: TrackWithDetails }) => (
    <TouchableOpacity
      className="flex-row items-center border-b border-gray-200 bg-white p-4 active:bg-gray-50"
      onPress={() => console.log('Play:', item.title)}>
      {/* Placeholder ou capa do álbum */}
      <View className="mr-3 h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
        {item.albums?.cover_url ? (
          <Text className="text-xs">🎵</Text>
        ) : (
          <Ionicons name="musical-note" size={24} color="#3b82f6" />
        )}
      </View>

      {/* Informações da música */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-sm text-gray-600" numberOfLines={1}>
          {item.artists?.name || 'Artista desconhecido'}
          {item.albums?.title && ` • ${item.albums.title}`}
        </Text>
        {item.local_key && (
          <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
            📁 {item.local_key}
          </Text>
        )}
      </View>

      {/* Duração */}
      <View className="ml-2 items-end">
        <Text className="text-sm text-gray-500">{formatDuration(item.duration_seconds)}</Text>
      </View>
    </TouchableOpacity>
  );

  //   if (loading) {
  //     return (
  //       <View className="flex-1 items-center justify-center bg-white">
  //         <ActivityIndicator size="large" color="#3b82f6" />
  //         <Text className="mt-4 text-gray-600">Carregando músicas...</Text>
  //       </View>
  //     );
  //   }

  //   if (error) {
  //     return (
  //       <View className="flex-1 items-center justify-center bg-white p-4">
  //         <Ionicons name="alert-circle" size={64} color="#ef4444" />
  //         <Text className="mt-4 text-xl font-bold text-gray-800">{error}</Text>
  //         <TouchableOpacity className="mt-4 rounded-lg bg-blue-500 px-6 py-3" onPress={loadTracks}>
  //           <Text className="font-semibold text-white">Tentar novamente</Text>
  //         </TouchableOpacity>
  //       </View>
  //     );
  //   }

  return (
    <View className="flex-1">
      {/* Barra de busca */}
      <View className="border-b border-red-500 bg-red-400 p-4">
        <View className="flex-row items-center rounded-lg bg-gray-500 px-3 py-2">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="ml-2 flex-1 text-base text-gray-800"
            placeholder="Buscar músicas, artistas ou álbuns..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de músicas */}
      {filteredTracks.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="musical-notes-outline" size={64} color="#d1d5db" />
          <Text className="mt-4 text-xl font-bold text-gray-800">
            {searchQuery ? 'Nenhuma música encontrada' : 'Nenhuma música cadastrada'}
          </Text>
          <Text className="mt-2 text-center text-gray-600">
            {searchQuery
              ? 'Tente buscar por outro termo'
              : 'Adicione suas primeiras músicas para começar'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-4"
        />
      )}
    </View>
  );
}
