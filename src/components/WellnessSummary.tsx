import { motion } from 'framer-motion';
import { X, Share2, Heart, Sparkles, Flame, BookOpen, Smile, Wind, Timer, Copy, TrendingUp } from 'lucide-react';
import { getMoods, getJournalEntries, getSessions, calculateStreak, calculateEHS, MOOD_MAP, getHabits } from '@/lib/storage';
import { toast } from 'sonner';

export default function WellnessSummary({ onClose }: { onClose: () => void }) {
  const streak = calculateStreak();
  const ehs = calculateEHS();
  const moods = getMoods();
  const journal = getJournalEntries();
  const habits = getHabits();

  const weekMoods = moods.filter(m => Date.now() - m.timestamp < 7 * 86400000);
  const avgScore = weekMoods.length > 0 ? Math.round(weekMoods.reduce((s, m) => s + m.moodScore, 0) / weekMoods.length) : 0;
  const weekJournals = journal.filter(j => Date.now() - j.timestamp < 7 * 86400000);

  let gratitudeCount = 0;
  try {
    const notes = JSON.parse(localStorage.getItem('mindease_gratitude_wall') || '[]');
    gratitudeCount = notes.filter((n: any) => {
      const d = new Date(n.date || '');
      return !isNaN(d.getTime()) && Date.now() - d.getTime() < 7 * 86400000;
    }).length;
  } catch {}

  const meditationCount = parseInt(localStorage.getItem('mindease_meditation_sessions') || '0');

  const moodCounts: Record<string, number> = {};
  weekMoods.forEach(m => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'okay';

  const weekDays: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekDays.push(d.toISOString().split('T')[0]);
  }
  const totalHabitChecks = weekDays.reduce((sum, d) => {
    const h = habits[d];
    return sum + (h ? Object.values(h).filter(Boolean).length : 0);
  }, 0);
  const habitPct = Math.round((totalHabitChecks / (7 * 7)) * 100);

  const shareText = `🧘 My Weekly Wellness Report — MindEase AI\n\n💙 EHS: ${ehs}/100\n🔥 Streak: ${streak} days\n😊 Avg mood: ${avgScore}/100 (${MOOD_MAP[dominantMood]?.label})\n📓 ${weekJournals.length} journal entries\n🧘 ${meditationCount} meditation sessions\n🌸 ${gratitudeCount} gratitude notes\n✅ ${habitPct}% habits completed\n\n#MindEaseAI #MentalWellness`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ text: shareText, title: 'Weekly Wellness Report' });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Report copied to clipboard!');
    }
  };

  const ehsColor = ehs >= 70 ? 'text-accent' : ehs >= 40 ? 'text-primary' : 'text-rose-soft';
  const ehsStroke = ehs >= 70 ? 'hsl(var(--accent))' : ehs >= 40 ? 'hsl(var(--primary))' : 'hsl(var(--rose-soft))';
  const ehsBg = ehs >= 70 ? 'from-accent/10 to-accent/5' : ehs >= 40 ? 'from-primary/10 to-primary/5' : 'from-rose-soft/15 to-rose-soft/5';

  const stats = [
    { label: 'Streak', value: `${streak}d`, emoji: '🔥' },
    { label: 'Avg Mood', value: `${avgScore}`, emoji: MOOD_MAP[dominantMood]?.emoji || '😊' },
    { label: 'Journals', value: weekJournals.length, emoji: '📓' },
    { label: 'Meditation', value: meditationCount, emoji: '🧘' },
    { label: 'Gratitude', value: gratitudeCount, emoji: '🌸' },
    { label: 'Habits', value: `${habitPct}%`, emoji: '✅' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative bg-card/98 backdrop-blur-2xl border border-border/30 rounded-[1.75rem] overflow-hidden shadow-2xl shadow-foreground/5"
    >
      {/* Top gradient accent with shimmer */}
      <div className="relative h-1.5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary" />
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      </div>

      {/* Subtle decorative blobs */}
      <div className="absolute top-16 -right-16 w-48 h-48 rounded-full bg-primary/4 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-accent/4 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <motion.div
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/12 to-secondary/8 border border-primary/10 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground">Weekly Wellness</h2>
              <p className="text-[11px] text-muted-foreground font-body -mt-0.5">
                {new Date(Date.now() - 6 * 86400000).toLocaleDateString([], { month: 'short', day: 'numeric' })} — {new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </motion.div>
          <button onClick={onClose}
            className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* EHS Score */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className={`flex items-center gap-5 my-6 p-5 rounded-2xl bg-gradient-to-br ${ehsBg} border border-border/20`}
        >
          <div className="relative w-[84px] h-[84px] shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted) / 0.5)" strokeWidth="6" />
              <motion.circle cx="50" cy="50" r="42" fill="none" stroke={ehsStroke} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - ehs / 100) }}
                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                className={`text-2xl font-bold font-number ${ehsColor}`}
              >
                {ehs}
              </motion.span>
              <span className="text-[9px] text-muted-foreground font-body -mt-0.5">/ 100</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-display text-base text-foreground">Emotional Health</p>
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              {ehs >= 70 ? 'You\'re thriving! Keep it up 🌟' : ehs >= 40 ? 'You\'re doing okay. Room to grow 💙' : 'Be gentle with yourself this week 🫂'}
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.06, type: 'spring', stiffness: 200, damping: 18 }}
              className="rounded-2xl bg-muted/20 border border-border/15 p-3.5 text-center hover:bg-muted/35 hover:border-border/30 transition-all duration-200 cursor-default"
            >
              <span className="text-xl block mb-1">{s.emoji}</span>
              <p className="font-number text-lg font-bold text-foreground leading-tight">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-body mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Mood Trend */}
        {weekMoods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-5 p-4 rounded-2xl bg-muted/12 border border-border/15"
          >
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 font-body">Mood Trend</p>
            <div className="flex items-end gap-2 h-16">
              {weekMoods.slice(-7).map((m, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-lg"
                  style={{
                    background: m.moodScore >= 75 ? 'hsl(var(--accent))' : m.moodScore >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--rose-soft))',
                  }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${Math.max(m.moodScore, 15)}%`, opacity: 1 }}
                  transition={{ delay: 0.55 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-2.5"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-3 rounded-2xl shadow-lg shadow-primary/20"
          >
            <Share2 className="w-4 h-4" /> Share Report
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { navigator.clipboard.writeText(shareText); toast.success('Copied!'); }}
            className="p-3 rounded-2xl border border-border/40 bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
