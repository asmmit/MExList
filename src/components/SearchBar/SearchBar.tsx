import { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTextScramble } from '../../hooks/useTextScramble';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  placeholder?: string;
}

/**
 * SearchBar Component
 * WHAT: Pill-shaped input with decoded placeholder animation and keyboard shortcuts.
 * WHY:  Serves as the central storytelling entrypoint ("Every story starts with a search").
 */
export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search by title, director, or cinematic theme...',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrambledPlaceholder = useTextScramble(placeholder, true, 25);

  // Keyboard shortcut: Press '/' to focus search input, ESC to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        if (value) {
          onClear();
        } else {
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onClear]);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchPill}>
        <Search className={styles.searchIcon} size={20} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={scrambledPlaceholder}
          aria-label="Search movies"
          autoComplete="off"
          spellCheck="false"
        />
        {value ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => {
              onClear();
              inputRef.current?.focus();
            }}
            aria-label="Clear search input"
          >
            <X size={18} />
          </button>
        ) : (
          <div className={styles.metaHint} aria-hidden="true">
            <kbd className={styles.kbdKey}>/</kbd>
          </div>
        )}
      </div>
    </div>
  );
}
