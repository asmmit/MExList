import React, { ReactNode } from 'react';
import { useMagnetic } from '../../hooks/useMagnetic';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  radius?: number;
  strength?: number;
  className?: string;
}

/**
 * MagneticButton Component
 * WHAT: Interactive button component that pulls magnetically toward the mouse cursor within 80px.
 * WHY:  Provides a reusable, encapsulated way to add magnetic physics to buttons throughout the application.
 */
export function MagneticButton({
  children,
  radius = 80,
  strength = 0.35,
  className = '',
  ...props
}: MagneticButtonProps) {
  const magneticRef = useMagnetic<HTMLButtonElement>({ radius, strength });

  return (
    <button
      ref={magneticRef}
      className={className}
      data-cursor-button="true"
      {...props}
    >
      {children}
    </button>
  );
}
