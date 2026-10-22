import React, { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Compass } from 'lucide-react';
import { SearchBar } from '../SearchBar/SearchBar';
import { MagneticField } from '../MagneticField/MagneticField';
import { MagneticFieldMode } from '../../hooks/useMagneticField';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './Hero.module.css';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSearchClear: () => void;
}

const HEADLINE_LINES = [
  ['Every', 'story'],
  ['starts', 'with', 'a'],
  ['search.'],
];

/**
 * Hero Component
 * WHAT: Storytelling centerpiece with masked word-by-word reveal, cursor spotlight,
 *       and an interactive canvas-based "Magnetic Field" background.
 * WHY:  Sets the cinematic tone immediately upon visit, drawing the eye toward the search interface
 *       with physical needle dynamics responding to user movement.
 */
export function Hero({ searchQuery, onSearchChange, onSearchClear }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const [fieldMode, setFieldMode] = useState<MagneticFieldMode>('pointer');
  const prefersReduced = useReducedMotion();

  // Update spotlight coordinates via CSS variables
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    heroRef.current.style.setProperty('--mx', `${x}px`);
    heroRef.current.style.setProperty('--my', `${y}px`);
  }, []);

  const toggleFieldMode = () => {
    setFieldMode((prev) => (prev === 'pointer' ? 'dipole' : 'pointer'));
  };

  return (
    <section
      ref={heroRef}
      className={styles.heroSection}
      onMouseMove={handleMouseMove}
      aria-label="Introduction and Search"
    >
      {/* Interactive Ferromagnetic Field Canvas Background */}
      <MagneticField containerRef={heroRef} mode={fieldMode} />

      {/* Subtle Mode Toggle Button */}
      <button
        type="button"
        className={styles.modeToggleBtn}
        onClick={toggleFieldMode}
        aria-label={`Toggle magnetic field mode (currently ${fieldMode})`}
        data-cursor-button="true"
      >
        <Compass size={12} aria-hidden="true" />
        <span>Field: <strong>{fieldMode === 'pointer' ? 'Pointer' : 'Dipole'}</strong></span>
      </button>

      {/* Cursor-driven radial spotlight mask */}
      <div className={styles.spotlight} aria-hidden="true" />

      <div className={styles.content}>
        {/* Masked Line-by-Line Word Reveal */}
        <h1 className={styles.headline}>
          {HEADLINE_LINES.map((line, lineIdx) => (
            <span key={`line-${lineIdx}`} className={styles.maskLine}>
              {line.map((word, wordIdx) => {
                const totalDelay = 0.15 + (lineIdx * 3 + wordIdx) * 0.08;
                return (
                  <React.Fragment key={`word-${wordIdx}`}>
                    <motion.span
                      className={styles.word}
                      initial={prefersReduced ? false : { y: '115%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      transition={{
                        duration: 0.85,
                        delay: totalDelay,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {word}
                    </motion.span>
                    {wordIdx < line.length - 1 && ' '}
                  </React.Fragment>
                );
              })}
            </span>
          ))}
        </h1>

        <motion.p
          className={styles.subtitle}
          initial={prefersReduced ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          A curated exploration of masterwork cinema, restored negatives, and timeless narrative form.
        </motion.p>

        {/* Embedded Pill Search Bar */}
        <motion.div
          id="search-container"
          className={styles.searchWrap}
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onClear={onSearchClear}
          />
        </motion.div>
      </div>

      <div className={styles.scrollIndicator} aria-hidden="true">
        <span>Scroll to Explore</span>
        <ChevronDown size={14} />
      </div>
    </section>
  );
}
