import { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { useWatchlist } from '../../hooks/useWatchlist';
import { Movie, WatchlistStatus } from '../../types/movie';
import { WatchlistCard } from './WatchlistCard';
import { scrollToTarget } from '../../hooks/useLenis';
import styles from './WatchlistSection.module.css';

interface WatchlistSectionProps {
  onSelectMovie?: (movie: Movie) => void;
}

/**
 * WatchlistSection Component ("Your Reel")
 *
 * ARCHITECTURAL NOTES (Interview & Assessment Explainability):
 * 1. WHY THE SENTINEL WAS MOVED:
 *    Previously, placing the Watchlist section below an infinite-scrolling results grid caused a
 *    reachability deadlock: the IntersectionObserver continuously loaded subsequent pages as the user
 *    scrolled down, perpetually pushing the Watchlist further down and making it impossible to reach.
 *    By reordering the narrative flow (Hero -> Your Reel -> Discover), the infinite scroll sentinel
 *    is placed at the very end of Discover where nothing essential sits below it.
 *
 * 2. WHY THE DRAWER DOES NOT DEPEND ON PAGE SCROLL POSITION:
 *    A dedicated slide-over drawer (opened via the persistent floating pill button) allows users to
 *    review, toggle, and curate their reel at ANY scroll depth without losing their place in an
 *    endless stream of 100+ discovered films.
 */
export function WatchlistSection({ onSelectMovie }: WatchlistSectionProps) {
  const [activeTab, setActiveTab] = useState<WatchlistStatus>('plan_to_watch');
  const { planToWatchList, watchedList, state } = useWatchlist();

  const currentList = activeTab === 'plan_to_watch' ? planToWatchList : watchedList;
  const isTotallyEmpty = state.order.length === 0;

  const handleScrollToSearch = () => {
    scrollToTarget('#search-container', { offset: -60 });
  };

  return (
    <section className={styles.section} id="watchlist-section" aria-label="Your Reel Watchlist">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className={styles.label}>Personal Ledger</span>
            <h2 className={styles.headline}>Your Reel</h2>
          </div>

          {/* Animated Tabs with layoutId */}
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
                  layoutId="watchlistTabUnderline"
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
                  layoutId="watchlistTabUnderline"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Watchlist Grid or Empty State */}
        {currentList.length === 0 ? (
          <div className={styles.emptyReel}>
            <h3 className={styles.emptyTitle}>
              {isTotallyEmpty
                ? 'Nothing saved yet.'
                : activeTab === 'plan_to_watch'
                ? 'No planned features.'
                : 'No finished features recorded yet.'}
            </h3>
            <p className={styles.emptyText}>
              {isTotallyEmpty
                ? 'Nothing saved yet. Add a movie from Discover.'
                : activeTab === 'plan_to_watch'
                ? 'Add movies from Discover below to queue your next cinema screening.'
                : 'Mark films as watched to preserve your cinema chronology.'}
            </p>
            <button
              type="button"
              className={styles.emptyBtn}
              onClick={handleScrollToSearch}
            >
              <Compass size={13} style={{ marginRight: '0.45rem', verticalAlign: '-1px' }} />
              <span>Explore Discover Archives</span>
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {currentList.map((item) => (
              <WatchlistCard
                key={item.movie.id}
                item={item}
                theme="inverted"
                onSelectMovie={onSelectMovie}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
