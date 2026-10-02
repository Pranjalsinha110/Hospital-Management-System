import React from 'react';
import './AnimateBackground.css';

/**
 * AnimatedBackground
 *
 * Reusable premium healthcare background.
 *
 * Design goals:
 * - Lightweight CSS-based animation
 * - No canvas / heavy JavaScript animation
 * - Subtle healthcare-tech visual language
 * - Works behind any page/section
 * - Responsive
 * - Dark-mode compatible
 * - Respects prefers-reduced-motion
 *
 * Usage:
 *
 * <div className="page-shell">
 *   <AnimatedBackground />
 *
 *   <div className="page-content">
 *     ...
 *   </div>
 * </div>
 */

const AnimatedBackground = ({
  variant = 'default',
  intensity = 'normal',
  className = '',
}) => {
  const backgroundClasses = [
    'animated-background',
    `animated-background--${variant}`,
    `animated-background--${intensity}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={backgroundClasses}
      aria-hidden="true"
      role="presentation"
    >
      {/* Base ambient gradient */}
      <div className="animated-background__base" />

      {/* Large blurred ambient lights */}
      <div className="animated-background__orb animated-background__orb--one" />
      <div className="animated-background__orb animated-background__orb--two" />
      <div className="animated-background__orb animated-background__orb--three" />

      {/* Very subtle healthcare-tech grid */}
      <div className="animated-background__grid" />

      {/* Slow moving ambient light */}
       <div className="animated-background__light-sweep" /> 

      {/* Soft center glow */}
      <div className="animated-background__center-glow" />

      {/* Tiny decorative light points */}
      <div className="animated-background__particles">
        <span className="animated-background__particle animated-background__particle--one" />
        <span className="animated-background__particle animated-background__particle--two" />
        <span className="animated-background__particle animated-background__particle--three" />
        <span className="animated-background__particle animated-background__particle--four" />
        <span className="animated-background__particle animated-background__particle--five" />
      </div>

      {/* Soft vignette to keep foreground content readable */}
      <div className="animated-background__vignette" />
    </div>
  );
};

export default AnimatedBackground;