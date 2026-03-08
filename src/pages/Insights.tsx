import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getMoods, getJournalEntries, getSessions, getHabits, calculateEHS, MOOD_MAP, getChatHistory } from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { Activity, Sparkles, TrendingUp, Brain, Zap, Heart, Flame, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const COLORS = ['hsl(207 90% 72%)', 'hsl(263 60% 76%)', 'hsl(156 55% 72%)', 'hsl(20 90% 87%)', 'hsl(330 60% 75%)'];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center">
        <Icon className="w-3 h-3 text-primary" />
      </div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">{label}</p>
    </div>
  );
}

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
      data.push({ day: d.toLocaleDateString([], { month: 'short', day: 'numeric' }), score: mood?.moodScore || null, date: key });
    }
    return data;
  }, [moods]);

  // Trend direction
  const trendDirection = useMemo(() => {
    const recent = moods.slice(-7);
    const older = moods.slice(-14, -7);
    if (recent.length < 2 || older.length < 2) return null;
    const recentAvg = recent.reduce((s, m) => s + m.moodScore, 0) / recent.length;
    const olderAvg = older.reduce((s, m) => s + m.moodScore, 0) / older.length;
    return recentAvg - olderAvg;
  }, [moods]);

  // Distribution
  const distData = useMemo(() => {
    const distMap: Record<string, number> = {};
    moods.forEach(m => { distMap[m.mood] = (distMap[m.mood] || 0) + 1; });
    return Object.entries(distMap).map(([mood, count]) => ({
      name: MOOD_MAP[mood]?.label || mood, value: count, emoji: MOOD_MAP[mood]?.emoji || '😐',
    }));
  }, [moods]);

  // Factors
  const factorData = useMemo(() => {
    const factorMap: Record<string, number> = {};
    moods.forEach(m => m.factors?.forEach(f => { factorMap[f] = (factorMap[f] || 0) + 1; }));
    return Object.entries(factorMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));
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

  // Word cloud
  const wordCloudData = useMemo(() => {
    const emotionWords = ['stress', 'anxious', 'happy', 'sad', 'tired', 'overwhelm', 'lonely', 'grateful', 'calm', 'angry', 'worried', 'excited', 'frustrated', 'peaceful', 'nervous', 'hopeful', 'confused', 'motivated', 'exhausted', 'proud', 'afraid', 'content', 'restless', 'inspired'];
    const allText = [...journal.map(j => j.content), ...chatHistory.filter(m => m.role === 'user').map(m => m.content)].join(' ').toLowerCase();
    const freq: Record<string, number> = {};
    emotionWords.forEach(w => { const count = (allText.match(new RegExp(w, 'gi')) || []).length; if (count > 0) freq[w] = count; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [journal, chatHistory]);

  // Peak stress
  const stressAnalysis = useMemo(() => {
    const stressMoods = moods.filter(m => m.moodScore <= 25);
    const dayCount: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    stressMoods.forEach(m => { const d = new Date(m.timestamp); const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]; dayCount[day]++; });
    const peakDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
    return { dayCount: Object.entries(dayCount).map(([name, count]) => ({ name, count })), peakDay: peakDay?.[1] > 0 ? peakDay[0] : null };
  }, [moods]);

  // Correlation
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

  // Stress triggers
  const stressTriggers = useMemo(() => {
    const triggers: Record<string, number> = {};
    moods.filter(m => m.moodScore <= 50).forEach(m => m.factors?.forEach(f => { triggers[f] = (triggers[f] || 0) + 1; }));
    return Object.entries(triggers).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [moods]);

  const heatColor = (score: number) => {
    if (score === 0) return 'bg-muted/40';
    if (score >= 75) return 'bg-secondary';
    if (score >= 50) return 'bg-primary/40';
    if (score >= 25) return 'bg-primary/60';
    return 'bg-rose-soft/70';
  };

  const ehsColor = ehs >= 70 ? 'text-secondary' : ehs >= 40 ? 'text-primary' : 'text-rose-soft';
  const ehsStroke = ehs >= 70 ? 'hsl(var(--secondary))' : ehs >= 40 ? 'hsl(var(--primary))' : 'hsl(var(--rose-soft))';

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
      <PageHeader title="Insights" subtitle="Understand your emotional patterns" emoji="📊" gradient="from-secondary/10 to-primary/8" />

      {moods.length === 0 ? (
        <div className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-3xl p-12 text-center">
          <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-body font-medium">No mood data yet</p>
          <p className="text-sm text-muted-foreground mt-1 font-body">Start logging your moods to see insights here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ─── Hero Stats Row ─── */}
          <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* EHS */}
            <div className="col-span-2 lg:col-span-1 bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5 flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
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
                  <span className={`text-lg font-bold font-number ${ehsColor}`}>{ehs}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">EHS</p>
                <p className="font-display text-sm font-semibold text-foreground mt-0.5">
                  {ehs >= 70 ? 'Thriving 🌟' : ehs >= 40 ? 'Steady 💙' : 'Needs care 🫂'}
                </p>
              </div>
            </div>

            {/* Trend */}
            <div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
              <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider mb-1">Weekly Trend</p>
              <div className="flex items-center gap-1.5">
                {trendDirection !== null ? (
                  <>
                    {trendDirection >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-secondary" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-soft" />
                    )}
                    <span className={`font-number text-lg font-bold ${trendDirection >= 0 ? 'text-secondary' : 'text-rose-soft'}`}>
                      {trendDirection >= 0 ? '+' : ''}{Math.round(trendDirection)}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground font-body">Not enough data</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-body mt-1">vs last week</p>
            </div>

            {/* Total logs */}
            <div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
              <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider mb-1">Mood Logs</p>
              <p className="font-number text-lg font-bold text-foreground">{moods.length}</p>
              <p className="text-[10px] text-muted-foreground font-body mt-1">all time</p>
            </div>

            {/* Journal count */}
            <div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
              <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider mb-1">Journal Entries</p>
              <p className="font-number text-lg font-bold text-foreground">{journal.length}</p>
              <p className="text-[10px] text-muted-foreground font-body mt-1">all time</p>
            </div>
          </motion.div>

          {/* ─── 30-Day Trend Chart ─── */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
            <SectionLabel icon={TrendingUp} label="30-Day Mood Trend" />
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={last30.filter(d => d.score !== null)}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 20px hsl(0 0% 0% / 0.08)' }} />
                <Line type="monotone" dataKey="score" stroke="url(#lineGrad)" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 2.5, strokeWidth: 0 }} activeDot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--card))' }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ─── Heatmap ─── */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
            <SectionLabel icon={Flame} label="Emotional Heatmap" />
            <div className="grid grid-cols-7 gap-1.5">
              {dayNames.map(d => <span key={d} className="text-[10px] text-muted-foreground text-center font-body font-medium">{d}</span>)}
              {heatmapData.map((cell, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.008 }}
                  className={`aspect-square rounded-lg ${heatColor(cell.score)} transition-colors cursor-default`}
                  title={`${cell.date}: ${cell.score || 'No data'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground font-body">
              <span>Less</span>
              <div className="w-3 h-3 rounded bg-muted/40" />
              <div className="w-3 h-3 rounded bg-rose-soft/70" />
              <div className="w-3 h-3 rounded bg-primary/40" />
              <div className="w-3 h-3 rounded bg-secondary" />
              <span>More</span>
            </div>
          </motion.div>

          {/* ─── Distribution + Factors Row ─── */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Distribution */}
            {distData.length > 0 && (
              <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }}
                className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
                <SectionLabel icon={Activity} label="Mood Distribution" />
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={distData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {distData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 20px hsl(0 0% 0% / 0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                  {distData.map((d, i) => (
                    <span key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-body">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      {d.emoji} {d.name} <span className="font-number text-foreground/70">({d.value})</span>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Factors */}
            {factorData.length > 0 && (
              <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
                <SectionLabel icon={Heart} label="Top Mood Factors" />
                <div className="space-y-2.5 mt-1">
                  {factorData.map((f, i) => {
                    const maxCount = factorData[0]?.count || 1;
                    return (
                      <div key={f.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-body text-foreground font-medium">{f.name}</span>
                          <span className="text-[10px] font-number text-muted-foreground">{f.count}×</span>
                        </div>
                        <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(f.count / maxCount) * 100}%` }}
                            transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                            className="h-full rounded-full"
                            style={{ background: COLORS[i % COLORS.length] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* ─── Word Cloud + Stress Row ─── */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Emotion Word Cloud */}
            {wordCloudData.length > 0 && (
              <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.25 }}
                className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
                <SectionLabel icon={Brain} label="Emotion Word Cloud" />
                <div className="flex flex-wrap gap-2 justify-center py-4">
                  {wordCloudData.map(([word, count], i) => (
                    <motion.span
                      key={word}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      className="font-display font-semibold px-2 py-0.5 rounded-lg transition-all hover:scale-110"
                      style={{
                        fontSize: `${Math.max(13, Math.min(26, 13 + count * 3.5))}px`,
                        color: COLORS[i % COLORS.length],
                        background: `${COLORS[i % COLORS.length]}15`,
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Peak Stress */}
            {stressAnalysis.peakDay && (
              <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
                <SectionLabel icon={Zap} label="Stress Patterns" />
                <p className="text-sm text-foreground font-body mb-3">
                  Peak stress day: <span className="font-semibold text-rose-soft">{stressAnalysis.peakDay}s</span>
                </p>
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={stressAnalysis.dayCount}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Bar dataKey="count" fill="hsl(var(--rose-soft))" radius={[6, 6, 0, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {/* ─── Correlation + Triggers Row ─── */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Mood vs Habit Correlation */}
            {(correlation.avgWith !== null || correlation.avgWithout !== null) && (
              <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.35 }}
                className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
                <SectionLabel icon={Activity} label="Mood vs. Habits" />
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 text-center p-4 rounded-xl bg-secondary/8 border border-secondary/15">
                    <p className="text-2xl font-bold font-number text-foreground">{correlation.avgWith || '—'}</p>
                    <p className="text-[10px] text-muted-foreground font-body mt-1">With habits ✅</p>
                  </div>
                  <div className="text-muted-foreground/50 font-display text-sm font-bold">vs</div>
                  <div className="flex-1 text-center p-4 rounded-xl bg-rose-soft/8 border border-rose-soft/15">
                    <p className="text-2xl font-bold font-number text-foreground">{correlation.avgWithout || '—'}</p>
                    <p className="text-[10px] text-muted-foreground font-body mt-1">Without habits</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-body mt-3 text-center leading-relaxed">
                  {correlation.avgWith && correlation.avgWithout && correlation.avgWith > correlation.avgWithout
                    ? `✨ Habits boost your mood by ${correlation.avgWith - correlation.avgWithout} points!`
                    : 'Keep tracking to see the impact of your habits.'}
                </p>
              </motion.div>
            )}

            {/* Stress Triggers */}
            {stressTriggers.length > 0 && (
              <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
                <SectionLabel icon={Zap} label="Top Stress Triggers" />
                <div className="space-y-2 mt-1">
                  {stressTriggers.map(([factor, count], i) => (
                    <div key={factor} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/20">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{i === 0 ? '🔴' : i === 1 ? '🟠' : '🟡'}</span>
                        <span className="text-sm font-body font-medium text-foreground">{factor}</span>
                      </div>
                      <span className="text-xs font-number text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">{count}×</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ─── SERA Weekly Insight ─── */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.45 }}
            className="relative rounded-2xl p-6 border border-primary/15 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--card)), hsl(var(--mint) / 0.06))' }}
          >
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />

            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground font-body">SERA's Weekly Insight</p>
                  <p className="text-[10px] text-muted-foreground font-body">AI-generated emotional analysis</p>
                </div>
              </div>
              {aiInsight ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-foreground leading-relaxed whitespace-pre-line font-body">
                  {aiInsight}
                </motion.p>
              ) : loadingInsight ? (
                <div className="space-y-2.5">
                  <div className="h-3 bg-muted/50 rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-muted/50 rounded-full w-4/5 animate-pulse" />
                  <div className="h-3 bg-muted/50 rounded-full w-3/5 animate-pulse" />
                </div>
              ) : (
                <button onClick={generateInsight} className="btn-primary text-sm">
                  ✨ Generate This Week's Insight
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
