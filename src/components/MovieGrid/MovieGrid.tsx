import { Movie, AsyncStatus } from '../../types/movie';
import { MovieCard } from '../MovieCard/MovieCard';
import { SkeletonGrid } from '../Skeleton/SkeletonCard';
import { EmptyState } from '../EmptyState/EmptyState';
import { ErrorState } from '../ErrorState/ErrorState';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import styles from './MovieGrid.module.css';

interface MovieGridProps {
  movies: Movie[];
  status: AsyncStatus;
  error: string | null;
  query: string;
  totalResults: number;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onClearSearch: () => void;
  onSelectMovie?: (movie: Movie) => void;
  isOffline?: boolean;
  isPaused?: boolean; // Pauses infinite scroll when slide-over drawer or modal is open
}

/**
 * MovieGrid Component ("Discover")
 *
 * ARCHITECTURAL NOTES (Interview & Assessment Explainability):
 * 1. WHY THE SENTINEL IS THE LAST ELEMENT OF DISCOVER ONLY:
 *    The infinite scroll sentinel MUST reside strictly as the trailing element of this
 *    Discover results section. If any subsequent sections (like the Watchlist) sit below an
 *    infinite stream, the IntersectionObserver fires continuously as the user approaches the
 *    bottom, perpetually appending new movies and making subsequent sections unreachable.
 *
 * 2. PAUSING WHILE DRAWER IS OPEN:
 *    When `isPaused` is true (e.g. while the Reel drawer is open), `hasMore` is masked as false
 *    and `isLoading` is held true, instantly disconnecting the observer to prevent wasteful
 *    background network requests.
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
      <section className={styles.gridSection} id="discover-section" aria-label="Discover movies">
        <div className={styles.header}>
          <h2 className={styles.title}>
            {query.trim() ? `Searching “${query}”` : 'Curated Discoveries'}
          </h2>
          <span className={styles.count}>Scanning Archives...</span>
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
    <section className={styles.gridSection} id="discover-section" aria-label="Discover movies">
      <div className={styles.header}>
        <h2 className={styles.title}>
          {query.trim() ? `Results for “${query}”` : 'Curated Discoveries'}
        </h2>
        <span className={styles.count}>
          {totalResults.toLocaleString()} {totalResults === 1 ? 'Title' : 'Titles'} Available
        </span>
      </div>

      <div className={styles.grid}>
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={onSelectMovie}
          />
        ))}
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
