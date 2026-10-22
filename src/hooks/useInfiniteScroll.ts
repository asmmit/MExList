import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  rootMargin?: string;
  threshold?: number;
  debounceMs?: number;
}

/**
 * useInfiniteScroll Hook
 * WHAT: Attaches an IntersectionObserver to a sentinel DOM element positioned at the end of the list.
 * WHY:  Enables declarative, performant pagination without polluting window scroll event listeners.
 *       Includes strict request locking, debouncing, and a 200px buffer to prefetch before the bottom
 *       while eliminating duplicate concurrent requests during rapid scrolling.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = '200px',
  threshold = 0.05,
  debounceMs = 120,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLockedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync request lock with loading state
  useEffect(() => {
    if (!isLoading) {
      isLockedRef.current = false;
    }
  }, [isLoading]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      // Strict guard condition: only proceed if sentinel intersects, not already loading, more data exists, and lock is free
      if (!entry || !entry.isIntersecting) return;
      if (isLoading || !hasMore || isLockedRef.current) return;

      // Debounce trigger to avoid firing duplicate concurrent requests during rapid scrolling
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (!isLoading && hasMore && !isLockedRef.current) {
          isLockedRef.current = true;
          onLoadMore();
        }
      }, debounceMs);
    },
    [onLoadMore, hasMore, isLoading, debounceMs]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root: null, // viewport
      rootMargin, // 200px threshold buffer
      threshold,
    });

    observer.observe(sentinel);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      observer.disconnect();
    };
  }, [handleIntersect, hasMore, rootMargin, threshold]);

  return sentinelRef;
}
