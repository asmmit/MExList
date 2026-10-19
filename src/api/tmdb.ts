import { Movie, MovieDetails, TMDBResponse } from '../types/movie';
import { FALLBACK_MOVIES, filterMockMovies } from './mockData';

/**
 * TMDB API Client Configuration
 * Base URLs for REST endpoints and image CDN delivery.
 */
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Access the API key defined in .env via Vite's import.meta.env
 */
const API_KEY = import.meta.env.VITE_TMDB_KEY as string | undefined;

/**
 * Helper to determine if we have a valid API key configured.
 */
export const hasValidApiKey = (): boolean => {
  return Boolean(API_KEY && API_KEY.trim() !== '' && API_KEY !== 'your_tmdb_api_key_here');
};

/**
 * Formats a TMDB poster or backdrop path to its absolute CDN URL.
 * WHAT: Appends image path to the appropriate TMDB image size bucket.
 * WHY:  Centralizes image URL creation and prevents layout breaks when paths are null.
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
 * Standardized Fetch Wrapper with AbortSignal & Status Validation
 * WHAT: Dispatches network requests with custom headers, query params, and signal propagation.
 * WHY:  Ensures that HTTP errors (like 401 Unauthorized or 404 Not Found) are not treated
 *       as successful responses by fetch(), and guarantees that cancelled requests
 *       bubble up their AbortError for caller cancellation loops.
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
        'Accept': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown network error');
      throw new Error(`TMDB HTTP error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error: unknown) {
    // Re-throw AbortError untouched so calling hooks can identify intentional cancellations
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    // Re-throw genuine network or server errors
    throw error;
  }
}

/**
 * Searches movies by user query with page offset.
 * WHAT: Calls TMDB /search/movie or falls back to curated offline catalog.
 * WHY:  Accepts an AbortSignal so rapid keystroke searches automatically cancel
 *       in-flight requests, avoiding stale data and race conditions.
 */
export async function searchMovies(
  query: string,
  page = 1,
  signal?: AbortSignal
): Promise<TMDBResponse<Movie>> {
  if (!hasValidApiKey() || !navigator.onLine) {
    // Provide simulated latency for authentic UI feel during local/offline testing
    await new Promise((resolve) => setTimeout(resolve, 150));
    return filterMockMovies(query, page);
  }

  return fetchFromTMDB<TMDBResponse<Movie>>(
    '/search/movie',
    {
      query: query.trim(),
      page,
      include_adult: 'false',
      language: 'en-US',
    },
    signal
  );
}

/**
 * Fetches trending or popular movies to populate the initial "Discover" state.
 * WHAT: Calls TMDB /trending/movie/day or returns the fallback showcase.
 * WHY:  Ensures the page displays a curated visual experience upon initial load
 *       before the user has typed anything into the search input.
 */
export async function getTrendingMovies(
  page = 1,
  signal?: AbortSignal
): Promise<TMDBResponse<Movie>> {
  if (!hasValidApiKey() || !navigator.onLine) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return filterMockMovies('', page);
  }

  return fetchFromTMDB<TMDBResponse<Movie>>(
    '/trending/movie/day',
    {
      page,
      language: 'en-US',
    },
    signal
  );
}

/**
 * Retrieves full movie details including runtime, genres, and cast roster.
 * WHAT: Calls TMDB /movie/{id} with append_to_response=credits.
 * WHY:  Powers the rich shared-element Detail Modal with deep metadata without
 *       making multiple roundtrip network calls.
 */
export async function getMovieDetails(
  id: number,
  signal?: AbortSignal
): Promise<MovieDetails> {
  if (!hasValidApiKey() || !navigator.onLine) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const found = FALLBACK_MOVIES.find((m) => m.id === id);
    if (found) return found;
    // If not in primary curated list, construct a graceful fallback detail object
    return {
      id,
      title: 'Cinematic Feature',
      overview: 'An enigmatic production currently residing in our archives.',
      poster_path: null,
      backdrop_path: null,
      release_date: '2024-01-01',
      vote_average: 8.0,
      vote_count: 100,
      runtime: 120,
      tagline: 'A story yet to be fully revealed.',
      status: 'Released',
      genres: [{ id: 1, name: 'Cinema' }],
      credits: { cast: [], crew: [] },
    };
  }

  return fetchFromTMDB<MovieDetails>(
    `/movie/${id}`,
    {
      append_to_response: 'credits',
      language: 'en-US',
    },
    signal
  );
}
