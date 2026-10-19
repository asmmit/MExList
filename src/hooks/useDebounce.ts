import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * WHAT: Delays propagating rapid state changes until a quiet period (delayMs) has elapsed.
 * WHY:  When a user types into a search box, typing 10 characters rapidly could trigger
 *       10 distinct API requests. Debouncing by 300ms waits until the user pauses typing
 *       before emitting the query, conserving network bandwidth and API quota.
 *
 * @param value The raw input value changing on every keystroke
 * @param delayMs The debounce quiet window in milliseconds (defaults to 300ms)
 * @returns The debounced value, which only updates after delayMs of silence
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Schedule the update after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Cancel timer if value or delayMs changes before timer fires (e.g. another keystroke)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
