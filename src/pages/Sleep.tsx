import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Moon as MoonIcon, Sun, Clock, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { callAI } from '@/lib/ai';
import { genId } from '@/lib/storage';
import { toast } from 'sonner';

interface SleepLog {
  id: string;
  date: string;
  sleepTime: string;
  wakeTime: string;
  quality: number; // 1-5
  duration: number; // hours
  timestamp: number;
}

function getSleepLogs(): SleepLog[] {
  try { return JSON.parse(localStorage.getItem('mindease_sleep') || '[]'); } catch { return []; }
}
function saveSleepLog(log: SleepLog) {
  const logs = getSleepLogs();
  logs.push(log);
  localStorage.setItem('mindease_sleep', JSON.stringify(logs));
}

const qualityLabels = ['', 'Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];
const qualityEmojis = ['', '😫', '😣', '😐', '😊', '😴'];
const qualityColors = ['', 'hsl(350,60%,65%)', 'hsl(30,70%,60%)', 'hsl(45,70%,55%)', 'hsl(125,40%,55%)', 'hsl(200,60%,55%)'];

export default function Sleep() {
  const [logs, setLogs] = useState<SleepLog[]>(getSleepLogs);
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(3);
  const [showForm, setShowForm] = useState(false);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  const calculateDuration = (sleep: string, wake: string): number => {
    const [sh, sm] = sleep.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let sleepMin = sh * 60 + sm;
    let wakeMin = wh * 60 + wm;
    if (wakeMin <= sleepMin) wakeMin += 24 * 60;
    return Math.round((wakeMin - sleepMin) / 60 * 10) / 10;
  };

  const handleLog = async () => {
    const duration = calculateDuration(sleepTime, wakeTime);
    const log: SleepLog = {
      id: genId(),
      date: new Date().toISOString().split('T')[0],
      sleepTime,
      wakeTime,
      quality,
      duration,
      timestamp: Date.now(),
    };
    saveSleepLog(log);
    setLogs(getSleepLogs());
    setShowForm(false);
    toast.success('Sleep logged! 😴');

    // Generate insight
    setLoadingInsight(true);
    try {
      const r = await callAI(
        `User slept from ${sleepTime} to ${wakeTime} (${duration}h), quality: ${qualityLabels[quality]}. Their recent sleep average is ${avgDuration.toFixed(1)}h. Give a warm, brief 2-sentence wellness suggestion about their sleep. Don't start with "I understand".`
      );
      setInsight(r);
    } catch {
      setInsight(duration < 7
        ? "Your body and mind need more rest to function at their best. Try setting a wind-down alarm 30 minutes before your target bedtime tonight. 🌙"
        : "Great job prioritizing sleep! Consistent rest is one of the most powerful things you can do for your mental health. Keep it up! ✨"
      );
    }
    setLoadingInsight(false);
  };

  const last7 = logs.slice(-7).map(l => ({
    day: new Date(l.timestamp).toLocaleDateString([], { weekday: 'short' }),
    duration: l.duration,
    quality: l.quality,
  }));

  const last30 = logs.slice(-30).map(l => ({
    date: new Date(l.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    duration: l.duration,
  }));

  const avgDuration = logs.length > 0 ? logs.slice(-7).reduce((s, l) => s + l.duration, 0) / Math.min(logs.length, 7) : 0;
  const avgQuality = logs.length > 0 ? logs.slice(-7).reduce((s, l) => s + l.quality, 0) / Math.min(logs.length, 7) : 0;

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-1 font-semibold">Sleep Tracker</h1>
        <p className="text-muted-foreground mb-6 font-body">Rest is the foundation of wellness</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-static rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground font-number">{avgDuration.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground font-body">Avg Sleep</p>
          </div>
          <div className="glass-static rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{qualityEmojis[Math.round(avgQuality)] || '—'}</p>
            <p className="text-xs text-muted-foreground font-body">Avg Quality</p>
          </div>
          <div className="glass-static rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground font-number">{logs.length}</p>
            <p className="text-xs text-muted-foreground font-body">Nights Logged</p>
          </div>
        </div>

        {/* Log button */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="w-full btn-primary flex items-center justify-center gap-2 mb-6">
            <Plus className="w-4 h-4" /> Log Tonight's Sleep
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-static rounded-3xl p-6 mb-6 space-y-4">
            <h3 className="font-display text-lg text-foreground font-semibold">Log Sleep</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Bedtime</label>
                <div className="flex items-center gap-2">
                  <MoonIcon className="w-4 h-4 text-primary" />
                  <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)}
                    className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Wake Time</label>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-secondary" />
                  <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
                    className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-body mb-2 block">Sleep Quality</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(q => (
                  <button key={q} onClick={() => setQuality(q)}
                    className={`flex-1 py-2 rounded-xl text-center transition-all ${
                      quality === q ? 'ring-2 ring-primary bg-primary/10 scale-105' : 'bg-muted hover:bg-muted/80'
                    }`}>
                    <span className="text-lg block">{qualityEmojis[q]}</span>
                    <span className="text-[10px] text-muted-foreground font-body">{qualityLabels[q]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground font-body">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              Duration: <strong className="text-foreground">{calculateDuration(sleepTime, wakeTime)}h</strong>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-body font-medium">Cancel</button>
              <button onClick={handleLog} className="flex-1 btn-primary">Log Sleep</button>
            </div>
          </motion.div>
        )}

        {/* Insight */}
        {(insight || loadingInsight) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-static rounded-3xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body">Sleep Insight</span>
            </div>
            {loadingInsight ? (
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
              </div>
            ) : (
              <p className="text-sm text-foreground font-body leading-relaxed">{insight}</p>
            )}
          </motion.div>
        )}

        {/* 7-day chart */}
        {last7.length > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-static rounded-3xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body">7-Day Sleep Duration</p>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={last7}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 12]} hide />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="duration" radius={[6, 6, 0, 0]} name="Hours">
                  {last7.map((entry, i) => (
                    <Cell key={i} fill={qualityColors[entry.quality] || 'hsl(var(--primary))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* 30-day trend */}
        {last30.length > 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-static rounded-3xl p-5 mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Sleep Trend</p>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={last30}>
                <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={Math.floor(last30.length / 5)} />
                <YAxis domain={[0, 12]} hide />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="duration" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Recent logs */}
        {logs.length > 0 && (
          <div className="glass-static rounded-3xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Recent Logs</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[...logs].reverse().slice(0, 7).map(l => (
                <div key={l.id} className="flex items-center gap-3 p-2 rounded-xl bg-muted/30">
                  <span className="text-lg">{qualityEmojis[l.quality]}</span>
                  <div className="flex-1">
                    <p className="text-xs text-foreground font-body font-medium">{l.date} · {l.duration}h</p>
                    <p className="text-[10px] text-muted-foreground font-body">{l.sleepTime} → {l.wakeTime}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-body">{qualityLabels[l.quality]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        {avgDuration > 0 && avgDuration < 7 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-primary font-body italic">
              💡 You're averaging less than 7 hours. Try setting a "wind-down" alarm 30 minutes before your target bedtime.
            </p>
          </div>
        )}

        {/* Why Sleep Matters for Mental Health */}
        <div className="glass-static rounded-3xl p-6 mt-6">
          <h3 className="font-display text-lg text-foreground font-semibold mb-4">🧠 Why Sleep Matters for Mental Health</h3>
          <div className="space-y-3">
            {[
              { icon: '😊', title: 'Sleep Improves Mood', desc: 'Quality sleep helps regulate serotonin and dopamine — the chemicals that keep you feeling positive and emotionally balanced throughout the day.' },
              { icon: '🧘', title: 'Sleep Helps Emotional Regulation', desc: 'During deep sleep, your brain processes emotional experiences, making it easier to handle stress and respond calmly to challenges the next day.' },
              { icon: '🧠', title: 'Sleep Improves Memory & Focus', desc: 'REM sleep consolidates memories and clears brain toxins. Students who sleep 7-8 hours perform up to 40% better on memory tasks than those who pull all-nighters.' },
              { icon: '😰', title: 'Poor Sleep Increases Stress & Anxiety', desc: 'Sleep deprivation amplifies the amygdala\'s reaction to negative stimuli by up to 60%, making everything feel more threatening and stressful.' },
              { icon: '💪', title: 'Sleep Builds Resilience', desc: 'Consistent restful sleep strengthens your prefrontal cortex — the part of your brain responsible for decision-making, impulse control, and emotional resilience.' },
            ].map(item => (
              <div key={item.title} className="flex gap-3 p-3 rounded-xl bg-muted/30">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-body font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-primary font-body italic mt-4 text-center">
            "Sleep is the single most effective thing you can do to reset your brain and body health each day." — Dr. Matthew Walker
          </p>
        </div>
      </motion.div>
    </div>
  );
}
