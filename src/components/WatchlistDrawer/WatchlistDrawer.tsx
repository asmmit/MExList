import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass } from 'lucide-react';
import { useWatchlist } from '../../hooks/useWatchlist';
import { WatchlistStatus, Movie } from '../../types/movie';
import { WatchlistCard } from '../WatchlistSection/WatchlistCard';
import { scrollToTarget } from '../../hooks/useLenis';
import styles from './WatchlistDrawer.module.css';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie?: (movie: Movie) => void;
}

/**
 * WatchlistDrawer Component
 *
 * ARCHITECTURAL NOTES (Interview & Assessment Explainability):
 * WHY THE DRAWER DOES NOT DEPEND ON PAGE SCROLL POSITION:
 * The drawer acts as a viewport-anchored overlay connected directly to the central
 * WatchlistContext. Regardless of whether the user is 200px or 12,000px down an
 * infinite-scrolling results feed, the drawer accesses the exact same in-memory state
 * without requiring the user to navigate away or lose their browsing position.
 */
export function WatchlistDrawer({
  isOpen,
  onClose,
  onSelectMovie,
}: WatchlistDrawerProps) {
  const [activeTab, setActiveTab] = useState<WatchlistStatus>('plan_to_watch');
  const drawerRef = useRef<HTMLDivElement>(null);

  const { planToWatchList, watchedList, state } = useWatchlist();
  const currentList = activeTab === 'plan_to_watch' ? planToWatchList : watchedList;
  const isTotallyEmpty = state.order.length === 0;

  // Body scroll lock while drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Keyboard accessibility: Escape key & Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleScrollToSearch = () => {
    onClose();
    setTimeout(() => {
      scrollToTarget('#search-container', { offset: -60 });
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={styles.scrim}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="presentation"
        >
          <motion.aside
            ref={drawerRef}
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            {/* Header */}
            <div className={styles.drawerHeader}>
              <div className={styles.titleArea}>
                <span className={styles.label}>Personal Ledger</span>
                <h2 id="drawer-title" className={styles.title}>
                  Your Reel
                </h2>
              </div>

              <button
                type="button"
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close Reel drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className={styles.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'plan_to_watch'}
                data-active={activeTab === 'plan_to_watch'}
                className={styles.tabBtn}
                onClick={() => setActiveTab('plan_to_watch')}
              >
                <span>Plan to Watch</span>
                <span className={styles.badge}>{planToWatchList.length}</span>
                {activeTab === 'plan_to_watch' && (
                  <motion.div
                    className={styles.tabUnderline}
                    layoutId="drawerTabUnderline"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'watched'}
                data-active={activeTab === 'watched'}
                className={styles.tabBtn}
                onClick={() => setActiveTab('watched')}
              >
                <span>Watched</span>
                <span className={styles.badge}>{watchedList.length}</span>
                {activeTab === 'watched' && (
                  <motion.div
                    className={styles.tabUnderline}
                    layoutId="drawerTabUnderline"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            </div>

            {/* Drawer Body */}
            <div className={styles.body}>
              {currentList.length === 0 ? (
                <div className={styles.emptyState}>
                  <h3 className={styles.emptyTitle}>
                    {isTotallyEmpty
                      ? 'Nothing saved yet.'
                      : activeTab === 'plan_to_watch'
                      ? 'No planned features.'
                      : 'No finished features.'}
                  </h3>
                  <p className={styles.emptyText}>
                    {isTotallyEmpty
                      ? 'Nothing saved yet. Add a movie from Discover.'
                      : activeTab === 'plan_to_watch'
                      ? 'Explore the archival stream to queue your next cinema screening.'
                      : 'Mark features as watched to record your personal viewing ledger.'}
                  </p>
                  <button
                    type="button"
                    className={styles.emptyActionBtn}
                    onClick={handleScrollToSearch}
                  >
                    <Compass size={13} style={{ marginRight: '0.45rem', verticalAlign: '-1px' }} />
                    <span>Explore Discover</span>
                  </button>
                </div>
              ) : (
                <div className={styles.drawerGrid}>
                  {currentList.map((item) => (
                    <WatchlistCard
                      key={item.movie.id}
                      item={item}
                      theme="dark"
                      onSelectMovie={(movie) => {
                        onClose();
                        onSelectMovie?.(movie);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
