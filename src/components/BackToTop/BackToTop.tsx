import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { scrollToTarget } from '../../hooks/useLenis';
import styles from './BackToTop.module.css';

/**
 * BackToTop Component
 * WHAT: Floating button appearing after the user scrolls past the hero (threshold 600px).
 * WHY:  Allows instant, fluid return to the search and hero sections on extremely deep infinite feeds.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    scrollToTarget(0);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className={styles.backToTopBtn}
          onClick={handleClick}
          aria-label="Back to top of page"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          data-cursor-button="true"
        >
          <ArrowUp size={18} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
