import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Trash2 } from 'lucide-react';
import { useWatchlist } from '../../hooks/useWatchlist';
import { Movie, WatchlistStatus } from '../../types/movie';
import { getImageUrl } from '../../api/tmdb';
import styles from './WatchlistSection.module.css';

interface WatchlistSectionProps {
  onSelectMovie?: (movie: Movie) => void;
}

/**
 * WatchlistSection Component ("Your Reel")
 * WHAT: Inverted off-white section displaying movies saved to Plan to Watch and Watched.
 * WHY:  Provides high-contrast visual break on the page, with fluid Framer Motion layoutId
 *       tab transitions and optimistic state dispatchers.
 */
export function WatchlistSection({ onSelectMovie }: WatchlistSectionProps) {
  const [activeTab, setActiveTab] = useState<WatchlistStatus>('plan_to_watch');
  const {
    planToWatchList,
    watchedList,
    toggleWatchlistStatus,
    removeFromWatchlist,
  } = useWatchlist();

  const currentList = activeTab === 'plan_to_watch' ? planToWatchList : watchedList;

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
              {activeTab === 'plan_to_watch'
                ? 'Your Reel awaits its first entry.'
                : 'No finished features recorded yet.'}
            </h3>
            <p className={styles.emptyText}>
              {activeTab === 'plan_to_watch'
                ? 'Hover or tap any movie card above and add it to your Reel to build your curated queue.'
                : 'Mark films as watched once completed to preserve your cinema chronology.'}
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {currentList.map(({ movie, status }) => {
              const poster = getImageUrl(movie.poster_path, 'w300');
              const year = movie.release_date ? movie.release_date.slice(0, 4) : '—';

              return (
                <article key={movie.id} className={styles.watchCard}>
                  <div
                    className={styles.posterWrap}
                    onClick={() => onSelectMovie?.(movie)}
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${movie.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onSelectMovie?.(movie);
                      }
                    }}
                  >
                    {poster ? (
                      <img
                        src={poster}
                        alt={`Poster for ${movie.title}`}
                        className={styles.posterImg}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {movie.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle} title={movie.title}>
                      {movie.title}
                    </h3>
                    <div className={styles.cardMeta}>
                      <span>{year}</span>
                      <span>★ {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
                    </div>

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => toggleWatchlistStatus(movie.id)}
                        aria-label={
                          status === 'plan_to_watch'
                            ? `Mark ${movie.title} as watched`
                            : `Move ${movie.title} to plan to watch`
                        }
                      >
                        {status === 'plan_to_watch' ? (
                          <>
                            <Check size={12} aria-hidden="true" />
                            <span>Mark Watched</span>
                          </>
                        ) : (
                          <>
                            <Clock size={12} aria-hidden="true" />
                            <span>Plan Again</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeFromWatchlist(movie.id)}
                        aria-label={`Remove ${movie.title} from Reel`}
                        title="Remove from Reel"
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
