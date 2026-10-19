import { useState, useEffect, useRef } from 'react';

export interface MousePosition {
  x: number;
  y: number;
  normalizedX: number; // -1 to 1 relative to center
  normalizedY: number; // -1 to 1 relative to center
  isInside: boolean;
}

/**
 * useMousePosition Hook
 * WHAT: Tracks window mouse coordinates and checks whether the device supports precise pointers.
 * WHY:  Powers fluid cursor lerping and global lighting effects while safely skipping on touch devices.
 */
export function useMousePosition() {
  const [position, setPosition] = useState<MousePosition>({
    x: -100,
    y: -100,
    normalizedX: 0,
    normalizedY: 0,
    isInside: false,
  });

  const isTouchRef = useRef(false);

  useEffect(() => {
    // Detect touch-only devices to disable synthetic mouse emulation
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      isTouchRef.current = true;
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      setPosition({
        x: clientX,
        y: clientY,
        normalizedX: (clientX / innerWidth) * 2 - 1,
        normalizedY: (clientY / innerHeight) * 2 - 1,
        isInside: true,
      });
    };

    const handleMouseLeave = () => {
      setPosition((prev) => ({ ...prev, isInside: false }));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return { ...position, isTouch: isTouchRef.current };
}
