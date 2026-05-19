export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
};

export const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    filter: 'brightness(2)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'brightness(1)',
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

export const fadeItemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};
