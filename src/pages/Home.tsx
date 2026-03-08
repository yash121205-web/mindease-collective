import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Leaf, ArrowRight, MessageCircle, Smile, BookOpen, Wind,
  Brain, Sparkles, Github, Heart, Shield, Star, TrendingUp,
  ChevronRight, Activity, Zap, Users, Lock, BarChart3,
  Flame, PenLine, Clock, Target, CheckCircle2, Play,
  Menu, X
} from 'lucide-react';

/* ─── Animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

const stagger = (i: number, base = 0.08) => fadeUp(i * base);

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 md:py-28 px-5 md:px-10 ${className}`}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.span {...fadeUp()} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-body font-medium bg-primary/10 text-primary mb-5 tracking-wide">
      <Sparkles className="w-3.5 h-3.5" />
      {children}
    </motion.span>
  );
}

function SectionHeading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <motion.div {...fadeUp()} className="text-center mb-14">
      <SectionLabel>{typeof children === 'string' ? children : 'Feature'}</SectionLabel>
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight">
        {children}
      </h2>
      {sub && <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-base md:text-lg leading-relaxed">{sub}</p>}
    </motion.div>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div {...fadeUp(index * 0.05)} className="neu overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="font-display font-medium text-foreground text-sm md:text-base pr-4">{question}</span>
        <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          <p className="text-sm text-muted-foreground font-body leading-relaxed">{answer}</p>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Contact Form ─── */
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-body text-muted-foreground mb-1 block">Your Name</label>
        <input
          type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Enter your name" required
        />
      </div>
      <div>
        <label className="text-xs font-body text-muted-foreground mb-1 block">Email Address</label>
        <input
          type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="you@example.com" required
        />
      </div>
      <div>
        <label className="text-xs font-body text-muted-foreground mb-1 block">Message</label>
        <textarea
          value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-none"
          placeholder="How can we help you?" required
        />
      </div>
      <button type="submit" className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-body font-medium text-sm hover:opacity-90 transition-opacity">
        Send Message
      </button>
      {sent && <p className="text-xs text-center text-primary font-body">✓ Message sent! We'll get back to you soon.</p>}
    </form>
  );
}

/* ─── Data ─── */
const moodEmojis = ['😄', '🙂', '😐', '😔', '😰'];
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const moodBars = [70, 85, 60, 90, 55, 80, 75];
const stressBars = [35, 50, 40, 60, 45, 30, 25];

const features = [
  {
    icon: MessageCircle, title: 'AI Companion Chat',
    desc: 'Talk to SERA, your empathetic AI companion who listens without judgment and provides personalized emotional support anytime.',
    gradient: 'from-primary/12 to-primary/4', iconBg: 'bg-primary/15', iconColor: 'text-primary',
  },
  {
    icon: Smile, title: 'Smart Mood Tracker',
    desc: 'Log emotions with quick emoji check-ins. Track patterns over time and discover what lifts your spirits or triggers stress.',
    gradient: 'from-mint/12 to-secondary/4', iconBg: 'bg-mint/20', iconColor: 'text-foreground',
  },
  {
    icon: BookOpen, title: 'AI Journaling Assistant',
    desc: 'Write freely and receive warm, insightful AI reflections that help you understand your emotions and grow.',
    gradient: 'from-secondary/12 to-primary/4', iconBg: 'bg-secondary/20', iconColor: 'text-primary',
  },
  {
    icon: Wind, title: 'Guided Wellness Exercises',
    desc: 'Box breathing, body scans, desk yoga — hand-picked exercises to reduce stress in under 10 minutes.',
    gradient: 'from-sky-soft/15 to-mint/5', iconBg: 'bg-sky-soft/25', iconColor: 'text-foreground',
  },
];

const quickActions = [
  { icon: MessageCircle, label: 'Talk to SERA', path: '/app/chat', color: 'from-primary to-primary/80' },
  { icon: Smile, label: 'Log Mood', path: '/app/mood', color: 'from-secondary to-secondary/80' },
  { icon: PenLine, label: 'Write Journal', path: '/app/journal', color: 'from-mint to-mint/80' },
  { icon: Wind, label: 'Start Breathing', path: '/app/wellness', color: 'from-sky-soft to-primary/60' },
];

const benefits = [
  { icon: Shield, title: 'Confidential Support', desc: 'Everything stays on your device. No accounts, no data collection — complete privacy by design.' },
  { icon: Brain, title: 'AI Emotional Insights', desc: 'SERA analyzes patterns to reveal hidden emotional trends, helping you understand yourself deeply.' },
  { icon: Users, title: 'Student-Focused', desc: 'Built specifically for exam anxiety, academic burnout, loneliness, and the unique pressures students face.' },
  { icon: Heart, title: 'Always Available', desc: 'No appointments, no waiting rooms. Compassionate AI support accessible 24/7, right when you need it.' },
];

const chatMessages = [
  { role: 'user' as const, text: "I'm feeling really stressed about my finals 😰" },
  { role: 'ai' as const, text: "Exam season can feel like a mountain — but you've climbed them before. What subject is weighing on you the most right now?" },
  { role: 'user' as const, text: "Organic chemistry. I feel so behind." },
  { role: 'ai' as const, text: "Falling behind doesn't mean failing. Let's make a small, manageable plan — even 25 focused minutes today counts. Would you like to try a Pomodoro session together?" },
];

const insightCards = [
  { title: 'Journaling Impact', text: 'Your mood improves by 23% on days you journal. Consider a quick reflection before bed tonight.', color: 'from-primary/10 to-mint/8' },
  { title: 'Stress Pattern', text: 'Your stress peaks on Tuesdays and Wednesdays — try a 5-minute breathing session before your first class.', color: 'from-mint/10 to-secondary/8' },
  { title: 'Sleep Connection', text: 'On nights you use the breathing tool, your next-day mood averages 15% higher. Great habit to keep!', color: 'from-secondary/10 to-primary/8' },
];

const progressStats = [
  { icon: Flame, label: 'Day Streak', value: '12', sub: 'Consecutive days' },
  { icon: PenLine, label: 'Journal Entries', value: '28', sub: 'This month' },
  { icon: Smile, label: 'Moods Logged', value: '47', sub: 'Total check-ins' },
  { icon: Wind, label: 'Wellness Sessions', value: '15', sub: 'Completed' },
];

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -40]);

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Features', id: 'features' },
    { label: 'Insights', id: 'insights' },
    { label: 'Resources', id: 'resources' },
    { label: 'About', id: 'about' },
  ];

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    const offset = 96;
    const targetTop = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    window.history.replaceState({}, '', `#${sectionId}`);
  };

  const handleNavClick = (sectionId: string) => {
    setMobileMenu(false);
    scrollToSection(sectionId);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const hashSection = location.hash.replace('#', '');
    const frame = requestAnimationFrame(() => scrollToSection(hashSection));
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  return (
    <div className="min-h-screen gradient-mesh font-body text-foreground overflow-x-hidden grain">

      {/* ━━━━━━━━━━ NAVBAR ━━━━━━━━━━ */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 py-4">
          <button type="button" onClick={() => handleNavClick('home')} className="flex items-center gap-3 text-left">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md"
            >
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">MindEase AI</span>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.label}
                onClick={() => handleNavClick(link.id)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button type="button" onClick={() => navigate('/login')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Login
            </button>
            <button type="button" onClick={() => navigate('/login')} className="btn-primary text-sm px-5 py-2.5">
              Start Free
            </button>
          </div>

          {/* Mobile toggle */}
          <button type="button" onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2" aria-label="Toggle navigation menu">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="lg:hidden glass-strong border-t border-border px-5 pb-5 pt-3 space-y-3"
          >
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.label}
                onClick={() => handleNavClick(link.id)}
                className="block w-full text-left text-sm font-medium text-foreground py-2"
              >
                {link.label}
              </button>
            ))}
            <button type="button" onClick={() => navigate('/login')} className="btn-primary w-full text-sm py-2.5 mt-2">Start Free</button>
          </motion.div>
        )}
      </motion.nav>

      {/* ━━━━━━━━━━ HERO ━━━━━━━━━━ */}
      <Section id="home" className="pt-32 md:pt-44 pb-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div style={{ y: heroParallax }}>
            <motion.div {...fadeUp()} className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-primary/8 text-primary border border-primary/15">
                <Star className="w-3.5 h-3.5 fill-primary/30" /> AI-Powered Mental Wellness Platform
              </span>
            </motion.div>
            <motion.h1 {...fadeUp(0.1)} className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-6">
              Your AI Companion for{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-mint bg-clip-text text-transparent">
                Mental Wellness
              </span>
            </motion.h1>
            <motion.p {...fadeUp(0.2)} className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              Track emotions, reflect through journaling, and receive AI-powered emotional support — anytime, anywhere. Built with compassion for students.
            </motion.p>
            <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/login')} className="btn-primary flex items-center gap-2.5 text-base px-8 py-3.5 shadow-lg hover:shadow-xl transition-shadow">
                Start Your Wellness Journey <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary flex items-center gap-2.5 text-base px-8 py-3.5">
                <MessageCircle className="w-4 h-4" /> Talk to AI Companion
              </button>
            </motion.div>
            {/* Trust badges */}
            <motion.div {...fadeUp(0.4)} className="flex items-center gap-5 mt-10 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> 100% Private</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> AI Powered</span>
              <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Free Forever</span>
            </motion.div>
          </motion.div>

          {/* Hero illustration — neumorphic card cluster */}
          <motion.div {...fadeUp(0.2)} className="relative flex items-center justify-center">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Glow orbs */}
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-mint/10 rounded-full blur-3xl" />

              {/* Main hero card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="neu p-8 md:p-10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/12 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-mint/12 to-transparent rounded-tr-full" />
                <div className="flex flex-col items-center text-center relative z-10">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-mint/20 flex items-center justify-center mb-6 shadow-lg border border-primary/10"
                  >
                    <Brain className="w-16 h-16 text-primary" />
                  </motion.div>
                  <p className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Calm & Clarity</p>
                  <p className="text-sm text-muted-foreground mb-4">Your wellness journey starts here</p>
                  <div className="flex gap-2">
                    {['AI Companion', 'Mood Tracking', 'Wellness Tools'].map((pill) => (
                      <span key={pill} className="text-[10px] px-3 py-1 rounded-full bg-primary/8 text-primary font-medium">{pill}</span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute -top-5 -right-5 md:-right-8 neu-flat p-3 flex items-center gap-2.5 shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-mint/20 flex items-center justify-center">
                  <Smile className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Mood: Great</p>
                  <p className="text-[10px] text-muted-foreground">Today 😊</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-5 md:-left-8 neu-flat p-3 flex items-center gap-2.5 shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground font-number">76%</p>
                  <p className="text-[10px] text-muted-foreground">Health Score</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute top-1/2 -right-3 md:-right-6 transform -translate-y-1/2 neu-flat p-2.5 flex items-center gap-2 shadow-md"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-soft/20 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-rose-soft" />
                </div>
                <p className="text-[10px] font-semibold text-foreground">🔥 12 streak</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ━━━━━━━━━━ EMOTIONAL HEALTH DASHBOARD ━━━━━━━━━━ */}
      <Section id="dashboard">
        <SectionHeading sub="Real-time emotional intelligence at your fingertips. Every metric is powered by your daily interactions.">
          Emotional Health at a Glance
        </SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* EHS Score */}
          <motion.div {...stagger(0)} className="neu p-7 flex flex-col items-center sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">Emotional Health</p>
            <div className="relative w-32 h-32 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#ehsGrad)"
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  whileInView={{ strokeDashoffset: 2 * Math.PI * 42 * 0.24 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="ehsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--mint))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-number text-foreground">76</span>
                <span className="text-[10px] text-muted-foreground">/ 100</span>
              </div>
            </div>
            <span className="text-xs text-primary font-medium px-3 py-1 rounded-full bg-primary/10">↑ +8 pts this week</span>
          </motion.div>

          {/* Today's Mood */}
          <motion.div {...stagger(1)} className="neu p-7">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Today's Mood</p>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">😊</span>
              <div>
                <p className="font-semibold text-lg text-foreground">Good</p>
                <p className="text-xs text-muted-foreground">Feeling positive today</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">This Week</p>
            <div className="flex gap-1.5">
              {['😄', '🙂', '🙂', '😐', '🙂', '😄', '🙂'].map((e, i) => (
                <motion.div key={i} {...stagger(i, 0.04)} className="neu-inset w-8 h-8 flex items-center justify-center text-sm rounded-xl">
                  {e}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stress Level */}
          <motion.div {...stagger(2)} className="neu p-7">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Stress Level</p>
            <div className="flex items-end gap-1.5 h-20 mb-4">
              {stressBars.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.06 }}
                  className="flex-1 rounded-xl bg-gradient-to-t from-primary/35 to-primary/10"
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">↓ 12% this week</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-mint/15 text-secondary font-medium">Improving</span>
            </div>
          </motion.div>

          {/* AI Insight */}
          <motion.div {...stagger(3)} className="neu p-7 bg-gradient-to-br from-primary/6 to-mint/6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">SERA's Insight</p>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-mint flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-foreground leading-relaxed mb-3">
                  "Your stress levels increased during late evening study sessions. Consider short 5-minute breaks every 25 minutes."
                </p>
                <span className="text-[10px] text-primary font-medium">Based on 7-day analysis</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ━━━━━━━━━━ QUICK ACTIONS ━━━━━━━━━━ */}
      <Section className="!py-0">
        <motion.div {...fadeUp()} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              {...stagger(i)}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(action.path)}
              className="neu p-5 flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                <action.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </Section>

      {/* ━━━━━━━━━━ CORE FEATURES ━━━━━━━━━━ */}
      <Section id="features">
        <SectionHeading sub="Powerful AI tools designed around your emotional wellbeing — gentle, private, and always available.">
          Everything You Need to Feel Better
        </SectionHeading>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...stagger(i)}
              whileHover={{ y: -6 }}
              className={`neu p-8 bg-gradient-to-br ${f.gradient} group cursor-pointer`}
              onClick={() => navigate('/login')}
            >
              <div className={`w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-7 h-7 ${f.iconColor}`} />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:gap-3 transition-all">
                Explore <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ━━━━━━━━━━ MOOD ANALYTICS ━━━━━━━━━━ */}
      <Section id="insights">
        <SectionHeading sub="Beautiful charts and AI insights that turn your daily feelings into actionable self-awareness.">
          Understand Your Emotions Deeply
        </SectionHeading>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Weekly Mood Chart */}
          <motion.div {...stagger(0)} className="neu p-7">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">Weekly Mood Trend</p>
            <div className="flex items-end gap-2.5 h-36">
              {weekDays.map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${moodBars[i]}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.07 }}
                    className={`w-full rounded-xl bg-gradient-to-t ${
                      moodBars[i] >= 80 ? 'from-mint/50 to-mint/20' : moodBars[i] >= 60 ? 'from-primary/40 to-primary/15' : 'from-rose-soft/40 to-rose-soft/15'
                    }`}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">{day}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Emotion Heatmap */}
          <motion.div {...stagger(1)} className="neu p-7">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">Emotion Heatmap</p>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const intensity = [0.08, 0.2, 0.35, 0.55, 0.75][Math.floor(Math.random() * 5)];
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.012 }}
                    className="aspect-square rounded-lg cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                    style={{ background: `hsl(var(--primary) / ${intensity})` }}
                    title={`Week ${Math.floor(i / 7) + 1}, ${weekDays[i % 7]}`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[10px] text-muted-foreground">Less active</span>
              <div className="flex gap-1">
                {[0.08, 0.2, 0.35, 0.55, 0.75].map((o, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded" style={{ background: `hsl(var(--primary) / ${o})` }} />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">More active</span>
            </div>
          </motion.div>

          {/* Stress Trend */}
          <motion.div {...stagger(2)} className="neu p-7">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">Stress Trend</p>
            <svg viewBox="0 0 200 90" className="w-full h-32">
              <defs>
                <linearGradient id="stressAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,65 Q25,50 50,55 T100,38 T150,42 T200,28 V90 H0 Z" fill="url(#stressAreaGrad)" />
              <motion.path
                d="M0,65 Q25,50 50,55 T100,38 T150,42 T200,28"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
              {/* Dots */}
              {[[0,65],[50,55],[100,38],[150,42],[200,28]].map(([cx,cy], i) => (
                <motion.circle
                  key={i} cx={cx} cy={cy} r="3.5"
                  fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2"
                  initial={{ scale: 0 }} whileInView={{ scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.15 }}
                />
              ))}
            </svg>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-mint" />
              <p className="text-xs text-muted-foreground">Trending down — great progress 🎉</p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ━━━━━━━━━━ AI CHAT PREVIEW ━━━━━━━━━━ */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div {...fadeUp()}>
            <SectionLabel>AI Companion</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-5 leading-tight">
              Meet SERA — Your Supportive AI
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              SERA listens without judgment, remembers your context, and provides warm, evidence-based emotional support tailored specifically to students and young adults.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                { icon: Heart, text: 'Empathetic emotion detection in every message' },
                { icon: Shield, text: 'Crisis support with professional resources when needed' },
                { icon: Lock, text: '100% private — conversations never leave your device' },
                { icon: Zap, text: 'Contextual responses using conversation history' },
              ].map((item, i) => (
                <motion.li key={i} {...stagger(i)} className="flex items-center gap-3 text-sm text-foreground">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  {item.text}
                </motion.li>
              ))}
            </ul>
            <button onClick={() => navigate('/login')} className="btn-primary inline-flex items-center gap-2 text-sm px-6 py-3">
              Chat with SERA <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Chat mockup */}
          <motion.div {...fadeUp(0.2)} className="neu p-6 max-w-md mx-auto w-full">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-mint flex items-center justify-center shadow-md">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">SERA</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                  <p className="text-[10px] text-muted-foreground">Online • Ready to listen</p>
                </div>
              </div>
            </div>
            <div className="space-y-3.5">
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.25, duration: 0.4 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`text-sm px-4 py-3 max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                      : 'neu-flat rounded-2xl rounded-bl-md text-foreground'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {/* Emotion tag */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2 }}
                className="flex justify-start"
              >
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  😟 Detected: Academic Stress
                </span>
              </motion.div>
            </div>
            {/* Typing indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.5 }}
              className="flex items-center gap-1.5 mt-4 pl-1"
            >
              {[0, 0.15, 0.3].map((d, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                  className="w-2 h-2 rounded-full bg-muted-foreground/40"
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">SERA is typing...</span>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ━━━━━━━━━━ AI INSIGHT CARDS ━━━━━━━━━━ */}
      <Section>
        <SectionHeading sub="Smart AI-generated recommendations based on your emotional patterns and daily habits.">
          Intelligent Wellness Insights
        </SectionHeading>

        <div className="grid md:grid-cols-3 gap-6">
          {insightCards.map((card, i) => (
            <motion.div
              key={card.title}
              {...stagger(i)}
              whileHover={{ y: -5 }}
              className={`neu p-7 bg-gradient-to-br ${card.color} relative overflow-hidden`}
            >
              <div className="absolute top-3 right-3">
                <Sparkles className="w-4 h-4 text-primary/30" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-mint flex items-center justify-center mb-4 shadow-sm">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.text}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ━━━━━━━━━━ PROGRESS & HABIT TRACKING ━━━━━━━━━━ */}
      <Section>
        <SectionHeading sub="Watch your wellness habits grow over time. Every check-in counts toward a healthier you.">
          Your Progress Journey
        </SectionHeading>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {progressStats.map((stat, i) => (
            <motion.div key={stat.label} {...stagger(i)} className="neu p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl font-bold font-number text-foreground mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-foreground">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Habit preview */}
        <motion.div {...fadeUp(0.2)} className="neu p-7 mt-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-display text-lg font-semibold text-foreground">Weekly Habits</p>
              <p className="text-xs text-muted-foreground">Track your daily wellness routines</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-mint/15 text-secondary font-medium">71% complete</span>
          </div>
          <div className="grid grid-cols-8 gap-2 text-center">
            <div />
            {weekDays.map(d => <p key={d} className="text-[10px] text-muted-foreground font-medium">{d}</p>)}
            {[
              { emoji: '🧘', label: 'Meditate', checks: [1,1,0,1,1,0,1] },
              { emoji: '📓', label: 'Journal',  checks: [1,1,1,1,0,1,0] },
              { emoji: '💧', label: 'Hydrate',  checks: [1,0,1,1,1,1,1] },
              { emoji: '🏃', label: 'Exercise', checks: [0,1,0,1,0,1,0] },
            ].map((habit) => (
              <>
                <p key={habit.label} className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <span>{habit.emoji}</span>
                </p>
                {habit.checks.map((c, j) => (
                  <div key={j} className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                    c ? 'bg-primary/15' : 'neu-inset'
                  }`}>
                    {c ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : null}
                  </div>
                ))}
              </>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ━━━━━━━━━━ IMPACT / BENEFITS ━━━━━━━━━━ */}
      <Section id="resources">
        <SectionHeading sub="MindEase AI was built with one mission: making mental wellness support accessible to every student.">
          Why MindEase AI Matters
        </SectionHeading>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <motion.div key={b.title} {...stagger(i)} whileHover={{ y: -5 }} className="neu p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <b.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ━━━━━━━━━━ FAQ ━━━━━━━━━━ */}
      <Section id="faq">
        <SectionHeading sub="Got questions? We've got answers.">
          Frequently Asked Questions
        </SectionHeading>

        <div className="max-w-3xl mx-auto space-y-3">
          {[
            { q: 'What is this mental wellness app?', a: 'MindEase AI is an AI-powered mental wellness platform designed specifically for students and young adults. It combines an empathetic AI companion (SERA), mood tracking, journaling, breathing exercises, and wellness tools — all in one safe, private space.' },
            { q: 'Is my data private?', a: 'Absolutely. All your data stays on your device in local storage. We don\'t collect, store, or share any personal information on external servers. Your conversations with SERA, mood logs, and journal entries are 100% private.' },
            { q: 'Can I use the platform anonymously?', a: 'Yes! You can use MindEase AI completely anonymously. Click "Continue Anonymously" on the login page — no email, no name, no data shared. Your anonymous session is isolated and private.' },
            { q: 'What features does the platform offer?', a: 'MindEase AI includes: AI companion chat (SERA), mood tracking with trends, private journaling with AI reflections, guided breathing & meditation, stress-relief games, sleep tracking, diet & nutrition guidance, wellness exercises, and personalized insights.' },
            { q: 'How does mood tracking help mental health?', a: 'Tracking your mood daily helps you recognize emotional patterns, identify triggers, and detect early signs of burnout. Research shows that the simple act of labeling emotions ("affect labeling") reduces their intensity and builds self-awareness over time.' },
            { q: 'Is this a replacement for professional therapy?', a: 'No. MindEase AI is a wellness support tool, not a substitute for professional mental health care. If you\'re experiencing a crisis or need clinical support, we encourage you to reach out to a licensed therapist or use the helpline resources provided in the app.' },
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
          ))}
        </div>
      </Section>

      {/* ━━━━━━━━━━ CONTACT & SUPPORT ━━━━━━━━━━ */}
      <Section id="contact">
        <SectionHeading sub="We're here to help. Reach out anytime.">
          Contact & Support
        </SectionHeading>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Info */}
          <motion.div {...fadeUp()} className="neu p-8">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Email</p>
                  <a href="mailto:support@mindease.ai" className="text-sm text-foreground font-body font-medium hover:text-primary transition-colors">support@mindease.ai</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">📞</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Phone</p>
                  <a href="tel:+919152987821" className="text-sm text-foreground font-body font-medium hover:text-primary transition-colors">+91 91529 87821</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">🕐</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Hours</p>
                  <p className="text-sm text-foreground font-body font-medium">Mon–Sat, 9am–8pm IST</p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-rose-soft/10 border border-rose-soft/20">
              <p className="text-xs text-foreground font-body font-medium">🆘 Crisis Support (24/7)</p>
              <p className="text-xs text-muted-foreground font-body mt-1">iCall: 9152987821 · Vandrevala: 1860-2662-345</p>
            </div>
          </motion.div>

          {/* Support Form */}
          <motion.div {...fadeUp(0.1)} className="neu p-8">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">Send Us a Message</h3>
            <ContactForm />
          </motion.div>
        </div>
      </Section>

      {/* ━━━━━━━━━━ FINAL CTA ━━━━━━━━━━ */}
      <Section id="about">
        <motion.div
          {...fadeUp()}
          className="neu p-12 md:p-20 text-center bg-gradient-to-br from-primary/8 to-mint/8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-primary/12 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-mint/12 to-transparent rounded-tr-full" />
          <div className="relative z-10">
            <motion.div {...fadeUp(0.1)} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-mint flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
              Start Your Mental Wellness<br />Journey Today
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-base md:text-lg leading-relaxed">
              Join thousands of students who are taking charge of their mental wellbeing with AI-powered, compassionate support.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2.5 shadow-xl hover:shadow-2xl transition-shadow"
              >
                Start Free <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary text-base px-8 py-4 inline-flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> Talk to AI Companion
              </button>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ━━━━━━━━━━ FOOTER ━━━━━━━━━━ */}
      <footer className="border-t border-border py-12 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-mint flex items-center justify-center shadow-sm">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display text-base font-bold text-foreground">MindEase AI</span>
                <p className="text-[10px] text-muted-foreground">Your calm in the chaos.</p>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <button type="button" onClick={() => scrollToSection('about')} className="hover:text-foreground transition-colors">About</button>
              <button type="button" onClick={() => navigate('/login')} className="hover:text-foreground transition-colors">Privacy</button>
              <a href="mailto:hello@mindease.ai" className="hover:text-foreground transition-colors">Contact</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">© 2026 MindEase AI. Built with 💙 for student mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
