/**
 * Movie Explorer & Watchlist Type Definitions
 * Strict types supporting TMDB responses, details, cast, and optimistic state.
 */

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  popularity?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface MovieCredits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface MovieDetails extends Movie {
  runtime: number | null;
  genres: Genre[];
  tagline: string | null;
  status: string;
  budget?: number;
  revenue?: number;
  credits?: MovieCredits;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/**
 * Watchlist Domain Types
 */
export type WatchlistStatus = 'plan_to_watch' | 'watched';

export interface WatchlistItem {
  movie: Movie;
  status: WatchlistStatus;
  addedAt: number; // Unix timestamp for sorting
}

export interface WatchlistState {
  items: Record<number, WatchlistItem>; // Fast O(1) key lookup by movieId
  order: number[];                      // Preserves chronologic insertion order
}

export type WatchlistAction =
  | { type: 'ADD'; movie: Movie; status?: WatchlistStatus }
  | { type: 'REMOVE'; movieId: number }
  | { type: 'TOGGLE_STATUS'; movieId: number }
  | { type: 'SET_STATUS'; movieId: number; status: WatchlistStatus }
  | { type: 'ROLLBACK'; previousState: WatchlistState }
  | { type: 'HYDRATE'; payload: WatchlistState };

/**
 * Search & Pagination Status
 */
export type AsyncStatus = 'idle' | 'loading' | 'loading_more' | 'success' | 'error';

export interface SearchState {
  query: string;
  page: number;
  results: Movie[];
  totalResults: number;
  totalPages: number;
  status: AsyncStatus;
  error: string | null;
  isFallback: boolean; // Indicates if data is served via curated fallback catalog
}
