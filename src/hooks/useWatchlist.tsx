import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import {
  MediaItem,
  WatchlistItem,
  WatchlistState,
  WatchlistAction,
  WatchlistStatus,
  MediaType,
  getMediaKey,
} from '../types/media';
import { useToast } from '../context/ToastContext';

const WATCHLIST_STORAGE_KEY_V2 = 'the_reel_watchlist_v2';
const LEGACY_STORAGE_KEY_V1 = 'the_reel_watchlist_v1';

const initialState: WatchlistState = {
  items: {},
  order: [],
};

/**
 * Watchlist Reducer
 *
 * ARCHITECTURAL EXPLAINABILITY (Interview Deep Dive):
 * WHY A COMPOSITE KEY IS NEEDED:
 * TMDB uses independent auto-incremented database identifiers for movies and TV series.
 * A blockbuster movie and a TV series can both have ID #157336.
 * Identifying items purely by numeric ID causes state collisions, where adding a TV series
 * could overwrite or block an existing movie.
 * By constructing a composite key `${mediaType}-${id}` (e.g. "movie-157336" vs "tv-157336"),
 * uniqueness is guaranteed across all dictionary lookups, deduplication, and removals.
 */
export function watchlistReducer(
  state: WatchlistState,
  action: WatchlistAction
): WatchlistState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'ADD': {
      const { item, status = 'plan_to_watch' } = action;
      const key = getMediaKey(item.mediaType, item.id);

      // Prevent duplicates by composite key
      if (state.items[key]) {
        return state;
      }

      const newItem: WatchlistItem = {
        key,
        item,
        status,
        addedAt: Date.now(),
      };

      return {
        items: {
          ...state.items,
          [key]: newItem,
        },
        order: [key, ...state.order],
      };
    }

    case 'REMOVE': {
      const { mediaKey } = action;
      if (!state.items[mediaKey]) {
        return state;
      }
      const newItems = { ...state.items };
      delete newItems[mediaKey];
      return {
        items: newItems,
        order: state.order.filter((k) => k !== mediaKey),
      };
    }

    case 'TOGGLE_STATUS': {
      const { mediaKey } = action;
      const target = state.items[mediaKey];
      if (!target) return state;

      const nextStatus: WatchlistStatus =
        target.status === 'plan_to_watch' ? 'watched' : 'plan_to_watch';

      return {
        ...state,
        items: {
          ...state.items,
          [mediaKey]: {
            ...target,
            status: nextStatus,
          },
        },
      };
    }

    case 'SET_STATUS': {
      const { mediaKey, status } = action;
      const target = state.items[mediaKey];
      if (!target) return state;

      return {
        ...state,
        items: {
          ...state.items,
          [mediaKey]: {
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

interface WatchlistContextValue {
  state: WatchlistState;
  itemsList: WatchlistItem[];
  planToWatchList: WatchlistItem[];
  watchedList: WatchlistItem[];
  isInWatchlist: (mediaType: MediaType, id: number) => boolean;
  getWatchlistStatus: (mediaType: MediaType, id: number) => WatchlistStatus | null;
  addToWatchlist: (item: MediaItem, status?: WatchlistStatus) => void;
  removeFromWatchlist: (mediaKeyOrId: string | number, mediaType?: MediaType) => void;
  toggleWatchlistStatus: (mediaKeyOrId: string | number, mediaType?: MediaType) => void;
}

const WatchlistContext = createContext<WatchlistContextValue | undefined>(undefined);

/**
 * Migration Loader
 * WHAT: Loads and migrates saved items from localStorage.
 * WHY:  Guarantees that items saved in earlier phases (without mediaType or keyed by numeric ID)
 *       are seamlessly upgraded to composite keys with mediaType="movie" without losing any user data.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateStoredWatchlist(storedRaw: any): WatchlistState | null {
  if (!storedRaw || typeof storedRaw !== 'object') return null;

  const migratedItems: Record<string, WatchlistItem> = {};
  const migratedOrder: string[] = [];

  const rawItems = storedRaw.items || {};
  const rawOrder = Array.isArray(storedRaw.order) ? storedRaw.order : Object.keys(rawItems);

  rawOrder.forEach((rawKey: string | number) => {
    const rawEntry = rawItems[rawKey];
    if (!rawEntry) return;

    // Handle legacy schema where item was stored in .movie or had no mediaType
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacyItem: any = rawEntry.item || rawEntry.movie || rawEntry;
    const mediaType: MediaType = legacyItem.mediaType || 'movie';
    const id: number = Number(legacyItem.id || rawKey);
    const key = getMediaKey(mediaType, id);

    const title = legacyItem.title || legacyItem.name || 'Untitled';
    const rawDate = legacyItem.release_date || legacyItem.first_air_date || legacyItem.year || '';
    const year = rawDate.length > 4 ? rawDate.slice(0, 4) : rawDate || '—';

    const normalizedItem: MediaItem = {
      id,
      mediaType,
      title,
      year,
      posterPath: legacyItem.posterPath || legacyItem.poster_path || null,
      backdropPath: legacyItem.backdropPath || legacyItem.backdrop_path || null,
      rating: typeof legacyItem.rating === 'number' ? legacyItem.rating : (legacyItem.vote_average || 0),
      voteCount: legacyItem.voteCount || legacyItem.vote_count || 0,
      overview: legacyItem.overview || '',
    };

    migratedItems[key] = {
      key,
      item: normalizedItem,
      status: rawEntry.status === 'watched' ? 'watched' : 'plan_to_watch',
      addedAt: rawEntry.addedAt || Date.now(),
    };

    if (!migratedOrder.includes(key)) {
      migratedOrder.push(key);
    }
  });

  return {
    items: migratedItems,
    order: migratedOrder,
  };
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(watchlistReducer, initialState);
  const { showToast } = useToast();
  const stateRef = useRef(state);
  stateRef.current = state;

  // 1. Initial Load with Schema Migration
  useEffect(() => {
    try {
      // Try V2 format first
      let storedStr = localStorage.getItem(WATCHLIST_STORAGE_KEY_V2);
      let isMigrating = false;

      // Fallback to V1 legacy format
      if (!storedStr) {
        storedStr = localStorage.getItem(LEGACY_STORAGE_KEY_V1);
        isMigrating = true;
      }

      if (storedStr) {
        const parsed = JSON.parse(storedStr);
        const migrated = migrateStoredWatchlist(parsed);

        if (migrated) {
          dispatch({ type: 'HYDRATE', payload: migrated });

          // Persist upgraded schema immediately
          if (isMigrating) {
            localStorage.setItem(WATCHLIST_STORAGE_KEY_V2, JSON.stringify(migrated));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to hydrate/migrate watchlist from localStorage:', err);
    }
  }, []);

  /**
   * Optimistic LocalStorage Sync with Rollback
   */
  const performOptimisticAction = useCallback(
    (action: WatchlistAction, successToastMessage?: string) => {
      const snapshot = stateRef.current;

      dispatch(action);

      const nextState = watchlistReducer(snapshot, action);

      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY_V2, JSON.stringify(nextState));
        if (successToastMessage) {
          showToast(successToastMessage, 'default');
        }
      } catch (storageError) {
        console.error('LocalStorage write failed. Rolling back optimistic update:', storageError);
        dispatch({ type: 'ROLLBACK', previousState: snapshot });
        showToast('Storage quota exceeded. Reverted changes.', 'error');
      }
    },
    [showToast]
  );

  // Helper to normalize keyOrId
  const resolveKey = useCallback(
    (keyOrId: string | number, mediaType: MediaType = 'movie'): string => {
      if (typeof keyOrId === 'string' && keyOrId.includes('-')) {
        return keyOrId;
      }
      return getMediaKey(mediaType, Number(keyOrId));
    },
    []
  );

  // Action: Add Item (Movie or TV series)
  const addToWatchlist = useCallback(
    (item: MediaItem, status: WatchlistStatus = 'plan_to_watch') => {
      const key = getMediaKey(item.mediaType, item.id);
      if (stateRef.current.items[key]) {
        showToast('Already in your list', 'warning');
        return;
      }
      const label = item.mediaType === 'tv' ? 'Series' : 'Film';
      performOptimisticAction(
        { type: 'ADD', item, status },
        `Added ${label} “${item.title}” to Reel`
      );
    },
    [performOptimisticAction, showToast]
  );

  // Action: Remove Item
  const removeFromWatchlist = useCallback(
    (keyOrId: string | number, mediaType: MediaType = 'movie') => {
      const key = resolveKey(keyOrId, mediaType);
      const target = stateRef.current.items[key];
      const title = target?.item.title || 'Title';
      performOptimisticAction(
        { type: 'REMOVE', mediaKey: key },
        `Removed “${title}”`
      );
    },
    [performOptimisticAction, resolveKey]
  );

  // Action: Toggle Status
  const toggleWatchlistStatus = useCallback(
    (keyOrId: string | number, mediaType: MediaType = 'movie') => {
      const key = resolveKey(keyOrId, mediaType);
      const target = stateRef.current.items[key];
      if (!target) return;
      const willBeWatched = target.status === 'plan_to_watch';
      performOptimisticAction(
        { type: 'TOGGLE_STATUS', mediaKey: key },
        willBeWatched
          ? `Marked “${target.item.title}” as Watched`
          : `Moved “${target.item.title}” to Plan to Watch`
      );
    },
    [performOptimisticAction, resolveKey]
  );

  // Query helpers
  const isInWatchlist = useCallback(
    (mediaType: MediaType, id: number) => {
      const key = getMediaKey(mediaType, id);
      return Boolean(state.items[key]);
    },
    [state.items]
  );

  const getWatchlistStatus = useCallback(
    (mediaType: MediaType, id: number) => {
      const key = getMediaKey(mediaType, id);
      return state.items[key]?.status ?? null;
    },
    [state.items]
  );

  const itemsList = state.order.map((key) => state.items[key]).filter(Boolean);
  const planToWatchList = itemsList.filter((i) => i.status === 'plan_to_watch');
  const watchedList = itemsList.filter((i) => i.status === 'watched');

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

export function useWatchlist(): WatchlistContextValue {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
