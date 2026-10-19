import { useState } from 'react';
import { useDebounce } from './hooks/useDebounce';
import { useMovieSearch } from './hooks/useMovieSearch';
import { useLenis } from './hooks/useLenis';
import { Hero } from './components/Hero/Hero';
import { Marquee } from './components/Marquee/Marquee';
import { MovieGrid } from './components/MovieGrid/MovieGrid';
import { WatchlistSection } from './components/WatchlistSection/WatchlistSection';
import { DetailModal } from './components/DetailModal/DetailModal';
import { Footer } from './components/Footer/Footer';
import { ScrollProgress } from './components/ScrollProgress/ScrollProgress';
import { CustomCursor } from './components/CustomCursor/CustomCursor';
import { ToastProvider } from './context/ToastContext';
import { WatchlistProvider } from './hooks/useWatchlist';
import { ToastContainer } from './components/Toast/ToastContainer';
import { Movie } from './types/movie';

/**
 * Inner Application Content Shell with Storytelling Narrative Flow:
 * 1. Top Scroll Progress Bar
 * 2. Hero with Masked Word-by-Word Slide-Up & Mouse Spotlight
 * 3. Infinite Kinetic Text Marquee Strip
 * 4. Archival Discovery Grid with Infinite Scroll
 * 5. Inverted "Your Reel" Watchlist Ledger
 * 6. Shared-Element Detail Modal
 * 7. Monolithic Serif Wordmark Footer
 */
function ExplorerApp() {
  const [rawQuery, setRawQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const debouncedQuery = useDebounce(rawQuery, 300);

  // Initialize smooth scroll engine
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

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Dynamic Blend-Mode Custom Cursor */}
      <CustomCursor />

      {/* 1. Hairline Top Scroll Progress Indicator */}
      <ScrollProgress />

      {/* 2. Hero Section with Masked Words & Embedded Search */}
      <Hero
        searchQuery={rawQuery}
        onSearchChange={setRawQuery}
        onSearchClear={handleClear}
      />

      {/* 3. Kinetic Marquee Ribbon */}
      <Marquee />

      {/* 4. Discover Results Grid */}
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
        />
      </main>

      {/* 5. Inverted "Your Reel" Section */}
      <WatchlistSection onSelectMovie={handleSelectMovie} />

      {/* 6. Shared-Element Detail Modal */}
      <DetailModal movie={selectedMovie} onClose={handleCloseModal} />

      {/* 7. Footer Wordmark */}
      <Footer />

      {/* Toast Feedback Layer */}
      <ToastContainer />
    </div>
  );
}

/**
 * Application Entry Root
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
