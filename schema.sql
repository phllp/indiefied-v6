-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.albums (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist_id uuid,
  cover_url text,
  year integer,
  CONSTRAINT albums_pkey PRIMARY KEY (id),
  CONSTRAINT albums_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id)
);
CREATE TABLE public.artists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT artists_pkey PRIMARY KEY (id)
);
CREATE TABLE public.playlist_items (
  playlist_id uuid NOT NULL,
  track_id uuid NOT NULL,
  position integer NOT NULL,
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT playlist_items_pkey PRIMARY KEY (playlist_id, track_id),
  CONSTRAINT playlist_items_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id),
  CONSTRAINT playlist_items_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id)
);
CREATE TABLE public.playlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  cover_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT playlists_pkey PRIMARY KEY (id),
  CONSTRAINT playlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text UNIQUE,
  display_name text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.recently_played (
  user_id uuid,
  track_id uuid,
  played_at timestamp with time zone DEFAULT now(),
  CONSTRAINT recently_played_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT recently_played_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id)
);
CREATE TABLE public.tracks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist_id uuid,
  album_id uuid,
  duration_seconds integer,
  local_key text UNIQUE,
  remote_url text,
  CONSTRAINT tracks_pkey PRIMARY KEY (id),
  CONSTRAINT tracks_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id),
  CONSTRAINT tracks_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id)
);