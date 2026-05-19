import type { Transition, Variants } from 'motion/react';

export function motionTransition(reducedMotion: boolean, transition: Transition = { duration: 0.3 }): Transition {
  if (reducedMotion) {
    return { duration: 0 };
  }
  return transition;
}

export function motionVariants(reducedMotion: boolean, variants: Variants): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
    };
  }
  return variants;
}

export function pageMotionProps(reducedMotion: boolean) {
  if (reducedMotion) {
    return { initial: false as const, animate: { opacity: 1 } };
  }

  return {
    initial: { opacity: 0, scale: 0.98, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.02, y: -10 },
    transition: { duration: 0.3, ease: 'easeOut' as const },
  };
}
