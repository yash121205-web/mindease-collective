import { motion } from 'framer-motion';

function Blob({ className, delay = 0, duration = 10 }: { className: string; delay?: number; duration?: number }) {
  return (
    <motion.div
      className={className}
      animate={{
        x: [0, 20, -15, 10, 0],
        y: [0, -18, 12, -8, 0],
        scale: [1, 1.08, 0.95, 1.05, 1],
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
      {/* Primary indigo — top left */}
      <Blob className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.05]" delay={0} duration={12} />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, hsl(237 95% 74%), transparent 70%)' }} />

      {/* Accent mint — top right */}
      <Blob className="absolute -top-20 -right-24 w-96 h-96 rounded-full opacity-[0.04]" delay={3} duration={14} />
      <div className="absolute -top-20 -right-24 w-96 h-96 rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, hsl(160 78% 58%), transparent 70%)' }} />

      {/* Secondary — bottom left */}
      <Blob className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full opacity-[0.04]" delay={5} duration={11} />
      <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, hsl(229 84% 78%), transparent 70%)' }} />

      {/* Indigo — bottom right */}
      <Blob className="absolute -bottom-16 -right-28 w-96 h-96 rounded-full opacity-[0.03]" delay={2} duration={13} />
      <div className="absolute -bottom-16 -right-28 w-96 h-96 rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, hsl(237 95% 74%), transparent 70%)' }} />

      {/* Center accent glow */}
      <Blob className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.02]" delay={1} duration={15} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.02]"
        style={{ background: 'radial-gradient(circle, hsl(160 78% 58%), transparent 60%)' }} />
    </div>
  );
}
