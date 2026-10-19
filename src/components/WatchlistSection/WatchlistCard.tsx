import React from 'react';
import { Check, Clock, Trash2 } from 'lucide-react';
import { WatchlistItem, Movie } from '../../types/movie';
import { getImageUrl } from '../../api/tmdb';
import { useWatchlist } from '../../hooks/useWatchlist';
import styles from './WatchlistCard.module.css';

interface WatchlistCardProps {
  item: WatchlistItem;
  theme?: 'inverted' | 'dark';
  onSelectMovie?: (movie: Movie) => void;
}

/**
 * WatchlistCard Component
 * WHAT: Reusable presentation card for movies in "Your Reel", shared between the main page section and slide-over drawer.
 * WHY:  Eliminates duplicate card logic and guarantees that status toggling ("Mark Watched" / "Plan Again")
 *       and deletion update instantly via optimistic UI across all viewport entrypoints.
 */
export function WatchlistCard({
  item,
  theme = 'inverted',
  onSelectMovie,
}: WatchlistCardProps) {
  const { movie, status } = item;
  const { toggleWatchlistStatus, removeFromWatchlist } = useWatchlist();

  const poster = getImageUrl(movie.poster_path, 'w300');
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';

  const handleSelect = () => {
    onSelectMovie?.(movie);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectMovie?.(movie);
    }
  };

  return (
    <article className={styles.watchCard} data-theme={theme}>
      <div
        className={styles.posterWrap}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${movie.title}`}
      >
        {poster ? (
          <img
            src={poster}
            alt={`Poster for ${movie.title}`}
            className={styles.posterImg}
            loading="lazy"
          />
        ) : (
          <div className={styles.fallbackMonogram}>
            {movie.title.charAt(0)}
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <h3
          className={styles.cardTitle}
          title={movie.title}
          onClick={handleSelect}
        >
          {movie.title}
        </h3>

        <div className={styles.cardMeta}>
          <span>{year}</span>
          <span>★ {rating}</span>
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
}
