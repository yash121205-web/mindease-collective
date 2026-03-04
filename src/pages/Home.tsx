import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf, ArrowRight, MessageCircle, Smile, BookOpen, Wind,
  Brain, Sparkles, Github,
  ChevronRight, Activity, Zap, Users, Lock
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

// Reusable neumorphic section wrapper
function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-16 md:py-24 px-4 md:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium bg-primary/10 text-primary mb-4">
      <Sparkles className="w-3 h-3" />
      {children}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen gradient-mesh font-body text-foreground overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <motion.nav
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-300 ${
          scrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-mint flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">MindEase AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Home', 'Features', 'Insights', 'Resources'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
        <button
          onClick={() => navigate('/login')}
          className="btn-primary text-sm px-5 py-2"
        >
          Login
        </button>
      </motion.nav>

      {/* ─── HERO ─── */}
      <Section id="home" className="pt-32 md:pt-40 pb-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left */}
          <motion.div {...fadeUp()}>
            <SectionLabel>AI-Powered Mental Wellness</SectionLabel>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight mb-5">
              Your AI Companion for{' '}
              <span className="bg-gradient-to-r from-primary to-mint bg-clip-text text-transparent">
                Mental Wellness
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
              Track your emotions, journal your thoughts, and receive personalized AI support — all in one calm, private space designed for students.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/login')} className="btn-primary flex items-center gap-2 text-base px-7 py-3">
                Start Free <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary flex items-center gap-2 text-base px-7 py-3">
                <MessageCircle className="w-4 h-4" /> Talk to AI
              </button>
            </div>
          </motion.div>

          {/* Right — Decorative Wellness Illustration (neumorphic card cluster) */}
          <motion.div {...fadeUp(0.2)} className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md mx-auto">
              {/* Main hero card */}
              <div className="neu p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/15 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-mint/15 to-transparent rounded-tr-full" />
                <div className="flex flex-col items-center text-center relative z-10">
                  {/* Animated 3D-ish wellness icon */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-mint/20 flex items-center justify-center mb-5 shadow-lg"
                  >
                    <Brain className="w-14 h-14 text-primary" />
                  </motion.div>
                  <p className="font-display text-2xl font-semibold text-foreground mb-1">Calm & Clarity</p>
                  <p className="text-sm text-muted-foreground">Your wellness journey starts here</p>
                </div>
              </div>

              {/* Floating mini cards */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -top-4 -right-4 neu-flat p-3 flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-mint/20 flex items-center justify-center">
                  <Smile className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Mood: Great</p>
                  <p className="text-[10px] text-muted-foreground">Today 😊</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-3 -left-4 neu-flat p-3 flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground font-mono">75%</p>
                  <p className="text-[10px] text-muted-foreground">Health Score</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ─── EMOTIONAL HEALTH DASHBOARD PREVIEW ─── */}
      <Section id="dashboard">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <SectionLabel>Dashboard Preview</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            Emotional Health at a Glance
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* EHS Score */}
          <motion.div {...fadeUp(0.1)} className="neu p-6 flex flex-col items-center sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Emotional Health</p>
            <div className="relative w-28 h-28 mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  whileInView={{ strokeDashoffset: 2 * Math.PI * 40 * 0.25 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold font-mono text-secondary">75</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Calm & balanced</p>
          </motion.div>

          {/* Today's Mood */}
          <motion.div {...fadeUp(0.15)} className="neu p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Today's Mood</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">😊</span>
              <div>
                <p className="font-semibold text-foreground">Good</p>
                <p className="text-xs text-muted-foreground">Feeling positive</p>
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              {['😄', '🙂', '🙂', '😐', '🙂', '😄', '🙂'].map((e, i) => (
                <div key={i} className="neu-inset w-7 h-7 flex items-center justify-center text-xs rounded-lg">
                  {e}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stress Level */}
          <motion.div {...fadeUp(0.2)} className="neu p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Stress Level</p>
            <div className="flex items-end gap-1 h-16 mb-3">
              {[35, 50, 40, 60, 45, 30, 25].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-primary/30 to-primary/10"
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">↓ 12% this week</p>
          </motion.div>

          {/* AI Insight */}
          <motion.div {...fadeUp(0.25)} className="neu p-6 bg-gradient-to-br from-primary/5 to-mint/5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">SERA's Insight</p>
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Leaf className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                "You're most calm on evenings after journaling. Keep writing — it's your superpower."
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ─── CORE FEATURES ─── */}
      <Section id="features">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <SectionLabel>Core Features</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
            Everything You Need to Feel Better
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Powerful AI tools designed around your emotional wellbeing — gentle, private, and always available.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {[
            {
              icon: MessageCircle,
              title: 'AI Companion Chat',
              desc: 'Talk to SERA, your empathetic AI companion who listens without judgment. Get personalized emotional support anytime, day or night.',
              gradient: 'from-primary/10 to-primary/5',
              iconBg: 'bg-primary/15',
              iconColor: 'text-primary',
            },
            {
              icon: Smile,
              title: 'Mood Tracker',
              desc: 'Log how you feel each day with quick emoji check-ins. Track patterns over time and discover what lifts your spirits.',
              gradient: 'from-mint/10 to-secondary/5',
              iconBg: 'bg-mint/20',
              iconColor: 'text-secondary',
            },
            {
              icon: BookOpen,
              title: 'AI Journaling Assistant',
              desc: 'Write freely and let SERA reflect back insights about your emotions. Discover patterns you didn\'t know existed in your thoughts.',
              gradient: 'from-secondary/10 to-primary/5',
              iconBg: 'bg-secondary/20',
              iconColor: 'text-primary',
            },
            {
              icon: Wind,
              title: 'Guided Wellness Exercises',
              desc: 'Box breathing, body scans, desk yoga, and more — each exercise hand-picked to reduce stress in under 10 minutes.',
              gradient: 'from-rose-soft/10 to-mint/5',
              iconBg: 'bg-rose-soft/20',
              iconColor: 'text-foreground',
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp(0.1 + i * 0.08)}
              className={`neu p-7 bg-gradient-to-br ${f.gradient} group cursor-pointer`}
              onClick={() => navigate('/login')}
            >
              <div className={`w-12 h-12 rounded-2xl ${f.iconBg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-6 h-6 ${f.iconColor}`} />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{f.desc}</p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                Try it <ChevronRight className="w-3 h-3" />
              </span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ─── MOOD ANALYTICS PREVIEW ─── */}
      <Section id="insights">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <SectionLabel>Mood Analytics</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
            Understand Your Emotions Deeply
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Beautiful charts and AI insights that turn your daily feelings into actionable self-awareness.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Weekly Mood Chart */}
          <motion.div {...fadeUp(0.1)} className="neu p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Weekly Mood</p>
            <div className="flex items-end gap-2 h-32">
              {[
                { day: 'Mon', val: 70, color: 'from-primary/40 to-primary/20' },
                { day: 'Tue', val: 85, color: 'from-mint/50 to-mint/25' },
                { day: 'Wed', val: 60, color: 'from-primary/35 to-primary/15' },
                { day: 'Thu', val: 90, color: 'from-mint/55 to-mint/30' },
                { day: 'Fri', val: 55, color: 'from-primary/30 to-primary/10' },
                { day: 'Sat', val: 80, color: 'from-mint/45 to-mint/20' },
                { day: 'Sun', val: 75, color: 'from-primary/40 to-primary/20' },
              ].map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${d.val}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.06 }}
                    className={`w-full rounded-xl bg-gradient-to-t ${d.color}`}
                  />
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Emotion Heatmap */}
          <motion.div {...fadeUp(0.15)} className="neu p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Emotion Heatmap</p>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 28 }, (_, i) => {
                const intensity = [0.1, 0.25, 0.4, 0.6, 0.8][Math.floor(Math.random() * 5)];
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.015 }}
                    className="aspect-square rounded-md"
                    style={{ background: `hsl(var(--primary) / ${intensity})` }}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-muted-foreground">Low</span>
              <div className="flex gap-1">
                {[0.1, 0.25, 0.4, 0.6, 0.8].map((o, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm" style={{ background: `hsl(var(--primary) / ${o})` }} />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
          </motion.div>

          {/* Stress Trend */}
          <motion.div {...fadeUp(0.2)} className="neu p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Stress Trend</p>
            <svg viewBox="0 0 200 80" className="w-full h-28">
              <defs>
                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,60 Q25,45 50,50 T100,35 T150,40 T200,25"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              <path d="M0,60 Q25,45 50,50 T100,35 T150,40 T200,25 V80 H0 Z" fill="url(#stressGrad)" opacity="0.5" />
            </svg>
            <p className="text-xs text-muted-foreground mt-1">Trending down — great progress</p>
          </motion.div>
        </div>
      </Section>

      {/* ─── AI CHAT PREVIEW ─── */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp()}>
            <SectionLabel>AI Companion</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Meet SERA — Your Supportive AI
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              SERA listens without judgment, remembers your context, and provides warm, evidence-based emotional support tailored specifically to students and young adults.
            </p>
            <ul className="space-y-3">
              {[
                'Emotion detection in every message',
                'Crisis support when you need it most',
                'Private, secure, and always available',
              ].map((item, i) => (
                <motion.li key={i} {...fadeUp(0.1 + i * 0.05)} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-5 h-5 rounded-full bg-mint/25 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-secondary" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Chat mockup */}
          <motion.div {...fadeUp(0.2)} className="neu p-5 max-w-sm mx-auto w-full">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-mint flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">SERA</p>
                <p className="text-[10px] text-muted-foreground">Online</p>
              </div>
            </div>
            <div className="space-y-3">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground text-sm px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%]">
                  I'm really stressed about my exams 😰
                </div>
              </div>
              {/* SERA message */}
              <div className="flex justify-start">
                <div className="neu-flat text-sm px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[80%] text-foreground">
                  Exam stress can feel so overwhelming, especially when everything piles up at once. Let's take a breath together — what subject feels most heavy right now?
                </div>
              </div>
              <div className="flex justify-start">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">😟 Detected: Anxiety</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ─── IMPACT / BENEFITS ─── */}
      <Section id="resources">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <SectionLabel>Why MindEase AI</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            Built for Your Wellbeing
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: Lock,
              title: 'Confidential Support',
              desc: 'Your conversations, moods, and journals stay completely private. No accounts needed — everything is stored locally on your device.',
            },
            {
              icon: Brain,
              title: 'AI Emotional Insights',
              desc: 'SERA analyzes your patterns to reveal hidden emotional trends, helping you understand yourself better over time.',
            },
            {
              icon: Users,
              title: 'Student-Focused Design',
              desc: 'Created specifically for the challenges students face — from exam anxiety to loneliness to burnout.',
            },
          ].map((b, i) => (
            <motion.div key={b.title} {...fadeUp(0.1 + i * 0.08)} className="neu p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <b.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ─── CTA SECTION ─── */}
      <Section>
        <motion.div
          {...fadeUp()}
          className="neu p-10 md:p-16 text-center bg-gradient-to-br from-primary/8 to-mint/8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-mint/10 to-transparent rounded-tr-full" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Your calm starts here.
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Join thousands of students who are taking charge of their mental wellness with AI-powered support.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2"
            >
              Get Started — It's Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </Section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-10 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-mint flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-semibold text-foreground">MindEase AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {['About', 'Privacy', 'Contact'].map((link) => (
              <a key={link} href="#" className="hover:text-foreground transition-colors">{link}</a>
            ))}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 MindEase AI. Your calm in the chaos.</p>
        </div>
      </footer>
    </div>
  );
}
