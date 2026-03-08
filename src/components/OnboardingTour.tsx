import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Smile, BookOpen, Wind, BarChart3, Moon, Apple, Target, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Sparkles,
    emoji: '👋',
    title: 'Welcome to MindEase AI!',
    desc: 'Your AI-powered mental wellness companion. Let me show you around in 30 seconds.',
    color: 'from-primary/15 to-secondary/10',
  },
  {
    icon: MessageCircle,
    emoji: '💬',
    title: 'Chat with SERA',
    desc: 'Your empathetic AI companion. Share what\'s on your mind — SERA listens without judgment and supports you in 90+ languages.',
    color: 'from-primary/15 to-mint/10',
  },
  {
    icon: Smile,
    emoji: '😊',
    title: 'Mood Tracking',
    desc: 'Log your daily mood with a quick emoji check-in. Track emotional patterns and get burnout warnings.',
    color: 'from-mint/15 to-secondary/10',
  },
  {
    icon: BookOpen,
    emoji: '📓',
    title: 'AI-Powered Journal',
    desc: 'Write freely and get gentle AI reflections. Includes gratitude tracking and emotional tone analysis.',
    color: 'from-secondary/15 to-primary/10',
  },
  {
    icon: Wind,
    emoji: '🧘',
    title: 'Wellness Exercises',
    desc: 'Guided breathing, body scans, grounding techniques, focus timers, and AI-generated wellness plans.',
    color: 'from-rose-soft/15 to-primary/10',
  },
  {
    icon: BarChart3,
    emoji: '📊',
    title: 'Insights Dashboard',
    desc: 'Emotion heatmaps, mood trends, word clouds, stress patterns, and weekly AI-generated narrative insights.',
    color: 'from-primary/15 to-mint/10',
  },
  {
    icon: Target,
    emoji: '🎯',
    title: 'Daily Challenges & Progress',
    desc: 'Complete wellness challenges, build streaks, earn badges, and track your growth with habit grids.',
    color: 'from-mint/15 to-primary/10',
  },
  {
    icon: Moon,
    emoji: '😴',
    title: 'Sleep & Diet Tracking',
    desc: 'Log sleep quality, meals, water intake — and get AI-powered nutrition and sleep insights.',
    color: 'from-secondary/15 to-mint/10',
  },
];

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-foreground/25 backdrop-blur-md"
    >
      <motion.div
        key={step}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`glass-strong rounded-3xl p-8 max-w-sm w-full text-center relative bg-gradient-to-br ${current.color}`}
      >
        <button onClick={onComplete} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted/50 text-muted-foreground">
          <X className="w-4 h-4" />
        </button>

        <span className="text-5xl block mb-4">{current.emoji}</span>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <current.icon className="w-6 h-6 text-primary" />
        </div>
        <h2 className="font-display text-xl text-foreground font-semibold mb-2">{current.title}</h2>
        <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">{current.desc}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-primary w-6' : i < step ? 'bg-primary/40' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-body font-medium flex items-center justify-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button
            onClick={() => isLast ? onComplete() : setStep(step + 1)}
            className="flex-1 btn-primary flex items-center justify-center gap-1 text-sm"
          >
            {isLast ? "Let's Go! 🚀" : <>Next <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>

        <button onClick={onComplete} className="text-xs text-muted-foreground font-body mt-3 hover:text-foreground transition-colors">
          Skip tour
        </button>
      </motion.div>
    </motion.div>
  );
}
