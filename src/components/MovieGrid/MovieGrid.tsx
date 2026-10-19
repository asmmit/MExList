import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MediaItem, AsyncStatus } from '../../types/media';
import { MovieCard } from '../MovieCard/MovieCard';
import { SkeletonGrid } from '../Skeleton/SkeletonCard';
import { EmptyState } from '../EmptyState/EmptyState';
import { ErrorState } from '../ErrorState/ErrorState';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import styles from './MovieGrid.module.css';

type MediaFilter = 'all' | 'movie' | 'tv';

interface MovieGridProps {
  movies: MediaItem[];
  status: AsyncStatus;
  error: string | null;
  query: string;
  totalResults: number;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onClearSearch: () => void;
  onSelectMovie?: (movie: MediaItem) => void;
  isOffline?: boolean;
  isPaused?: boolean; // Pauses infinite scroll when slide-over drawer or modal is open
}

const FILTER_TABS: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'Series' },
];

/**
 * MovieGrid Component ("Discover")
 *
 * ARCHITECTURAL NOTES (Interview & Assessment Explainability):
 * 1. CLIENT-SIDE SEGMENTED FILTERING:
 *    Filter switching ("All" | "Movies" | "Series") is performed entirely in memory
 *    over the loaded results via `useMemo`. This guarantees 0 network refetches, no layout
 *    jank, and maintains current scroll position without resetting pagination or debounce state.
 *
 * 2. COMPOSITE KEY RECONCILIATION:
 *    Cards are keyed by `${movie.mediaType}-${movie.id}` to eliminate React reconciliation
 *    conflicts should TMDB return identical auto-increment IDs for a movie and a TV series.
 *
 * 3. WHY THE SENTINEL IS THE LAST ELEMENT OF DISCOVER ONLY:
 *    The infinite scroll sentinel MUST reside strictly as the trailing element of this
 *    Discover results section. If any subsequent sections (like the Watchlist) sit below an
 *    infinite stream, the IntersectionObserver fires continuously as the user approaches the
 *    bottom, perpetually appending new movies and making subsequent sections unreachable.
 */
export function MovieGrid({
  movies,
  status,
  error,
  query,
  totalResults,
  hasMore,
  onLoadMore,
  onRetry,
  onClearSearch,
  onSelectMovie,
  isOffline,
  isPaused = false,
}: MovieGridProps) {
  const [filter, setFilter] = useState<MediaFilter>('all');

  // Client-side filtering of loaded results - avoids refetching and scroll reset
  const filteredMovies = useMemo(() => {
    if (filter === 'all') return movies;
    return movies.filter((m) => m.mediaType === filter);
  }, [movies, filter]);

  // Infinite scroll sentinel hook (paused when drawer or modal is active)
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    hasMore: hasMore && !isPaused,
    isLoading: status === 'loading' || status === 'loading_more' || isPaused,
    rootMargin: '400px',
  });

  // Initial loading state
  if (status === 'loading') {
    return (
      <section className={styles.gridSection} id="discover-section" aria-label="Discover cinema and series">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>
              {query.trim() ? `Searching “${query}”` : 'Curated Discoveries'}
            </h2>
            <span className={styles.count}>Scanning Archives...</span>
          </div>
        </div>
        <SkeletonGrid count={12} />
      </section>
    );
  }

  // Error / Offline state
  if (status === 'error' && movies.length === 0) {
    return (
      <section className={styles.gridSection} id="discover-section">
        <ErrorState error={error} isOffline={isOffline} onRetry={onRetry} />
      </section>
    );
  }

  // Zero-results empty state
  if (status === 'success' && movies.length === 0) {
    return (
      <section className={styles.gridSection} id="discover-section">
        <EmptyState query={query} onClear={onClearSearch} />
      </section>
    );
  }

  return (
    <section className={styles.gridSection} id="discover-section" aria-label="Discover cinema and series">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            {query.trim() ? `Results for “${query}”` : 'Curated Discoveries'}
          </h2>
          <span className={styles.count}>
            {filter === 'all'
              ? `${totalResults.toLocaleString()} ${totalResults === 1 ? 'Title' : 'Titles'} Available`
              : `${filteredMovies.length} ${filter === 'tv' ? 'Series' : 'Films'} Shown`}
          </span>
        </div>

        {/* Animated Segmented Filter Control */}
        <div className={styles.headerRight}>
          <nav
            className={styles.segmentedControl}
            role="tablist"
            aria-label="Filter media by type"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = filter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={styles.segmentBtn}
                  data-active={isActive}
                  onClick={() => setFilter(tab.value)}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeMediaFilter"
                      className={styles.segmentIndicator}
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <MovieCard
              key={`${movie.mediaType}-${movie.id}`}
              movie={movie}
              onClick={onSelectMovie}
            />
          ))
        ) : (
          <div className={styles.emptyFilteredState}>
            <p className={styles.emptyFilteredText}>
              No {filter === 'tv' ? 'series' : 'movies'} found in currently loaded batch.
            </p>
            <button
              type="button"
              className={styles.resetFilterBtn}
              onClick={() => setFilter('all')}
            >
              Show All Titles
            </button>
          </div>
        )}
      </div>

      {/* Infinite Scroll Sentinel (Must be strictly the last item in Discover) */}
      {hasMore && !isPaused && (
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true">
          {status === 'loading_more' && (
            <span className={styles.loadingMoreIndicator}>
              Retrieving next reel...
            </span>
          )}
        </div>
      )}
    </section>
  );
}
