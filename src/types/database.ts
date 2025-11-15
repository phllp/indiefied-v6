export interface Artist {
  id: string;
  name: string;
}

export interface Album {
  id: string;
  title: string;
  artist_id: string | null;
  cover_url: string | null;
  year: number | null;
}

export interface Track {
  id: string;
  title: string;
  artist_id: string | null;
  album_id: string | null;
  duration_seconds: number | null;
  local_key: string | null;
  remote_url: string | null;
}

export interface TrackWithDetails extends Track {
  artists: Artist;
  albums: Album;
}

export type Playlist = {
  id: string;
  user_id: string;
  name: string;
  cover_url: string | null;
  created_at: string;
};

export type PlaylistTrackItem = {
  track_id: string;
  added_at: string;
  artist_id: string | null;
  album_url: string | null;
  tracks: TrackWithDetails | null;
};
