import { motion } from 'framer-motion';

function Blob({ className, delay = 0, duration = 8 }: { className: string; delay?: number; duration?: number }) {
  return (
    <motion.div
      className={className}
      animate={{
        x: [0, 15, -10, 8, 0],
        y: [0, -12, 8, -6, 0],
        scale: [1, 1.05, 0.97, 1.03, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function DecorativeBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Sage green — top left */}
      <Blob
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.08]"
        delay={0}
        duration={10}
      />
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, hsl(158 42% 68%), transparent 70%)' }}
      />

      {/* Warm lavender — top right */}
      <Blob
        className="absolute -top-20 -right-24 w-80 h-80 rounded-full opacity-[0.06]"
        delay={2}
        duration={12}
      />
      <div
        className="absolute -top-20 -right-24 w-80 h-80 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, hsl(280 40% 78%), transparent 70%)' }}
      />

      {/* Warm peach — bottom left */}
      <Blob
        className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full opacity-[0.07]"
        delay={4}
        duration={9}
      />
      <div
        className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, hsl(20 80% 82%), transparent 70%)' }}
      />

      {/* Sand accent — center right */}
      <Blob
        className="absolute top-1/3 -right-16 w-64 h-64 rounded-full opacity-[0.05]"
        delay={1}
        duration={11}
      />
      <div
        className="absolute top-1/3 -right-16 w-64 h-64 rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, hsl(35 40% 80%), transparent 70%)' }}
      />

      {/* Subtle sage — bottom right */}
      <Blob
        className="absolute -bottom-16 -right-28 w-80 h-80 rounded-full opacity-[0.04]"
        delay={3}
        duration={13}
      />
      <div
        className="absolute -bottom-16 -right-28 w-80 h-80 rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, hsl(158 30% 75%), transparent 70%)' }}
      />
    </div>
  );
}
