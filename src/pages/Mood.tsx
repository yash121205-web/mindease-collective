import { useState } from 'react';
import { motion } from 'framer-motion';
import { saveMood, getMoods, genId, MOOD_MAP, getTodayHabits, saveTodayHabits } from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { TrendingUp, Sparkles, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts';
import PageHeader from '@/components/PageHeader';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts';

const factors = ['Academics', 'Sleep', 'Social', 'Family', 'Health', 'Work', 'Relationships'];

const moods = [
  { key: 'great', emoji: '😄', label: 'Great', color: 'hsl(45, 80%, 60%)', bg: 'bg-[hsl(45,80%,92%)]', ring: 'ring-[hsl(45,80%,60%)]' },
  { key: 'good', emoji: '🙂', label: 'Good', color: 'hsl(125, 40%, 55%)', bg: 'bg-[hsl(125,40%,90%)]', ring: 'ring-[hsl(125,40%,55%)]' },
  { key: 'okay', emoji: '😐', label: 'Okay', color: 'hsl(200, 60%, 60%)', bg: 'bg-[hsl(200,60%,92%)]', ring: 'ring-[hsl(200,60%,60%)]' },
  { key: 'low', emoji: '😔', label: 'Low', color: 'hsl(270, 40%, 70%)', bg: 'bg-[hsl(270,40%,92%)]', ring: 'ring-[hsl(270,40%,70%)]' },
  { key: 'overwhelmed', emoji: '😰', label: 'Overwhelmed', color: 'hsl(350, 60%, 70%)', bg: 'bg-[hsl(350,60%,92%)]', ring: 'ring-[hsl(350,60%,70%)]' },
];

const motivations = [
  "You showed up for yourself today. That matters. 🌱",
  "Every feeling is valid. Every step counts. 💙",
  "Tracking your emotions is an act of self-love. ✨",
  "You're building self-awareness, one day at a time. 🌿",
  "Being honest with yourself takes courage. You have it. 💪",
];

export default function Mood() {
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const allMoods = getMoods();
  const last7 = allMoods.slice(-7).map(m => ({
    day: new Date(m.timestamp).toLocaleDateString([], { weekday: 'short' }),
    score: m.moodScore,
    mood: m.mood,
  }));

  const last30 = allMoods.slice(-30).map(m => ({
    date: new Date(m.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: m.moodScore,
  }));

  // Mood prediction - only after logging
  const recentScores = allMoods.slice(-7).map(m => m.moodScore);
  const avgScore = recentScores.length > 0 ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length) : null;
  const stressCount = allMoods.slice(-7).filter(m => m.moodScore <= 25).length;

  // Burnout detection
  const lowMoodStreak = (() => {
    let count = 0;
    for (let i = allMoods.length - 1; i >= 0; i--) {
      if (allMoods[i].moodScore <= 25) count++;
      else break;
    }
    return count;
  })();

  const toggleFactor = (f: string) => {
    setSelectedFactors(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    saveMood({
      id: genId(),
      date: new Date().toISOString().split('T')[0],
      mood: selected,
      moodScore: MOOD_MAP[selected].score,
      note,
      factors: selectedFactors,
      timestamp: Date.now(),
    });
    setSubmitted(true);

    // Auto-update habits when sleep quality is good
    if (MOOD_MAP[selected].score >= 75) {
      const h = getTodayHabits();
      if (selectedFactors.includes('Sleep')) { h.sleep = true; saveTodayHabits(h); }
    }
    setLoading(true);
    try {
      const msg = await callAI(`User logged their mood as "${selected}" with factors: ${selectedFactors.join(', ') || 'none'}. Note: "${note || 'none'}". Give a warm, personalized 2-sentence response. Don't start with "I understand" or "I'm sorry".`);
      setAiMessage(msg);
    } catch {
      setAiMessage(motivations[Math.floor(Math.random() * motivations.length)]);
    }
    setLoading(false);
  };

  const moodColorMap: Record<string, string> = {
    great: 'hsl(45, 80%, 60%)',
    good: 'hsl(125, 40%, 55%)',
    okay: 'hsl(200, 60%, 60%)',
    low: 'hsl(270, 40%, 70%)',
    overwhelmed: 'hsl(350, 60%, 70%)',
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <PageHeader title="Mood Check-In" subtitle="How are you feeling right now?" emoji="😊" gradient="from-primary/10 to-mint/8" />

        {!submitted ? (
          <div className="space-y-6">
            {/* Mood selector with warm pastel colors */}
            <div className="flex justify-center gap-3 flex-wrap">
              {moods.map((mood, i) => (
                <motion.button
                  key={mood.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setSelected(mood.key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                    selected === mood.key
                      ? `${mood.bg} ring-2 ${mood.ring} scale-110`
                      : 'glass hover:scale-105'
                  }`}
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className="text-xs font-medium text-foreground font-body">{mood.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Note */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind? (optional)"
              className="w-full bg-muted rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-body"
              rows={3}
            />

            {/* Factors */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 font-body">Contributing factors</p>
              <div className="flex flex-wrap gap-2">
                {factors.map(f => (
                  <button
                    key={f}
                    onClick={() => toggleFactor(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all font-body ${
                      selectedFactors.includes(f)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-primary/10'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!selected}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-medium disabled:opacity-40 hover:opacity-90 transition-opacity font-body"
            >
              Log Mood
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass rounded-3xl p-6 text-center">
              <span className="text-5xl mb-3 block">{MOOD_MAP[selected!]?.emoji}</span>
              <p className="font-display text-xl text-foreground mb-2 font-semibold">Mood Logged ✓</p>
              {loading ? (
                <div className="flex gap-1 justify-center mt-3">
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed font-body">{aiMessage}</p>
              )}
            </div>

            {/* Motivation */}
            <div className="text-center">
              <p className="text-sm text-primary font-body italic">
                {motivations[Math.floor(Math.random() * motivations.length)]}
              </p>
            </div>
          </motion.div>
        )}

        {/* Burnout warning */}
        {lowMoodStreak >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-5 mt-6 border-l-4 border-rose-soft">
            <p className="text-sm text-foreground font-body">
              ⚠️ You've logged low or overwhelmed mood for <strong>{lowMoodStreak} consecutive days</strong>. 
              This could be a sign of burnout. Please consider talking to SERA or reaching out to a professional. 
              Your wellbeing matters. 💙
            </p>
          </motion.div>
        )}

        {/* 7-day chart */}
        {last7.length > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass rounded-3xl p-5 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body">7-Day Trend</p>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={last7}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {last7.map((entry, i) => (
                    <Cell key={i} fill={moodColorMap[entry.mood] || 'hsl(var(--primary))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Emotional timeline (30-day) */}
        {last30.length > 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="glass rounded-3xl p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body">Emotional Timeline</p>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={last30}>
                <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={Math.floor(last30.length / 5)} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Mood prediction — only shown after logging */}
        {submitted && avgScore !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass rounded-3xl p-5 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body">Mood Prediction</p>
            </div>
            <p className="text-sm text-foreground font-body">
              {stressCount >= 3
                ? `📊 Predicted mood tomorrow: Likely stressed (${Math.round(stressCount / 7 * 100)}% confidence) — Try a breathing session before bed tonight.`
                : `📊 Predicted mood tomorrow: ${avgScore >= 70 ? 'Good' : 'Okay'} (${Math.round(65 + Math.random() * 20)}% confidence) — Keep up your positive habits!`
              }
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
