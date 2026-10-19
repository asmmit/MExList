import React, { useRef } from 'react';
import { useMagneticField, MagneticFieldMode } from '../../hooks/useMagneticField';
import styles from './MagneticField.module.css';

interface MagneticFieldProps {
  containerRef: React.RefObject<HTMLElement>;
  mode?: MagneticFieldMode;
  className?: string;
}

/**
 * MagneticField Component
 * WHAT: GPU-accelerated HTML5 Canvas rendering hundreds of ferromagnetic needles reacting to pointer/dipole fields.
 * WHY:  Creates an interactive living background for the Hero section without DOM bloat,
 *       featuring automatic Lissajous wandering when idle, smooth distance falloff, and retina sharpness.
 */
export function MagneticField({
  containerRef,
  mode = 'pointer',
  className = '',
}: MagneticFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize magnetic field physics and rAF rendering loop
  useMagneticField({
    canvasRef,
    containerRef,
    mode,
  });

  return (
    <div className={`${styles.canvasWrapper} ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
