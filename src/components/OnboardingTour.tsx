import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Smile, BookOpen, Wind, BarChart3, Moon, Target, X, ChevronRight, ChevronLeft, Sparkles, PartyPopper } from 'lucide-react';

const steps = [
  {
    icon: Sparkles,
    emoji: '👋',
    title: 'Welcome to MindEase AI!',
    desc: 'Your AI-powered mental wellness companion. Let me show you around in 30 seconds.',
    gradient: 'from-primary/20 via-secondary/10 to-mint/15',
  },
  {
    icon: MessageCircle,
    emoji: '💬',
    title: 'Chat with SERA',
    desc: 'Your empathetic AI companion. Share what\'s on your mind — SERA listens without judgment and supports you in 90+ languages.',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    icon: Smile,
    emoji: '😊',
    title: 'Mood Tracking',
    desc: 'Log your daily mood with a quick emoji check-in. Track emotional patterns and get burnout warnings.',
    gradient: 'from-mint/20 to-mint/5',
  },
  {
    icon: BookOpen,
    emoji: '📓',
    title: 'AI-Powered Journal',
    desc: 'Write freely and get gentle AI reflections. Includes gratitude tracking and emotional tone analysis.',
    gradient: 'from-secondary/20 to-secondary/5',
  },
  {
    icon: Wind,
    emoji: '🧘',
    title: 'Wellness Exercises',
    desc: 'Guided breathing, body scans, grounding techniques, focus timers, and AI-generated wellness plans.',
    gradient: 'from-rose-soft/30 to-rose-soft/5',
  },
  {
    icon: BarChart3,
    emoji: '📊',
    title: 'Insights Dashboard',
    desc: 'Emotion heatmaps, mood trends, word clouds, stress patterns, and weekly AI-generated narrative insights.',
    gradient: 'from-primary/15 to-secondary/10',
  },
  {
    icon: Target,
    emoji: '🎯',
    title: 'Daily Challenges & Progress',
    desc: 'Complete wellness challenges, build streaks, earn badges, and track your growth with habit grids.',
    gradient: 'from-mint/20 to-primary/10',
  },
  {
    icon: Moon,
    emoji: '😴',
    title: 'Sleep & Diet Tracking',
    desc: 'Log sleep quality, meals, water intake — and get AI-powered nutrition and sleep insights.',
    gradient: 'from-secondary/20 to-mint/10',
  },
];

/* ─── Confetti particles for the last step ─── */
function ConfettiParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.5,
    size: 4 + Math.random() * 6,
    color: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--mint))', 'hsl(var(--rose-soft))'][i % 4],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -10, x: `${p.x}%`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ y: '120%', opacity: 0, rotate: p.rotation + 180, scale: 0.5 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

const contentVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.92,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.92,
    filter: 'blur(4px)',
  }),
};

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const goNext = useCallback(() => {
    setDirection(1);
    isLast ? onComplete() : setStep(s => s + 1);
  }, [isLast, onComplete]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep(s => s - 1);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      {/* Layered backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-foreground/20 backdrop-blur-md"
        onClick={onComplete}
      />

      <div className="relative w-full max-w-[380px]">
        {/* Animated glow ring */}
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 -m-6 rounded-[2.5rem] bg-gradient-to-br from-primary/15 via-secondary/10 to-mint/15 blur-3xl"
        />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-card/98 backdrop-blur-2xl border border-border/30 rounded-[1.75rem] shadow-2xl shadow-foreground/5 overflow-hidden"
          >
            {/* Confetti on last step */}
            {isLast && <ConfettiParticles />}

            {/* Top gradient bar with shimmer */}
            <div className="relative h-1.5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-mint" />
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </div>

            {/* Background gradient per step */}
            <div className={`absolute inset-0 bg-gradient-to-br ${current.gradient} opacity-30 pointer-events-none`} />

            <div className="relative z-10 p-8 pt-7">
              {/* Close button */}
              <button
                onClick={onComplete}
                className="absolute top-4 right-4 p-2 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Emoji with bounce */}
              <motion.div
                key={`emoji-${step}`}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                className="text-center mb-3"
              >
                <span className="text-[3.5rem] leading-none block drop-shadow-sm">
                  {isLast ? '🚀' : current.emoji}
                </span>
              </motion.div>

              {/* Icon badge */}
              <motion.div
                key={`icon-${step}`}
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.15 }}
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/12 to-secondary/8 border border-primary/10 flex items-center justify-center mx-auto mb-4 shadow-sm"
              >
                <current.icon className="w-5 h-5 text-primary" />
              </motion.div>

              {/* Title */}
              <motion.h2
                key={`title-${step}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.3 }}
                className="font-display text-xl text-foreground font-bold text-center mb-2"
              >
                {current.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                key={`desc-${step}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.3 }}
                className="text-sm text-muted-foreground font-body leading-relaxed text-center mb-7 max-w-[280px] mx-auto"
              >
                {current.desc}
              </motion.p>

              {/* Step indicator — pill style */}
              <div className="flex justify-center gap-1.5 mb-6">
                {steps.map((_, i) => (
                  <motion.div
                    key={i}
                    layout
                    animate={{
                      width: i === step ? 28 : 8,
                      backgroundColor: i <= step ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="h-2 rounded-full"
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-2.5">
                {step > 0 && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={goBack}
                    className="flex-1 py-3 rounded-2xl border border-border/60 bg-card text-foreground text-sm font-body font-medium flex items-center justify-center gap-1.5 hover:bg-muted/40 active:scale-[0.97] transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={goNext}
                  className="flex-1 btn-primary flex items-center justify-center gap-1.5 text-sm py-3 rounded-2xl shadow-lg shadow-primary/20"
                >
                  {isLast ? (
                    <>Let's Go! <PartyPopper className="w-4 h-4" /></>
                  ) : (
                    <>Next <ChevronRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </div>

              {/* Skip link */}
              <button
                onClick={onComplete}
                className="text-xs text-muted-foreground/70 font-body mt-4 hover:text-foreground transition-colors block mx-auto"
              >
                Skip tour
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
