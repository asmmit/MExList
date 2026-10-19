import { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type MagneticFieldMode = 'pointer' | 'dipole';

interface Needle {
  x: number;
  y: number;
  angle: number; // Current smoothed angle in radians
}

interface UseMagneticFieldOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLElement>;
  mode?: MagneticFieldMode;
}

/**
 * useMagneticField Hook
 *
 * ARCHITECTURAL EXPLAINABILITY (Interview Deep Dive):
 *
 * 1. WHY Math.atan2(dy, dx) GIVES THE EXACT ANGLE:
 *    Unlike Math.atan(dy / dx), which loses quadrant information and throws division-by-zero
 *    when dx = 0, atan2(dy, dx) returns the unambiguous signed angle in radians [-PI, PI]
 *    measured counterclockwise from the positive X axis for all coordinate quadrants.
 *
 * 2. WHY WE LERP THE ANGLE:
 *    Linear interpolation (angle += delta * lerpFactor) simulates physical angular momentum
 *    and magnetic damping. Instead of snapping instantly like digital readouts, needles swing
 *    smoothly into alignment like real ferromagnetic compass needles with mechanical inertia.
 *
 * 3. HOW SHORTEST-ANGLE WRAPPING WORKS:
 *    Angles wrap cyclically at +/-PI (+/-180 deg). When crossing the boundary (e.g. from 3.10 rad to -3.10 rad),
 *    a naive delta of (-3.10 - 3.10) = -6.20 rad would cause the needle to spin nearly a full 360 deg backwards.
 *    By applying:
 *      if (diff > Math.PI) diff -= 2 * Math.PI;
 *      if (diff < -Math.PI) diff += 2 * Math.PI;
 *    the needle always takes the shortest angular route (never rotating more than 180 deg).
 *
 * 4. WHY REFS AND CANVAS INSTEAD OF REACT STATE AND DOM NODES:
 *    Rendering hundreds of individual DOM needles with CSS transforms or React components
 *    updating at 60-120fps would generate hundreds of layout recals and React reconciliation cycles
 *    per frame, bottlenecking the main thread. A single GPU-accelerated HTML5 <canvas> driven by
 *    mutable pointer refs executes in one batched draw call with ZERO React component re-renders.
 */
export function useMagneticField({
  canvasRef,
  containerRef,
  mode = 'pointer',
}: UseMagneticFieldOptions) {
  const needlesRef = useRef<Needle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; isInside: boolean }>({
    x: -9999,
    y: -9999,
    isInside: false,
  });
  const lastInteractionRef = useRef<number>(Date.now());
  const isVisibleRef = useRef<boolean>(true);
  const prefersReduced = useReducedMotion();

  // Pointer position update handlers (touch & mouse) without React state re-renders
  const updatePointer = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    mouseRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
      isInside: true,
    };
    lastInteractionRef.current = Date.now();
  }, [containerRef]);

  // Generate / regenerate the needle grid based on canvas dimensions and device type
  const buildGrid = useCallback((width: number, height: number) => {
    // Spacing: 36px on desktop, 48px on mobile for performance optimization
    const isMobile = width < 768;
    const spacing = isMobile ? 48 : 36;
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    const offsetX = (width - (cols - 1) * spacing) / 2;
    const offsetY = (height - (rows - 1) * spacing) / 2;

    const needles: Needle[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        needles.push({
          x: offsetX + c * spacing,
          y: offsetY + r * spacing,
          angle: 0, // Initial angle
        });
      }
    }
    needlesRef.current = needles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let rafId: number;

    // Handle high-DPI retina sharpness
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildGrid(width, height);

      // If user prefers reduced motion, draw static snapshot and halt rAF
      if (prefersReduced) {
        drawStatic(ctx, width, height);
      }
    };

    // Static fallback rendering for accessibility reduced-motion
    const drawStatic = (context: CanvasRenderingContext2D, w: number, h: number) => {
      context.clearRect(0, 0, w, h);
      needlesRef.current.forEach((n) => {
        context.save();
        context.translate(n.x, n.y);
        context.rotate(Math.PI / 4); // Elegant uniform resting angle
        context.strokeStyle = 'rgba(242, 239, 232, 0.16)';
        context.lineWidth = 1.2;
        context.beginPath();
        context.moveTo(-6, 0);
        context.lineTo(6, 0);
        context.stroke();
        context.restore();
      });
    };

    handleResize();

    // Mouse and touch listeners attached directly to the container
    const handleMouseMove = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      mouseRef.current.isInside = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleTouchMove, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Window resize observer with debounced grid rebuild
    let resizeTimer: number;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(handleResize, 100);
    });
    resizeObserver.observe(container);

    // Pause animation loop when hero is off-screen
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Pause when browser tab is inactive / hidden
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Skip continuous physics loop if user prefers reduced motion
    if (prefersReduced) {
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('touchstart', handleTouchMove);
        container.removeEventListener('touchmove', handleTouchMove);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    // MAIN PHYSICS & RENDER LOOP
    const render = (time: number) => {
      rafId = requestAnimationFrame(render);

      // Do nothing if hero is scrolled off-screen or tab is backgrounded
      if (!isVisibleRef.current) return;

      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      const isIdle = now - lastInteractionRef.current > 2000 || !mouseRef.current.isInside;

      // Determine active magnetic target (Pointer vs gentle Lissajous wander)
      let targetX: number;
      let targetY: number;

      if (isIdle) {
        // Lissajous harmonic wander ensures the field never looks frozen or dead
        const t = time * 0.00075;
        targetX = width * (0.5 + 0.32 * Math.cos(t * 0.8));
        targetY = height * (0.5 + 0.28 * Math.sin(t * 1.15));
      } else {
        targetX = mouseRef.current.x;
        targetY = mouseRef.current.y;
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const needles = needlesRef.current;
      const needleCount = needles.length;

      for (let i = 0; i < needleCount; i++) {
        const needle = needles[i];
        const dx = targetX - needle.x;
        const dy = targetY - needle.y;
        const dist = Math.hypot(dx, dy);

        let desiredAngle: number;

        if (mode === 'dipole') {
          // DIPOLE PHYSICS:
          // Cursor acts as North pole (+), Hero center acts as South pole (-)
          // Field vector is sum of vectors from both poles:
          // B = (r_pointer / d_pointer^2) - (r_center / d_center^2)
          const dPointer = Math.max(dist, 30);
          const dxCenter = needle.x - centerX;
          const dyCenter = needle.y - centerY;
          const dCenter = Math.max(Math.hypot(dxCenter, dyCenter), 30);

          const bPx = -dx / (dPointer * dPointer);
          const bPy = -dy / (dPointer * dPointer);

          const bCx = dxCenter / (dCenter * dCenter);
          const bCy = dyCenter / (dCenter * dCenter);

          const bx = bPx + bCx;
          const by = bPy + bCy;

          desiredAngle = Math.atan2(by, bx);
        } else {
          // POINTER MODE:
          // Needle points directly at the cursor
          desiredAngle = Math.atan2(dy, dx);
        }

        // SHORTEST-ANGLE WRAPPING (Prevents 360-degree reverse spin at -PI/PI boundary)
        let diff = desiredAngle - needle.angle;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;

        // Easing interpolation (lerp factor ~0.12)
        needle.angle += diff * 0.12;

        // DISTANCE-BASED INTENSITY FALLOFF:
        // Needles near cursor: longer (18px), brighter (opacity ~0.85), thicker (1.8px)
        // Needles far away: short (10px), dim (opacity ~0.12), thinner (1.2px)
        const maxDist = 450;
        const distRatio = Math.min(dist / maxDist, 1);
        const strength = Math.pow(1 - distRatio, 1.8);

        const length = 10 + strength * 8;
        const opacity = 0.12 + strength * 0.76;
        const lineWidth = 1.1 + strength * 0.7;

        // DRAW NEEDLE WITH LOCAL TRANSFORM MATRIX
        ctx.save();
        ctx.translate(needle.x, needle.y);
        ctx.rotate(needle.angle);

        // Needle stem
        ctx.strokeStyle = `rgba(242, 239, 232, ${opacity.toFixed(3)})`;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(-length / 2, 0);
        ctx.lineTo(length / 2, 0);
        ctx.stroke();

        // North pole dot indicator at forward tip
        ctx.fillStyle = `rgba(242, 239, 232, ${(opacity * 1.1).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(length / 2, 0, 1.2 + strength * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchstart', handleTouchMove);
      container.removeEventListener('touchmove', handleTouchMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [buildGrid, canvasRef, containerRef, mode, prefersReduced, updatePointer]);

  return { isIdle: Date.now() - lastInteractionRef.current > 2000 };
}
