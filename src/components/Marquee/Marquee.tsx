import { useRef, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './Marquee.module.css';

const PHRASES = [
  'Discover',
  'Save',
  'Watch',
  'Repeat',
  'Cinematic Masterpieces',
  'Archival Restorations',
  'Every Story Starts Here',
];

/**
 * Marquee Component
 * WHAT: Infinite horizontal ribbon repeating cinematic verbs and phrases.
 * WHY:  Accelerates dynamically as the user scrolls, creating kinetic rhythm between storytelling sections.
 */
export function Marquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const lastScrollY = useRef(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    let rafId: number;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = Math.abs(currentScrollY - lastScrollY.current);
      lastScrollY.current = currentScrollY;
      // Boost velocity proportional to scroll impulse (capped)
      velocityRef.current = Math.min(velocityRef.current + delta * 0.08, 12);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const animate = () => {
      // Base continuous speed ~ 0.8px per frame
      const baseSpeed = 0.8;
      const currentSpeed = baseSpeed + velocityRef.current;

      offsetRef.current -= currentSpeed;

      // Friction: decay velocity back to 0
      velocityRef.current *= 0.94;

      if (trackRef.current) {
        const singleWidth = trackRef.current.scrollWidth / 2;
        if (Math.abs(offsetRef.current) >= singleWidth) {
          offsetRef.current = 0;
        }
        trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReduced]);

  return (
    <div className={styles.marqueeSection} ref={containerRef} aria-hidden="true">
      <div className={styles.track} ref={trackRef}>
        {/* First copy */}
        <div className={styles.itemGroup}>
          {PHRASES.map((phrase, idx) => (
            <span key={`group1-${idx}`} className={styles.text}>
              {phrase}
              <span className={styles.separator}>/</span>
            </span>
          ))}
        </div>
        {/* Second duplicate copy for seamless infinite loop */}
        <div className={styles.itemGroup}>
          {PHRASES.map((phrase, idx) => (
            <span key={`group2-${idx}`} className={styles.text}>
              {phrase}
              <span className={styles.separator}>/</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
