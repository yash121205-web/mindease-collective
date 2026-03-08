import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

const ripple = {
  initial: { scale: 0, opacity: 0.5 },
  animate: (i: number) => ({
    scale: [0, 2.5],
    opacity: [0.4, 0],
    transition: { duration: 1.8, delay: 0.3 + i * 0.35, ease: 'easeOut' },
  }),
};

const particles = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return { x: Math.cos(angle) * 120, y: Math.sin(angle) * 120 };
});

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, hsl(210 33% 98%), hsl(207 65% 90%))' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      onAnimationComplete={() => setTimeout(onDone, 3200)}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(207 90% 72% / 0.15), transparent 70%)' }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.2, 1], opacity: [0, 0.8, 0.5] }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      {/* Ripple rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-24 h-24 rounded-full border border-primary/30"
          custom={i}
          variants={ripple}
          initial="initial"
          animate="animate"
        />
      ))}

      {/* Particle burst */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/40"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{ duration: 1.4, delay: 0.8 + i * 0.06, ease: 'easeOut' }}
        />
      ))}

      {/* Logo with bounce-in */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        >
          <img src={logo} alt="MindEase AI" className="w-24 h-24 drop-shadow-lg" />
        </motion.div>
      </motion.div>

      {/* Title with letter stagger */}
      <motion.div className="relative z-10 mt-8 overflow-hidden">
        <motion.h1
          className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          MindEase{' '}
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            AI
          </span>
        </motion.h1>
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="relative z-10 text-muted-foreground font-body text-lg mt-3 font-light"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        Your calm in the chaos.
      </motion.p>

      {/* Loading bar */}
      <motion.div
        className="relative z-10 mt-10 w-48 h-1 rounded-full bg-border overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, hsl(207 90% 72%), hsl(263 60% 76%))' }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 1.3, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>
    </motion.div>
  );
}
