import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import styles from './ToastContainer.module.css';

/**
 * ToastContainer Component
 * WHAT: Renders spring-animated pill toasts at the bottom center of the viewport.
 * WHY:  Provides non-intrusive feedback for watchlist state mutations and optimistic rollbacks.
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className={styles.toastContainer} aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={styles.toastPill}
            data-type={toast.type}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 30,
            }}
            onClick={() => removeToast(toast.id)}
            role="status"
          >
            <span className={styles.toastDot} aria-hidden="true" />
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
