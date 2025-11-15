import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import palette from '@/styles/colors';
import { listArtistsWithAlbums } from '@/services/supabase/albums';
import { AlbumSummary, ArtistWithAlbums } from '@/types/database';
import { useOverlay } from '@/context/OverlayProvider';

type FeaturedAlbum = {
  album: AlbumSummary;
  artistName: string;
  coverUrl: string;
};

export default function HomeScreen() {
  const [artists, setArtists] = useState<ArtistWithAlbums[]>([]);
  const [featured, setFeatured] = useState<FeaturedAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { openAlbum } = useOverlay();

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const data = await listArtistsWithAlbums();
      const withAlbums = data.filter((a) => a.albums && a.albums.length > 0);

      if (withAlbums.length === 0) {
        setArtists([]);
        setFeatured(null);
        return;
      }

      // ---- sorteia álbum em destaque ----
      const randArtistIdx = Math.floor(Math.random() * withAlbums.length);
      const randArtist = withAlbums[randArtistIdx];
      const randAlbumIdx = Math.floor(Math.random() * randArtist.albums.length);
      const randAlbum = randArtist.albums[randAlbumIdx];

      setFeatured({
        album: randAlbum,
        artistName: randArtist.name,
        coverUrl: randAlbum.cover_url ?? '',
      });

      // ---- sorteia 3 artistas aleatórios (com álbum) ----
      const shuffled = [...withAlbums].sort(() => Math.random() - 0.5);
      const randomThree = shuffled.slice(0, 3);

      setArtists(randomThree);
    } catch (e) {
      console.error(e);
      setError('Erro ao carregar álbuns');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const renderAlbum = (album: AlbumSummary, artistName: string) => {
    const coverUrl = album.cover_url ?? undefined;

    return (
      <TouchableOpacity
        key={album.id}
        className="mr-3 w-32 active:opacity-90"
        onPress={() => {
          openAlbum({
            id: album.id,
            title: album.title,
            cover_url: album.cover_url,
            artist_name: artistName,
          });
        }}>
        <View className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface">
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="albums-outline" size={24} color={palette.muted} />
            </View>
          )}
        </View>
        <Text className="mt-2 text-xs font-semibold text-content" numberOfLines={2}>
          {album.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderArtistRow = (artist: ArtistWithAlbums) => {
    if (!artist.albums || artist.albums.length === 0) return null;

    return (
      <View key={artist.id} className="mb-6">
        <View className="mb-2 flex-row items-center justify-between pr-2">
          <Text className="text-base font-bold text-content" numberOfLines={1}>
            {artist.name}
          </Text>
        </View>

        <FlatList
          data={artist.albums}
          keyExtractor={(alb) => alb.id}
          renderItem={({ item }) => renderAlbum(item, artist.name)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 8 }}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color={palette.primary} size="large" />
        <Text className="mt-3 text-muted">Carregando recomendações…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Ionicons name="alert-circle" size={48} color={palette.danger} />
        <Text className="mt-3 text-lg font-semibold text-content">Ops…</Text>
        <Text className="mt-1 text-center text-muted">{error}</Text>
        <TouchableOpacity
          onPress={load}
          className="mt-4 rounded-lg bg-primary px-5 py-2 active:opacity-90">
          <Text className="font-semibold text-black">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!featured && artists.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Ionicons name="musical-notes-outline" size={48} color={palette.muted} />
        <Text className="mt-3 text-lg font-semibold text-content">Nenhum conteúdo ainda</Text>
        <Text className="mt-1 text-center text-muted">
          Adicione músicas e álbuns para ver recomendações aqui.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}>
      {/* ÁLBUM EM DESTAQUE */}
      {featured && (
        <TouchableOpacity
          className="mb-8 active:opacity-90"
          onPress={() => {
            openAlbum({
              id: featured.album.id,
              title: featured.album.title,
              cover_url: featured.coverUrl,
              artist_name: featured.artistName,
            });
          }}>
          <Text className="mb-2 text-xs uppercase tracking-wide text-muted">Em destaque</Text>

          <View className="overflow-hidden rounded-3xl border border-border bg-surface">
            <View className="aspect-square w-full">
              {featured.album.cover_url ? (
                <Image
                  source={{ uri: featured.album.cover_url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="albums-outline" size={40} color={palette.muted} />
                </View>
              )}
            </View>

            <View className="px-4 py-3">
              <Text className="text-lg font-bold text-content" numberOfLines={1}>
                {featured.album.title}
              </Text>
              <Text className="mt-1 text-sm text-muted" numberOfLines={1}>
                {featured.artistName}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* SEÇÕES DE ARTISTAS ALEATÓRIOS */}
      {artists.length > 0 && (
        <View>
          <Text className="mb-3 text-xs uppercase tracking-wide text-muted">
            Descubra por artista
          </Text>

          {artists.map(renderArtistRow)}
        </View>
      )}
    </ScrollView>
  );
}
