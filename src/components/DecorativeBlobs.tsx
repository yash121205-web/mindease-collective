import { motion } from 'framer-motion';

/**
 * Floating decorative blobs that maintain the "Soft Organic" aesthetic
 * across all app pages. Renders fixed-position, pointer-event-free shapes.
 */
export default function DecorativeBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Top-left primary blob */}
      <motion.div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, hsl(207 90% 72%), transparent 70%)' }}
        animate={{ x: [0, 15, 0], y: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Top-right lavender blob */}
      <motion.div
        className="absolute -top-20 -right-24 w-72 h-72 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, hsl(263 60% 76%), transparent 70%)' }}
        animate={{ x: [0, -12, 0], y: [0, 18, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center-right mint accent */}
      <motion.div
        className="absolute top-1/3 -right-16 w-56 h-56 rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, hsl(156 55% 72%), transparent 70%)' }}
        animate={{ x: [0, -8, 0], y: [0, -14, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Bottom-left peach blob */}
      <motion.div
        className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, hsl(20 90% 87%), transparent 70%)' }}
        animate={{ x: [0, 10, 0], y: [0, -12, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Bottom-right secondary blob */}
      <motion.div
        className="absolute -bottom-16 -right-28 w-72 h-72 rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, hsl(263 55% 82%), transparent 70%)' }}
        animate={{ x: [0, -10, 0], y: [0, -8, 0] }}
        transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating small circles — decorative "stickers" */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-3 h-3 rounded-full bg-primary/10"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[25%] right-[15%] w-2 h-2 rounded-full bg-secondary/15"
        animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-[60%] left-[5%] w-2.5 h-2.5 rounded-full bg-mint/12"
        animate={{ y: [0, -18, 0], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute top-[70%] right-[8%] w-2 h-2 rounded-full bg-rose-soft/15"
        animate={{ y: [0, -12, 0], opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className="absolute top-[45%] left-[50%] w-1.5 h-1.5 rounded-full bg-primary/8"
        animate={{ y: [0, -22, 0], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
    </div>
  );
}
