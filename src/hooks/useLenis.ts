import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from './useReducedMotion';

/**
 * useLenis Hook
 * WHAT: Configures and drives the Lenis smooth-scroll engine on the window.
 * WHY:  Creates the fluid cinematic momentum requested for award-style portfolios,
 *       while strictly respecting accessibility reduced-motion settings and cleaning up rAF loops.
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    // If the user requests reduced motion, rely on standard instant native scrolling
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReduced]);

  return lenisRef;
}
