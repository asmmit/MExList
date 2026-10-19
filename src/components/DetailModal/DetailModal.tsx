import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Calendar, Check, Plus, Tv, Film } from 'lucide-react';
import { MediaItem, MediaDetails } from '../../types/media';
import { getMediaDetails, getImageUrl } from '../../api/tmdb';
import { useWatchlist } from '../../hooks/useWatchlist';
import styles from './DetailModal.module.css';

interface DetailModalProps {
  movie: MediaItem | null;
  onClose: () => void;
}

/**
 * Format minutes into "2h 49m" representation.
 */
function formatRuntime(minutes: number | null): string {
  if (!minutes || minutes <= 0) return '—';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

/**
 * DetailModal Component
 * WHAT: Full-feature modal with Framer Motion shared-element poster expansion,
 *       deep cast rosters, runtime metadata, series-specific seasons/episodes/creator,
 *       focus trapping, and body scroll lock.
 * WHY:  Enriches discovery with narrative context and seamless spring motion across films and series.
 */
export function DetailModal({ movie, onClose }: DetailModalProps) {
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist, getWatchlistStatus, toggleWatchlistStatus } =
    useWatchlist();

  const isSeries = movie?.mediaType === 'tv';
  const inWatchlist = movie ? isInWatchlist(movie.mediaType, movie.id) : false;
  const currentStatus = movie ? getWatchlistStatus(movie.mediaType, movie.id) : null;

  // Lock body scroll while modal is active
  useEffect(() => {
    if (!movie) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [movie]);

  // Keyboard navigation: Escape key to close + Focus Trap
  useEffect(() => {
    if (!movie) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap logic
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movie, onClose]);

  // Fetch deep details and credits on media selection
  useEffect(() => {
    if (!movie) {
      setDetails(null);
      return;
    }

    const controller = new AbortController();
    setLoadingDetails(true);

    async function loadData() {
      try {
        if (!movie) return;
        const res = await getMediaDetails(movie.mediaType, movie.id, controller.signal);
        setDetails(res);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Failed to load media details:', err);
      } finally {
        setLoadingDetails(false);
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [movie]);

  if (!movie) return null;

  const posterUrl = getImageUrl(movie.posterPath, 'w780');
  const releaseYear = movie.year || '—';
  const topCast = details?.credits?.cast?.slice(0, 6) || [];
  const creatorOrDirector = details?.creator;

  return (
    <AnimatePresence>
      <div
        className={styles.scrim}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="presentation"
      >
        <motion.div
          ref={dialogRef}
          className={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-movie-title"
          aria-describedby="modal-movie-overview"
          tabIndex={-1}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Close Button */}
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close details dialog"
          >
            <X size={18} />
          </button>

          <div className={styles.modalContent}>
            {/* Shared-Element Poster Column */}
            <div className={styles.posterCol}>
              {posterUrl ? (
                <motion.img
                  layoutId={`poster-${movie.mediaType}-${movie.id}`}
                  src={posterUrl}
                  alt={`Cover for ${movie.title}`}
                  className={styles.modalPoster}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : (
                <div
                  style={{
                    fontSize: '4rem',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--fg-subtle)',
                  }}
                >
                  {movie.title.charAt(0)}
                </div>
              )}
            </div>

            {/* Details & Narrative Column */}
            <div className={styles.detailsCol}>
              <div className={styles.headerInfo}>
                <span className={styles.mediaBadge}>
                  {isSeries ? 'Series' : 'Film'}
                </span>

                {details?.tagline && (
                  <p className={styles.tagline}>&ldquo;{details.tagline}&rdquo;</p>
                )}
                <h2 id="modal-movie-title" className={styles.title}>
                  {movie.title}
                </h2>

                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <Calendar size={13} aria-hidden="true" />
                    <span>{releaseYear}</span>
                  </span>

                  <span className={styles.metaItem}>
                    <Star size={13} fill="currentColor" aria-hidden="true" />
                    <span>
                      {movie.rating ? movie.rating.toFixed(1) : 'NR'} / 10
                    </span>
                  </span>

                  {/* Runtime / Duration representation */}
                  <span className={styles.metaItem}>
                    <Clock size={13} aria-hidden="true" />
                    <span>
                      {loadingDetails
                        ? 'Calculating...'
                        : isSeries
                        ? details?.runtime
                          ? `${details.runtime}m / ep`
                          : 'Variable runtime'
                        : formatRuntime(details?.runtime ?? null)}
                    </span>
                  </span>

                  {/* Series-Specific: Seasons & Episodes */}
                  {isSeries && details?.numberOfSeasons && (
                    <span className={styles.metaItem}>
                      <Tv size={13} aria-hidden="true" />
                      <span>
                        {details.numberOfSeasons} {details.numberOfSeasons === 1 ? 'Season' : 'Seasons'}
                        {details.numberOfEpisodes ? ` (${details.numberOfEpisodes} eps)` : ''}
                      </span>
                    </span>
                  )}

                  {/* Creator / Director metadata */}
                  {creatorOrDirector && (
                    <span className={styles.metaItem}>
                      {!isSeries && <Film size={13} aria-hidden="true" />}
                      <span>
                        {isSeries ? 'Created by ' : 'Directed by '}
                        <strong>{creatorOrDirector}</strong>
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Genre Pills */}
              {details?.genres && details.genres.length > 0 && (
                <div className={styles.genreList}>
                  {details.genres.map((genre) => (
                    <span key={genre.id} className={styles.genreTag}>
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Narrative Synopsis */}
              <div className={styles.synopsisSection}>
                <span className={styles.sectionLabel}>Archival Synopsis</span>
                <p id="modal-movie-overview" className={styles.overviewText}>
                  {movie.overview || 'No synopsis recorded in this archive.'}
                </p>
              </div>

              {/* Cast Ensemble */}
              {topCast.length > 0 && (
                <div className={styles.castSection}>
                  <span className={styles.sectionLabel}>Key Cast</span>
                  <div className={styles.castGrid}>
                    {topCast.map((cast) => (
                      <div key={cast.id} className={styles.castCard}>
                        <span className={styles.castName} title={cast.name}>
                          {cast.name}
                        </span>
                        <span className={styles.castChar} title={cast.character}>
                          {cast.character || 'Role'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className={styles.actionsBar}>
                <button
                  type="button"
                  className={styles.watchlistBtn}
                  data-active={inWatchlist}
                  onClick={() => {
                    if (inWatchlist) {
                      removeFromWatchlist(movie.id, movie.mediaType);
                    } else {
                      addToWatchlist(movie);
                    }
                  }}
                >
                  {inWatchlist ? (
                    <>
                      <Check size={16} aria-hidden="true" />
                      <span>In Reel</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} aria-hidden="true" />
                      <span>Add to Reel</span>
                    </>
                  )}
                </button>

                {inWatchlist && (
                  <button
                    type="button"
                    className={styles.statusToggleBtn}
                    onClick={() => toggleWatchlistStatus(movie.id, movie.mediaType)}
                  >
                    <span>
                      {currentStatus === 'plan_to_watch'
                        ? 'Mark Watched'
                        : 'Plan Again'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
