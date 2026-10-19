import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SearchBar } from '../SearchBar/SearchBar';
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
 * WHAT: Storytelling centerpiece with masked word-by-word reveal and cursor spotlight.
 * WHY:  Sets the cinematic tone immediately upon visit, drawing the eye toward the search interface.
 */
export function Hero({ searchQuery, onSearchChange, onSearchClear }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
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

  return (
    <section
      ref={heroRef}
      className={styles.heroSection}
      onMouseMove={handleMouseMove}
      aria-label="Introduction and Search"
    >
      <div className={styles.spotlight} aria-hidden="true" />

      <div className={styles.content}>
        <motion.div
          className={styles.categoryTag}
          initial={prefersReduced ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.tagDot} aria-hidden="true" />
          <span>The Archival Collection</span>
        </motion.div>

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
