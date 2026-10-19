import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './CustomCursor.module.css';

type CursorMode = 'default' | 'card' | 'button';

/**
 * CustomCursor Component
 * WHAT: Dual-tier cursor (immediate dot + lerp-smoothed trailing ring) with difference blend-mode.
 * WHY:  Reacts intelligently to hovered DOM context: expands to display "View" on cards
 *       and contracts to a compact bead on clickable buttons, while disabling cleanly on touch screens.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const [cursorMode, setCursorMode] = useState<CursorMode>('default');
  const [cursorLabel, setCursorLabel] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    // Disable on reduced motion or touch screens
    if (prefersReduced) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Inspect target to configure cursor mode
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cardEl = target.closest('[data-cursor-label]') as HTMLElement | null;
      const buttonEl = target.closest('button, a, [role="button"], input, [data-cursor-button]');

      if (cardEl) {
        setCursorMode('card');
        setCursorLabel(cardEl.getAttribute('data-cursor-label') || 'View');
      } else if (buttonEl) {
        setCursorMode('button');
        setCursorLabel('');
      } else {
        setCursorMode('default');
        setCursorLabel('');
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Lerp animation loop
    const animate = () => {
      // 1. Move immediate dot directly to mouse position
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      // 2. Smooth trailing ring with lerp easing (factor 0.16)
      const lerpFactor = 0.16;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <div
      className={styles.cursorContainer}
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div ref={dotRef} className={styles.cursorDot} />
      <div
        ref={ringRef}
        className={styles.cursorRing}
        data-mode={cursorMode}
      >
        <span ref={labelRef} className={styles.cursorLabel}>
          {cursorLabel}
        </span>
      </div>
    </div>
  );
}
