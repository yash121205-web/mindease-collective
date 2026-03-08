import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Moon as MoonIcon, Sun, Clock, TrendingUp, Sparkles, Plus, BedDouble } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import { callAI } from '@/lib/ai';
import { genId } from '@/lib/storage';
import { toast } from 'sonner';

interface SleepLog {
  id: string; date: string; sleepTime: string; wakeTime: string; quality: number; duration: number; timestamp: number;
}

function getSleepStorageKey(): string {
  const userId = sessionStorage.getItem('mindease_user_id') || 'anonymous';
  return `mindease_${userId}_sleep`;
}
function getSleepLogs(): SleepLog[] {
  try { return JSON.parse(localStorage.getItem(getSleepStorageKey()) || '[]'); } catch { return []; }
}
function saveSleepLog(log: SleepLog) {
  const logs = getSleepLogs(); logs.push(log);
  localStorage.setItem(getSleepStorageKey(), JSON.stringify(logs));
}

const qualityLabels = ['', 'Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];
const qualityEmojis = ['', '😫', '😣', '😐', '😊', '😴'];
const qualityColors = ['', 'hsl(var(--rose-soft))', 'hsl(var(--warm-peach))', 'hsl(var(--primary))', 'hsl(var(--mint))', 'hsl(var(--secondary))'];

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-secondary/15 to-primary/10 flex items-center justify-center">
        <Icon className="w-3 h-3 text-secondary" />
      </div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">{label}</p>
    </div>
  );
}

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

  const avgDuration = logs.length > 0 ? logs.slice(-7).reduce((s, l) => s + l.duration, 0) / Math.min(logs.length, 7) : 0;
  const avgQuality = logs.length > 0 ? logs.slice(-7).reduce((s, l) => s + l.quality, 0) / Math.min(logs.length, 7) : 0;

  const handleLog = async () => {
    const duration = calculateDuration(sleepTime, wakeTime);
    const log: SleepLog = { id: genId(), date: new Date().toISOString().split('T')[0], sleepTime, wakeTime, quality, duration, timestamp: Date.now() };
    saveSleepLog(log);
    setLogs(getSleepLogs());
    setShowForm(false);
    toast.success('Sleep logged! 😴');
    setLoadingInsight(true);
    try {
      const r = await callAI(`User slept from ${sleepTime} to ${wakeTime} (${duration}h), quality: ${qualityLabels[quality]}. Their recent sleep average is ${avgDuration.toFixed(1)}h. Give a warm, brief 2-sentence wellness suggestion about their sleep. Don't start with "I understand".`);
      setInsight(r);
    } catch {
      setInsight(duration < 7
        ? "Your body and mind need more rest to function at their best. Try setting a wind-down alarm 30 minutes before your target bedtime tonight. 🌙"
        : "Great job prioritizing sleep! Consistent rest is one of the most powerful things you can do for your mental health. Keep it up! ✨");
    }
    setLoadingInsight(false);
  };

  const last7 = logs.slice(-7).map(l => ({ day: new Date(l.timestamp).toLocaleDateString([], { weekday: 'short' }), duration: l.duration, quality: l.quality }));
  const last30 = logs.slice(-30).map(l => ({ date: new Date(l.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }), duration: l.duration }));

  // Sleep goal progress (target: 7-9h)
  const goalPct = Math.min(100, Math.round((avgDuration / 8) * 100));

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <PageHeader title="Sleep Tracker" subtitle="Rest is the foundation of wellness" emoji="🌙" gradient="from-secondary/10 to-sky-soft/10" />

      {/* ─── Stats Row ─── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-secondary" />
            <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">Avg Sleep</p>
          </div>
          <p className="text-2xl font-bold text-foreground font-number">{avgDuration.toFixed(1)}<span className="text-sm font-normal text-muted-foreground">h</span></p>
          <div className="mt-2 h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-secondary to-primary" initial={{ width: 0 }} animate={{ width: `${goalPct}%` }} transition={{ duration: 0.6 }} />
          </div>
          <p className="text-[9px] text-muted-foreground font-body mt-1">{goalPct}% of 8h goal</p>
        </div>
        <div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-4 text-center">
          <p className="text-3xl mb-0.5">{qualityEmojis[Math.round(avgQuality)] || '—'}</p>
          <p className="text-[11px] text-muted-foreground font-body">Avg Quality</p>
          <p className="text-xs font-body font-medium text-foreground mt-0.5">{qualityLabels[Math.round(avgQuality)] || '—'}</p>
        </div>
        <div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <BedDouble className="w-3.5 h-3.5 text-primary" />
            <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">Logged</p>
          </div>
          <p className="text-2xl font-bold text-foreground font-number">{logs.length}</p>
          <p className="text-[10px] text-muted-foreground font-body mt-1">nights tracked</p>
        </div>
      </motion.div>

      {/* ─── Log Form ─── */}
      {!showForm ? (
        <motion.button {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }}
          onClick={() => setShowForm(true)}
          className="w-full btn-primary flex items-center justify-center gap-2 mb-6">
          <Plus className="w-4 h-4" /> Log Tonight's Sleep
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="relative bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden mb-6">
          <div className="h-1 bg-gradient-to-r from-secondary via-primary to-mint" />
          <div className="p-5 space-y-4">
            <h3 className="font-display text-base text-foreground font-semibold">Log Sleep</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-muted-foreground font-body font-semibold uppercase tracking-wider mb-1.5 block">Bedtime</label>
                <div className="flex items-center gap-2 bg-muted/30 border border-border/30 rounded-xl px-3 py-2.5">
                  <MoonIcon className="w-4 h-4 text-secondary shrink-0" />
                  <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground font-body focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground font-body font-semibold uppercase tracking-wider mb-1.5 block">Wake Time</label>
                <div className="flex items-center gap-2 bg-muted/30 border border-border/30 rounded-xl px-3 py-2.5">
                  <Sun className="w-4 h-4 text-warm-peach shrink-0" />
                  <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground font-body focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Duration preview */}
            <div className="text-center py-2 rounded-xl bg-secondary/5 border border-secondary/10">
              <p className="text-[11px] text-muted-foreground font-body">Estimated Duration</p>
              <p className="text-lg font-bold font-number text-secondary">{calculateDuration(sleepTime, wakeTime)}h</p>
            </div>

            {/* Quality */}
            <div>
              <label className="text-[11px] text-muted-foreground font-body font-semibold uppercase tracking-wider mb-2 block">Sleep Quality</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(q => (
                  <button key={q} onClick={() => setQuality(q)}
                    className={`flex-1 py-2.5 rounded-xl text-center transition-all border ${
                      quality === q
                        ? 'border-primary/30 bg-primary/10 scale-[1.03] shadow-sm'
                        : 'border-border/30 bg-card hover:bg-muted/30'
                    }`}>
                    <span className="text-xl block">{qualityEmojis[q]}</span>
                    <span className="text-[9px] text-muted-foreground font-body mt-0.5 block">{qualityLabels[q]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-body font-medium hover:bg-muted/50 transition-colors">Cancel</button>
              <button onClick={handleLog} className="flex-1 btn-primary">Log Sleep</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── AI Insight ─── */}
      {(insight || loadingInsight) && (
        <motion.div {...fadeUp} transition={{ duration: 0.4 }}
          className="relative bg-card/90 backdrop-blur-sm border border-primary/15 rounded-2xl overflow-hidden mb-6"
          style={{ background: 'linear-gradient(135deg, hsl(var(--secondary) / 0.04), hsl(var(--card)), hsl(var(--primary) / 0.04))' }}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/15 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">Sleep Insight</span>
            </div>
            {loadingInsight ? (
              <div className="space-y-2">
                <div className="h-3 bg-muted/50 rounded-full w-full animate-pulse" />
                <div className="h-3 bg-muted/50 rounded-full w-3/4 animate-pulse" />
              </div>
            ) : (
              <p className="text-sm text-foreground font-body leading-relaxed">{insight}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── 7-Day Chart ─── */}
      {last7.length > 1 && (
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5 mb-5">
          <SectionLabel icon={TrendingUp} label="7-Day Sleep Duration" />
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={last7} barCategoryGap="20%">
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} hide />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 20px hsl(0 0% 0% / 0.08)' }} />
              <Bar dataKey="duration" radius={[8, 8, 0, 0]} name="Hours" barSize={28}>
                {last7.map((entry, i) => (
                  <Cell key={i} fill={qualityColors[entry.quality] || 'hsl(var(--primary))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground font-body">
            {[1, 3, 5].map(q => (
              <span key={q} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded" style={{ background: qualityColors[q] }} />
                {qualityLabels[q]}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── 30-Day Trend ─── */}
      {last30.length > 3 && (
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5 mb-5">
          <SectionLabel icon={TrendingUp} label="Sleep Trend" />
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={last30}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={Math.floor(last30.length / 5)} />
              <YAxis domain={[0, 12]} hide />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px' }} />
              <Line type="monotone" dataKey="duration" stroke="url(#sleepGrad)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ─── Recent Logs ─── */}
      {logs.length > 0 && (
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5 mb-5">
          <SectionLabel icon={BedDouble} label="Recent Logs" />
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {[...logs].reverse().slice(0, 7).map(l => (
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/15 border border-border/20">
                <span className="text-xl">{qualityEmojis[l.quality]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground font-body font-medium">{l.date} · <span className="font-number">{l.duration}h</span></p>
                  <p className="text-[10px] text-muted-foreground font-body">{l.sleepTime} → {l.wakeTime}</p>
                </div>
                <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-md ${
                  l.quality >= 4 ? 'text-secondary bg-secondary/10' : l.quality >= 3 ? 'text-primary bg-primary/10' : 'text-rose-soft bg-rose-soft/10'
                }`}>{qualityLabels[l.quality]}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Low sleep tip ─── */}
      {avgDuration > 0 && avgDuration < 7 && (
        <motion.div {...fadeUp} className="mb-5 p-4 rounded-2xl bg-rose-soft/5 border border-rose-soft/15 text-center">
          <p className="text-sm text-foreground font-body">
            💡 You're averaging <span className="font-bold font-number text-rose-soft">{avgDuration.toFixed(1)}h</span> — less than 7 hours. Try a wind-down alarm 30 minutes before bedtime.
          </p>
        </motion.div>
      )}

      {/* ─── Why Sleep Matters ─── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.25 }}
        className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-secondary via-primary to-mint" />
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-xl">🧠</span>
            <h3 className="font-display text-base text-foreground font-semibold">Why Sleep Matters for Mental Health</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: '😊', title: 'Improves Mood', desc: 'Quality sleep helps regulate serotonin and dopamine — the chemicals that keep you feeling positive and balanced.' },
              { icon: '🧘', title: 'Emotional Regulation', desc: 'During deep sleep, your brain processes emotional experiences, making it easier to handle stress the next day.' },
              { icon: '🧠', title: 'Memory & Focus', desc: 'REM sleep consolidates memories. Students who sleep 7-8h perform up to 40% better on memory tasks.' },
              { icon: '😰', title: 'Reduces Anxiety', desc: 'Sleep deprivation amplifies the amygdala\'s reaction to negative stimuli by up to 60%.' },
              { icon: '💪', title: 'Builds Resilience', desc: 'Consistent sleep strengthens your prefrontal cortex — responsible for decision-making and emotional resilience.' },
            ].map(item => (
              <div key={item.title} className="flex gap-3 p-3 rounded-xl bg-muted/15 border border-border/15">
                <span className="text-lg shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs font-body font-semibold text-foreground">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground font-body leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-secondary font-body italic mt-4 text-center">
            "Sleep is the single most effective thing you can do to reset your brain and body health each day." — Dr. Matthew Walker
          </p>
        </div>
      </motion.div>
    </div>
  );
}
