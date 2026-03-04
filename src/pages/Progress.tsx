import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getMoods, getJournalEntries, getSessions, getHabits, getTodayHabits, saveTodayHabits,
  calculateStreak, calculateEHS, MOOD_MAP, type HabitDay
} from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { Flame, BookOpen, Smile, Wind, Timer, Sparkles, Award } from 'lucide-react';

const habitList: { key: keyof HabitDay; label: string; emoji: string }[] = [
  { key: 'meditated', label: 'Meditated', emoji: '🧘' },
  { key: 'journaled', label: 'Journaled', emoji: '📓' },
  { key: 'water', label: 'Drank enough water', emoji: '💧' },
  { key: 'exercise', label: 'Exercised', emoji: '🏃' },
  { key: 'sleep', label: 'Slept 7+ hours', emoji: '😴' },
  { key: 'screenFree', label: 'Screen-free time', emoji: '📵' },
  { key: 'gratitude', label: 'Practiced gratitude', emoji: '🙏' },
];

const milestones = [
  { days: 7, badge: '🏅', label: '7-Day Journaler' },
  { days: 14, badge: '🌟', label: 'Two Week Warrior' },
  { days: 30, badge: '🏆', label: 'Monthly Master' },
];

export default function Progress() {
  const streak = calculateStreak();
  const moods = getMoods();
  const journal = getJournalEntries();
  const sessions = getSessions();
  const [habits, setHabits] = useState<HabitDay>(getTodayHabits);
  const [selfCarePlan, setSelfCarePlan] = useState('');
  const [affirmation, setAffirmation] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingAff, setLoadingAff] = useState(false);

  const toggleHabit = (key: keyof HabitDay) => {
    const next = { ...habits, [key]: !habits[key] };
    setHabits(next);
    saveTodayHabits(next);
  };

  const thisWeekMoods = moods.filter(m => {
    const d = new Date(m.timestamp);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 86400000;
  });

  const generatePlan = async () => {
    setLoadingPlan(true);
    const moodSummary = moods.slice(-7).map(m => m.mood).join(', ') || 'no data';
    const habitSummary = Object.entries(habits).filter(([,v]) => v).map(([k]) => k).join(', ') || 'none';
    try {
      const r = await callAI(`Based on mood history [${moodSummary}] and completed habits [${habitSummary}], generate a personalized 5-day self-care plan for a student. Keep it brief and actionable, one line per day.`);
      setSelfCarePlan(r);
    } catch {
      setSelfCarePlan("Day 1: Start with 5 min breathing\nDay 2: Journal your thoughts\nDay 3: Take a nature walk\nDay 4: Practice gratitude before bed\nDay 5: Have a screen-free evening");
    }
    setLoadingPlan(false);
  };

  const generateAffirmation = async () => {
    setLoadingAff(true);
    try {
      const r = await callAI("Generate a single powerful, warm affirmation for a student dealing with academic pressure. One sentence only.");
      setAffirmation(r);
    } catch {
      setAffirmation("You are capable of amazing things, even on your hardest days. 🌟");
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
    return { day: i + 1, mood };
  });

  const earnedBadges = milestones.filter(m => streak >= m.days);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-1">Progress</h1>
        <p className="text-muted-foreground mb-8">Track your wellness journey</p>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Streak */}
          <div className="glass rounded-3xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Flame className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
            </div>
          </div>

          {/* Stats */}
          {[
            { label: 'Journal Entries', value: journal.length, icon: BookOpen },
            { label: 'Moods This Week', value: thisWeekMoods.length, icon: Smile },
            { label: 'Breathing Sessions', value: sessions.breathing, icon: Wind },
            { label: 'Focus Sessions', value: sessions.pomodoro, icon: Timer },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
              <s.icon className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}

          {/* Badges */}
          <div className="glass rounded-3xl p-6 md:col-span-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Badges</p>
            <div className="flex gap-3 flex-wrap">
              {milestones.map(m => (
                <div key={m.days} className={`px-4 py-2 rounded-2xl border text-sm flex items-center gap-2 ${streak >= m.days ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground opacity-50'}`}>
                  <span className="text-xl">{m.badge}</span> {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Habit Tracker */}
          <div className="glass rounded-3xl p-6 md:col-span-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Today's Habits</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {habitList.map(h => (
                <button
                  key={h.key}
                  onClick={() => toggleHabit(h.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                    habits[h.key]
                      ? 'bg-primary/10 text-foreground'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs transition-all ${habits[h.key] ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
                    {habits[h.key] && '✓'}
                  </span>
                  <span>{h.emoji} {h.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Self-care plan */}
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Self-Care Plan</p>
            </div>
            {selfCarePlan ? (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{selfCarePlan}</p>
            ) : (
              <button onClick={generatePlan} disabled={loadingPlan} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40">
                {loadingPlan ? 'Generating...' : 'Generate My Plan'}
              </button>
            )}
          </div>

          {/* Affirmation */}
          <div className="glass rounded-3xl p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">✨ Affirmation</p>
            {affirmation ? (
              <p className="font-display text-lg text-foreground italic leading-relaxed">"{affirmation}"</p>
            ) : (
              <button onClick={generateAffirmation} disabled={loadingAff} className="w-full py-3 rounded-xl bg-secondary/30 text-foreground text-sm font-medium disabled:opacity-40">
                {loadingAff ? 'Generating...' : "Generate Today's Affirmation"}
              </button>
            )}
          </div>

          {/* Monthly Calendar */}
          <div className="glass rounded-3xl p-6 md:col-span-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} — Mood Calendar
            </p>
            <div className="grid grid-cols-7 gap-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="text-[9px] text-muted-foreground text-center">{d}</span>)}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {calendarDays.map(d => (
                <div
                  key={d.day}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[10px] ${
                    d.mood
                      ? d.mood.moodScore >= 75 ? 'bg-secondary/40' : d.mood.moodScore >= 50 ? 'bg-primary/20' : 'bg-rose-soft/30'
                      : 'bg-muted/30'
                  }`}
                  title={d.mood ? `${MOOD_MAP[d.mood.mood]?.label}` : 'No log'}
                >
                  {d.mood ? MOOD_MAP[d.mood.mood]?.emoji : d.day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
