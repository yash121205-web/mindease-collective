import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Flame, Trophy, Gift, RefreshCw, Sparkles, Lock, Star } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

// ─── Challenge Data ───
interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'mindfulness' | 'gratitude' | 'social' | 'movement' | 'creativity' | 'self-care';
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
  xp: number;
}

const CHALLENGE_POOL: Challenge[] = [
  { id: 'c1', title: 'Morning Gratitude', description: 'Write down 3 things you are grateful for before checking your phone.', category: 'gratitude', difficulty: 'easy', emoji: '🌅', xp: 10 },
  { id: 'c2', title: '5-Minute Breathing', description: 'Do a 5-minute box breathing session (inhale 4s, hold 4s, exhale 4s, hold 4s).', category: 'mindfulness', difficulty: 'easy', emoji: '🫁', xp: 10 },
  { id: 'c3', title: 'Kind Message', description: 'Send a genuine, kind message to someone you haven\'t spoken to in a while.', category: 'social', difficulty: 'medium', emoji: '💌', xp: 20 },
  { id: 'c4', title: 'Mindful Walk', description: 'Take a 15-minute walk without your phone. Notice 5 things you can see, 4 you can touch, 3 you can hear.', category: 'movement', difficulty: 'medium', emoji: '🚶', xp: 20 },
  { id: 'c5', title: 'Digital Sunset', description: 'Put away all screens 1 hour before bed. Read, journal, or just sit quietly.', category: 'self-care', difficulty: 'hard', emoji: '🌙', xp: 30 },
  { id: 'c6', title: 'Body Scan', description: 'Do a 10-minute body scan meditation, noticing tension in each body part.', category: 'mindfulness', difficulty: 'medium', emoji: '🧘', xp: 20 },
  { id: 'c7', title: 'Joy List', description: 'Write a list of 10 small things that bring you joy. Pick one and do it today.', category: 'creativity', difficulty: 'easy', emoji: '📝', xp: 10 },
  { id: 'c8', title: 'Cold Water Splash', description: 'Splash cold water on your face and take 10 slow, deep breaths after.', category: 'self-care', difficulty: 'easy', emoji: '💧', xp: 10 },
  { id: 'c9', title: 'Compliment Chain', description: 'Give 3 genuine compliments to 3 different people today.', category: 'social', difficulty: 'medium', emoji: '🗣️', xp: 20 },
  { id: 'c10', title: 'Nature Connection', description: 'Spend 20 minutes outdoors. Touch a tree, feel the wind, ground yourself.', category: 'movement', difficulty: 'medium', emoji: '🌳', xp: 20 },
  { id: 'c11', title: 'Worry Dump', description: 'Set a timer for 10 minutes and write down every worry. Then close the notebook.', category: 'mindfulness', difficulty: 'easy', emoji: '📒', xp: 10 },
  { id: 'c12', title: 'Stretch Break', description: 'Do a full-body 10-minute stretch. Hold each stretch for 30 seconds.', category: 'movement', difficulty: 'easy', emoji: '🤸', xp: 10 },
  { id: 'c13', title: 'Gratitude Letter', description: 'Write a heartfelt letter of gratitude to someone important in your life.', category: 'gratitude', difficulty: 'hard', emoji: '✉️', xp: 30 },
  { id: 'c14', title: 'Positive Playlist', description: 'Create a playlist of songs that make you feel calm, empowered, or happy.', category: 'creativity', difficulty: 'easy', emoji: '🎵', xp: 10 },
  { id: 'c15', title: 'Forgiveness Practice', description: 'Think of someone you\'re holding a grudge against. Write them a letter (don\'t send it) and release the feeling.', category: 'mindfulness', difficulty: 'hard', emoji: '🕊️', xp: 30 },
  { id: 'c16', title: 'Dance It Out', description: 'Put on your favorite song and dance like nobody is watching for the full duration.', category: 'movement', difficulty: 'easy', emoji: '💃', xp: 10 },
  { id: 'c17', title: 'Future Letter', description: 'Write a letter to yourself 1 year from now. What do you hope to feel and achieve?', category: 'creativity', difficulty: 'medium', emoji: '🔮', xp: 20 },
  { id: 'c18', title: 'Media Fast', description: 'Avoid social media for the entire day. Replace it with reading or creating.', category: 'self-care', difficulty: 'hard', emoji: '📵', xp: 30 },
  { id: 'c19', title: 'Savoring Moment', description: 'During your next meal, eat slowly and mindfully. Notice every flavor and texture.', category: 'mindfulness', difficulty: 'easy', emoji: '🍵', xp: 10 },
  { id: 'c20', title: 'Affirmation Mirror', description: 'Look in the mirror and say 5 affirmations out loud. Mean every word.', category: 'self-care', difficulty: 'medium', emoji: '🪞', xp: 20 },
  { id: 'c21', title: 'Random Act of Kindness', description: 'Do something kind for a stranger today — hold a door, buy a coffee, smile warmly.', category: 'social', difficulty: 'medium', emoji: '🤝', xp: 20 },
];

interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requirement: number; // streak days needed
}

const BADGES: Badge[] = [
  { id: 'b1', name: 'First Step', emoji: '🌱', description: 'Complete your first challenge', requirement: 1 },
  { id: 'b2', name: '3-Day Spark', emoji: '⚡', description: '3-day challenge streak', requirement: 3 },
  { id: 'b3', name: 'Week Warrior', emoji: '🛡️', description: '7-day challenge streak', requirement: 7 },
  { id: 'b4', name: 'Fortnight Focus', emoji: '🎯', description: '14-day challenge streak', requirement: 14 },
  { id: 'b5', name: 'Monthly Master', emoji: '👑', description: '30-day challenge streak', requirement: 30 },
  { id: 'b6', name: 'Centurion', emoji: '💎', description: '100-day challenge streak', requirement: 100 },
];

const CATEGORY_COLORS: Record<string, string> = {
  mindfulness: 'bg-primary/10 text-primary',
  gratitude: 'bg-secondary/20 text-foreground',
  social: 'bg-rose-soft/15 text-foreground',
  movement: 'bg-mint/10 text-foreground',
  creativity: 'bg-warm-lavender/15 text-foreground',
  'self-care': 'bg-sky-soft/15 text-foreground',
};

const DIFFICULTY_XP = { easy: 10, medium: 20, hard: 30 };

// ─── Storage helpers ───
function getKey(base: string) {
  const userId = sessionStorage.getItem('mindease_user_id') || 'anonymous';
  return `mindease_${userId}_${base}`;
}

interface ChallengeState {
  date: string;
  challengeIds: string[];
  completed: string[];
  streak: number;
  totalXP: number;
  history: Record<string, { completed: string[]; xpEarned: number }>;
}

function getState(): ChallengeState {
  try {
    const raw = localStorage.getItem(getKey('challenges'));
    return raw ? JSON.parse(raw) : { date: '', challengeIds: [], completed: [], streak: 0, totalXP: 0, history: {} };
  } catch { return { date: '', challengeIds: [], completed: [], streak: 0, totalXP: 0, history: {} }; }
}

function saveState(s: ChallengeState) {
  localStorage.setItem(getKey('challenges'), JSON.stringify(s));
}

function getTodayChallenges(): { state: ChallengeState; challenges: Challenge[] } {
  const today = new Date().toISOString().split('T')[0];
  let state = getState();

  if (state.date !== today) {
    // Check streak continuity
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().split('T')[0];
    const hadYesterday = state.history[yKey]?.completed?.length > 0;

    // Save yesterday's progress if it was today
    if (state.date && state.challengeIds.length > 0) {
      state.history[state.date] = { completed: state.completed, xpEarned: state.completed.reduce((sum, id) => sum + (CHALLENGE_POOL.find(c => c.id === id)?.xp || 0), 0) };
    }

    // Pick 3 new challenges (mix of difficulties)
    const seed = hashDate(today);
    const shuffled = [...CHALLENGE_POOL].sort((a, b) => hashDate(a.id + today) - hashDate(b.id + today));
    const picked = [
      shuffled.find(c => c.difficulty === 'easy')!,
      shuffled.find(c => c.difficulty === 'medium' && c.id !== shuffled.find(x => x.difficulty === 'easy')?.id)!,
      shuffled.find(c => c.difficulty === 'hard' && !['easy', 'medium'].includes(c.difficulty) || c.difficulty === 'hard')!,
    ].filter(Boolean).slice(0, 3);

    // If streak broken
    const newStreak = hadYesterday || state.date === '' ? state.streak : 0;

    state = {
      ...state,
      date: today,
      challengeIds: picked.map(c => c.id),
      completed: [],
      streak: newStreak,
    };
    saveState(state);
  }

  const challenges = state.challengeIds.map(id => CHALLENGE_POOL.find(c => c.id === id)!).filter(Boolean);
  return { state, challenges };
}

function hashDate(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) { h = (h << 5) - h + input.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

// ─── Component ───
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function DailyChallenges() {
  const [data, setData] = useState(() => getTodayChallenges());
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState<Badge | null>(null);

  const { state, challenges } = data;
  const earnedBadges = BADGES.filter(b => state.streak >= b.requirement);
  const nextBadge = BADGES.find(b => state.streak < b.requirement);
  const allCompleted = challenges.length > 0 && challenges.every(c => state.completed.includes(c.id));

  const completeChallenge = (id: string) => {
    if (state.completed.includes(id)) return;
    const challenge = CHALLENGE_POOL.find(c => c.id === id);
    if (!challenge) return;

    const newCompleted = [...state.completed, id];
    const allDone = challenges.every(c => newCompleted.includes(c.id));
    const newStreak = allDone ? state.streak + 1 : state.streak;
    const newXP = state.totalXP + challenge.xp + (allDone ? 15 : 0); // Bonus XP for completing all

    const newState = { ...state, completed: newCompleted, streak: newStreak, totalXP: newXP };
    saveState(newState);
    setData({ state: newState, challenges });
    setJustCompleted(id);
    setTimeout(() => setJustCompleted(null), 1500);

    toast.success(`+${challenge.xp} XP earned!`, { description: challenge.title });

    if (allDone) {
      toast.success('🎉 All challenges complete! +15 bonus XP', { duration: 4000 });
      // Check for new badge unlock
      const newBadge = BADGES.find(b => b.requirement === newStreak && state.streak < newStreak);
      if (newBadge) {
        setTimeout(() => setShowBadgeUnlock(newBadge), 1000);
      }
    }
  };

  const streakProgress = nextBadge ? (state.streak / nextBadge.requirement) * 100 : 100;

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Badge Unlock Modal */}
      <AnimatePresence>
        {showBadgeUnlock && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-md"
            onClick={() => setShowBadgeUnlock(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="glass-strong rounded-3xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="text-6xl mb-4 block">{showBadgeUnlock.emoji}</motion.div>
              <h3 className="font-display text-2xl text-foreground font-semibold mb-1">Badge Unlocked!</h3>
              <p className="font-display text-lg text-primary font-semibold">{showBadgeUnlock.name}</p>
              <p className="text-sm text-muted-foreground font-body mt-2">{showBadgeUnlock.description}</p>
              <button onClick={() => setShowBadgeUnlock(null)}
                className="mt-6 px-6 py-2.5 rounded-2xl text-sm font-body font-medium text-primary-foreground"
                style={{ background: 'linear-gradient(135deg, hsl(207,90%,72%), hsl(260,60%,78%))' }}>
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div {...fadeUp(0.05)}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl text-foreground font-semibold">Daily Challenges</h1>
            <p className="text-sm text-muted-foreground font-body">Small steps, big change ✨</p>
          </div>
        </div>
      </motion.div>

      {/* Streak & XP Bar */}
      <motion.div {...fadeUp(0.12)} className="mt-6 glass-static rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-primary" />
              <span className="font-number text-lg font-bold text-foreground">{state.streak}</span>
              <span className="text-xs text-muted-foreground font-body">day streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="font-number text-lg font-bold text-foreground">{state.totalXP}</span>
              <span className="text-xs text-muted-foreground font-body">XP</span>
            </div>
          </div>
          {nextBadge && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground font-body">Next: {nextBadge.emoji} {nextBadge.name}</p>
              <p className="text-[10px] text-muted-foreground font-body">{nextBadge.requirement - state.streak} days to go</p>
            </div>
          )}
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, hsl(207,90%,72%), hsl(260,60%,78%))' }}
            initial={{ width: 0 }} animate={{ width: `${Math.min(streakProgress, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }} />
        </div>
      </motion.div>

      {/* Today's Challenges */}
      <motion.div {...fadeUp(0.2)} className="mt-6">
        <h2 className="font-display text-lg text-foreground font-semibold mb-3">Today's Challenges</h2>
        <div className="space-y-3">
          {challenges.map((c, i) => {
            const done = state.completed.includes(c.id);
            const justDone = justCompleted === c.id;
            return (
              <motion.div key={c.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
                className={`rounded-2xl p-4 border transition-all ${done ? 'bg-primary/5 border-primary/20' : 'glass-static border-border/50 hover:shadow-md'}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => completeChallenge(c.id)} disabled={done}
                    className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? '' : 'border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/5'}`}
                    style={done ? { background: 'linear-gradient(135deg, hsl(207,90%,72%), hsl(260,60%,78%))' } : {}}>
                    {done && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{c.emoji}</span>
                      <h3 className={`font-body font-semibold text-sm ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{c.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${CATEGORY_COLORS[c.category]}`}>{c.category}</span>
                    </div>
                    <p className={`text-xs font-body leading-relaxed ${done ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>{c.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] font-body font-medium px-1.5 py-0.5 rounded-md ${c.difficulty === 'hard' ? 'bg-rose-soft/15 text-foreground' : c.difficulty === 'medium' ? 'bg-primary/10 text-primary' : 'bg-secondary/15 text-foreground'}`}>
                        {c.difficulty}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-body flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5" /> +{c.xp} XP
                      </span>
                    </div>
                  </div>
                </div>
                <AnimatePresence>
                  {justDone && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 text-center">
                      <p className="text-xs font-body text-primary font-medium">✨ Well done! You're building a stronger you.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {allCompleted && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-4 rounded-2xl p-5 text-center border border-primary/20"
            style={{ background: 'linear-gradient(135deg, hsl(330 100% 85% / 0.1), hsl(197 88% 66% / 0.1))' }}>
            <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-display text-lg text-foreground font-semibold">All done for today! 🎉</h3>
            <p className="text-xs text-muted-foreground font-body mt-1">Come back tomorrow for new challenges. Your streak is growing!</p>
          </motion.div>
        )}
      </motion.div>

      {/* Badges */}
      <motion.div {...fadeUp(0.35)} className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-primary" />
          <h2 className="font-display text-lg text-foreground font-semibold">Badges</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BADGES.map(badge => {
            const earned = state.streak >= badge.requirement;
            return (
              <motion.div key={badge.id} whileHover={{ scale: 1.05 }}
                className={`rounded-2xl p-3 text-center border transition-all ${earned ? 'glass-static border-primary/20 shadow-md' : 'bg-muted/30 border-border/30 opacity-50'}`}>
                <span className="text-2xl block mb-1">{earned ? badge.emoji : '🔒'}</span>
                <p className="text-[10px] font-body font-medium text-foreground leading-tight">{badge.name}</p>
                <p className="text-[9px] text-muted-foreground font-body">{badge.requirement}d</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent History */}
      {Object.keys(state.history).length > 0 && (
        <motion.div {...fadeUp(0.45)} className="mt-8 mb-8">
          <h2 className="font-display text-lg text-foreground font-semibold mb-3">Recent Days</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(state.history).slice(-7).reverse().map(([date, day]) => (
              <div key={date} className="shrink-0 rounded-xl p-3 bg-muted/30 border border-border/30 min-w-[80px] text-center">
                <p className="text-[10px] font-body text-muted-foreground">{new Date(date + 'T12:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <p className="font-number text-sm font-bold text-foreground mt-1">{day.completed.length}/3</p>
                <p className="text-[10px] text-primary font-body">+{day.xpEarned} XP</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
