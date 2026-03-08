import { motion } from 'framer-motion';
import { X, Share2, Heart, Sparkles, Flame, BookOpen, Smile, Wind, Timer, Copy } from 'lucide-react';
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

  const shareText = `🧘 My Weekly Wellness Report — MindEase AI\n\n` +
    `💙 EHS: ${ehs}/100\n` +
    `🔥 Streak: ${streak} days\n` +
    `😊 Avg mood: ${avgScore}/100 (${MOOD_MAP[dominantMood]?.label})\n` +
    `📓 ${weekJournals.length} journal entries\n` +
    `🧘 ${meditationCount} meditation sessions\n` +
    `🌸 ${gratitudeCount} gratitude notes\n` +
    `✅ ${habitPct}% habits completed\n\n` +
    `#MindEaseAI #MentalWellness`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ text: shareText, title: 'Weekly Wellness Report' });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Report copied to clipboard!');
    }
  };

  const ehsColor = ehs >= 70 ? 'text-secondary' : ehs >= 40 ? 'text-primary' : 'text-rose-soft';
  const ehsStroke = ehs >= 70 ? 'hsl(var(--secondary))' : ehs >= 40 ? 'hsl(var(--primary))' : 'hsl(var(--rose-soft))';

  const stats = [
    { label: 'Streak', value: `${streak}d`, emoji: '🔥', icon: Flame },
    { label: 'Avg Mood', value: `${avgScore}`, emoji: MOOD_MAP[dominantMood]?.emoji || '😊', icon: Smile },
    { label: 'Journals', value: weekJournals.length, emoji: '📓', icon: BookOpen },
    { label: 'Meditation', value: meditationCount, emoji: '🧘', icon: Timer },
    { label: 'Gratitude', value: gratitudeCount, emoji: '🌸', icon: Heart },
    { label: 'Habits', value: `${habitPct}%`, emoji: '✅', icon: Wind },
  ];

  return (
    <div className="relative bg-card/95 backdrop-blur-xl border border-border/40 rounded-3xl overflow-hidden shadow-xl">
      {/* Top gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-mint" />
      
      {/* Decorative blobs */}
      <div className="absolute top-12 -right-12 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-secondary/5 blur-3xl" />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 border border-primary/10 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Weekly Wellness</h2>
              <p className="text-[11px] text-muted-foreground font-body -mt-0.5">
                {new Date(Date.now() - 6 * 86400000).toLocaleDateString([], { month: 'short', day: 'numeric' })} — {new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* EHS Score Hero */}
        <div className="flex items-center gap-5 my-6 p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
              <motion.circle cx="50" cy="50" r="42" fill="none" stroke={ehsStroke} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - ehs / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-bold font-number ${ehsColor}`}>{ehs}</span>
            </div>
          </div>
          <div>
            <p className="font-display text-base font-semibold text-foreground">Emotional Health Score</p>
            <p className="text-xs text-muted-foreground font-body mt-1 leading-relaxed">
              {ehs >= 70 ? 'You\'re thriving! Keep it up 🌟' : ehs >= 40 ? 'You\'re doing okay. Room to grow 💙' : 'Be gentle with yourself this week 🫂'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-xl bg-muted/25 border border-border/20 p-3 text-center hover:bg-muted/40 transition-colors"
            >
              <span className="text-lg block mb-0.5">{s.emoji}</span>
              <p className="font-number text-lg font-bold text-foreground leading-tight">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-body mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Mood Trend */}
        {weekMoods.length > 0 && (
          <div className="mb-5 p-3 rounded-xl bg-muted/15 border border-border/20">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-body">Mood Trend</p>
            <div className="flex items-end gap-1.5 h-14">
              {weekMoods.slice(-7).map((m, i) => (
                <motion.div key={i} className="flex-1 rounded-md"
                  style={{ background: m.moodScore >= 75 ? 'hsl(var(--secondary))' : m.moodScore >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--rose-soft))' }}
                  initial={{ height: 0 }} animate={{ height: `${Math.max(m.moodScore, 12)}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2.5">
          <button onClick={handleShare} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
            <Share2 className="w-4 h-4" /> Share Report
          </button>
          <button onClick={() => { navigator.clipboard.writeText(shareText); toast.success('Copied!'); }}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
