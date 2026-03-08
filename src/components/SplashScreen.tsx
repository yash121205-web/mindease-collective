import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gradient-mesh"
      initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
      onAnimationComplete={() => setTimeout(onDone, 2500)}
    >
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="animate-glow-pulse">
        <img src={logo} alt="MindEase AI" className="w-20 h-20" />
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="font-display text-4xl font-semibold text-foreground mt-6">MindEase AI</motion.h1>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="text-muted-foreground font-body text-lg mt-2 font-light">Your calm in the chaos.</motion.p>
    </motion.div>
  );
}
