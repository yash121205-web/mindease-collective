import { motion } from 'framer-motion';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gradient-mesh"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onAnimationComplete={() => setTimeout(onDone, 2500)}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="animate-glow-pulse"
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <defs>
            <linearGradient id="splash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(15, 87%, 66%)" />
              <stop offset="100%" stopColor="hsl(125, 22%, 58%)" />
            </linearGradient>
          </defs>
          <path d="M40 8C28 8 18 18 18 30C18 38 22 44 28 48C24 52 22 58 22 64C22 68 26 72 30 72C34 72 36 70 38 68C39 70 39.5 72 40 72C40.5 72 41 70 42 68C44 70 46 72 50 72C54 72 58 68 58 64C58 58 56 52 52 48C58 44 62 38 62 30C62 18 52 8 40 8Z" fill="url(#splash-grad)" opacity="0.9" />
          <path d="M40 20V60M32 32L40 28L48 32M34 44L40 40L46 44" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="font-display text-4xl font-semibold text-foreground mt-6"
      >
        MindEase AI
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="text-muted-foreground font-body text-lg mt-2 font-light"
      >
        Your calm in the chaos.
      </motion.p>
    </motion.div>
  );
}
