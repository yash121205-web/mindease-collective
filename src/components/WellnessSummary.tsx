import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Share2, Download, Heart, Sparkles, Flame, BookOpen, Smile, Wind, Timer, Copy } from 'lucide-react';
import { getMoods, getJournalEntries, getSessions, calculateStreak, calculateEHS, MOOD_MAP, getHabits } from '@/lib/storage';
import { toast } from 'sonner';

export default function WellnessSummary({ onClose }: { onClose: () => void }) {
  const streak = calculateStreak();
  const ehs = calculateEHS();
  const moods = getMoods();
  const journal = getJournalEntries();
  const sessions = getSessions();
  const habits = getHabits();

  // Last 7 days
  const weekMoods = moods.filter(m => Date.now() - m.timestamp < 7 * 86400000);
  const avgScore = weekMoods.length > 0 ? Math.round(weekMoods.reduce((s, m) => s + m.moodScore, 0) / weekMoods.length) : 0;
  const weekJournals = journal.filter(j => Date.now() - j.timestamp < 7 * 86400000);

  // Gratitude count
  let gratitudeCount = 0;
  try {
    const notes = JSON.parse(localStorage.getItem('mindease_gratitude_wall') || '[]');
    gratitudeCount = notes.filter((n: any) => {
      const d = new Date(n.date || '');
      return !isNaN(d.getTime()) && Date.now() - d.getTime() < 7 * 86400000;
    }).length;
  } catch {}

  // Meditation sessions
  const meditationCount = parseInt(localStorage.getItem('mindease_meditation_sessions') || '0');

  // Favorite affirmations
  let affirmationCount = 0;
  try {
    affirmationCount = JSON.parse(localStorage.getItem('mindease_fav_affirmations') || '[]').length;
  } catch {}

  // Dominant mood
  const moodCounts: Record<string, number> = {};
  weekMoods.forEach(m => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'okay';

  // Habit completion this week
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

  return (
    <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-secondary/5 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Weekly Wellness Report</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground font-body mb-6">
          {new Date(Date.now() - 6 * 86400000).toLocaleDateString([], { month: 'short', day: 'numeric' })} — {new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>

        {/* EHS Circle */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - ehs / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold font-number ${ehsColor}`}>{ehs}</span>
            </div>
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-foreground">Emotional Health</p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              {ehs >= 70 ? 'You\'re thriving! Keep it up 🌟' : ehs >= 40 ? 'You\'re doing okay. Room to grow 💙' : 'Be gentle with yourself this week 🫂'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Streak', value: `${streak}d`, icon: Flame, emoji: '🔥' },
            { label: 'Avg Mood', value: `${avgScore}`, icon: Smile, emoji: MOOD_MAP[dominantMood]?.emoji || '😊' },
            { label: 'Journals', value: weekJournals.length, icon: BookOpen, emoji: '📓' },
            { label: 'Meditation', value: meditationCount, icon: Timer, emoji: '🧘' },
            { label: 'Gratitude', value: gratitudeCount, icon: Heart, emoji: '🌸' },
            { label: 'Habits', value: `${habitPct}%`, icon: Wind, emoji: '✅' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
              className="rounded-xl bg-muted/30 p-3 text-center">
              <span className="text-lg block">{s.emoji}</span>
              <p className="font-number text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-body">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Mood Trend */}
        {weekMoods.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 font-body">Mood Trend</p>
            <div className="flex items-end gap-1 h-12">
              {weekMoods.slice(-7).map((m, i) => (
                <motion.div key={i} className="flex-1 rounded-t-md"
                  style={{ background: m.moodScore >= 75 ? 'hsl(var(--secondary))' : m.moodScore >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--rose-soft))' }}
                  initial={{ height: 0 }} animate={{ height: `${Math.max(m.moodScore, 10)}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Share Actions */}
        <div className="flex gap-3">
          <button onClick={handleShare} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
            <Share2 className="w-4 h-4" /> Share Report
          </button>
          <button onClick={() => { navigator.clipboard.writeText(shareText); toast.success('Copied!'); }}
            className="btn-secondary flex items-center justify-center gap-2 text-sm px-4">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
