import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowRight, BookOpen, Smile, Wind, Sparkles, Copy } from 'lucide-react';
import { getTodayMood, saveMood, calculateEHS, getUser, saveUser, genId, MOOD_MAP } from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { toast } from 'sonner';

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

const gradients = [
  'from-primary/10 to-mint/10',
  'from-mint/10 to-primary/10',
  'from-rose-soft/10 to-primary/10',
  'from-primary/10 to-secondary/10',
  'from-secondary/10 to-mint/10',
  'from-primary/15 to-rose-soft/5',
  'from-mint/15 to-primary/5',
];

export default function Landing() {
  const navigate = useNavigate();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [ehs, setEhs] = useState(0);
  const [affirmation, setAffirmation] = useState('');
  const [loadingAff, setLoadingAff] = useState(false);
  const user = getUser();
  const todayMood = getTodayMood();

  const dayOfWeek = new Date().getDay();
  const gradientClass = gradients[dayOfWeek];

  useEffect(() => {
    setEhs(calculateEHS());
    const today = new Date().toISOString().split('T')[0];
    if (!todayMood && user.lastCheckIn !== today) {
      setTimeout(() => setShowCheckIn(true), 800);
    }
    // Load daily affirmation
    const stored = localStorage.getItem('mindease_daily_affirmation');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        setAffirmation(parsed.text);
        return;
      }
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
    saveMood({
      id: genId(),
      date: new Date().toISOString().split('T')[0],
      mood: mood.key,
      moodScore: MOOD_MAP[mood.key].score,
      note: '',
      factors: [],
      timestamp: Date.now(),
    });
    const u = getUser();
    u.lastCheckIn = new Date().toISOString().split('T')[0];
    saveUser(u);
    setEhs(calculateEHS());
    setTimeout(() => {
      setShowCheckIn(false);
      navigate('/app/chat');
    }, 2500);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const ehsColor = ehs >= 70 ? 'text-secondary' : ehs >= 40 ? 'text-primary' : 'text-rose-soft';

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Check-in Modal */}
      <AnimatePresence>
        {showCheckIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-3xl p-8 max-w-md w-full text-center"
            >
              {!selectedMood ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl text-foreground mb-1 font-semibold">
                    {greeting()}{user.name ? `, ${user.name}` : ''}.
                  </h2>
                  <p className="text-muted-foreground font-body mb-6">How are you feeling today?</p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {moods.map((mood, i) => (
                      <motion.button
                        key={mood.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => handleMoodSelect(mood)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-muted/50 transition-all hover:scale-110"
                      >
                        <span className="text-3xl">{mood.emoji}</span>
                        <span className="text-xs font-medium text-muted-foreground font-body">{mood.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <span className="text-5xl mb-4 block">{moods.find(m => m.key === selectedMood)?.emoji}</span>
                  <p className="text-foreground font-medium text-lg font-body">{message}</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main landing content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-2 font-semibold">
          {greeting()}{user.name ? `, ${user.name}` : ''} 👋
        </h1>
        <p className="text-muted-foreground text-lg mb-8 font-body">Your calm in the chaos</p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* EHS Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-static rounded-3xl p-6 md:col-span-2 lg:col-span-1 flex flex-col items-center justify-center"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Emotional Health Score</p>
          <div className="relative w-32 h-32 mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - ehs / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold font-number ${ehsColor}`}>{ehs}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-body">out of 100</p>
        </motion.div>

        {/* Affirmation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`glass-static rounded-3xl p-6 flex flex-col justify-between bg-gradient-to-br ${gradientClass}`}
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Today's Affirmation</p>
          <p className="font-display text-xl text-foreground italic leading-relaxed font-semibold">"{affirmation}"</p>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={() => { navigator.clipboard.writeText(affirmation); toast.success('Copied!'); }} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button onClick={generateAffirmation} disabled={loadingAff} className="text-xs text-primary font-body font-medium hover:underline disabled:opacity-40">
              {loadingAff ? '...' : 'Generate new'}
            </button>
          </div>
        </motion.div>

        {/* Today's Mood / Check-in Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-static rounded-3xl p-6"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">How are you feeling?</p>
          {todayMood || selectedMood ? (
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{MOOD_MAP[todayMood?.mood || selectedMood || 'okay']?.emoji}</span>
                <div>
                  <p className="font-semibold text-foreground font-body">{MOOD_MAP[todayMood?.mood || selectedMood || 'okay']?.label}</p>
                  <p className="text-xs text-muted-foreground font-body">You checked in today 😊</p>
                </div>
              </div>
              <button onClick={() => setShowCheckIn(true)} className="mt-3 text-xs text-primary font-body hover:underline">
                Update mood
              </button>
            </div>
          ) : (
            <div className="flex justify-center gap-2 flex-wrap">
              {moods.map(mood => (
                <button
                  key={mood.key}
                  onClick={() => { setShowCheckIn(true); }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted/50 transition-all hover:scale-110"
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-[10px] text-muted-foreground font-body">{mood.label}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        {[
          { label: 'Talk to SERA', desc: 'AI companion', icon: Leaf, path: '/app/chat', color: 'bg-primary/10 text-primary' },
          { label: 'Write in Journal', desc: 'Reflect & grow', icon: BookOpen, path: '/app/journal', color: 'bg-secondary/30 text-foreground' },
          { label: 'Breathing Exercise', desc: 'Find your calm', icon: Wind, path: '/app/wellness', color: 'bg-rose-soft/20 text-foreground' },
        ].map((item, i) => (
          <motion.button
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            onClick={() => navigate(item.path)}
            className="glass-static rounded-3xl p-5 text-left group"
          >
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-foreground font-body">{item.label}</p>
            <p className="text-xs text-muted-foreground font-body">{item.desc}</p>
            <ArrowRight className="w-4 h-4 text-muted-foreground mt-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
