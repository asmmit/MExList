import { useWatchlist } from '../../hooks/useWatchlist';
import { scrollToTarget } from '../../hooks/useLenis';
import styles from './Navbar.module.css';

interface NavbarProps {
  onOpenDrawer?: () => void;
}

/**
 * Navbar Component
 * WHAT: Sticky top navigational bar with smooth Lenis scroll triggers.
 * WHY:  Fulfills requirement for "Your Reel (n)" link that uses Lenis scrollTo
 *       to navigate gracefully to the Reel section without harsh viewport jumps.
 */
export function Navbar({ onOpenDrawer }: NavbarProps) {
  const { state } = useWatchlist();
  const count = state.order.length;

  const handleScrollToTop = () => {
    scrollToTarget(0);
  };

  const handleScrollToReel = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget('#watchlist-section', { offset: -30 });
  };

  const handleScrollToDiscover = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget('#discover-section', { offset: -30 });
  };

  return (
    <header className={styles.navbar} role="banner">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleScrollToTop();
        }}
        className={styles.brand}
        aria-label="The Reel Home"
      >
        <span className={styles.brandDot} aria-hidden="true" />
        <span>The Reel</span>
      </a>

      <nav className={styles.navLinks} aria-label="Main Navigation">
        <button
          type="button"
          className={styles.navLink}
          onClick={handleScrollToDiscover}
        >
          Discover
        </button>

        <button
          type="button"
          className={styles.navLink}
          onClick={handleScrollToReel}
          aria-label={`Scroll to Your Reel (${count} saved films)`}
        >
          <span>Your Reel</span>
          <span className={styles.badge}>{count}</span>
        </button>

        {onOpenDrawer && (
          <button
            type="button"
            className={styles.openDrawerBtn}
            onClick={onOpenDrawer}
            aria-label="Open Reel slide-over drawer"
          >
            <span>Open Drawer</span>
          </button>
        )}
      </nav>
    </header>
  );
}
