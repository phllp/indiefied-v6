import { createClient } from '@supabase/supabase-js';

// Usando variáveis de ambiente do Expo
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Credenciais do Supabase não configuradas');
}

// Instância única do cliente Supabase (Singleton)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funções auxiliares para acesso aos dados
export const supabaseService = {
  // Buscar todas as tracks com detalhes de artista e álbum
  async getTracks() {
    const { data, error } = await supabase
      .from('tracks')
      .select(
        `
        *,
        artists (
          id,
          name
        ),
        albums (
          id,
          title,
          cover_url,
          year
        )
      `
      )
      .order('title', { ascending: true });

    if (error) {
      console.error('Erro ao buscar tracks:', error);
      throw error;
    }

    return data;
  },

  // Buscar tracks por título (para a pesquisa)
  async searchTracks(query: string) {
    const { data, error } = await supabase
      .from('tracks')
      .select(
        `
        *,
        artists (
          id,
          name
        ),
        albums (
          id,
          title,
          cover_url,
          year
        )
      `
      )
      .ilike('title', `%${query}%`)
      .order('title', { ascending: true });

    if (error) {
      console.error('Erro ao buscar tracks:', error);
      throw error;
    }

    return data;
  },

  // Buscar artistas
  async getArtists() {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar artistas:', error);
      throw error;
    }

    return data;
  },
};
