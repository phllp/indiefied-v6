import { View, Text, FlatList, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabaseService } from '../services/supabase';
import { TrackWithDetails } from '../types/database';

import palette from '@/styles/colors';

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
    const q = searchQuery.toLowerCase();
    setFilteredTracks(
      tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artists?.name.toLowerCase().includes(q) ||
          t.albums?.title.toLowerCase().includes(q)
      )
    );
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTrackItem = ({ item }: { item: TrackWithDetails }) => (
    <TouchableOpacity
      className="border-border active:bg-primary-soft/10 flex-row items-center border-b px-4 py-3"
      onPress={() => console.log('Play:', item.title)}>
      {/* Capa / placeholder */}
      <View className="bg-surface border-border mr-3 h-12 w-12 items-center justify-center rounded-lg border">
        {item.albums?.cover_url ? (
          // Coloca tua <Image> real aqui quando tiver a URL
          <Text className="text-muted text-xs">🎵</Text>
        ) : (
          <Ionicons name="musical-note" size={20} color={palette.muted} />
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

  if (loading) {
    return (
      <View className="bg-bg flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={palette.primary} />
        <Text className="text-muted mt-4">Carregando músicas…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-bg flex-1 items-center justify-center p-4">
        <Ionicons name="alert-circle" size={64} color={palette.danger} />
        <Text className="text-content mt-4 text-xl font-bold">{error}</Text>
        <TouchableOpacity
          className="bg-primary mt-4 rounded-lg px-6 py-3 active:opacity-90"
          onPress={loadTracks}>
          <Text className="font-semibold text-black">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-bg flex-1">
      {/* Search bar */}
      <View className="p-4">
        <View className="bg-surface border-border flex-row items-center rounded-lg border px-3 py-2">
          <Ionicons name="search" size={20} color={palette.muted} />
          <TextInput
            className="text-content ml-2 flex-1"
            placeholder="Buscar músicas, artistas ou álbuns..."
            placeholderTextColor={palette.muted}
            selectionColor={palette.primary}
            cursorColor={palette.primary as any}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={palette.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista */}
      {filteredTracks.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="musical-notes-outline" size={64} color={palette.muted} />
          <Text className="text-content mt-4 text-xl font-bold">
            {searchQuery ? 'Nenhuma música encontrada' : 'Nenhuma música cadastrada'}
          </Text>
          <Text className="text-muted mt-2 text-center">
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
