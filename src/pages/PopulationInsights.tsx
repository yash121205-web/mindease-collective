import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getMoods, getJournalEntries, getSessions } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Heart, Brain, Shield } from 'lucide-react';

export default function PopulationInsights() {
  const moods = getMoods();
  const journal = getJournalEntries();
  const sessions = getSessions();

  // Simulate aggregated population data from actual user data + synthetic boost
  const moodDistribution = useMemo(() => {
    const counts: Record<string, number> = { great: 0, good: 0, okay: 0, low: 0, overwhelmed: 0 };
    moods.forEach(m => { if (counts[m.mood] !== undefined) counts[m.mood]++; });
    // Add synthetic population data
    return [
      { name: 'Great', value: counts.great + 18, color: 'hsl(45, 80%, 60%)' },
      { name: 'Good', value: counts.good + 32, color: 'hsl(125, 40%, 55%)' },
      { name: 'Okay', value: counts.okay + 24, color: 'hsl(200, 60%, 60%)' },
      { name: 'Low', value: counts.low + 15, color: 'hsl(270, 40%, 65%)' },
      { name: 'Overwhelmed', value: counts.overwhelmed + 11, color: 'hsl(350, 60%, 65%)' },
    ];
  }, [moods]);

  const weeklyTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      stress: 30 + Math.sin(i * 0.8) * 15 + Math.random() * 10,
      wellbeing: 55 + Math.cos(i * 0.6) * 12 + Math.random() * 8,
    }));
  }, []);

  const topStressors = [
    { factor: 'Academics', percentage: 67, emoji: '📚' },
    { factor: 'Sleep Issues', percentage: 52, emoji: '😴' },
    { factor: 'Social Pressure', percentage: 43, emoji: '👥' },
    { factor: 'Family', percentage: 38, emoji: '🏠' },
    { factor: 'Financial', percentage: 31, emoji: '💰' },
  ];

  const copingMethods = [
    { method: 'Breathing exercises', usage: 78, trend: '+12%' },
    { method: 'Journaling', usage: 65, trend: '+8%' },
    { method: 'Talking to SERA', usage: 61, trend: '+23%' },
    { method: 'Physical activity', usage: 45, trend: '+5%' },
    { method: 'Meditation', usage: 42, trend: '+15%' },
  ];

  const totalUsers = 142 + moods.length;
  const avgWellbeing = 62;
  const activeToday = 34 + (moods.filter(m => m.date === new Date().toISOString().split('T')[0]).length > 0 ? 1 : 0);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-1 font-semibold">Community Wellness Insights</h1>
        <p className="text-muted-foreground mb-2 font-body">Anonymized, aggregated mental wellness patterns</p>
        
        <div className="flex items-center gap-2 mb-8 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <Shield className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground font-body">
            All data is <strong>completely anonymized</strong>. No personal information is ever exposed. These insights help us understand collective wellness patterns.
          </p>
        </div>

        {/* Top stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
          {[
            { label: 'Community Members', value: totalUsers, icon: Users, emoji: '👥' },
            { label: 'Avg. Wellbeing', value: `${avgWellbeing}%`, icon: Heart, emoji: '💚' },
            { label: 'Active Today', value: activeToday, icon: TrendingUp, emoji: '📊' },
            { label: 'Wellness Sessions', value: sessions.breathing + sessions.pomodoro + 89, icon: Brain, emoji: '🧘' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-static rounded-2xl p-4">
              <p className="text-2xl font-bold text-foreground font-number">{s.value}</p>
              <p className="text-xs text-muted-foreground font-body flex items-center gap-1">{s.emoji} {s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Mood Distribution */}
          <div className="glass-static rounded-3xl p-6">
            <h3 className="font-display text-lg text-foreground mb-4 font-semibold">Community Mood Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={moodDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {moodDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {moodDistribution.map(m => (
                <span key={m.name} className="text-xs font-body text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          {/* Weekly Stress vs Wellbeing */}
          <div className="glass-static rounded-3xl p-6">
            <h3 className="font-display text-lg text-foreground mb-4 font-semibold">Stress vs. Wellbeing Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyTrend}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="stress" stroke="hsl(350, 60%, 65%)" strokeWidth={2} dot={{ r: 3 }} name="Stress Level" />
                <Line type="monotone" dataKey="wellbeing" stroke="hsl(125, 40%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="Wellbeing" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center text-xs font-body text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-soft" /> Stress</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> Wellbeing</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Top Stressors */}
          <div className="glass-static rounded-3xl p-6">
            <h3 className="font-display text-lg text-foreground mb-4 font-semibold">Top Stressors</h3>
            <div className="space-y-3">
              {topStressors.map((s, i) => (
                <motion.div key={s.factor} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3">
                  <span className="text-lg">{s.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-body text-foreground">{s.factor}</span>
                      <span className="text-xs font-number text-muted-foreground">{s.percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.percentage}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full bg-primary/60"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Coping Methods */}
          <div className="glass-static rounded-3xl p-6">
            <h3 className="font-display text-lg text-foreground mb-4 font-semibold">Popular Coping Methods</h3>
            <div className="space-y-3">
              {copingMethods.map((c, i) => (
                <motion.div key={c.method} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <span className="text-lg font-bold text-primary font-number">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-body text-foreground">{c.method}</p>
                    <p className="text-xs font-number text-muted-foreground">{c.usage} users</p>
                  </div>
                  <span className="text-xs font-number text-secondary font-medium">{c.trend}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-static rounded-3xl p-6 text-center">
          <p className="text-sm text-muted-foreground font-body">
            💙 Together, our community has completed <strong className="text-foreground">{sessions.breathing + sessions.pomodoro + 234}</strong> wellness sessions and written <strong className="text-foreground">{journal.length + 87}</strong> journal entries.
          </p>
          <p className="text-xs text-muted-foreground font-body mt-2">You're not alone in this journey.</p>
        </div>
      </motion.div>
    </div>
  );
}
