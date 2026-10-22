import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Check } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { getImageUrl } from '../../api/tmdb';
import { useWatchlist } from '../../hooks/useWatchlist';
import { useTilt } from '../../hooks/useTilt';
import styles from './MovieCard.module.css';

interface MovieCardProps {
  movie: MediaItem;
  onClick?: (movie: MediaItem) => void;
}

/**
 * MovieCard Component
 * WHAT: Displays a 3D tilt poster card with perspective, moving specular glare,
 *       floating typography layers (translateZ), media tag badge (FILM / SERIES),
 *       and slide-up watchlist action.
 * WHY:  Delivers tactile, three-dimensional physical presence and immediate medium clarity.
 */
export const MovieCard = React.memo(function MovieCard({ movie, onClick }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.mediaType, movie.id);
  const isSeries = movie.mediaType === 'tv';

  // Bind 3D perspective tilt & specular glare highlight
  const { elementRef, glareRef } = useTilt<HTMLElement>({
    maxTilt: 10,
    perspective: 1000,
  });

  const posterUrl = getImageUrl(movie.posterPath, 'w500');
  const releaseYear = movie.year || '—';
  const ratingFormatted = movie.rating
    ? movie.rating.toFixed(1)
    : 'NR';

  const handleClick = () => {
    onClick?.(movie);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        onClick?.(movie);
      }
    }
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.id, movie.mediaType);
    } else {
      addToWatchlist(movie);
    }
  };

  return (
    <article
      ref={elementRef}
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${movie.title} (${releaseYear})`}
      data-cursor-label="View"
    >
      {/* Dynamic Specular Glare Highlight */}
      <div ref={glareRef} className={styles.glare} aria-hidden="true" />

      {/* Poster Container with Parallax Depth */}
      <div className={styles.posterWrapper}>
        {/* Medium Type Indicator Badge */}
        <span
          className={styles.mediaTag}
          aria-label={`Type: ${isSeries ? 'Series' : 'Film'}`}
        >
          {isSeries ? 'Series' : 'Film'}
        </span>

        {posterUrl && !imageError ? (
          <motion.img
            layoutId={`poster-${movie.mediaType}-${movie.id}`}
            src={posterUrl}
            alt={`Poster for ${movie.title}`}
            className={styles.posterImg}
            loading="lazy"
            onError={() => setImageError(true)}
            width="500"
            height="750"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <div className={styles.posterFallback}>
            <span className={styles.fallbackMonogram}>
              {movie.title.charAt(0) || '★'}
            </span>
            <span className={styles.fallbackTitle}>{movie.title}</span>
          </div>
        )}

        {/* Slide-up overlay on hover with Add to Reel action */}
        <div className={styles.hoverOverlay}>
          <button
            type="button"
            className={styles.watchlistBtn}
            data-active={inWatchlist}
            onClick={handleWatchlistClick}
            aria-label={
              inWatchlist
                ? `Remove ${movie.title} from Reel`
                : `Add ${movie.title} to Reel`
            }
          >
            {inWatchlist ? (
              <>
                <Check size={14} aria-hidden="true" />
                <span>In Reel</span>
              </>
            ) : (
              <>
                <Plus size={14} aria-hidden="true" />
                <span>Add to Reel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3D Floating Information Block (translateZ) */}
      <div className={styles.info}>
        <h3 className={styles.title} title={movie.title}>
          {movie.title}
        </h3>
        <div className={styles.meta}>
          <span>{releaseYear}</span>
          <span className={styles.rating} aria-label={`Rating: ${ratingFormatted} out of 10`}>
            <Star size={12} fill="currentColor" aria-hidden="true" />
            {ratingFormatted}
          </span>
        </div>
      </div>
    </article>
  );
});
