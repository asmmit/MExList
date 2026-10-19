import { useRef, useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface UseTiltOptions {
  maxTilt?: number; // Maximum rotation in degrees (default 10deg)
  perspective?: number; // CSS perspective distance (default 1000px)
}

/**
 * useTilt Hook
 * WHAT: Applies physics-based 3D rotation (rotateX, rotateY) and specular glare to an element based on pointer position.
 * WHY:  Creates tactile, three-dimensional depth on movie cards without heavy WebGL/Three.js bundles,
 *       while skipping automatically on touch devices and accessibility-reduced-motion profiles.
 */
export function useTilt<T extends HTMLElement>({
  maxTilt = 10,
  perspective = 1000,
}: UseTiltOptions = {}) {
  const elementRef = useRef<T | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReduced) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let glareX = 50;
    let glareY = 50;
    let glareOpacity = 0;
    let rafId: number;

    element.style.perspective = `${perspective}px`;
    element.style.transformStyle = 'preserve-3d';

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normalizedX = (x / rect.width) * 2 - 1; // -1 to 1
      const normalizedY = (y / rect.height) * 2 - 1; // -1 to 1

      targetRotateY = normalizedX * maxTilt;
      targetRotateX = -normalizedY * maxTilt;

      glareX = (x / rect.width) * 100;
      glareY = (y / rect.height) * 100;
      glareOpacity = 0.16;
    };

    const handleMouseLeave = () => {
      targetRotateX = 0;
      targetRotateY = 0;
      glareOpacity = 0;
    };

    const animate = () => {
      const ease = 0.14;
      currentRotateX += (targetRotateX - currentRotateX) * ease;
      currentRotateY += (targetRotateY - currentRotateY) * ease;

      element.style.transform = `perspective(${perspective}px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;

      if (glareRef.current) {
        glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(242, 239, 232, 0.22) 0%, transparent 65%)`;
        glareRef.current.style.opacity = `${glareOpacity}`;
      }

      rafId = requestAnimationFrame(animate);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
      element.style.transform = '';
    };
  }, [maxTilt, perspective, prefersReduced]);

  return { elementRef, glareRef };
}
