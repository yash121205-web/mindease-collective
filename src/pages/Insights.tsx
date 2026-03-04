import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMoods, calculateEHS, MOOD_MAP } from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { Activity, Sparkles, BarChart3 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const COLORS = ['hsl(155 62% 50%)', 'hsl(200 70% 55%)', 'hsl(45 90% 55%)', 'hsl(20 80% 60%)', 'hsl(0 60% 60%)'];

export default function Insights() {
  const moods = getMoods();
  const ehs = calculateEHS();
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Weekly trend
  const last7 = moods.slice(-7).map(m => ({
    day: new Date(m.timestamp).toLocaleDateString([], { weekday: 'short' }),
    score: m.moodScore,
  }));

  // Distribution
  const distMap: Record<string, number> = {};
  moods.forEach(m => { distMap[m.mood] = (distMap[m.mood] || 0) + 1; });
  const distData = Object.entries(distMap).map(([mood, count]) => ({
    name: MOOD_MAP[mood]?.label || mood,
    value: count,
    emoji: MOOD_MAP[mood]?.emoji || '😐',
  }));

  // Factors
  const factorMap: Record<string, number> = {};
  moods.forEach(m => m.factors?.forEach(f => { factorMap[f] = (factorMap[f] || 0) + 1; }));
  const factorData = Object.entries(factorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // Heatmap — last 4 weeks
  const heatmapData: { day: string; week: number; score: number; date: string }[] = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let w = 3; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const date = new Date();
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      const key = date.toISOString().split('T')[0];
      const mood = moods.find(m => m.date === key);
      heatmapData.push({ day: dayNames[d], week: 3 - w, score: mood?.moodScore || 0, date: key });
    }
  }

  const heatColor = (score: number) => {
    if (score === 0) return 'bg-muted';
    if (score >= 75) return 'bg-secondary';
    if (score >= 50) return 'bg-primary/30';
    if (score >= 25) return 'bg-primary/50';
    return 'bg-rose-soft/60';
  };

  useEffect(() => {
    if (moods.length < 3) return;
    setLoadingInsight(true);
    const data = moods.slice(-14).map(m => `${m.date}: ${m.mood} (${m.moodScore}), factors: ${m.factors?.join(',')||'none'}`).join('; ');
    callAI(`Based on this mood data: ${data}, generate a 2-paragraph empathetic weekly mental wellness insight. Identify patterns and give one actionable suggestion.`)
      .then(setAiInsight)
      .finally(() => setLoadingInsight(false));
  }, []);

  const ehsColor = ehs >= 70 ? 'text-secondary' : ehs >= 40 ? 'text-primary' : 'text-rose-soft';

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-1">Insights</h1>
        <p className="text-muted-foreground mb-8">Understand your emotional patterns</p>

        {moods.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No mood data yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start logging your moods to see insights here.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {/* EHS */}
            <div className="glass rounded-3xl p-6 flex flex-col items-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Emotional Health Score</p>
              <div className="relative w-28 h-28 mb-2">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <motion.circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - ehs / 100) }}
                    transition={{ duration: 1.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${ehsColor}`}>{ehs}</span>
                </div>
              </div>
            </div>

            {/* Weekly trend */}
            <div className="glass rounded-3xl p-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Weekly Mood Trend</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={last7}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Heatmap */}
            <div className="glass rounded-3xl p-6 md:col-span-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Emotional Heatmap</p>
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map(d => <span key={d} className="text-[9px] text-muted-foreground text-center">{d}</span>)}
                {heatmapData.map((cell, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-md ${heatColor(cell.score)} transition-colors`}
                    title={`${cell.date}: ${cell.score || 'No data'}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 text-[9px] text-muted-foreground">
                <span>Less</span>
                <div className="w-3 h-3 rounded bg-muted" />
                <div className="w-3 h-3 rounded bg-rose-soft/60" />
                <div className="w-3 h-3 rounded bg-primary/30" />
                <div className="w-3 h-3 rounded bg-secondary" />
                <span>More</span>
              </div>
            </div>

            {/* Distribution */}
            {distData.length > 0 && (
              <div className="glass rounded-3xl p-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Mood Distribution</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={distData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {distData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value} times`, name]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {distData.map((d, i) => (
                    <span key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {d.emoji} {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Factors */}
            {factorData.length > 0 && (
              <div className="glass rounded-3xl p-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Top Mood Factors</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={factorData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={80} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* AI Insight */}
            <div className="md:col-span-2 rounded-3xl p-6 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Weekly Insight</p>
              </div>
              {loadingInsight ? (
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-muted rounded-full w-4/5 animate-pulse" />
                  <div className="h-3 bg-muted rounded-full w-3/4 animate-pulse" />
                </div>
              ) : aiInsight ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{aiInsight}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Log at least 3 moods to unlock AI-powered insights about your patterns.</p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
