import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Smile, BookOpen, Wind, BarChart3, Moon, Target, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Sparkles,
    emoji: '👋',
    title: 'Welcome to MindEase AI!',
    desc: 'Your AI-powered mental wellness companion. Let me show you around in 30 seconds.',
    accent: 'primary',
  },
  {
    icon: MessageCircle,
    emoji: '💬',
    title: 'Chat with SERA',
    desc: 'Your empathetic AI companion. Share what\'s on your mind — SERA listens without judgment and supports you in 90+ languages.',
    accent: 'primary',
  },
  {
    icon: Smile,
    emoji: '😊',
    title: 'Mood Tracking',
    desc: 'Log your daily mood with a quick emoji check-in. Track emotional patterns and get burnout warnings.',
    accent: 'mint',
  },
  {
    icon: BookOpen,
    emoji: '📓',
    title: 'AI-Powered Journal',
    desc: 'Write freely and get gentle AI reflections. Includes gratitude tracking and emotional tone analysis.',
    accent: 'secondary',
  },
  {
    icon: Wind,
    emoji: '🧘',
    title: 'Wellness Exercises',
    desc: 'Guided breathing, body scans, grounding techniques, focus timers, and AI-generated wellness plans.',
    accent: 'rose-soft',
  },
  {
    icon: BarChart3,
    emoji: '📊',
    title: 'Insights Dashboard',
    desc: 'Emotion heatmaps, mood trends, word clouds, stress patterns, and weekly AI-generated narrative insights.',
    accent: 'primary',
  },
  {
    icon: Target,
    emoji: '🎯',
    title: 'Daily Challenges & Progress',
    desc: 'Complete wellness challenges, build streaks, earn badges, and track your growth with habit grids.',
    accent: 'mint',
  },
  {
    icon: Moon,
    emoji: '😴',
    title: 'Sleep & Diet Tracking',
    desc: 'Log sleep quality, meals, water intake — and get AI-powered nutrition and sleep insights.',
    accent: 'secondary',
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const goNext = () => { setDirection(1); isLast ? onComplete() : setStep(step + 1); };
  const goBack = () => { setDirection(-1); setStep(step - 1); };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-foreground/25 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-sm">
        {/* Decorative glow behind card */}
        <div className="absolute inset-0 -m-4 rounded-[2rem] bg-gradient-to-br from-primary/10 via-secondary/5 to-mint/10 blur-2xl opacity-60" />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-card/95 backdrop-blur-xl border border-border/40 rounded-3xl p-8 text-center shadow-xl overflow-hidden"
          >
            {/* Subtle gradient accent at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-mint rounded-t-3xl" />

            <button onClick={onComplete} className="absolute top-4 right-4 p-1.5 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>

            {/* Large emoji with animated entrance */}
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="text-5xl block mb-3"
            >
              {current.emoji}
            </motion.span>

            {/* Icon badge */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.15 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 border border-primary/10 flex items-center justify-center mx-auto mb-4"
            >
              <current.icon className="w-6 h-6 text-primary" />
            </motion.div>

            <h2 className="font-display text-xl text-foreground font-bold mb-2">{current.title}</h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6 max-w-xs mx-auto">{current.desc}</p>

            {/* Progress bar */}
            <div className="flex justify-center gap-1.5 mb-6">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === step ? 24 : 8, backgroundColor: i <= step ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}
                  transition={{ duration: 0.3 }}
                  className="h-2 rounded-full"
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              {step > 0 && (
                <button onClick={goBack}
                  className="flex-1 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-body font-medium flex items-center justify-center gap-1 hover:bg-muted/50 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button
                onClick={goNext}
                className="flex-1 btn-primary flex items-center justify-center gap-1 text-sm"
              >
                {isLast ? "Let's Go! 🚀" : <>Next <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>

            <button onClick={onComplete} className="text-xs text-muted-foreground font-body mt-4 hover:text-foreground transition-colors inline-block">
              Skip tour
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
