import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from './useReducedMotion';

let activeLenisInstance: Lenis | null = null;

/**
 * Smoothly scrolls to a target selector, pixel offset, or DOM element using active Lenis engine.
 * WHAT: Programmatic smooth scroll utility with graceful native fallback.
 * WHY:  Allows navigation links and "Back to top" buttons to trigger silky momentum scrolling
 *       without hard, disorienting viewport jumps.
 */
export function scrollToTarget(
  target: string | number | HTMLElement,
  options: { offset?: number; duration?: number } = {}
) {
  if (activeLenisInstance) {
    activeLenisInstance.scrollTo(target, {
      offset: options.offset ?? 0,
      duration: options.duration ?? 1.2,
    });
  } else if (typeof window !== 'undefined') {
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/**
 * Pauses the Lenis smooth-scroll engine.
 */
export function pauseLenis() {
  activeLenisInstance?.stop();
}

/**
 * Resumes the Lenis smooth-scroll engine.
 */
export function resumeLenis() {
  activeLenisInstance?.start();
}

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
    activeLenisInstance = lenis;

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
      if (activeLenisInstance === lenis) {
        activeLenisInstance = null;
      }
    };
  }, [prefersReduced]);

  return lenisRef;
}
