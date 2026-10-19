import styles from './Skeleton.module.css';

/**
 * SkeletonCard Component
 * WHAT: Placeholder movie card with animated shimmer sweep.
 * WHY:  Communicates pending asynchronous fetch state and preserves grid geometry
 *       to prevent cumulative layout shifts (CLS).
 */
export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.posterBox} />
      <div className={styles.titleBar} />
      <div className={styles.metaBar} />
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
}

export function SkeletonGrid({ count = 10 }: SkeletonGridProps) {
  return (
    <div className={styles.grid} aria-label="Loading movies" role="status">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
      <span className="sr-only">Loading movie titles...</span>
    </div>
  );
}
