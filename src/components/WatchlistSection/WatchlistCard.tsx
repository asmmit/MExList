import React from 'react';
import { Check, Clock, Trash2 } from 'lucide-react';
import { WatchlistItem, MediaItem } from '../../types/media';
import { getImageUrl } from '../../api/tmdb';
import { useWatchlist } from '../../hooks/useWatchlist';
import styles from './WatchlistCard.module.css';

interface WatchlistCardProps {
  item: WatchlistItem;
  theme?: 'inverted' | 'dark';
  onSelectMovie?: (item: MediaItem) => void;
}

/**
 * WatchlistCard Component
 * WHAT: Reusable card for items in "Your Reel", displaying a "FILM" or "SERIES" tag.
 * WHY:  Unified across both the main page section and the slide-over drawer, supporting
 *       instant optimistic updates and composite-key removals.
 */
export function WatchlistCard({
  item,
  theme = 'inverted',
  onSelectMovie,
}: WatchlistCardProps) {
  const { key, item: media, status } = item;
  const { toggleWatchlistStatus, removeFromWatchlist } = useWatchlist();

  const poster = getImageUrl(media.posterPath, 'w300');
  const year = media.year || '—';
  const rating = media.rating ? media.rating.toFixed(1) : 'NR';
  const isSeries = media.mediaType === 'tv';

  const handleSelect = () => {
    onSelectMovie?.(media);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectMovie?.(media);
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
        aria-label={`View details for ${media.title}`}
      >
        {/* Medium Type Indicator Badge */}
        <span className={styles.mediaTypeTag} aria-label={`Type: ${isSeries ? 'Series' : 'Film'}`}>
          {isSeries ? 'Series' : 'Film'}
        </span>

        {poster ? (
          <img
            src={poster}
            alt={`Poster for ${media.title}`}
            className={styles.posterImg}
            loading="lazy"
          />
        ) : (
          <div className={styles.fallbackMonogram}>
            {media.title.charAt(0)}
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <h3
          className={styles.cardTitle}
          title={media.title}
          onClick={handleSelect}
        >
          {media.title}
        </h3>

        <div className={styles.cardMeta}>
          <span>{year}</span>
          <span>★ {rating}</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => toggleWatchlistStatus(key)}
            aria-label={
              status === 'plan_to_watch'
                ? `Mark ${media.title} as watched`
                : `Move ${media.title} to plan to watch`
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
            onClick={() => removeFromWatchlist(key)}
            aria-label={`Remove ${media.title} from Reel`}
            title="Remove from Reel"
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
