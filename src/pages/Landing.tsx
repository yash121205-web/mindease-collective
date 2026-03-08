import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowRight, BookOpen, Smile, Wind, Sparkles, Copy, Star, BarChart3, TrendingUp } from 'lucide-react';
import { getTodayMood, saveMood, calculateEHS, getUser, saveUser, genId, MOOD_MAP, getMoods, getJournalEntries, getSessions, calculateStreak } from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { toast } from 'sonner';
import WellnessSummary from '@/components/WellnessSummary';
import OnboardingTour from '@/components/OnboardingTour';

const moods = [
  { key: 'great', emoji: '😄', label: 'Great', message: "That's amazing! Keep riding that positive wave. 🌟" },
  { key: 'good', emoji: '🙂', label: 'Good', message: "Glad to hear it! Small joys matter. ☀️" },
  { key: 'okay', emoji: '😐', label: 'Okay', message: "Neutral days are part of the journey. You're doing fine. 💙" },
  { key: 'low', emoji: '😔', label: 'Low', message: "I'm sorry you're feeling low. Be gentle with yourself today. 🫂" },
  { key: 'overwhelmed', emoji: '😰', label: 'Overwhelmed', message: "It's okay to feel overwhelmed. Let's take it one step at a time. 💙" },
];

const defaultAffirmations = [
  "You are doing better than you think.",
  "Your feelings are valid, and so are you.",
  "Progress, not perfection, is what matters.",
  "You deserve rest just as much as you deserve success.",
  "Every breath is a fresh start.",
  "You are resilient, even when it doesn't feel like it.",
  "Your struggles are shaping your strength.",
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } },
};

export default function Landing() {
  const navigate = useNavigate();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [ehs, setEhs] = useState(0);
  const [affirmation, setAffirmation] = useState('');
  const [loadingAff, setLoadingAff] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const user = getUser();
  const todayMood = getTodayMood();

  const streak = calculateStreak();
  const allMoods = getMoods();
  const journalCount = getJournalEntries().length;
  const sessions = getSessions();

  useEffect(() => {
    setEhs(calculateEHS());
    const today = new Date().toISOString().split('T')[0];
    const onboardingSeen = localStorage.getItem('mindease_onboarding_seen');
    if (!onboardingSeen) {
      setTimeout(() => setShowOnboarding(true), 500);
    } else if (!todayMood && user.lastCheckIn !== today) {
      setTimeout(() => setShowCheckIn(true), 800);
    }
    const stored = localStorage.getItem('mindease_daily_affirmation');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) { setAffirmation(parsed.text); return; }
    }
    setAffirmation(defaultAffirmations[new Date().getDate() % defaultAffirmations.length]);
  }, []);

  const generateAffirmation = async () => {
    setLoadingAff(true);
    const mood = todayMood?.mood || selectedMood || 'okay';
    try {
      const r = await callAI(`Generate one powerful, specific affirmation for a student who is feeling ${mood}. Make it feel personal and genuine, not generic. 1-2 sentences max. No hashtags or emojis.`);
      setAffirmation(r);
      localStorage.setItem('mindease_daily_affirmation', JSON.stringify({ date: new Date().toISOString().split('T')[0], text: r }));
    } catch {
      setAffirmation("You are capable of amazing things, even on your hardest days.");
    }
    setLoadingAff(false);
  };

  const handleMoodSelect = (mood: typeof moods[0]) => {
    setSelectedMood(mood.key);
    setMessage(mood.message);
    saveMood({ id: genId(), date: new Date().toISOString().split('T')[0], mood: mood.key, moodScore: MOOD_MAP[mood.key].score, note: '', factors: [], timestamp: Date.now() });
    const u = getUser(); u.lastCheckIn = new Date().toISOString().split('T')[0]; saveUser(u);
    setEhs(calculateEHS());
    setTimeout(() => setShowCheckIn(false), 2500);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const ehsColor = ehs >= 70 ? 'text-secondary' : ehs >= 40 ? 'text-primary' : 'text-rose-soft';
  const ehsGradient = ehs >= 70 ? 'from-secondary to-mint' : ehs >= 40 ? 'from-primary to-sky-soft' : 'from-rose-soft to-warm-peach';

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* Onboarding Tour */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingTour onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem('mindease_onboarding_seen', 'true');
            const today = new Date().toISOString().split('T')[0];
            if (!todayMood && user.lastCheckIn !== today) setTimeout(() => setShowCheckIn(true), 500);
          }} />
        )}
      </AnimatePresence>

      {/* Check-in Modal */}
      <AnimatePresence>
        {showCheckIn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-3xl p-8 max-w-md w-full text-center">
              {!selectedMood ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-5">
                    <Leaf className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl text-foreground mb-1 font-bold">{greeting()}{user.name ? `, ${user.name}` : ''}.</h2>
                  <p className="text-muted-foreground font-body mb-6">How are you feeling today?</p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {moods.map((mood, i) => (
                      <motion.button key={mood.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        onClick={() => handleMoodSelect(mood)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-muted/50 transition-all hover:scale-110">
                        <span className="text-3xl">{mood.emoji}</span>
                        <span className="text-xs font-medium text-muted-foreground">{mood.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <span className="text-5xl mb-4 block">{moods.find(m => m.key === selectedMood)?.emoji}</span>
                  <p className="font-display text-foreground font-semibold text-lg italic">{message}</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wellness Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-md overflow-y-auto"
            onClick={() => setShowSummary(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg my-8" onClick={e => e.stopPropagation()}>
              <WellnessSummary onClose={() => setShowSummary(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Hero Section ─── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
        className="relative rounded-b-[2.5rem] overflow-hidden px-6 pt-8 pb-10 lg:px-10 lg:pt-12 lg:pb-14 mb-8"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--secondary) / 0.12) 40%, hsl(var(--mint) / 0.08) 100%)',
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-mint/8 blur-2xl" />

        <motion.div {...stagger.container} initial="initial" animate="animate" className="relative z-10">
          <motion.div variants={stagger.item}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/12 text-primary border border-primary/15 mb-4">
              <Sparkles className="w-3 h-3" /> Your wellness companion
            </span>
          </motion.div>
          <motion.h1 variants={stagger.item} className="font-display text-4xl lg:text-5xl text-foreground font-bold leading-tight mb-2">
            {greeting()}{user.name ? `, ${user.name}` : ''} <span className="inline-block animate-float">👋</span>
          </motion.h1>
          <motion.p variants={stagger.item} className="text-muted-foreground text-lg lg:text-xl max-w-md italic font-display">
            Your calm in the chaos
          </motion.p>

          {/* Quick Stats */}
          <motion.div variants={stagger.item} className="flex gap-3 mt-6 flex-wrap">
            {[
              { label: 'Streak', value: `${streak}d`, icon: '🔥' },
              { label: 'Moods', value: allMoods.length, icon: '😊' },
              { label: 'Journals', value: journalCount, icon: '📓' },
              { label: 'Sessions', value: sessions.breathing + sessions.pomodoro, icon: '🧘' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-background/70 backdrop-blur-sm border border-border/40 shadow-sm">
                <span className="text-lg">{s.icon}</span>
                <div>
                  <p className="font-number text-sm font-bold text-foreground leading-tight">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
            <button onClick={() => setShowSummary(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 transition-colors shadow-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Weekly Report</span>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ─── Main Dashboard Grid ─── */}
      <div className="px-4 lg:px-0">
        <motion.div {...stagger.container} initial="initial" animate="animate" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {/* EHS Card — with gradient ring */}
          <motion.div variants={stagger.item} className="glass-static rounded-3xl p-6 md:col-span-2 lg:col-span-1 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/6 blur-2xl" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 font-display">Emotional Health Score</p>
            <div className="relative w-36 h-36 mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted) / 0.5)" strokeWidth="7" />
                <defs>
                  <linearGradient id="ehs-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </linearGradient>
                </defs>
                <motion.circle cx="50" cy="50" r="42" fill="none" stroke="url(#ehs-gradient)" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - ehs / 100) }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold font-number ${ehsColor}`}>{ehs}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">out of 100</span>
              </div>
            </div>
            <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${ehsGradient} opacity-60`} />
          </motion.div>

          {/* Affirmation Card — dramatic quote style */}
          <motion.div variants={stagger.item} className="rounded-3xl p-7 flex flex-col justify-between relative overflow-hidden border border-border/30"
            style={{ background: 'linear-gradient(160deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--warm-lavender) / 0.1) 50%, hsl(var(--secondary) / 0.06) 100%)' }}>
            <div className="absolute top-4 left-6 text-7xl leading-none text-primary/10 font-display select-none">"</div>
            <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-secondary/8 blur-2xl" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 font-display relative z-10">Today's Affirmation</p>
            <p className="font-display text-xl lg:text-2xl text-foreground italic leading-relaxed font-semibold tracking-wide relative z-10 pl-2">
              {affirmation}
            </p>
            <div className="flex items-center gap-3 mt-5 relative z-10">
              <button onClick={() => { navigator.clipboard.writeText(affirmation); toast.success('Copied!'); }}
                className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={generateAffirmation} disabled={loadingAff}
                className="text-sm text-primary font-medium hover:underline disabled:opacity-40 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {loadingAff ? 'Generating...' : 'New affirmation'}
              </button>
            </div>
          </motion.div>

          {/* Mood Check-in Card */}
          <motion.div variants={stagger.item} className="glass-static rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-rose-soft/10 blur-2xl" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 font-display relative z-10">How are you feeling?</p>
            {todayMood || selectedMood ? (
              <div className="relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <span className="text-3xl">{MOOD_MAP[todayMood?.mood || selectedMood || 'okay']?.emoji}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{MOOD_MAP[todayMood?.mood || selectedMood || 'okay']?.label}</p>
                    <p className="text-xs text-muted-foreground">You checked in today 😊</p>
                  </div>
                </div>
                <button onClick={() => setShowCheckIn(true)} className="mt-4 text-sm text-primary font-medium hover:underline flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5" /> Update mood
                </button>
              </div>
            ) : (
              <div className="flex justify-center gap-2.5 flex-wrap relative z-10">
                {moods.map(mood => (
                  <button key={mood.key} onClick={() => setShowCheckIn(true)}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-muted/50 transition-all hover:scale-110">
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-[10px] text-muted-foreground">{mood.label}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Primary Action Cards — larger, bolder */}
          {[
            { label: 'Talk to SERA', desc: 'Your AI wellness companion', icon: Leaf, path: '/app/chat', gradient: 'from-primary/12 to-sky-soft/8', iconBg: 'bg-primary/15 text-primary' },
            { label: 'Write in Journal', desc: 'Reflect, release & grow', icon: BookOpen, path: '/app/journal', gradient: 'from-secondary/10 to-warm-lavender/8', iconBg: 'bg-secondary/15 text-secondary' },
            { label: 'Breathing Exercise', desc: 'Find your inner calm', icon: Wind, path: '/app/wellness', gradient: 'from-mint/10 to-primary/6', iconBg: 'bg-mint/15 text-foreground' },
          ].map((item) => (
            <motion.button
              key={item.path} variants={stagger.item}
              onClick={() => navigate(item.path)}
              className={`rounded-3xl p-6 text-left group relative overflow-hidden border border-border/30 bg-gradient-to-br ${item.gradient} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />
              <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center mb-4`}>
                <item.icon className="w-6 h-6" />
              </div>
              <p className="font-display font-bold text-foreground text-lg">{item.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              <div className="flex items-center gap-1.5 mt-3 text-primary text-sm font-medium">
                <span>Open</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* ─── Explore Features ─── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="mt-10">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-primary fill-primary/30" />
            </div>
            <h2 className="font-display text-2xl text-foreground font-bold">Explore Features</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: 'Guided Meditation', desc: 'Breathe, focus, find peace', path: '/app/meditation', emoji: '🧘', gradient: 'from-primary/10 via-sky-soft/8 to-primary/4' },
              { label: 'Gratitude Wall', desc: 'Grow your garden of joy', path: '/app/gratitude', emoji: '🌸', gradient: 'from-secondary/10 via-rose-soft/8 to-secondary/4' },
              { label: 'Daily Challenges', desc: 'Streak-based wellness quests', path: '/app/challenges', emoji: '🎯', gradient: 'from-rose-soft/10 via-warm-peach/8 to-rose-soft/4' },
              { label: 'Mood Soundscapes', desc: 'Ambient sounds for calm', path: '/app/soundscapes', emoji: '🎧', gradient: 'from-mint/10 via-primary/6 to-mint/4' },
              { label: 'Affirmations', desc: 'Nurture your inner world', path: '/app/affirmations', emoji: '✨', gradient: 'from-warm-lavender/10 via-secondary/6 to-warm-lavender/4' },
            ].map((feat) => (
              <motion.button
                key={feat.path}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(feat.path)}
                className={`rounded-2xl p-5 text-left bg-gradient-to-br ${feat.gradient} border border-border/40 group relative overflow-hidden`}
              >
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-foreground/[0.02] blur-xl" />
                <span className="text-3xl block mb-3">{feat.emoji}</span>
                <p className="font-display text-base font-bold text-foreground">{feat.label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feat.desc}</p>
                <ArrowRight className="w-4 h-4 text-primary mt-3 group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ─── Weekly Mood Chart ─── */}
        {allMoods.length > 2 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="mt-10 rounded-3xl p-6 relative overflow-hidden border border-border/30"
            style={{ background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--primary) / 0.03) 100%)' }}>
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground font-display">This Week's Mood</p>
              </div>
              <button onClick={() => navigate('/app/mood')} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                See all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-end gap-2.5 h-24">
              {allMoods.slice(-7).map((m, i) => {
                const height = `${Math.max(m.moodScore, 12)}%`;
                const isHigh = m.moodScore >= 75;
                const isMid = m.moodScore >= 50;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full rounded-xl"
                      style={{
                        background: isHigh
                          ? 'linear-gradient(180deg, hsl(var(--secondary)), hsl(var(--mint)))'
                          : isMid
                          ? 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--sky-soft)))'
                          : 'linear-gradient(180deg, hsl(var(--rose-soft)), hsl(var(--warm-peach)))',
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground font-number">
                      {new Date(m.timestamp).toLocaleDateString([], { weekday: 'narrow' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
