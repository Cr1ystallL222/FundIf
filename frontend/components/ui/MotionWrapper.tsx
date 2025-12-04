// components/ui/MotionWrapper.tsx
'use client';

import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// ============================================================================
// Animation Variants
// ============================================================================

const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom easing
    },
  },
};

const scaleOnHoverVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// ============================================================================
// FadeIn Component
// ============================================================================

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  className,
  ...props
}: FadeInProps) {
  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// FadeInWhenVisible Component (Scroll-triggered)
// ============================================================================

interface FadeInWhenVisibleProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  delay?: number;
}

export function FadeInWhenVisible({
  children,
  delay = 0,
  className,
  ...props
}: FadeInWhenVisibleProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// ScaleOnHover Component
// ============================================================================

interface ScaleOnHoverProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  scale?: number;
  tapScale?: number;
}

export function ScaleOnHover({
  children,
  scale = 1.02,
  tapScale = 0.98,
  className,
  ...props
}: ScaleOnHoverProps) {
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={{
        initial: { scale: 1 },
        hover: {
          scale,
          transition: { duration: 0.2, ease: 'easeOut' },
        },
        tap: {
          scale: tapScale,
          transition: { duration: 0.1 },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// StaggerContainer Component
// ============================================================================

interface StaggerContainerProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  initialDelay = 0.1,
  className,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// StaggerItem Component
// ============================================================================

interface StaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <motion.div
      variants={staggerItemVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// GlowCard Component (Card with animated glow border)
// ============================================================================

interface GlowCardProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  glowColor?: 'primary' | 'secondary' | 'purple' | 'rainbow';
}

export function GlowCard({
  children,
  glowColor = 'rainbow',
  className,
  ...props
}: GlowCardProps) {
  const glowGradients = {
    primary: 'from-primary via-primary to-primary',
    secondary: 'from-secondary via-secondary to-secondary',
    purple: 'from-purple-500 via-pink-500 to-purple-500',
    rainbow: 'from-primary via-secondary to-purple-500',
  };

  return (
    <motion.div
      className={`relative group ${className || ''}`}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={scaleOnHoverVariants}
      {...props}
    >
      {/* Glow Effect Layer */}
      <motion.div
        className={`absolute -inset-[1px] rounded-[var(--radius-box)] bg-gradient-to-r ${glowGradients[glowColor]} opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-75`}
        aria-hidden="true"
      />
      <motion.div
        className={`absolute -inset-[1px] rounded-[var(--radius-box)] bg-gradient-to-r ${glowGradients[glowColor]} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        aria-hidden="true"
      />
      
      {/* Content Layer */}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  fadeInVariants,
  staggerContainerVariants,
  staggerItemVariants,
  scaleOnHoverVariants,
};