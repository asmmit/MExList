import { useState, useEffect } from 'react';

/**
 * useReducedMotion Hook
 * WHAT: Detects user OS-level preference for reduced motion.
 * WHY:  Adheres to WCAG 2.1 accessibility guidelines by allowing users with vestibular
 *       disorders or motion sickness to opt out of parallax, smooth scrolling, and cursor effects.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
