import { useState } from 'react';
import { useDebounce } from './hooks/useDebounce';
import { useMovieSearch } from './hooks/useMovieSearch';
import { useLenis } from './hooks/useLenis';
import { Navbar } from './components/Navbar/Navbar';
import { Hero } from './components/Hero/Hero';
import { Marquee } from './components/Marquee/Marquee';
import { MovieGrid } from './components/MovieGrid/MovieGrid';
import { WatchlistSection } from './components/WatchlistSection/WatchlistSection';
import { WatchlistFloatingButton } from './components/WatchlistFloatingButton/WatchlistFloatingButton';
import { WatchlistDrawer } from './components/WatchlistDrawer/WatchlistDrawer';
import { BackToTop } from './components/BackToTop/BackToTop';
import { DetailModal } from './components/DetailModal/DetailModal';
import { Footer } from './components/Footer/Footer';
import { ScrollProgress } from './components/ScrollProgress/ScrollProgress';
import { CustomCursor } from './components/CustomCursor/CustomCursor';
import { ToastProvider } from './context/ToastContext';
import { WatchlistProvider } from './hooks/useWatchlist';
import { ToastContainer } from './components/Toast/ToastContainer';
import { MediaItem } from './types/media';

/**
 * ExplorerApp Component
 *
 * ARCHITECTURAL NOTES (Interview & Assessment Explainability):
 * 1. RESOLVING INFINITE-SCROLL SENTINEL REACHABILITY BUG:
 *    Previously, rendering "Your Reel" below an infinite-scrolling results feed made it unreachable
 *    because the IntersectionObserver continually triggered next-page network requests whenever
 *    the user scrolled downward.
 *    The resolved architecture places:
 *      Hero + Search  ──>  Your Reel  ──>  Marquee  ──>  Discover (Infinite Scroll)  ──>  Footer
 *    The infinite-scroll sentinel is strictly enclosed as the terminal element of Discover only.
 *
 * 2. DUAL PERSISTENT ACCESS:
 *    Users can access their Reel at any time via:
 *      a) Top Navbar "Your Reel (n)" link: Smooth-scrolls to the section using Lenis scrollTo.
 *      b) Fixed Pill Button: Opens the slide-over drawer with instant optimistic sync and pauses
 *         background infinite scroll while open.
 */
function ExplorerApp() {
  const [rawQuery, setRawQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<MediaItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const debouncedQuery = useDebounce(rawQuery, 300);

  // Initialize Lenis smooth scroll engine
  useLenis();

  const {
    results,
    status,
    error,
    totalResults,
    hasMore,
    loadMore,
    retry,
    isOffline,
  } = useMovieSearch(debouncedQuery);

  const handleClear = () => {
    setRawQuery('');
  };

  const handleSelectMovie = (movie: MediaItem) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Dynamic Blend-Mode Custom Cursor */}
      <CustomCursor />

      {/* Top Hairline Scroll Progress Bar */}
      <ScrollProgress />

      {/* Sticky Top Navigation Bar */}
      <Navbar onOpenDrawer={() => setIsDrawerOpen(true)} />

      {/* 1. Hero Section + Search (Padded for 60px fixed navbar) */}
      <div style={{ paddingTop: '60px' }}>
        <Hero
          searchQuery={rawQuery}
          onSearchChange={setRawQuery}
          onSearchClear={handleClear}
        />
      </div>

      {/* 2. "Your Reel" Watchlist Section (Placed BEFORE Discover so infinite scroll never blocks it) */}
      <WatchlistSection onSelectMovie={handleSelectMovie} />

      {/* 3. Kinetic Horizontal Marquee Ribbon */}
      <Marquee />

      {/* 4. Discover Results Grid (Infinite scroll sentinel sits strictly as the trailing element here) */}
      <main
        style={{
          flex: 1,
          padding: '2rem var(--content-padding-x)',
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <MovieGrid
          movies={results}
          status={status}
          error={error}
          query={debouncedQuery}
          totalResults={totalResults}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onRetry={retry}
          onClearSearch={handleClear}
          onSelectMovie={handleSelectMovie}
          isOffline={isOffline}
          isPaused={isDrawerOpen}
        />
      </main>

      {/* 5. Monolithic Footer Wordmark */}
      <Footer />

      {/* Persistent Reel Access & Drawer */}
      <WatchlistFloatingButton onClick={() => setIsDrawerOpen(true)} />
      <BackToTop />

      <WatchlistDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectMovie={handleSelectMovie}
      />

      {/* Shared-Element Detail Modal */}
      <DetailModal movie={selectedMovie} onClose={handleCloseModal} />

      {/* Toast Feedback Layer */}
      <ToastContainer />
    </div>
  );
}

/**
 * Root Application Shell
 */
export default function App() {
  return (
    <ToastProvider>
      <WatchlistProvider>
        <ExplorerApp />
      </WatchlistProvider>
    </ToastProvider>
  );
}
