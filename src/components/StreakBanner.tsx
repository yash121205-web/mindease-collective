import { calculateStreak } from '@/lib/storage';
import { motion } from 'framer-motion';

export default function StreakBanner() {
  const streak = calculateStreak();
  if (streak < 3) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="text-center py-1.5 text-xs font-medium"
      style={{ background: 'linear-gradient(90deg, hsl(239 84% 74% / 0.08), hsl(160 84% 67% / 0.08), hsl(239 84% 74% / 0.08))' }}>
      <span className="text-foreground">🔥 You're on a {streak}-day streak! Keep going.</span>
    </motion.div>
  );
}
