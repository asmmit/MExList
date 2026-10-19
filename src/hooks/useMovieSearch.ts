import { useState, useEffect, useRef, useCallback } from 'react';
import { Movie, AsyncStatus } from '../types/movie';
import { searchMovies, getTrendingMovies } from '../api/tmdb';

interface UseMovieSearchResult {
  results: Movie[];
  status: AsyncStatus;
  error: string | null;
  page: number;
  totalPages: number;
  totalResults: number;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
  isOffline: boolean;
}

/**
 * useMovieSearch Hook
 * WHAT: Coordinates movie searches, pagination, deduplication, and cancellation.
 * WHY:  Guarantees race-condition prevention during rapid typing via AbortController.
 *       Whenever a new search fires, the previous in-flight HTTP request is aborted,
 *       preventing slower obsolete responses from overwriting newer query results.
 */
export function useMovieSearch(query: string): UseMovieSearchResult {
  const [results, setResults] = useState<Movie[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Active AbortController instance across renders
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track online/offline browser state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reset pagination whenever the search query changes
  useEffect(() => {
    setPage(1);
    setResults([]);
  }, [query]);

  // Primary Fetch Orchestrator
  const fetchMovies = useCallback(async (searchQuery: string, pageNum: number) => {
    // 1. Abort existing in-flight request if present
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 2. Instantiate a fresh AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 3. Transition status appropriately
    setStatus(pageNum === 1 ? 'loading' : 'loading_more');
    setError(null);

    try {
      const trimmed = searchQuery.trim();
      const response = trimmed
        ? await searchMovies(trimmed, pageNum, controller.signal)
        : await getTrendingMovies(pageNum, controller.signal);

      // Verify that this controller is still the active one before committing state
      if (abortControllerRef.current !== controller) {
        return;
      }

      setResults((prev) => {
        if (pageNum === 1) {
          return response.results;
        }
        // Deduplicate movies by ID when appending subsequent pages
        const existingIds = new Set(prev.map((m) => m.id));
        const uniqueNew = response.results.filter((m) => !existingIds.has(m.id));
        return [...prev, ...uniqueNew];
      });

      setTotalPages(response.total_pages);
      setTotalResults(response.total_results);
      setStatus('success');
    } catch (err: unknown) {
      // 4. Silently ignore intentional cancellations
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      // Check if this controller is still active
      if (abortControllerRef.current !== controller) {
        return;
      }

      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred while fetching movies.';
      setError(errorMessage);
      setStatus('error');
    }
  }, []);

  // Execute fetch whenever query or page changes
  useEffect(() => {
    fetchMovies(query, page);

    // Cleanup: Abort pending request if component unmounts or effect re-runs
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, page, fetchMovies]);

  // Action: Load Next Page
  const loadMore = useCallback(() => {
    if (status !== 'loading' && status !== 'loading_more' && page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [status, page, totalPages]);

  // Action: Manual Retry
  const retry = useCallback(() => {
    fetchMovies(query, page);
  }, [fetchMovies, query, page]);

  const hasMore = page < totalPages;

  return {
    results,
    status,
    error,
    page,
    totalPages,
    totalResults,
    hasMore,
    loadMore,
    retry,
    isOffline,
  };
}
