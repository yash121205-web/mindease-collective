import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
