import { useRef, useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface UseMagneticOptions {
  radius?: number; // Detection radius in pixels (default 80px)
  strength?: number; // Attraction factor (default 0.35)
}

/**
 * useMagnetic Hook
 * WHAT: Attracts an element toward the cursor when the pointer approaches within a set radius (80px),
 *       and springs back cleanly to origin when the pointer departs.
 * WHY:  Adds tactile physical presence to calls-to-action and primary buttons without third-party physics engines.
 */
export function useMagnetic<T extends HTMLElement>({
  radius = 80,
  strength = 0.35,
}: UseMagneticOptions = {}) {
  const ref = useRef<T | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReduced) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.hypot(distX, distY);

      if (distance < radius) {
        // Within magnetic pull threshold
        targetX = distX * strength;
        targetY = distY * strength;
      } else {
        // Outside magnetic boundary — return to origin
        targetX = 0;
        targetY = 0;
      }
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    // Smooth spring-back loop
    const animate = () => {
      const friction = 0.2;
      currentX += (targetX - currentX) * friction;
      currentY += (targetY - currentY) * friction;

      if (element) {
        element.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    element.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
      if (element) {
        element.style.transform = '';
      }
    };
  }, [radius, strength, prefersReduced]);

  return ref;
}
