import { MediaItem, MediaDetails, TMDBResponse, MediaType } from '../types/media';
import { FALLBACK_CATALOG, filterMockMedia } from './mockData';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const API_KEY = import.meta.env.VITE_TMDB_KEY as string | undefined;

export const hasValidApiKey = (): boolean => {
  return Boolean(API_KEY && API_KEY.trim() !== '' && API_KEY !== 'your_tmdb_api_key_here');
};

/**
 * Formats a TMDB poster or backdrop path to its absolute CDN URL.
 */
export function getImageUrl(
  path: string | null,
  size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'
): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Raw TMDB Multi-Search Result interface
 */
interface RawTMDBMultiItem {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  overview?: string;
}

/**
 * Normalization Boundary Helper
 *
 * WHY THE API RESPONSE IS NORMALIZED IN ONE PLACE (Interview Explainability):
 * TMDB's data contract diverges significantly across media types:
 * - Movies expose: `title`, `release_date`, `runtime`
 * - TV Series expose: `name`, `first_air_date`, `episode_run_time`, `number_of_seasons`
 * Normalizing immediately upon network ingestion ensures all downstream React components,
 * hooks, filters, and reducers operate against one single, strongly-typed `MediaItem` contract.
 * This completely eliminates defensive fallback branching (`m.title || m.name`) across the UI.
 */
export function normalizeTMDBItem(raw: RawTMDBMultiItem): MediaItem {
  const mediaType: MediaType = raw.media_type === 'tv' ? 'tv' : 'movie';
  const title = (raw.title || raw.name || 'Untitled Feature').trim();
  const rawDate = raw.release_date || raw.first_air_date || '';
  const year = rawDate ? rawDate.slice(0, 4) : '—';

  return {
    id: raw.id,
    mediaType,
    title,
    year,
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    rating: typeof raw.vote_average === 'number' ? raw.vote_average : 0,
    voteCount: raw.vote_count ?? 0,
    overview: raw.overview ?? '',
  };
}

/**
 * Standardized Fetch Wrapper with AbortSignal & Status Validation
 */
async function fetchFromTMDB<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  signal?: AbortSignal
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);

  if (API_KEY) {
    url.searchParams.set('api_key', API_KEY);
  }

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown network error');
      throw new Error(`TMDB HTTP error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw error;
  }
}

/**
 * Searches across both Movies and TV Series using /search/multi.
 * WHAT: Queries TMDB /search/multi, filters out non-cinematic entities ("person"),
 *       and normalizes remaining items into the MediaItem contract.
 * WHY:  Accepts AbortSignal to enable race-condition cancellation on rapid keystrokes.
 */
export async function searchMovies(
  query: string,
  page = 1,
  signal?: AbortSignal
): Promise<TMDBResponse<MediaItem>> {
  if (!hasValidApiKey() || !navigator.onLine) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return filterMockMedia(query, page);
  }

  const response = await fetchFromTMDB<TMDBResponse<RawTMDBMultiItem>>(
    '/search/multi',
    {
      query: query.trim(),
      page,
      include_adult: 'false',
      language: 'en-US',
    },
    signal
  );

  // Filter to only movie or tv media types (drop "person" entities)
  const validItems = (response.results || []).filter(
    (item) => item.media_type === 'movie' || item.media_type === 'tv'
  );

  return {
    page: response.page,
    results: validItems.map(normalizeTMDBItem),
    total_pages: response.total_pages,
    total_results: response.total_results,
  };
}

/**
 * Fetches combined trending movies and TV series for the initial Discover grid.
 */
export async function getTrendingMovies(
  page = 1,
  signal?: AbortSignal
): Promise<TMDBResponse<MediaItem>> {
  if (!hasValidApiKey() || !navigator.onLine) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return filterMockMedia('', page);
  }

  const response = await fetchFromTMDB<TMDBResponse<RawTMDBMultiItem>>(
    '/trending/all/day',
    {
      page,
      language: 'en-US',
    },
    signal
  );

  const validItems = (response.results || []).filter(
    (item) => item.media_type === 'movie' || item.media_type === 'tv'
  );

  return {
    page: response.page,
    results: validItems.map(normalizeTMDBItem),
    total_pages: response.total_pages,
    total_results: response.total_results,
  };
}

/**
 * Fetches detailed metadata for a film or TV series, normalizing runtime, seasons, and creators.
 * WHAT: Calls /movie/{id} or /tv/{id} with append_to_response=credits based on mediaType.
 * WHY:  Enriches the detail modal with medium-specific fields (e.g. number of seasons, episodes).
 */
export async function getMediaDetails(
  mediaType: MediaType,
  id: number,
  signal?: AbortSignal
): Promise<MediaDetails> {
  if (!hasValidApiKey() || !navigator.onLine) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const found = FALLBACK_CATALOG.find((m) => m.id === id && m.mediaType === mediaType);
    if (found) return found;

    return {
      id,
      mediaType,
      title: mediaType === 'tv' ? 'Television Series' : 'Cinematic Feature',
      year: '2024',
      overview: 'An enigmatic production currently residing in our archives.',
      posterPath: null,
      backdropPath: null,
      rating: 8.0,
      voteCount: 100,
      runtime: mediaType === 'tv' ? 50 : 120,
      numberOfSeasons: mediaType === 'tv' ? 1 : undefined,
      numberOfEpisodes: mediaType === 'tv' ? 10 : undefined,
      creator: mediaType === 'tv' ? 'Series Creator' : 'Film Director',
      tagline: 'A story yet to be fully revealed.',
      status: 'Released',
      genres: [{ id: 1, name: mediaType === 'tv' ? 'Drama Series' : 'Cinema' }],
      credits: { cast: [], crew: [] },
    };
  }

  const endpoint = mediaType === 'tv' ? `/tv/${id}` : `/movie/${id}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = await fetchFromTMDB<any>(
    endpoint,
    {
      append_to_response: 'credits',
      language: 'en-US',
    },
    signal
  );

  const title = (raw.title || raw.name || 'Untitled').trim();
  const rawDate = raw.release_date || raw.first_air_date || '';
  const year = rawDate ? rawDate.slice(0, 4) : '—';

  // Normalize runtime: movie gives runtime in minutes; tv gives episode_run_time array
  let runtime: number | null = null;
  if (typeof raw.runtime === 'number') {
    runtime = raw.runtime;
  } else if (Array.isArray(raw.episode_run_time) && raw.episode_run_time.length > 0) {
    runtime = raw.episode_run_time[0];
  }

  // Creator normalization: tv uses created_by array; movie uses Director from crew
  let creator: string | undefined;
  if (mediaType === 'tv') {
    if (Array.isArray(raw.created_by) && raw.created_by.length > 0) {
      creator = raw.created_by[0].name;
    } else {
      creator = raw.credits?.crew?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => c.job === 'Executive Producer' || c.job === 'Creator'
      )?.name;
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    creator = raw.credits?.crew?.find((c: any) => c.job === 'Director')?.name;
  }

  return {
    id: raw.id,
    mediaType,
    title,
    year,
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    rating: typeof raw.vote_average === 'number' ? raw.vote_average : 0,
    voteCount: raw.vote_count ?? 0,
    overview: raw.overview ?? '',
    runtime,
    numberOfSeasons: raw.number_of_seasons,
    numberOfEpisodes: raw.number_of_episodes,
    creator,
    genres: raw.genres || [],
    tagline: raw.tagline || null,
    status: raw.status || 'Released',
    credits: raw.credits,
  };
}

/**
 * Backward compatibility alias for single-id movie requests
 */
export async function getMovieDetails(
  id: number,
  signal?: AbortSignal
): Promise<MediaDetails> {
  return getMediaDetails('movie', id, signal);
}
