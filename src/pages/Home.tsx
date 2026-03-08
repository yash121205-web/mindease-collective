import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, ArrowRight, MessageCircle, Smile, BookOpen,
  Brain, Sparkles, Heart, Shield, Star, TrendingUp,
  ChevronRight, Activity, Zap, Users, Lock,
  Menu, X, Headphones, Timer, ChevronDown, Phone
} from 'lucide-react';

/* ─── Animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const childFade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 md:py-28 px-5 md:px-10 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/8 text-primary border border-primary/15 mb-5 tracking-wide">
      <Sparkles className="w-3.5 h-3.5" />
      {children}
    </span>
  );
}

/* ─── Floating blob for hero ─── */
function HeroBlob({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ x: [0, 15, -10, 0], y: [0, -12, 8, 0], scale: [1, 1.05, 0.97, 1] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ─── Typing animation for chat preview ─── */
function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-3 py-2">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary/50"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity, repeatDelay: 0.5 }}
        />
      ))}
    </div>
  );
}

/* ─── Chat message bubble ─── */
function ChatBubble({ role, text, delay }: { role: 'user' | 'ai'; text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {role === 'ai' && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-2 shrink-0 mt-1">
          <Leaf className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        role === 'user'
          ? 'bg-primary text-white rounded-br-sm'
          : 'bg-muted/60 text-foreground rounded-bl-sm border border-border/30'
      }`}>
        {text}
      </div>
    </motion.div>
  );
}

/* ─── Breathing circle ─── */
function BreathingCircle() {
  return (
    <div className="relative w-40 h-40 mx-auto">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20"
        animate={{ scale: [1, 1.3, 1.3, 1], opacity: [0.5, 0.8, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/30 to-accent/30"
        animate={{ scale: [1, 1.2, 1.2, 1], opacity: [0.6, 0.9, 0.9, 0.6] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      />
      <motion.div
        className="absolute inset-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary"
        animate={{ scale: [1, 1.15, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        <motion.span
          className="text-white text-sm font-medium"
          animate={{ opacity: [1, 1, 0, 0, 1, 1, 0, 0, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
        >
          Breathe
        </motion.span>
      </motion.div>
    </div>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card rounded-2xl border border-border/40 overflow-hidden hover:border-primary/20 transition-colors">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="font-display font-medium text-foreground text-sm md:text-base pr-4">{question}</span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 -mt-1">
              <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Data ─── */
const features = [
  { icon: MessageCircle, title: 'AI Emotional Companion', desc: 'Talk to SERA, your empathetic AI companion who provides personalized emotional support anytime.', gradient: 'from-primary/10 to-accent/5' },
  { icon: Smile, title: 'Mood Tracking', desc: 'Log emotions with quick emoji check-ins. Track patterns and discover what lifts your spirits.', gradient: 'from-accent/10 to-primary/5' },
  { icon: Timer, title: 'Guided Meditation', desc: 'Scientifically-backed guided sessions to reduce anxiety and build focus in under 10 minutes.', gradient: 'from-secondary/10 to-primary/5' },
  { icon: BookOpen, title: 'Personal Journal', desc: 'Write freely and receive warm, insightful AI reflections that help you understand your emotions.', gradient: 'from-warm-peach/12 to-primary/5' },
  { icon: Heart, title: 'Gratitude Wall', desc: 'Build a visual garden of things you\'re grateful for. Research shows gratitude boosts wellbeing by 25%.', gradient: 'from-rose-soft/10 to-accent/5' },
  { icon: Headphones, title: 'Relaxing Soundscapes', desc: 'Curated ambient soundscapes designed to calm your mind and improve focus during study sessions.', gradient: 'from-primary/8 to-secondary/5' },
];

const chatMessages = [
  { role: 'user' as const, text: "I'm feeling really stressed about my finals 😰" },
  { role: 'ai' as const, text: "I hear you — exam season can feel overwhelming. Let's try a quick breathing exercise to reset. Ready?" },
  { role: 'user' as const, text: "Yes please, I need that right now" },
  { role: 'ai' as const, text: "Breathe in for 4 counts… hold 4… out 4. Two more rounds and notice how your shoulders drop. 🧘" },
];

const testimonials = [
  { text: "MindEase helped me manage anxiety during exams. The AI companion feels like talking to a real friend.", name: "Priya S.", role: "Engineering Student" },
  { text: "The journaling insights helped me understand my emotions better than any app I've tried.", name: "James L.", role: "Graduate Student" },
  { text: "I love the breathing exercises and mood tracking. It's become part of my daily routine.", name: "Aisha K.", role: "Medical Student" },
];

const trustBadges = [
  { icon: Lock, title: 'End-to-End Privacy', desc: 'All data stays on your device' },
  { icon: Shield, title: 'No Data Selling', desc: 'We never monetize your data' },
  { icon: BookOpen, title: 'Private Journaling', desc: 'Your thoughts are yours alone' },
  { icon: Brain, title: 'Ethical AI', desc: 'Responsible wellness models' },
];

const crisisLines = [
  { country: '🇮🇳 India', name: 'Kiran Mental Health', number: '1800-599-0019' },
  { country: '🇺🇸 USA', name: 'Suicide & Crisis Lifeline', number: '988' },
  { country: '🇬🇧 UK', name: 'Samaritans', number: '116 123' },
];

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Trust', id: 'trust' },
    { label: 'FAQ', id: 'faq' },
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
    if (!location.hash) return;
    const hashSection = location.hash.replace('#', '');
    const frame = requestAnimationFrame(() => scrollToSection(hashSection));
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  // Auto-slide testimonials
  useEffect(() => {
    const t = setInterval(() => setCurrentTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ━━━ NAVBAR ━━━ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 md:px-10 py-3.5">
          <button type="button" onClick={() => handleNavClick('home')} className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">MindEase</span>
          </button>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button type="button" key={link.label} onClick={() => handleNavClick(link.id)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full group-hover:w-full transition-all duration-300" />
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

        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-card/95 backdrop-blur-xl border-t border-border/30 px-5 pb-5 pt-3 space-y-3 overflow-hidden"
            >
              {navLinks.map((link) => (
                <button type="button" key={link.label} onClick={() => handleNavClick(link.id)}
                  className="block w-full text-left text-sm font-medium text-foreground py-2">{link.label}</button>
              ))}
              <button type="button" onClick={() => navigate('/login')} className="btn-primary w-full text-sm py-2.5 mt-2">Start Free</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ━━━ IMMERSIVE HERO ━━━ */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Animated background blobs */}
        <HeroBlob className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-3xl" delay={0} />
        <HeroBlob className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/[0.06] blur-3xl" delay={3} />
        <HeroBlob className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-secondary/[0.04] blur-3xl" delay={5} />

        {/* Breathing animation in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            className="w-[800px] h-[800px] rounded-full border border-primary/[0.04]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-5 md:px-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <motion.div {...fadeUp()}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-primary/8 text-primary border border-primary/15">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles className="w-3.5 h-3.5" />
                  </motion.div>
                  AI-Powered Mental Wellness
                </span>
              </motion.div>

              <motion.h1 {...fadeUp(0.1)} className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold text-foreground leading-[1.08] mt-6 mb-6">
                Your{' '}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  AI Companion
                </span>{' '}
                for Mental Wellness
              </motion.h1>

              <motion.p {...fadeUp(0.18)} className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
                Talk to an empathetic AI, track your mood, and build healthier habits — in a safe, private digital space designed for students.
              </motion.p>

              <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/login')}
                  className="btn-primary flex items-center gap-2.5 text-base px-8 py-4"
                >
                  Start Free Session <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleNavClick('features')}
                  className="btn-secondary flex items-center gap-2.5 text-base px-8 py-4"
                >
                  Explore Features
                </motion.button>
              </motion.div>

              <motion.div {...fadeUp(0.32)} className="flex items-center gap-6 mt-10 text-xs text-muted-foreground">
                {[
                  { icon: Lock, text: '100% Private' },
                  { icon: Zap, text: 'AI-Powered' },
                  { icon: Heart, text: 'Free Forever' },
                  { icon: Users, text: '90+ Languages' },
                ].map((badge) => (
                  <span key={badge.text} className="flex items-center gap-1.5">
                    <badge.icon className="w-3.5 h-3.5 text-primary" /> {badge.text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Chat preview */}
            <motion.div {...fadeUp(0.15)} className="relative hidden lg:block">
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/40 rounded-3xl p-6 shadow-2xl shadow-primary/5">
                {/* Chat header */}
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/30">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">SERA</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-xs text-muted-foreground">Online • Ready to listen</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {chatMessages.map((msg, i) => (
                    <ChatBubble key={i} role={msg.role} text={msg.text} delay={0.5 + i * 0.3} />
                  ))}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                  >
                    <TypingDots />
                  </motion.div>
                </div>

                {/* Floating emotion badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, type: 'spring' }}
                  className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/20 text-xs font-medium text-accent-foreground flex items-center gap-1.5"
                >
                  <Activity className="w-3 h-3 text-accent" /> Detected: Stress
                </motion.div>
              </div>

              {/* Floating stats cards */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 bg-card/90 backdrop-blur-md rounded-2xl p-3 flex items-center gap-2.5 shadow-lg border border-border/30"
              >
                <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground font-mono">76%</p>
                  <p className="text-[10px] text-muted-foreground">Wellness Score</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground/50" />
        </motion.div>
      </section>

      {/* ━━━ FEATURES ━━━ */}
      <Section id="features">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <SectionLabel>Features</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Mental Wellness</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-lg leading-relaxed">
            Scientifically-backed tools designed to support your emotional health journey.
          </p>
        </motion.div>

        <motion.div variants={stagger} initial="initial" animate="animate" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              variants={childFade}
              whileHover={{ y: -6, boxShadow: '0 20px 40px -12px hsl(var(--primary) / 0.12)' }}
              className={`rounded-3xl p-7 bg-gradient-to-br ${feat.gradient} border border-border/30 group cursor-pointer transition-all`}
              onClick={() => navigate('/login')}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <feat.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Try it <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ━━━ AI THERAPIST + BREATHING ━━━ */}
      <Section id="how-it-works" className="bg-muted/30">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Your Personal{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Wellness Journey</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Breathing exercise */}
          <motion.div {...fadeUp(0.1)} className="bg-card rounded-3xl border border-border/30 p-10 text-center shadow-lg">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Breathing Exercise</h3>
            <BreathingCircle />
            <div className="mt-6 space-y-1 text-sm text-muted-foreground">
              <p>Inhale for 4 seconds</p>
              <p>Hold for 4 seconds</p>
              <p>Exhale for 4 seconds</p>
            </div>
          </motion.div>

          {/* Mood tracker preview */}
          <motion.div {...fadeUp(0.2)} className="bg-card rounded-3xl border border-border/30 p-8 shadow-lg">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Interactive Mood Tracker</h3>
            <div className="flex justify-center gap-3 mb-8">
              {['😄', '🙂', '😐', '😔', '😰'].map((emoji, i) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border transition-all ${
                    i === 0 ? 'bg-primary/10 border-primary/30 shadow-md' : 'bg-muted/40 border-border/30 hover:bg-muted/60'
                  }`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Weekly Mood Trend</p>
            <div className="flex items-end gap-2 h-24">
              {[70, 85, 60, 90, 55, 80, 75].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-lg"
                  style={{ background: `linear-gradient(180deg, hsl(var(--primary)), hsl(var(--accent)))` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ━━━ TRUST & PRIVACY ━━━ */}
      <Section id="trust">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <SectionLabel>Trust & Privacy</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Your Privacy is{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sacred</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-lg">
            We built MindEase with privacy-first architecture. Your data never leaves your control.
          </p>
        </motion.div>

        <motion.div variants={stagger} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustBadges.map((badge) => (
            <motion.div
              key={badge.title}
              variants={childFade}
              whileHover={{ y: -4 }}
              className="bg-card rounded-2xl border border-border/30 p-6 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <badge.icon className="w-7 h-7 text-primary" />
              </motion.div>
              <h3 className="font-display font-bold text-foreground mb-1">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ━━━ TESTIMONIALS ━━━ */}
      <Section className="bg-muted/30">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <SectionLabel>Testimonials</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Loved by Students
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-3xl border border-border/30 p-8 md:p-10 text-center shadow-lg"
            >
              <div className="flex justify-center gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-lg md:text-xl text-foreground leading-relaxed italic font-display mb-6">
                "{testimonials[currentTestimonial].text}"
              </p>
              <p className="font-semibold text-foreground">{testimonials[currentTestimonial].name}</p>
              <p className="text-sm text-muted-foreground">{testimonials[currentTestimonial].role}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentTestimonial ? 'bg-primary w-8' : 'bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>
        </div>
      </Section>

      {/* ━━━ CRISIS SUPPORT ━━━ */}
      <Section>
        <motion.div {...fadeUp()} className="bg-card rounded-3xl border border-border/30 p-8 md:p-10 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-soft/15 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-7 h-7 text-rose-soft" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Need Immediate Support?</h2>
            <p className="text-muted-foreground">You're not alone. Professional help is available 24/7.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {crisisLines.map((line) => (
              <div key={line.country} className="bg-muted/30 rounded-2xl p-4 text-center border border-border/20">
                <p className="text-sm font-semibold text-foreground mb-1">{line.country}</p>
                <p className="text-xs text-muted-foreground mb-2">{line.name}</p>
                <p className="font-mono text-lg font-bold text-primary">{line.number}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ━━━ FAQ ━━━ */}
      <Section id="faq" className="bg-muted/30">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Common Questions</h2>
        </motion.div>
        <div className="max-w-2xl mx-auto space-y-3">
          {[
            { q: 'Is MindEase really free?', a: 'Yes! All core features are completely free. We believe mental wellness should be accessible to everyone.' },
            { q: 'Is my data private and secure?', a: 'Absolutely. All data stays on your device by default. We use end-to-end encryption and never sell your data.' },
            { q: 'Can the AI replace a real therapist?', a: 'No. MindEase is a wellness companion, not a replacement for professional therapy. We encourage seeking professional help when needed.' },
            { q: 'What languages does SERA support?', a: 'SERA supports 90+ languages including English, Hindi, Spanish, French, Arabic, Japanese, and many more.' },
          ].map((faq) => (
            <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </Section>

      {/* ━━━ FINAL CTA ━━━ */}
      <Section>
        <motion.div
          {...fadeUp()}
          className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
          style={{ background: 'linear-gradient(135deg, hsl(239 84% 74% / 0.08), hsl(160 84% 67% / 0.08))' }}
        >
          <HeroBlob className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl" />
          <HeroBlob className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-accent/10 blur-3xl" delay={3} />

          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Start Your Mental Wellness Journey{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Today</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join thousands of students building healthier minds with AI-powered support.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px hsl(239 84% 74% / 0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="btn-primary text-base px-10 py-4 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> Start Free Chat
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="btn-secondary text-base px-10 py-4"
              >
                Create Account
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-border/30 py-10 px-5 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-foreground">MindEase AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MindEase Collective. Built with 💜 for student wellness.
          </p>
        </div>
      </footer>
    </div>
  );
}
