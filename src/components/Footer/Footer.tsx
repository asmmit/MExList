import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './Footer.module.css';

/**
 * Footer Component
 * WHAT: Monolithic footer with giant serif wordmark and fade-in scroll reveal.
 * WHY:  Provides a cinematic conclusion to the single-page storytelling journey.
 */
export function Footer() {
  const prefersReduced = useReducedMotion();

  return (
    <footer className={styles.footer} role="contentinfo">
      <motion.div
        className={styles.wordmarkContainer}
        initial={prefersReduced ? false : { opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className={styles.wordmark}>The Reel</span>
      </motion.div>

      <div className={styles.bottomBar}>
        <div className={styles.credits}>
          <span>Crafted with reverence for cinema. Architecture & Engineering Assessment.</span>
        </div>

        <p className={styles.tmdbNote}>
          Film metadata, imagery, and synopsis provided courtesy of The Movie Database (TMDB).
        </p>
      </div>
    </footer>
  );
}
