import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  getMoods, getJournalEntries, getSessions, getHabits, getTodayHabits, saveTodayHabits,
  calculateStreak, calculateEHS, MOOD_MAP, type HabitDay, getChatHistory
} from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { Flame, BookOpen, Smile, Wind, Sparkles, Award, Copy, Check, TrendingUp, Calendar } from 'lucide-react';
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

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <h3 className="font-display text-base text-foreground font-semibold">{label}</h3>
    </div>
  );
}

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
    if (Object.values(next).every(Boolean)) {
      toast.success('🌟 Badge unlocked: Wellness Warrior!');
    }
  };

  const habitCompletionPct = Math.round((Object.values(habits).filter(Boolean).length / 7) * 100);
  const ehsColor = ehs >= 70 ? 'text-secondary' : ehs >= 40 ? 'text-primary' : 'text-rose-soft';
  const ehsStroke = ehs >= 70 ? 'hsl(var(--secondary))' : ehs >= 40 ? 'hsl(var(--primary))' : 'hsl(var(--rose-soft))';

  const todayStr = new Date().toISOString().split('T')[0];
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

      {/* ─── Hero Stats ─── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
        {[
          { label: 'Current Streak', value: streak, emoji: '🔥', suffix: 'd' },
          { label: 'Journal Entries', value: journal.length, emoji: '📓', suffix: '' },
          { label: 'Moods Logged', value: moods.length, emoji: '😊', suffix: '' },
          { label: 'Sessions', value: sessions.breathing + sessions.pomodoro, emoji: '🧘', suffix: '' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">{s.emoji}</span>
              <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-foreground font-number">{s.value}<span className="text-sm font-normal text-muted-foreground">{s.suffix}</span></p>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── EHS + Today's Habits Row ─── */}
      <div className="grid gap-5 md:grid-cols-5 mb-6">
        {/* EHS Card */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }}
          className="md:col-span-2 bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5 flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="42" fill="none" stroke={ehsStroke} strokeWidth="8" strokeLinecap="round"
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
            <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">Emotional Health</p>
            <p className="font-display text-sm font-semibold text-foreground mt-0.5">
              {ehs >= 70 ? 'Thriving 🌟' : ehs >= 40 ? 'Steady progress 💙' : 'Needs attention 🫂'}
            </p>
            <p className="text-[11px] text-muted-foreground font-body mt-1 leading-relaxed">
              Today's habits: {habitCompletionPct}% complete
            </p>
          </div>
        </motion.div>

        {/* Today's Quick Habits */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }}
          className="md:col-span-3 bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider font-semibold">Today's Habits</p>
            <span className="text-xs font-number text-primary font-bold">{Object.values(habits).filter(Boolean).length}/7</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {habitList.map(h => {
              const done = habits[h.key];
              return (
                <button
                  key={h.key}
                  onClick={() => toggleHabit(h.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-medium transition-all border ${
                    done
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'bg-card border-border/40 text-muted-foreground hover:border-primary/15 hover:text-foreground'
                  }`}
                >
                  {done ? <Check className="w-3 h-3" /> : <span>{h.emoji}</span>}
                  {h.label}
                </button>
              );
            })}
          </div>
          {/* Completion bar */}
          <div className="mt-3 h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${habitCompletionPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>

      {/* ─── Weekly Habit Tracker ─── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5 mb-6">
        <SectionLabel icon={TrendingUp} label="Weekly Habit Tracker" />
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr>
                <th className="text-left text-[11px] text-muted-foreground font-body font-semibold pb-3 w-28 uppercase tracking-wider">Habit</th>
                {weekDays.map(d => {
                  const isToday = d === todayStr;
                  return (
                    <th key={d} className={`text-center text-[11px] font-body pb-3 ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      <div>{new Date(d + 'T12:00:00').toLocaleDateString([], { weekday: 'short' })}</div>
                      <div className={`text-[9px] mt-0.5 ${isToday ? 'text-primary' : 'text-muted-foreground/60'}`}>
                        {new Date(d + 'T12:00:00').getDate()}
                      </div>
                    </th>
                  );
                })}
                <th className="text-center text-[11px] text-muted-foreground font-body font-semibold pb-3 uppercase tracking-wider">%</th>
              </tr>
            </thead>
            <tbody>
              {habitList.map((h, hi) => {
                const completed = weekDays.filter(d => {
                  if (d === todayStr) return habits[h.key];
                  return allHabits[d]?.[h.key];
                }).length;
                const pct = Math.round(completed / 7 * 100);
                return (
                  <motion.tr key={h.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + hi * 0.03 }}>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{h.emoji}</span>
                        <span className="text-xs text-foreground font-body font-medium">{h.label}</span>
                      </div>
                    </td>
                    {weekDays.map(d => {
                      const isToday = d === todayStr;
                      const checked = isToday ? habits[h.key] : allHabits[d]?.[h.key];
                      return (
                        <td key={d} className="text-center py-2">
                          <button
                            onClick={() => isToday && toggleHabit(h.key)}
                            disabled={!isToday}
                            className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center text-[10px] transition-all border ${
                              checked
                                ? 'bg-primary border-primary/30 text-primary-foreground shadow-sm'
                                : isToday
                                  ? 'border-primary/25 bg-primary/5 hover:bg-primary/10 cursor-pointer'
                                  : 'border-border/30 bg-muted/20'
                            } ${!isToday && !checked ? 'opacity-50' : ''}`}
                          >
                            {checked && <Check className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="text-center py-2">
                      <span className={`text-xs font-number font-bold px-2 py-0.5 rounded-md ${
                        pct >= 70 ? 'text-secondary bg-secondary/10' : pct >= 40 ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted/30'
                      }`}>{pct}%</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border/30">
                <td className="text-[11px] text-muted-foreground font-body font-semibold pt-3 uppercase tracking-wider">Daily</td>
                {weekDays.map(d => {
                  const isToday = d === todayStr;
                  const dayHabits = isToday ? habits : allHabits[d];
                  const pct = dayHabits ? Math.round(Object.values(dayHabits).filter(Boolean).length / 7 * 100) : 0;
                  return (
                    <td key={d} className="text-center pt-3">
                      <span className={`text-[10px] font-number font-bold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{pct}%</span>
                    </td>
                  );
                })}
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* ─── Badges ─── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5 mb-6">
        <SectionLabel icon={Award} label="Badges" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {badgeDefs.map((b, i) => {
            const earned = b.check();
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                className={`rounded-xl p-3.5 text-center border transition-all ${
                  earned
                    ? 'border-primary/25 bg-gradient-to-br from-primary/8 to-secondary/5 shadow-sm'
                    : 'border-border/30 bg-muted/10 opacity-45 grayscale'
                }`}
              >
                <span className="text-2xl block mb-1.5">{b.emoji}</span>
                <p className="text-xs font-body font-semibold text-foreground">{b.label}</p>
                <p className="text-[10px] text-muted-foreground font-body mt-0.5">{b.desc}</p>
                {earned && <span className="text-[9px] text-primary font-body font-semibold mt-1 inline-block">✓ Earned</span>}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Self-Care Plan + Affirmation ─── */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
        {/* Self-care plan */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.25 }}
          className="relative bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-secondary to-mint" />
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/15 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="font-display text-base text-foreground font-semibold">AI Self-Care Plan</h3>
            </div>
            {selfCarePlan.length > 0 ? (
              <div className="space-y-2.5">
                {selfCarePlan.map((p: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="p-3 rounded-xl bg-muted/20 border border-border/20">
                    <p className="text-[11px] text-primary font-body font-bold uppercase tracking-wider mb-1.5">{p.day}</p>
                    <div className="space-y-1">
                      <p className="text-xs text-foreground font-body">☀️ {p.morning}</p>
                      <p className="text-xs text-foreground font-body">🌿 {p.activity}</p>
                      <p className="text-xs text-foreground font-body">🌙 {p.evening}</p>
                    </div>
                  </motion.div>
                ))}
                <button onClick={generatePlan} disabled={loadingPlan} className="w-full py-2 rounded-xl border border-border bg-card text-xs font-body font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-40">
                  {loadingPlan ? 'Regenerating...' : '↻ Regenerate Plan'}
                </button>
              </div>
            ) : (
              <button onClick={generatePlan} disabled={loadingPlan} className="w-full btn-primary disabled:opacity-40">
                {loadingPlan ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating...
                  </span>
                ) : '✨ Generate My Self-Care Plan'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Affirmation */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.3 }}
          className="relative bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-secondary via-mint to-primary" />
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary/20 to-mint/15 flex items-center justify-center">
                <span className="text-sm">✨</span>
              </div>
              <h3 className="font-display text-base text-foreground font-semibold">Daily Affirmation</h3>
            </div>
            {affirmation ? (
              <div>
                <p className="font-display text-base text-foreground italic leading-relaxed font-semibold">"{affirmation}"</p>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => { navigator.clipboard.writeText(affirmation); toast.success('Copied!'); }} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={generateAffirmation} disabled={loadingAff} className="text-xs text-primary font-body font-medium hover:underline disabled:opacity-40">
                    Generate new
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={generateAffirmation} disabled={loadingAff} className="w-full btn-primary disabled:opacity-40">
                {loadingAff ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating...
                  </span>
                ) : "✨ Generate Today's Affirmation"}
              </button>
            )}
            {pastAffirmations.length > 0 && (
              <div className="mt-4 border-t border-border/30 pt-3">
                <p className="text-[11px] text-muted-foreground font-body font-semibold uppercase tracking-wider mb-2">Recent</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {pastAffirmations.slice(-4).reverse().map((a, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground italic font-body leading-relaxed">"{a}"</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── Monthly Mood Calendar ─── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
        <SectionLabel icon={Calendar} label={`${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} — Mood Calendar`} />
        <div className="grid grid-cols-7 gap-1.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-[10px] text-muted-foreground text-center font-body font-semibold">{d}</span>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {calendarDays.map(d => {
            const isToday = d.date === todayStr;
            return (
              <div
                key={d.day}
                className={`aspect-square rounded-lg flex items-center justify-center text-[10px] transition-colors cursor-default ${
                  d.mood
                    ? d.mood.moodScore >= 75 ? 'bg-secondary/40' : d.mood.moodScore >= 50 ? 'bg-primary/20' : 'bg-rose-soft/30'
                    : 'bg-muted/20'
                } ${isToday ? 'ring-1.5 ring-primary/40' : ''}`}
                title={d.mood ? `${d.date}: ${MOOD_MAP[d.mood.mood]?.label} — ${d.mood.note || 'No note'}` : `${d.date}: No log`}
              >
                {d.mood ? MOOD_MAP[d.mood.mood]?.emoji : <span className="font-number text-muted-foreground/60">{d.day}</span>}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-muted-foreground font-body">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted/20" /> No data</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-soft/30" /> Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/20" /> Okay</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-secondary/40" /> Great</span>
        </div>
      </motion.div>
    </div>
  );
}
