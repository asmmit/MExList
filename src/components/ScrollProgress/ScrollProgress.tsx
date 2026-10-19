import { motion, useScroll, useSpring } from 'framer-motion';
import styles from './ScrollProgress.module.css';

/**
 * ScrollProgress Component
 * WHAT: Hairline indicator at the top edge reflecting page scroll completion.
 * WHY:  Provides subtle, award-winning orientation for long-scroll exploratory experiences.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={styles.progressBar}
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
