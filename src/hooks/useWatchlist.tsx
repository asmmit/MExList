import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { Movie, WatchlistItem, WatchlistState, WatchlistAction, WatchlistStatus } from '../types/movie';
import { useToast } from '../context/ToastContext';

/**
 * Storage Key for LocalStorage Persistence
 */
const WATCHLIST_STORAGE_KEY = 'the_reel_watchlist_v1';

/**
 * Initial empty watchlist state
 */
const initialState: WatchlistState = {
  items: {},
  order: [],
};

/**
 * Watchlist Reducer
 * WHAT: Deterministic pure state reducer for all Watchlist modifications.
 * WHY:  Centralizes state mutations, eliminates duplicate logic, and guarantees
 *       atomic rollbacks when optimistic writes fail.
 *
 * STATE ARCHITECTURE NOTE (Interview Explainability):
 * Why useReducer + Context over Redux/Zustand?
 * 1. Zero Extra Dependencies: Keeps bundle size minimal without external state libraries.
 * 2. Scoped Domain: Watchlist is the only persistent cross-component domain in the app;
 *    search UI state is transient and properly lives in local component state to prevent
 *    costly global re-renders.
 * 3. Predictability: useReducer provides identical action-driven determinism and time-travel/rollback
 *    capability as Redux without the setup overhead.
 */
export function watchlistReducer(state: WatchlistState, action: WatchlistAction): WatchlistState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'ADD': {
      const { movie, status = 'plan_to_watch' } = action;
      // Prevent duplicates by movie id
      if (state.items[movie.id]) {
        return state;
      }
      const newItem: WatchlistItem = {
        movie,
        status,
        addedAt: Date.now(),
      };
      return {
        items: {
          ...state.items,
          [movie.id]: newItem,
        },
        order: [movie.id, ...state.order],
      };
    }

    case 'REMOVE': {
      const { movieId } = action;
      if (!state.items[movieId]) {
        return state;
      }
      const newItems = { ...state.items };
      delete newItems[movieId];
      return {
        items: newItems,
        order: state.order.filter((id) => id !== movieId),
      };
    }

    case 'TOGGLE_STATUS': {
      const { movieId } = action;
      const target = state.items[movieId];
      if (!target) return state;

      const nextStatus: WatchlistStatus =
        target.status === 'plan_to_watch' ? 'watched' : 'plan_to_watch';

      return {
        ...state,
        items: {
          ...state.items,
          [movieId]: {
            ...target,
            status: nextStatus,
          },
        },
      };
    }

    case 'SET_STATUS': {
      const { movieId, status } = action;
      const target = state.items[movieId];
      if (!target) return state;

      return {
        ...state,
        items: {
          ...state.items,
          [movieId]: {
            ...target,
            status,
          },
        },
      };
    }

    case 'ROLLBACK':
      return action.previousState;

    default:
      return state;
  }
}

/**
 * Context Interface
 */
interface WatchlistContextValue {
  state: WatchlistState;
  itemsList: WatchlistItem[];
  planToWatchList: WatchlistItem[];
  watchedList: WatchlistItem[];
  isInWatchlist: (movieId: number) => boolean;
  getWatchlistStatus: (movieId: number) => WatchlistStatus | null;
  addToWatchlist: (movie: Movie, status?: WatchlistStatus) => void;
  removeFromWatchlist: (movieId: number) => void;
  toggleWatchlistStatus: (movieId: number) => void;
}

const WatchlistContext = createContext<WatchlistContextValue | undefined>(undefined);

/**
 * WatchlistProvider
 * WHAT: Wraps the app, provides watchlist actions, synchronizes localStorage with optimistic rollback.
 * WHY:  Ensures state reflects instantly on screen before background disk I/O, and rolls back
 *       cleanly if localStorage quota or permissions fail.
 */
export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(watchlistReducer, initialState);
  const { showToast } = useToast();
  const isHydratedRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // 1. Hydrate state from localStorage on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WatchlistState;
        if (parsed && typeof parsed.items === 'object' && Array.isArray(parsed.order)) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      }
    } catch (err) {
      console.warn('Failed to parse watchlist from localStorage:', err);
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  /**
   * Helper: Optimistic LocalStorage Sync with Rollback
   * WHAT: Executes the reducer action immediately, then commits to localStorage.
   * WHY:  If writing to localStorage throws (e.g. QuotaExceededError or private mode block),
   *       rolls back React state to previous snapshot and alerts the user via Toast.
   */
  const performOptimisticAction = useCallback(
    (action: WatchlistAction, successToastMessage?: string) => {
      const snapshot = stateRef.current;
      
      // Step A: Apply mutation immediately (Optimistic Update)
      dispatch(action);

      // Compute prospective next state to test storage write
      const nextState = watchlistReducer(snapshot, action);

      // Step B: Synchronize to LocalStorage
      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(nextState));
        if (successToastMessage) {
          showToast(successToastMessage, 'default');
        }
      } catch (storageError) {
        console.error('LocalStorage write failed. Rolling back optimistic update:', storageError);
        // Step C: Roll back state instantly
        dispatch({ type: 'ROLLBACK', previousState: snapshot });
        showToast('Storage quota exceeded. Reverted changes.', 'error');
      }
    },
    [showToast]
  );

  // Action: Add movie
  const addToWatchlist = useCallback(
    (movie: Movie, status: WatchlistStatus = 'plan_to_watch') => {
      if (stateRef.current.items[movie.id]) {
        showToast('Already in your list', 'warning');
        return;
      }
      performOptimisticAction(
        { type: 'ADD', movie, status },
        `Added “${movie.title}” to Reel`
      );
    },
    [performOptimisticAction, showToast]
  );

  // Action: Remove movie
  const removeFromWatchlist = useCallback(
    (movieId: number) => {
      const target = stateRef.current.items[movieId];
      const title = target?.movie.title || 'Movie';
      performOptimisticAction(
        { type: 'REMOVE', movieId },
        `Removed “${title}”`
      );
    },
    [performOptimisticAction]
  );

  // Action: Toggle status between 'plan_to_watch' and 'watched'
  const toggleWatchlistStatus = useCallback(
    (movieId: number) => {
      const target = stateRef.current.items[movieId];
      if (!target) return;
      const willBeWatched = target.status === 'plan_to_watch';
      performOptimisticAction(
        { type: 'TOGGLE_STATUS', movieId },
        willBeWatched ? `Marked “${target.movie.title}” as Watched` : `Moved “${target.movie.title}” to Plan to Watch`
      );
    },
    [performOptimisticAction]
  );

  // Query helpers
  const isInWatchlist = useCallback(
    (movieId: number) => Boolean(state.items[movieId]),
    [state.items]
  );

  const getWatchlistStatus = useCallback(
    (movieId: number) => state.items[movieId]?.status ?? null,
    [state.items]
  );

  // Derived lists sorted by insertion order
  const itemsList = state.order.map((id) => state.items[id]).filter(Boolean);
  const planToWatchList = itemsList.filter((item) => item.status === 'plan_to_watch');
  const watchedList = itemsList.filter((item) => item.status === 'watched');

  const value: WatchlistContextValue = {
    state,
    itemsList,
    planToWatchList,
    watchedList,
    isInWatchlist,
    getWatchlistStatus,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlistStatus,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

/**
 * useWatchlist Hook
 * WHAT: Custom hook exposing watchlist state and optimistic dispatchers.
 * WHY:  Provides a clean, type-safe API for components to interact with the Reel.
 */
export function useWatchlist(): WatchlistContextValue {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
