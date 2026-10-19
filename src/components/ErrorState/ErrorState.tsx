import { RotateCcw, WifiOff } from 'lucide-react';
import { MagneticButton } from '../Magnetic/MagneticButton';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  error: string | null;
  isOffline?: boolean;
  onRetry: () => void;
}

/**
 * ErrorState Component
 * WHAT: Clean error presentation with offline intelligence and retry capability.
 * WHY:  Ensures graceful degradation without technical jargon or noisy error popups.
 */
export function ErrorState({ error, isOffline = false, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.errorContainer} role="alert">
      {isOffline && (
        <div className={styles.offlineBadge}>
          <WifiOff size={13} aria-hidden="true" />
          <span>Offline Signal</span>
        </div>
      )}

      <h3 className={styles.headline}>
        {isOffline ? 'You seem to be offline.' : 'Connection Interrupted.'}
      </h3>

      <p className={styles.message}>
        {isOffline
          ? 'Network connectivity has been lost. Reconnect to resume live exploration, or enjoy our local catalog.'
          : error || 'We could not reach the TMDB archival service. Verify network connection and retry.'}
      </p>

      <MagneticButton type="button" className={styles.retryBtn} onClick={onRetry}>
        <RotateCcw size={14} aria-hidden="true" />
        <span>Retry Archival Query</span>
      </MagneticButton>
    </div>
  );
}
