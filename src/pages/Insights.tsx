import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getMoods, getJournalEntries, getSessions, getHabits, getTodayHabits, calculateEHS, MOOD_MAP, getChatHistory } from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { Activity, Sparkles, BarChart3, TrendingUp, Brain, Zap } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const COLORS = ['hsl(330 100% 85%)', 'hsl(197 88% 66%)', 'hsl(45 90% 70%)', 'hsl(270 40% 80%)', 'hsl(0 70% 80%)'];

export default function Insights() {
  const moods = getMoods();
  const ehs = calculateEHS();
  const journal = getJournalEntries();
  const chatHistory = getChatHistory();
  const allHabits = getHabits();
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  // 30-day trend
  const last30 = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const mood = moods.find(m => m.date === key);
      data.push({
        day: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        score: mood?.moodScore || null,
        date: key,
      });
    }
    return data;
  }, [moods]);

  const last7 = last30.slice(-7);

  // Distribution
  const distData = useMemo(() => {
    const distMap: Record<string, number> = {};
    moods.forEach(m => { distMap[m.mood] = (distMap[m.mood] || 0) + 1; });
    return Object.entries(distMap).map(([mood, count]) => ({
      name: MOOD_MAP[mood]?.label || mood,
      value: count,
      emoji: MOOD_MAP[mood]?.emoji || '😐',
    }));
  }, [moods]);

  // Factors
  const factorData = useMemo(() => {
    const factorMap: Record<string, number> = {};
    moods.forEach(m => m.factors?.forEach(f => { factorMap[f] = (factorMap[f] || 0) + 1; }));
    return Object.entries(factorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [moods]);

  // Heatmap
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapData = useMemo(() => {
    const data: { day: string; week: number; score: number; date: string }[] = [];
    for (let w = 3; w >= 0; w--) {
      for (let d = 0; d < 7; d++) {
        const date = new Date();
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const key = date.toISOString().split('T')[0];
        const mood = moods.find(m => m.date === key);
        data.push({ day: dayNames[d], week: 3 - w, score: mood?.moodScore || 0, date: key });
      }
    }
    return data;
  }, [moods]);

  // Word cloud from journals + chats
  const wordCloudData = useMemo(() => {
    const emotionWords = ['stress', 'anxious', 'happy', 'sad', 'tired', 'overwhelm', 'lonely', 'grateful', 'calm', 'angry', 'worried', 'excited', 'frustrated', 'peaceful', 'nervous', 'hopeful', 'confused', 'motivated', 'exhausted', 'proud', 'afraid', 'content', 'restless', 'inspired'];
    const allText = [...journal.map(j => j.content), ...chatHistory.filter(m => m.role === 'user').map(m => m.content)].join(' ').toLowerCase();
    const freq: Record<string, number> = {};
    emotionWords.forEach(w => {
      const count = (allText.match(new RegExp(w, 'gi')) || []).length;
      if (count > 0) freq[w] = count;
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [journal, chatHistory]);

  // Peak stress analysis
  const stressAnalysis = useMemo(() => {
    const stressMoods = moods.filter(m => m.moodScore <= 25);
    const dayCount: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    stressMoods.forEach(m => {
      const d = new Date(m.timestamp);
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      dayCount[day]++;
    });
    const peakDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
    return { dayCount: Object.entries(dayCount).map(([name, count]) => ({ name, count })), peakDay: peakDay?.[1] > 0 ? peakDay[0] : null };
  }, [moods]);

  // Mood vs habit correlation
  const correlation = useMemo(() => {
    const withHabits: number[] = [];
    const withoutHabits: number[] = [];
    moods.forEach(m => {
      const dayHabits = allHabits[m.date];
      if (dayHabits) {
        const completed = Object.values(dayHabits).filter(Boolean).length;
        if (completed >= 4) withHabits.push(m.moodScore);
        else withoutHabits.push(m.moodScore);
      }
    });
    const avgWith = withHabits.length > 0 ? Math.round(withHabits.reduce((a, b) => a + b, 0) / withHabits.length) : null;
    const avgWithout = withoutHabits.length > 0 ? Math.round(withoutHabits.reduce((a, b) => a + b, 0) / withoutHabits.length) : null;
    return { avgWith, avgWithout };
  }, [moods, allHabits]);

  // Top stress triggers
  const stressTriggers = useMemo(() => {
    const triggers: Record<string, number> = {};
    moods.filter(m => m.moodScore <= 50).forEach(m => m.factors?.forEach(f => { triggers[f] = (triggers[f] || 0) + 1; }));
    return Object.entries(triggers).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [moods]);

  const heatColor = (score: number) => {
    if (score === 0) return 'bg-muted';
    if (score >= 75) return 'bg-secondary';
    if (score >= 50) return 'bg-primary/30';
    if (score >= 25) return 'bg-primary/50';
    return 'bg-rose-soft/60';
  };

  const ehsColor = ehs >= 70 ? 'text-secondary' : ehs >= 40 ? 'text-primary' : 'text-rose-soft';

  const generateInsight = async () => {
    setLoadingInsight(true);
    const data = moods.slice(-14).map(m => `${m.date}: ${m.mood} (${m.moodScore}), factors: ${m.factors?.join(',') || 'none'}`).join('; ');
    try {
      const r = await callAI(`Based on this week's wellness data for a student:\nMoods logged: [${data}]\nHabits completed: ${Object.keys(allHabits).length} days tracked\nJournal entries: ${journal.length}\nBreathing sessions: ${getSessions().breathing}\n\nWrite a warm, insightful 3-paragraph weekly narrative:\n(1) What patterns you notice in their emotional week\n(2) What they should celebrate (genuine, specific)\n(3) One focus area and concrete suggestion for next week.\nSpeak directly to the user as SERA.`);
      setAiInsight(r);
    } catch {
      setAiInsight("Based on your recent activity, you're showing great consistency in checking in with yourself. That self-awareness is a real strength. Keep building on the habits that feel most natural to you — consistency matters more than perfection. 💙");
    }
    setLoadingInsight(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-1 font-semibold">Insights</h1>
        <p className="text-muted-foreground mb-8 font-body">Understand your emotional patterns</p>

        {moods.length === 0 ? (
          <div className="glass-static rounded-3xl p-12 text-center">
            <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-body font-medium">No mood data yet</p>
            <p className="text-sm text-muted-foreground mt-1 font-body">Start logging your moods to see insights here.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {/* EHS */}
            <div className="glass-static rounded-3xl p-6 flex flex-col items-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Emotional Health Score</p>
              <div className="relative w-28 h-28 mb-2">
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
            </div>

            {/* 30-day trend */}
            <div className="glass-static rounded-3xl p-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 30-Day Mood Trend</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={last30.filter(d => d.score !== null)}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 2 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Heatmap */}
            <div className="glass-static rounded-3xl p-6 md:col-span-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Emotional Heatmap</p>
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map(d => <span key={d} className="text-[9px] text-muted-foreground text-center font-body">{d}</span>)}
                {heatmapData.map((cell, i) => (
                  <div key={i} className={`aspect-square rounded-md ${heatColor(cell.score)} transition-colors cursor-default`}
                    title={`${cell.date}: ${cell.score || 'No data'}`} />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 text-[9px] text-muted-foreground font-body">
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
              <div className="glass-static rounded-3xl p-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Mood Distribution</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={distData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {distData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {distData.map((d, i) => (
                    <span key={i} className="text-[10px] text-muted-foreground flex items-center gap-1 font-body">
                      <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {d.emoji} {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Factors */}
            {factorData.length > 0 && (
              <div className="glass-static rounded-3xl p-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Top Mood Factors</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={factorData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={80} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Emotion Word Cloud */}
            {wordCloudData.length > 0 && (
              <div className="glass-static rounded-3xl p-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body flex items-center gap-1"><Brain className="w-3 h-3" /> Emotion Word Cloud</p>
                <div className="flex flex-wrap gap-2 justify-center py-4">
                  {wordCloudData.map(([word, count], i) => (
                    <span key={word} className="font-body font-medium transition-all" style={{
                      fontSize: `${Math.max(12, Math.min(28, 12 + count * 4))}px`,
                      color: i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--mint))',
                      opacity: 0.7 + (count / (wordCloudData[0]?.[1] || 1)) * 0.3,
                    }}>
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Peak Stress Analysis */}
            {stressAnalysis.peakDay && (
              <div className="glass-static rounded-3xl p-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body flex items-center gap-1"><Zap className="w-3 h-3" /> Stress Patterns</p>
                <p className="text-sm text-foreground font-body mb-3">
                  You tend to feel most stressed on <strong>{stressAnalysis.peakDay}s</strong>.
                </p>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={stressAnalysis.dayCount}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Bar dataKey="count" fill="hsl(var(--rose-soft))" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Mood vs Habit Correlation */}
            {(correlation.avgWith !== null || correlation.avgWithout !== null) && (
              <div className="glass-static rounded-3xl p-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Mood vs. Habits</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center p-3 rounded-xl bg-secondary/10">
                    <p className="text-2xl font-bold font-number text-foreground">{correlation.avgWith || '—'}</p>
                    <p className="text-[10px] text-muted-foreground font-body">With habits</p>
                  </div>
                  <span className="text-muted-foreground font-body">vs</span>
                  <div className="flex-1 text-center p-3 rounded-xl bg-rose-soft/10">
                    <p className="text-2xl font-bold font-number text-foreground">{correlation.avgWithout || '—'}</p>
                    <p className="text-[10px] text-muted-foreground font-body">Without habits</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-body mt-3 text-center">
                  {correlation.avgWith && correlation.avgWithout && correlation.avgWith > correlation.avgWithout
                    ? `Habits boost your mood by ${correlation.avgWith - correlation.avgWithout} points! Keep it up.`
                    : 'Keep tracking to see the impact of your habits.'}
                </p>
              </div>
            )}

            {/* Stress Triggers */}
            {stressTriggers.length > 0 && (
              <div className="glass-static rounded-3xl p-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Top Stress Triggers</p>
                <div className="space-y-2">
                  {stressTriggers.map(([factor, count], i) => (
                    <div key={factor} className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
                      <span className="text-sm font-body text-foreground">{factor}</span>
                      <span className="text-xs font-number text-muted-foreground">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SERA Weekly Insight */}
            <div className="md:col-span-2 rounded-3xl p-6 border border-border"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--card)), hsl(var(--mint) / 0.08))' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body">SERA's Weekly Insight</p>
              </div>
              {aiInsight ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-foreground leading-relaxed whitespace-pre-line font-body">
                  {aiInsight}
                </motion.p>
              ) : loadingInsight ? (
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-muted rounded-full w-4/5 animate-pulse" />
                  <div className="h-3 bg-muted rounded-full w-3/4 animate-pulse" />
                </div>
              ) : (
                <button onClick={generateInsight} className="btn-primary">
                  Generate This Week's Insight
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
