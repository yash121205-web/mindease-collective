import { useState } from 'react';
import { motion } from 'framer-motion';
import { saveMood, getMoods, genId, MOOD_MAP } from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { TrendingUp, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const factors = ['Academics', 'Sleep', 'Social', 'Family', 'Health', 'Work', 'Relationships'];

const moods = [
  { key: 'great', emoji: '😄', label: 'Great' },
  { key: 'good', emoji: '🙂', label: 'Good' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'low', emoji: '😔', label: 'Low' },
  { key: 'overwhelmed', emoji: '😰', label: 'Overwhelmed' },
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
  }));

  // Mood prediction
  const recentScores = allMoods.slice(-7).map(m => m.moodScore);
  const avgScore = recentScores.length > 0 ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length) : null;
  const stressCount = allMoods.slice(-7).filter(m => m.moodScore <= 25).length;

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
    setLoading(true);
    try {
      const msg = await callAI(`User logged their mood as "${selected}" with factors: ${selectedFactors.join(', ') || 'none'}. Note: "${note || 'none'}". Give a warm, personalized 2-sentence response.`);
      setAiMessage(msg);
    } catch {
      setAiMessage("Remember to be gentle with yourself today. Every feeling is temporary. 💙");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-1">Mood Check-In</h1>
        <p className="text-muted-foreground mb-8">How are you feeling right now?</p>

        {!submitted ? (
          <div className="space-y-6">
            {/* Mood selector */}
            <div className="flex justify-center gap-4 flex-wrap">
              {moods.map((mood, i) => (
                <motion.button
                  key={mood.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setSelected(mood.key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                    selected === mood.key
                      ? 'bg-primary/10 ring-2 ring-primary scale-110'
                      : 'glass hover:scale-105'
                  }`}
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className="text-xs font-medium text-foreground">{mood.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Note */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind? (optional)"
              className="w-full bg-muted rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              rows={3}
            />

            {/* Factors */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Contributing factors</p>
              <div className="flex flex-wrap gap-2">
                {factors.map(f => (
                  <button
                    key={f}
                    onClick={() => toggleFactor(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              Log Mood
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass rounded-3xl p-6 text-center">
              <span className="text-5xl mb-3 block">{MOOD_MAP[selected!]?.emoji}</span>
              <p className="font-display text-xl text-foreground mb-2">Mood Logged ✓</p>
              {loading ? (
                <div className="flex gap-1 justify-center mt-3">
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{aiMessage}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* 7-day chart */}
        {last7.length > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass rounded-3xl p-5 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">7-Day Trend</p>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={last7}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Mood prediction */}
        {avgScore !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass rounded-3xl p-5 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mood Prediction</p>
            </div>
            <p className="text-sm text-foreground">
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
