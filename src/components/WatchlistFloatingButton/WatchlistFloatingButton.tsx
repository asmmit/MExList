import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import { useWatchlist } from '../../hooks/useWatchlist';
import styles from './WatchlistFloatingButton.module.css';

interface WatchlistFloatingButtonProps {
  onClick: () => void;
}

/**
 * WatchlistFloatingButton Component
 * WHAT: Persistent fixed pill trigger for the Reel drawer (bottom-right desktop / bottom-center mobile).
 * WHY:  Ensures the user can access their saved films at ANY scroll depth without being blocked
 *       by infinite scroll pagination, featuring an animated spring "pop" badge on count updates.
 */
export function WatchlistFloatingButton({ onClick }: WatchlistFloatingButtonProps) {
  const { state } = useWatchlist();
  const count = state.order.length;

  return (
    <button
      type="button"
      className={styles.floatingBtn}
      onClick={onClick}
      aria-label={`Open Your Reel (${count} movies saved)`}
      data-cursor-button="true"
    >
      <Film size={15} className={styles.icon} aria-hidden="true" />
      <span>Your Reel</span>

      {/* Spring Pop Badge */}
      <motion.span
        key={count}
        className={styles.badge}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      >
        {count}
      </motion.span>
    </button>
  );
}
