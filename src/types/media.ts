/**
 * Unified Media & Watchlist Types
 *
 * ARCHITECTURAL NOTE (Interview & Assessment Explainability):
 * WHY THE API RESPONSE IS NORMALIZED IN ONE PLACE:
 * TMDB returns drastically divergent payload schemas for movies (title, release_date, runtime)
 * vs TV series (name, first_air_date, episode_run_time, number_of_seasons).
 * Normalizing at the API ingestion boundary (src/api/tmdb.ts) guarantees that downstream
 * React components, hooks, and filters operate on a clean, unified contract (MediaItem)
 * without polluting UI code with repetitive ternary checks like `item.title || item.name`.
 *
 * WHY A COMPOSITE KEY IS NEEDED:
 * TMDB uses separate auto-incrementing ID sequences in its database for movies and TV shows.
 * Therefore, movie ID 157336 and TV series ID 157336 can and do collide.
 * Using a composite key `${mediaType}-${id}` (e.g. "movie-157336" vs "tv-157336") provides
 * guaranteed uniqueness across all watchlist operations, removals, and localStorage sync.
 */

export type MediaType = 'movie' | 'tv';

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

export interface MediaCredits {
  cast: CastMember[];
  crew: CrewMember[];
}

/**
 * Normalized internal media contract
 */
export interface MediaItem {
  id: number;
  mediaType: MediaType;
  title: string;          // From movie.title or tv.name
  year: string;           // Formatted 4-digit year from release_date or first_air_date
  posterPath: string | null;
  backdropPath: string | null;
  rating: number;         // Normalized vote_average
  voteCount: number;
  overview: string;
}

/**
 * Extended details for modal presentation
 */
export interface MediaDetails extends MediaItem {
  runtime: number | null; // Minutes for film, or average episode length for TV
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  creator?: string;       // Director for film, or created_by for TV series
  genres: Genre[];
  tagline: string | null;
  status: string;
  credits?: MediaCredits;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/**
 * Helper to construct the collision-free composite key
 */
export function getMediaKey(mediaType: MediaType, id: number): string {
  return `${mediaType}-${id}`;
}

/**
 * Watchlist Domain Types
 */
export type WatchlistStatus = 'plan_to_watch' | 'watched';

export interface WatchlistItem {
  key: string;            // Composite key: `${mediaType}-${id}`
  item: MediaItem;        // Normalized media item
  status: WatchlistStatus;
  addedAt: number;        // Timestamp
}

export interface WatchlistState {
  items: Record<string, WatchlistItem>; // O(1) lookup by composite key
  order: string[];                      // Preserves chronologic insertion order of composite keys
}

export type WatchlistAction =
  | { type: 'ADD'; item: MediaItem; status?: WatchlistStatus }
  | { type: 'REMOVE'; mediaKey: string }
  | { type: 'TOGGLE_STATUS'; mediaKey: string }
  | { type: 'SET_STATUS'; mediaKey: string; status: WatchlistStatus }
  | { type: 'ROLLBACK'; previousState: WatchlistState }
  | { type: 'HYDRATE'; payload: WatchlistState };

// Backward compatibility aliases
export type Movie = MediaItem;
export type MovieDetails = MediaDetails;
export type AsyncStatus = 'idle' | 'loading' | 'loading_more' | 'success' | 'error';
