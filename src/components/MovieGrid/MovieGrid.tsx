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
}

/**
 * MovieGrid Component
 * WHAT: Responsive grid displaying movies with infinite scroll sentinel, skeletons, and error handling.
 * WHY:  Ensures that users experience zero layout shifts, receive visual feedback during background fetches,
 *       and seamlessly scroll through hundreds of archival entries.
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
}: MovieGridProps) {
  // Infinite scroll sentinel hook
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading: status === 'loading' || status === 'loading_more',
    rootMargin: '400px',
  });

  // Initial loading state
  if (status === 'loading') {
    return (
      <section className={styles.gridSection} aria-label="Discover movies">
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
      <section className={styles.gridSection}>
        <ErrorState error={error} isOffline={isOffline} onRetry={onRetry} />
      </section>
    );
  }

  // Zero-results empty state
  if (status === 'success' && movies.length === 0) {
    return (
      <section className={styles.gridSection}>
        <EmptyState query={query} onClear={onClearSearch} />
      </section>
    );
  }

  return (
    <section className={styles.gridSection} aria-label="Discover movies">
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

      {/* Infinite Scroll Sentinel */}
      {hasMore && (
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
