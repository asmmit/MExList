import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  rootMargin?: string;
  threshold?: number;
}

/**
 * useInfiniteScroll Hook
 * WHAT: Attaches an IntersectionObserver to a sentinel DOM element positioned at the end of the list.
 * WHY:  Enables declarative, performant pagination without polluting window scroll event listeners.
 *       Pre-fetches the next page when the user is 300px away from the bottom to ensure
 *       a smooth, unbroken scrolling experience.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = '300px',
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      // Trigger only if sentinel is visible, more items exist, and not currently fetching
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, isLoading]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root: null, // viewport
      rootMargin,
      threshold,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, hasMore, rootMargin, threshold]);

  return sentinelRef;
}
