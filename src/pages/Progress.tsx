import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  getMoods, getJournalEntries, getSessions, getHabits, getTodayHabits, saveTodayHabits,
  calculateStreak, calculateEHS, MOOD_MAP, type HabitDay, getChatHistory
} from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { Flame, BookOpen, Smile, Wind, Timer, Sparkles, Award, Copy } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';

const habitList: { key: keyof HabitDay; label: string; emoji: string }[] = [
  { key: 'meditated', label: 'Meditated', emoji: '🧘' },
  { key: 'journaled', label: 'Journaled', emoji: '📓' },
  { key: 'water', label: 'Hydrated', emoji: '💧' },
  { key: 'exercise', label: 'Exercised', emoji: '🏃' },
  { key: 'sleep', label: 'Slept 7h+', emoji: '😴' },
  { key: 'screenFree', label: 'Screen break', emoji: '📵' },
  { key: 'gratitude', label: 'Gratitude', emoji: '🙏' },
];

const badgeDefs = [
  { id: 'first-entry', emoji: '📓', label: 'First Entry', desc: 'Journal 1 time', check: () => getJournalEntries().length >= 1 },
  { id: 'streak-3', emoji: '🔥', label: '3-Day Streak', desc: '3 consecutive days', check: () => calculateStreak() >= 3 },
  { id: 'streak-7', emoji: '🔥🔥', label: '7-Day Streak', desc: '7 consecutive days', check: () => calculateStreak() >= 7 },
  { id: 'breath-5', emoji: '🧘', label: 'Breathing Master', desc: '5 breathing sessions', check: () => getSessions().breathing >= 5 },
  { id: 'chat-10', emoji: '💬', label: 'Open Up', desc: '10 chat messages', check: () => getChatHistory().filter(m => m.role === 'user').length >= 10 },
  { id: 'all-habits', emoji: '🌟', label: 'Wellness Warrior', desc: 'All 7 habits in one day', check: () => { const h = getTodayHabits(); return Object.values(h).every(Boolean); } },
  { id: 'mood-7', emoji: '📊', label: 'Self-Aware', desc: 'Log mood 7 days', check: () => { const dates = new Set(getMoods().map(m => m.date)); return dates.size >= 7; } },
];

export default function Progress() {
  const streak = calculateStreak();
  const moods = getMoods();
  const journal = getJournalEntries();
  const sessions = getSessions();
  const ehs = calculateEHS();
  const [habits, setHabits] = useState<HabitDay>(getTodayHabits);
  const [selfCarePlan, setSelfCarePlan] = useState<any[]>([]);
  const [affirmation, setAffirmation] = useState('');
  const [pastAffirmations] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('mindease_affirmations') || '[]'); } catch { return []; }
  });
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingAff, setLoadingAff] = useState(false);

  const toggleHabit = (key: keyof HabitDay) => {
    const next = { ...habits, [key]: !habits[key] };
    setHabits(next);
    saveTodayHabits(next);
    // Check badge
    if (Object.values(next).every(Boolean)) {
      toast.success('🌟 Badge unlocked: Wellness Warrior!');
    }
  };

  const thisWeekMoods = moods.filter(m => (Date.now() - m.timestamp) < 7 * 86400000);
  const habitCompletionPct = Math.round((Object.values(habits).filter(Boolean).length / 7) * 100);
  const ehsColor = ehs >= 70 ? 'text-secondary' : ehs >= 40 ? 'text-primary' : 'text-rose-soft';

  // Week days for habit tracker
  const weekDays: string[] = [];
  const allHabits = getHabits();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekDays.push(d.toISOString().split('T')[0]);
  }

  const generatePlan = async () => {
    setLoadingPlan(true);
    const moodSummary = moods.slice(-7).map(m => `${m.mood}`).join(', ') || 'no data';
    const habitSummary = Object.entries(habits).filter(([,v]) => v).map(([k]) => k).join(', ') || 'none';
    const journalSnippet = journal.length > 0 ? journal[journal.length - 1].content.slice(0, 100) : 'none';
    try {
      const r = await callAI(
        `Based on the following data about a student:\n- Recent moods: [${moodSummary}]\n- Habits completed: [${habitSummary}]\n- Journal themes: "${journalSnippet}"\n- Wellness sessions: ${sessions.breathing} breathing, ${sessions.pomodoro} focus\n\nGenerate a warm, specific 5-day self-care plan. For each day include: morning routine (2 min), one wellness activity, one evening reflection prompt. Format as JSON: [{"day":"Day 1","morning":"...","activity":"...","evening":"..."}]. Return ONLY JSON.`,
        'You are a wellness advisor. Return ONLY valid JSON, no extra text.'
      );
      const match = r.match(/\[[\s\S]*\]/);
      if (match) setSelfCarePlan(JSON.parse(match[0]));
      else throw new Error();
    } catch {
      setSelfCarePlan([
        { day: 'Day 1', morning: '5-min stretching + glass of water', activity: 'Box breathing — 4 cycles', evening: 'Write 3 things that went well today' },
        { day: 'Day 2', morning: 'Gratitude journaling — 3 things', activity: '15-min walk in nature', evening: 'Body scan before sleep' },
        { day: 'Day 3', morning: 'Cold water face splash + affirmation', activity: 'Desk yoga between classes', evening: 'Screen-free last hour before bed' },
        { day: 'Day 4', morning: '2-min meditation', activity: 'Call or text a friend', evening: 'Journal about one emotion you felt today' },
        { day: 'Day 5', morning: 'Plan your day in 3 priorities', activity: 'Try EFT tapping for 5 min', evening: 'Celebrate one small win from the week' },
      ]);
    }
    setLoadingPlan(false);
  };

  const generateAffirmation = async () => {
    setLoadingAff(true);
    const mood = moods.length > 0 ? moods[moods.length - 1].mood : 'okay';
    try {
      const r = await callAI(`Generate one powerful, specific affirmation for a student who is feeling ${mood}. Make it feel personal and genuine, not generic. 1-2 sentences max. No hashtags or emojis.`);
      setAffirmation(r);
      const stored = JSON.parse(localStorage.getItem('mindease_affirmations') || '[]');
      stored.push(r);
      localStorage.setItem('mindease_affirmations', JSON.stringify(stored.slice(-7)));
    } catch {
      setAffirmation("You are capable of amazing things, even on your hardest days.");
    }
    setLoadingAff(false);
  };

  // Calendar
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    const mood = moods.find(m => m.date === date);
    return { day: i + 1, mood, date };
  });

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto overflow-y-auto">
      <PageHeader title="Progress" subtitle="Track your wellness journey" emoji="🏆" gradient="from-warm-peach/10 to-mint/8" />

        {/* Top Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
          {[
            { label: 'Current Streak', value: streak, icon: Flame, emoji: '🔥' },
            { label: 'Journal Entries', value: journal.length, icon: BookOpen, emoji: '📓' },
            { label: 'Moods Logged', value: moods.length, icon: Smile, emoji: '😊' },
            { label: 'Wellness Sessions', value: sessions.breathing + sessions.pomodoro, icon: Wind, emoji: '🧘' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-static rounded-2xl p-4">
              <p className="text-2xl font-bold text-foreground font-number">{s.value}</p>
              <p className="text-xs text-muted-foreground font-body flex items-center gap-1">{s.emoji} {s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* EHS Card */}
        <div className="glass-static rounded-3xl p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="42" fill="none"
                stroke={ehs >= 70 ? 'hsl(var(--secondary))' : ehs >= 40 ? 'hsl(var(--primary))' : 'hsl(var(--rose-soft))'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - ehs / 100) }}
                transition={{ duration: 1.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold font-number ${ehsColor}`}>{ehs}</span>
            </div>
          </div>
          <div>
            <h3 className="font-display text-xl text-foreground font-semibold mb-1">Emotional Health Score</h3>
            <p className="text-sm text-muted-foreground font-body">
              Based on mood ({Math.round(ehs * 0.6)}%), habits ({habitCompletionPct}%), journaling, and breathing sessions.
            </p>
          </div>
        </div>

        {/* Habit Tracker - 7-day grid */}
        <div className="glass-static rounded-3xl p-6 mb-6">
          <h3 className="font-display text-lg text-foreground mb-4 font-semibold">Weekly Habit Tracker</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr>
                  <th className="text-left text-xs text-muted-foreground font-body pb-2 w-28">Habit</th>
                  {weekDays.map(d => (
                    <th key={d} className="text-center text-xs text-muted-foreground font-body pb-2">
                      {new Date(d + 'T12:00:00').toLocaleDateString([], { weekday: 'short' })}
                    </th>
                  ))}
                  <th className="text-center text-xs text-muted-foreground font-body pb-2">%</th>
                </tr>
              </thead>
              <tbody>
                {habitList.map(h => {
                  const completed = weekDays.filter(d => allHabits[d]?.[h.key]).length;
                  return (
                    <tr key={h.key}>
                      <td className="text-xs text-foreground font-body py-1">{h.emoji} {h.label}</td>
                      {weekDays.map(d => {
                        const isToday = d === new Date().toISOString().split('T')[0];
                        const checked = isToday ? habits[h.key] : allHabits[d]?.[h.key];
                        return (
                          <td key={d} className="text-center py-1">
                            <button
                              onClick={() => isToday && toggleHabit(h.key)}
                              disabled={!isToday}
                              className={`w-6 h-6 rounded-full border-2 mx-auto flex items-center justify-center text-[10px] transition-all ${
                                checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                              } ${isToday ? 'hover:border-primary cursor-pointer' : 'opacity-60 cursor-default'}`}
                            >
                              {checked && '✓'}
                            </button>
                          </td>
                        );
                      })}
                      <td className="text-center text-xs font-number text-muted-foreground">{Math.round(completed / 7 * 100)}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td className="text-xs text-muted-foreground font-body pt-2">Daily %</td>
                  {weekDays.map(d => {
                    const dayHabits = d === new Date().toISOString().split('T')[0] ? habits : allHabits[d];
                    const pct = dayHabits ? Math.round(Object.values(dayHabits).filter(Boolean).length / 7 * 100) : 0;
                    return <td key={d} className="text-center text-xs font-number text-muted-foreground pt-2">{pct}%</td>;
                  })}
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Badges */}
        <div className="glass-static rounded-3xl p-6 mb-6">
          <h3 className="font-display text-lg text-foreground mb-4 font-semibold flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {badgeDefs.map(b => {
              const earned = b.check();
              return (
                <div key={b.id} className={`rounded-xl p-3 text-center border transition-all ${
                  earned ? 'border-primary bg-primary/5 animate-glow-pulse' : 'border-border opacity-40'
                }`}>
                  <span className="text-2xl block mb-1">{b.emoji}</span>
                  <p className="text-xs font-body font-medium text-foreground">{b.label}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Self-care plan */}
          <div className="glass-static rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg text-foreground font-semibold">AI Self-Care Plan</h3>
            </div>
            {selfCarePlan.length > 0 ? (
              <div className="space-y-3">
                {selfCarePlan.map((p: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-primary font-body font-medium">{p.day}</p>
                    <p className="text-xs text-foreground font-body mt-1">☀️ {p.morning}</p>
                    <p className="text-xs text-foreground font-body">🌿 {p.activity}</p>
                    <p className="text-xs text-foreground font-body">🌙 {p.evening}</p>
                  </motion.div>
                ))}
                <button onClick={generatePlan} disabled={loadingPlan} className="btn-secondary w-full text-xs disabled:opacity-40">
                  {loadingPlan ? 'Regenerating...' : 'Regenerate Plan'}
                </button>
              </div>
            ) : (
              <button onClick={generatePlan} disabled={loadingPlan} className="w-full btn-primary disabled:opacity-40">
                {loadingPlan ? 'Generating...' : 'Generate My Self-Care Plan'}
              </button>
            )}
          </div>

          {/* Affirmation */}
          <div className="glass-static rounded-3xl p-6">
            <h3 className="font-display text-lg text-foreground mb-4 font-semibold">✨ Daily Affirmation</h3>
            {affirmation ? (
              <div>
                <p className="font-display text-lg text-foreground italic leading-relaxed font-semibold">"{affirmation}"</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { navigator.clipboard.writeText(affirmation); toast.success('Copied!'); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={generateAffirmation} disabled={loadingAff} className="text-xs text-primary font-body hover:underline disabled:opacity-40">
                    Generate new
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={generateAffirmation} disabled={loadingAff} className="w-full btn-primary disabled:opacity-40">
                {loadingAff ? 'Generating...' : "Generate Today's Affirmation"}
              </button>
            )}
            {/* Past affirmations */}
            {pastAffirmations.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs text-muted-foreground font-body mb-2">Recent affirmations:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {pastAffirmations.slice(-5).reverse().map((a, i) => (
                    <p key={i} className="text-xs text-foreground italic font-body">"{a}"</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Calendar */}
        <div className="glass-static rounded-3xl p-6">
          <h3 className="font-display text-lg text-foreground mb-4 font-semibold">
            {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} — Mood Calendar
          </h3>
          <div className="grid grid-cols-7 gap-1.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="text-[10px] text-muted-foreground text-center font-body">{d}</span>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {calendarDays.map(d => (
              <div
                key={d.day}
                className={`aspect-square rounded-lg flex items-center justify-center text-[10px] transition-colors cursor-default ${
                  d.mood
                    ? d.mood.moodScore >= 75 ? 'bg-secondary/40' : d.mood.moodScore >= 50 ? 'bg-primary/20' : 'bg-rose-soft/30'
                    : 'bg-muted/30'
                }`}
                title={d.mood ? `${d.date}: ${MOOD_MAP[d.mood.mood]?.label} — ${d.mood.note || 'No note'}` : `${d.date}: No log`}
              >
                {d.mood ? MOOD_MAP[d.mood.mood]?.emoji : <span className="font-number">{d.day}</span>}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
