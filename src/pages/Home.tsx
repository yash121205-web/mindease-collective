import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf, ArrowRight, MessageCircle, Smile, BookOpen, Wind,
  Brain, Sparkles, Github, Heart, Shield, Star, TrendingUp,
  ChevronRight, Activity, Zap, Users, Lock,
  Flame, PenLine, Clock, CheckCircle2,
  Menu, X, Headphones, Timer
} from 'lucide-react';
import meditationHero from '@/assets/meditation-hero.png';

/* ─── Lightweight animation helpers (no scroll observers) ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-16 md:py-24 px-5 md:px-10 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-body font-medium bg-primary/8 text-primary border border-primary/12 mb-5 tracking-wide">
      <Sparkles className="w-3.5 h-3.5" />
      {children}
    </span>
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
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-background rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="font-display font-medium text-foreground text-sm md:text-base pr-4">{question}</span>
        <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          <p className="text-sm text-muted-foreground font-body leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
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
        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Enter your name" required />
      </div>
      <div>
        <label className="text-xs font-body text-muted-foreground mb-1 block">Email Address</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="you@example.com" required />
      </div>
      <div>
        <label className="text-xs font-body text-muted-foreground mb-1 block">Message</label>
        <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-none"
          placeholder="How can we help you?" required />
      </div>
      <button type="submit" className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-body font-medium text-sm hover:opacity-90 transition-opacity">
        Send Message
      </button>
      {sent && <p className="text-xs text-center text-primary font-body">✓ Message sent!</p>}
    </form>
  );
}

/* ─── Data ─── */
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const moodBars = [70, 85, 60, 90, 55, 80, 75];
const stressBars = [35, 50, 40, 60, 45, 30, 25];

const features = [
  { icon: MessageCircle, title: 'AI Emotional Companion', desc: 'Talk to SERA, your empathetic AI companion who provides personalized emotional support anytime.', gradient: 'from-primary/8 to-secondary/4', iconBg: 'bg-primary/12', iconColor: 'text-primary' },
  { icon: Smile, title: 'Mood Tracking', desc: 'Log emotions with quick emoji check-ins. Track patterns and discover what lifts your spirits.', gradient: 'from-mint/8 to-primary/4', iconBg: 'bg-mint/15', iconColor: 'text-foreground' },
  { icon: Timer, title: 'Guided Meditation', desc: 'Scientifically-backed guided sessions to reduce anxiety and build focus in under 10 minutes.', gradient: 'from-secondary/8 to-primary/4', iconBg: 'bg-secondary/15', iconColor: 'text-secondary' },
  { icon: BookOpen, title: 'Personal Journal', desc: 'Write freely and receive warm, insightful AI reflections that help you understand your emotions.', gradient: 'from-warm-peach/10 to-primary/4', iconBg: 'bg-warm-peach/15', iconColor: 'text-foreground' },
  { icon: Heart, title: 'Gratitude Wall', desc: 'Build a visual garden of things you\'re grateful for. Research shows gratitude boosts wellbeing by 25%.', gradient: 'from-mint/8 to-secondary/4', iconBg: 'bg-mint/15', iconColor: 'text-foreground' },
  { icon: Headphones, title: 'Relaxing Soundscapes', desc: 'Curated ambient soundscapes designed to calm your mind and improve focus during study sessions.', gradient: 'from-sky-soft/10 to-primary/5', iconBg: 'bg-sky-soft/20', iconColor: 'text-primary' },
];

const benefits = [
  { icon: Shield, title: 'Confidential Support', desc: 'Everything stays on your device. Complete privacy by design.' },
  { icon: Brain, title: 'AI Emotional Insights', desc: 'SERA reveals hidden emotional trends to help you understand yourself.' },
  { icon: Users, title: 'Student-Focused', desc: 'Built for exam anxiety, burnout, and the unique pressures students face.' },
  { icon: Heart, title: 'Always Available', desc: 'Compassionate AI support accessible 24/7, right when you need it.' },
];

const chatMessages = [
  { role: 'user' as const, text: "I'm feeling really stressed about my finals 😰" },
  { role: 'ai' as const, text: "Exam season can feel like a mountain — but you've climbed them before. What subject is weighing on you the most?" },
  { role: 'user' as const, text: "Organic chemistry. I feel so behind." },
  { role: 'ai' as const, text: "Falling behind doesn't mean failing. Let's make a small plan — even 25 focused minutes today counts." },
];

const challengeCards = [
  { title: 'Stretch Break', desc: 'Stand up and stretch for 3 minutes', emoji: '🧘', streak: 5 },
  { title: 'Gratitude Reflection', desc: 'Write 3 things you\'re grateful for', emoji: '🙏', streak: 12 },
  { title: 'Digital Sunset', desc: 'No screens 30 min before bed', emoji: '🌅', streak: 3 },
  { title: 'Mindful Breathing', desc: '4-7-8 breathing for 5 minutes', emoji: '🌬️', streak: 8 },
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

  // Stable heatmap values so they don't re-randomize on re-render
  const heatmapValues = useMemo(() =>
    Array.from({ length: 35 }, () => [0.06, 0.15, 0.28, 0.45, 0.65][Math.floor(Math.random() * 5)]),
  []);

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
    let rafId = 0;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      rafId = window.requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 20;
        setScrolled(prev => (prev === nextScrolled ? prev : nextScrolled));
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const hashSection = location.hash.replace('#', '');
    const frame = requestAnimationFrame(() => scrollToSection(hashSection));
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background font-body text-foreground overflow-x-hidden">

      {/* ━━━ NAVBAR ━━━ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 md:px-10 py-4">
          <button type="button" onClick={() => handleNavClick('home')} className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">MindEase AI</span>
          </button>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button type="button" key={link.label} onClick={() => handleNavClick(link.id)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button type="button" onClick={() => navigate('/login')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">Login</button>
            <button type="button" onClick={() => navigate('/login')} className="btn-primary text-sm px-6 py-2.5">Start Free</button>
          </div>

          <button type="button" onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2" aria-label="Toggle menu">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenu && (
          <div className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 px-5 pb-5 pt-3 space-y-3">
            {navLinks.map((link) => (
              <button type="button" key={link.label} onClick={() => handleNavClick(link.id)}
                className="block w-full text-left text-sm font-medium text-foreground py-2">{link.label}</button>
            ))}
            <button type="button" onClick={() => navigate('/login')} className="btn-primary w-full text-sm py-2.5 mt-2">Start Free</button>
          </div>
        )}
      </nav>

      {/* ━━━ HERO ━━━ */}
      <Section id="home" optimize={false} className="pt-32 md:pt-40 pb-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.div {...fadeUp()} className="mb-5">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-primary/6 text-primary border border-primary/10">
                <Star className="w-3.5 h-3.5 fill-primary/30" /> AI-Powered Mental Wellness Platform
              </span>
            </motion.div>
            <motion.h1 {...fadeUp(0.08)} className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold text-foreground leading-[1.08] mb-6">
              Your AI Companion for{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-mint bg-clip-text text-transparent">
                Mental Wellness
              </span>
            </motion.h1>
            <motion.p {...fadeUp(0.14)} className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              Track emotions, reflect through journaling, and receive AI-powered emotional support — anytime, anywhere.
            </motion.p>
            <motion.div {...fadeUp(0.2)} className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/login')} className="btn-primary flex items-center gap-2.5 text-base px-8 py-3.5">
                Start Your Wellness Journey <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary flex items-center gap-2.5 text-base px-8 py-3.5">
                <MessageCircle className="w-4 h-4" /> Talk to AI Companion
              </button>
            </motion.div>
            <motion.div {...fadeUp(0.26)} className="flex items-center gap-6 mt-10 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> 100% Private</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> AI Powered</span>
              <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Free Forever</span>
            </motion.div>
          </div>

          {/* Hero illustration */}
          <motion.div {...fadeUp(0.1)} className="relative flex items-center justify-center">
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-secondary/8 rounded-full blur-3xl pointer-events-none" />

              <img
                src={meditationHero}
                alt="Person meditating peacefully"
                className="w-full max-w-md mx-auto drop-shadow-xl animate-float"
                loading="eager"
              />

              {/* Floating cards — CSS animation only */}
              <div className="absolute -top-3 -right-3 md:-right-6 bg-background/90 backdrop-blur-md rounded-2xl p-3 flex items-center gap-2.5 shadow-lg border border-border/40 animate-float" style={{ animationDelay: '0.3s' }}>
                <div className="w-9 h-9 rounded-xl bg-mint/15 flex items-center justify-center">
                  <Smile className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Mood: Great</p>
                  <p className="text-[10px] text-muted-foreground">Today 😊</p>
                </div>
              </div>

              <div className="absolute -bottom-2 -left-3 md:-left-6 bg-background/90 backdrop-blur-md rounded-2xl p-3 flex items-center gap-2.5 shadow-lg border border-border/40 animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground font-number">76%</p>
                  <p className="text-[10px] text-muted-foreground">Health Score</p>
                </div>
              </div>

              <div className="absolute top-1/2 -right-1 md:-right-4 -translate-y-1/2 bg-background/90 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2 shadow-lg border border-border/40 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="w-7 h-7 rounded-lg bg-warm-peach/20 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-foreground" />
                </div>
                <p className="text-[10px] font-semibold text-foreground">🔥 12 streak</p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ━━━ FEATURE PREVIEW CARDS ━━━ */}
      <Section className="!py-8">
        <motion.div {...fadeUp()} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MessageCircle, title: 'AI Emotional Companion', desc: 'Empathetic support', color: 'bg-primary/8' },
            { icon: Smile, title: 'Mood Tracking', desc: 'Daily check-ins', color: 'bg-secondary/8' },
            { icon: Timer, title: 'Guided Meditation', desc: 'Calm your mind', color: 'bg-mint/10' },
            { icon: BookOpen, title: 'Personal Journal', desc: 'AI-powered reflection', color: 'bg-warm-peach/12' },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-background rounded-2xl border border-border/50 p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
              onClick={() => navigate('/login')}
            >
              <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mx-auto mb-3`}>
                <card.icon className="w-6 h-6 text-foreground" />
              </div>
              <p className="font-display text-sm font-semibold text-foreground mb-1">{card.title}</p>
              <p className="text-[11px] text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </motion.div>
      </Section>

      {/* ━━━ DASHBOARD PREVIEW ━━━ */}
      <Section id="dashboard">
        <SectionHeading sub="Real-time emotional intelligence at your fingertips.">
          Emotional Health at a Glance
        </SectionHeading>

        <motion.div {...fadeUp()} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* EHS Score */}
          <div className="bg-background rounded-2xl border border-border/50 p-7 flex flex-col items-center sm:col-span-2 lg:col-span-1 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">Emotional Health</p>
            <div className="relative w-28 h-28 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#ehsGrad)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * 0.24}`}
                  className="transition-all duration-1000" />
                <defs>
                  <linearGradient id="ehsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--mint))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-number text-foreground">76</span>
                <span className="text-[10px] text-muted-foreground">/ 100</span>
              </div>
            </div>
            <span className="text-xs text-primary font-medium px-3 py-1 rounded-full bg-primary/8">↑ +8 pts this week</span>
          </div>

          {/* Today's Mood */}
          <div className="bg-background rounded-2xl border border-border/50 p-7 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Today's Mood</p>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">😊</span>
              <div>
                <p className="font-semibold text-lg text-foreground">Good</p>
                <p className="text-xs text-muted-foreground">Feeling positive today</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">This Week</p>
            <div className="flex gap-1.5">
              {['😄', '🙂', '🙂', '😐', '🙂', '😄', '🙂'].map((e, i) => (
                <div key={i} className="bg-muted/40 w-8 h-8 flex items-center justify-center text-sm rounded-xl border border-border/30">{e}</div>
              ))}
            </div>
          </div>

          {/* Stress Level */}
          <div className="bg-background rounded-2xl border border-border/50 p-7 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Stress Level</p>
            <div className="flex items-end gap-1.5 h-20 mb-4">
              {stressBars.map((h, i) => (
                <div key={i} className="flex-1 rounded-lg bg-gradient-to-t from-primary/30 to-primary/8 transition-all duration-700"
                  style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">↓ 12% this week</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-mint/12 text-foreground font-medium">Improving</span>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-background rounded-2xl border border-border/50 p-7 bg-gradient-to-br from-primary/4 to-mint/4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">SERA's Insight</p>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-foreground leading-relaxed mb-3">
                  "Your stress levels increased during late evening study sessions. Consider short 5-minute breaks."
                </p>
                <span className="text-[10px] text-primary font-medium">Based on 7-day analysis</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ━━━ CORE FEATURES ━━━ */}
      <Section id="features">
        <SectionHeading sub="Powerful AI tools designed around your emotional wellbeing — gentle, private, and always available.">
          Everything You Need to Feel Better
        </SectionHeading>

        <motion.div {...fadeUp()} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`bg-background rounded-2xl border border-border/50 p-8 bg-gradient-to-br ${f.gradient} group cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all`}
              onClick={() => navigate('/login')}
            >
              <div className={`w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-7 h-7 ${f.iconColor}`} />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:gap-3 transition-all">
                Explore <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </motion.div>
      </Section>

      {/* ━━━ MOOD ANALYTICS ━━━ */}
      <Section id="insights">
        <SectionHeading sub="Beautiful charts and AI insights that turn your daily feelings into actionable self-awareness.">
          Understand Your Emotions Deeply
        </SectionHeading>

        <motion.div {...fadeUp()} className="grid md:grid-cols-3 gap-5">
          {/* Weekly Mood Chart */}
          <div className="bg-background rounded-2xl border border-border/50 p-7 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">Weekly Mood Trend</p>
            <div className="flex items-end gap-2.5 h-36">
              {weekDays.map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-lg bg-gradient-to-t transition-all duration-700 ${
                      moodBars[i] >= 80 ? 'from-mint/40 to-mint/15' : moodBars[i] >= 60 ? 'from-primary/35 to-primary/10' : 'from-warm-peach/40 to-warm-peach/15'
                    }`}
                    style={{ height: `${moodBars[i]}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emotion Heatmap — static, no per-cell animation */}
          <div className="bg-background rounded-2xl border border-border/50 p-7 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">Emotion Heatmap</p>
            <div className="grid grid-cols-7 gap-2">
              {heatmapValues.map((intensity, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md cursor-pointer hover:ring-2 hover:ring-primary/30 transition-shadow"
                  style={{ background: `hsl(var(--primary) / ${intensity})` }}
                  title={`Week ${Math.floor(i / 7) + 1}, ${weekDays[i % 7]}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[10px] text-muted-foreground">Less active</span>
              <div className="flex gap-1">
                {[0.06, 0.15, 0.28, 0.45, 0.65].map((o, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded" style={{ background: `hsl(var(--primary) / ${o})` }} />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">More active</span>
            </div>
          </div>

          {/* Stress Trend */}
          <div className="bg-background rounded-2xl border border-border/50 p-7 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-5">Stress Trend</p>
            <svg viewBox="0 0 200 90" className="w-full h-32">
              <defs>
                <linearGradient id="stressAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,65 Q25,50 50,55 T100,38 T150,42 T200,28 V90 H0 Z" fill="url(#stressAreaGrad)" />
              <path d="M0,65 Q25,50 50,55 T100,38 T150,42 T200,28" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
              {[[0,65],[50,55],[100,38],[150,42],[200,28]].map(([cx,cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3.5" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2" />
              ))}
            </svg>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-mint" />
              <p className="text-xs text-muted-foreground">Trending down — great progress 🎉</p>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ━━━ DAILY WELLNESS CHALLENGES ━━━ */}
      <Section>
        <SectionHeading sub="Small daily actions that build lasting habits.">
          Daily Wellness Challenges
        </SectionHeading>

        <motion.div {...fadeUp()} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {challengeCards.map((c) => (
            <div key={c.title} className="bg-background rounded-2xl border border-border/50 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer">
              <span className="text-3xl block mb-3">{c.emoji}</span>
              <h3 className="font-display text-base font-semibold text-foreground mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">{c.desc}</p>
              <div className="flex items-center justify-between">
                <button className="px-4 py-1.5 rounded-xl bg-primary/8 text-primary text-xs font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  Complete
                </button>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {c.streak}d streak
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </Section>

      {/* ━━━ AI CHAT PREVIEW ━━━ */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div {...fadeUp()}>
            <SectionLabel>AI Companion</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-5 leading-tight">
              Meet SERA — Your Supportive AI
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              SERA listens without judgment and provides warm, evidence-based emotional support tailored to students.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                { icon: Brain, text: 'Detects emotional patterns and triggers' },
                { icon: Shield, text: '100% private — no data leaves your device' },
                { icon: Heart, text: 'Warm, empathetic, and culturally sensitive' },
                { icon: Clock, text: 'Available 24/7 — no appointments needed' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-foreground font-body">
                  <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/login')} className="btn-primary inline-flex items-center gap-2 text-sm px-6 py-3">
              Chat with SERA <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Chat mockup */}
          <motion.div {...fadeUp(0.1)} className="bg-background rounded-2xl border border-border/50 p-6 max-w-md mx-auto w-full shadow-lg">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">SERA</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-mint animate-pulse-soft" />
                  <p className="text-[10px] text-muted-foreground">Online • Powered by AI</p>
                </div>
              </div>
            </div>
            <div className="space-y-3.5">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`text-sm px-4 py-3 max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-2xl rounded-br-md'
                      : 'bg-muted/50 border border-border/40 rounded-2xl rounded-bl-md text-foreground'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div className="flex justify-start">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/8 text-primary font-medium">
                  😟 Detected: Academic Stress
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 pl-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse-soft" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse-soft" style={{ animationDelay: '0.15s' }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
              <span className="text-[10px] text-muted-foreground ml-1">SERA is typing...</span>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ━━━ AI INSIGHT CARDS ━━━ */}
      <Section>
        <SectionHeading sub="Smart AI-generated recommendations based on your emotional patterns.">
          Intelligent Wellness Insights
        </SectionHeading>

        <motion.div {...fadeUp()} className="grid md:grid-cols-3 gap-5">
          {[
            { title: 'Journaling Impact', text: 'Your mood improves by 23% on days you journal.', color: 'from-primary/6 to-secondary/5' },
            { title: 'Stress Pattern', text: 'Stress peaks on Tuesdays — try breathing exercises before class.', color: 'from-mint/8 to-primary/5' },
            { title: 'Sleep Connection', text: 'Breathing tool users see 15% higher next-day mood scores.', color: 'from-secondary/6 to-mint/5' },
          ].map((card) => (
            <div key={card.title}
              className={`bg-background rounded-2xl border border-border/50 p-7 bg-gradient-to-br ${card.color} relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all`}>
              <div className="absolute top-3 right-3"><Sparkles className="w-4 h-4 text-primary/20" /></div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-sm">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.text}</p>
            </div>
          ))}
        </motion.div>
      </Section>

      {/* ━━━ PROGRESS ━━━ */}
      <Section>
        <SectionHeading sub="Watch your wellness habits grow over time.">
          Your Progress Journey
        </SectionHeading>

        <motion.div {...fadeUp()} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {progressStats.map((stat) => (
            <div key={stat.label} className="bg-background rounded-2xl border border-border/50 p-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl font-bold font-number text-foreground mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-foreground">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Habit preview */}
        <motion.div {...fadeUp(0.1)} className="bg-background rounded-2xl border border-border/50 p-7 mt-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-display text-lg font-semibold text-foreground">Weekly Habits</p>
              <p className="text-xs text-muted-foreground">Track your daily wellness routines</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-mint/10 text-foreground font-medium">71% complete</span>
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
              <div key={habit.label} className="contents">
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <span>{habit.emoji}</span>
                </p>
                {habit.checks.map((c, j) => (
                  <div key={j} className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                    c ? 'bg-primary/10' : 'bg-muted/30 border border-border/30'
                  }`}>
                    {c ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ━━━ BENEFITS ━━━ */}
      <Section id="resources">
        <SectionHeading sub="Making mental wellness support accessible to every student.">
          Why MindEase AI Matters
        </SectionHeading>

        <motion.div {...fadeUp()} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b) => (
            <div key={b.title} className="bg-background rounded-2xl border border-border/50 p-7 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-5">
                <b.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </motion.div>
      </Section>

      {/* ━━━ FAQ ━━━ */}
      <Section id="faq">
        <SectionHeading sub="Got questions? We've got answers.">
          Frequently Asked Questions
        </SectionHeading>

        <div className="max-w-3xl mx-auto space-y-3">
          {[
            { q: 'What is this mental wellness app?', a: 'MindEase AI is an AI-powered mental wellness platform designed specifically for students and young adults. It combines an empathetic AI companion (SERA), mood tracking, journaling, breathing exercises, and wellness tools — all in one safe, private space.' },
            { q: 'Is my data private?', a: 'Absolutely. All your data stays on your device. We don\'t collect, store, or share any personal information. Your conversations, mood logs, and journal entries are 100% private.' },
            { q: 'Can I use the platform anonymously?', a: 'Yes! Click "Continue Anonymously" on the login page — no email, no name, no data shared.' },
            { q: 'Is this a replacement for professional therapy?', a: 'No. MindEase AI is a wellness support tool, not a substitute for professional mental health care.' },
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </Section>

      {/* ━━━ CONTACT ━━━ */}
      <Section id="contact">
        <SectionHeading sub="We're here to help. Reach out anytime.">
          Contact & Support
        </SectionHeading>

        <motion.div {...fadeUp()} className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-background rounded-2xl border border-border/50 p-8 shadow-sm">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">Get in Touch</h3>
            <div className="space-y-4">
              {[
                { emoji: '📧', label: 'Email', value: 'support@mindease.ai', href: 'mailto:support@mindease.ai' },
                { emoji: '📞', label: 'Phone', value: '+91 91529 87821', href: 'tel:+919152987821' },
                { emoji: '🕐', label: 'Hours', value: 'Mon–Sat, 9am–8pm IST' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                    <span className="text-lg">{item.emoji}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-body">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-foreground font-body font-medium hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-sm text-foreground font-body font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-warm-peach/10 border border-warm-peach/20">
              <p className="text-xs text-foreground font-body font-medium">🆘 Crisis Support (24/7)</p>
              <p className="text-xs text-muted-foreground font-body mt-1">iCall: 9152987821 · Vandrevala: 1860-2662-345</p>
            </div>
          </div>

          <div className="bg-background rounded-2xl border border-border/50 p-8 shadow-sm">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">Send Us a Message</h3>
            <ContactForm />
          </div>
        </motion.div>
      </Section>

      {/* ━━━ FINAL CTA ━━━ */}
      <Section id="about">
        <motion.div {...fadeUp()}
          className="bg-background rounded-3xl border border-border/50 p-12 md:p-20 text-center bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-primary/8 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-secondary/8 to-transparent rounded-tr-full pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
              Start Your Mental Wellness<br />Journey Today
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-base md:text-lg leading-relaxed">
              Join thousands of students taking charge of their mental wellbeing with AI-powered support.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button onClick={() => navigate('/login')} className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2.5">
                Start Free <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary text-base px-8 py-4 inline-flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Talk to AI Companion
              </button>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-border/50 py-12 px-5 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
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
          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground">© 2026 MindEase AI. Built with 💙 for student mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
