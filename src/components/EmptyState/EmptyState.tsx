import { MagneticButton } from '../Magnetic/MagneticButton';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  query: string;
  onClear: () => void;
}

/**
 * EmptyState Component
 * WHAT: Elegant, illustration-free empty state for zero-result queries.
 * WHY:  Preserves the award-winning minimalist aesthetic without childish clipart.
 */
export function EmptyState({ query, onClear }: EmptyStateProps) {
  return (
    <div className={styles.emptyContainer} role="region" aria-label="No results">
      <h3 className={styles.headline}>The archives hold no record.</h3>
      <p className={styles.description}>
        No titles match &ldquo;{query}&rdquo;. Check for spelling subtleties, explore a director&rsquo;s name,
        or reset to view current cinema highlights.
      </p>
      <MagneticButton type="button" className={styles.clearBtn} onClick={onClear}>
        Reset Exploration
      </MagneticButton>
    </div>
  );
}
