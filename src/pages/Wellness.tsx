import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getTodayMood, getSessions, saveSessions } from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { Wind, Play, Pause, RotateCcw, Timer, Volume2, VolumeX, Sparkles } from 'lucide-react';

const categories: Record<string, string> = { mindfulness: '🧘', movement: '🏃', learning: '📖', music: '🎵', rest: '😴' };

interface Suggestion { title: string; description: string; duration: string; category: string; }

export default function Wellness() {
  const todayMood = getTodayMood();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSugg, setLoadingSugg] = useState(false);

  // Breathing
  const [breathing, setBreathing] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [breathTimer, setBreathTimer] = useState(0);
  const breathRef = useRef<ReturnType<typeof setInterval>>();
  const phaseRef = useRef<ReturnType<typeof setTimeout>>();

  // Pomodoro
  const [pomoActive, setPomActive] = useState(false);
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoLabel, setPomoLabel] = useState('');
  const [isBreak, setIsBreak] = useState(false);
  const pomoRef = useRef<ReturnType<typeof setInterval>>();

  const [soundOn, setSoundOn] = useState(false);

  // Load suggestions
  useEffect(() => {
    const mood = todayMood?.mood || 'okay';
    setLoadingSugg(true);
    callAI(
      `User mood: "${mood}". Suggest 3 specific wellness activities for a student. Return ONLY valid JSON array: [{"title":"...","description":"...","duration":"...","category":"mindfulness|movement|learning|music|rest"}]`,
      'You are a wellness advisor. Return ONLY valid JSON, no extra text.'
    ).then(r => {
      try {
        const match = r.match(/\[[\s\S]*\]/);
        if (match) setSuggestions(JSON.parse(match[0]));
        else throw new Error();
      } catch {
        setSuggestions([
          { title: 'Box Breathing', description: 'A calming 4-4-6-2 breathing pattern to reduce stress', duration: '5 min', category: 'mindfulness' },
          { title: 'Quick Walk', description: 'Step outside for fresh air and gentle movement', duration: '10 min', category: 'movement' },
          { title: 'Gratitude Journaling', description: 'Write 3 things you are grateful for right now', duration: '5 min', category: 'learning' },
        ]);
      }
    }).finally(() => setLoadingSugg(false));
  }, []);

  // Breathing logic
  const phaseConfig = { inhale: { dur: 4000, next: 'hold1' as const, label: 'Inhale' }, hold1: { dur: 4000, next: 'exhale' as const, label: 'Hold' }, exhale: { dur: 6000, next: 'hold2' as const, label: 'Exhale' }, hold2: { dur: 2000, next: 'inhale' as const, label: 'Hold' } };

  const startBreathing = () => {
    setBreathing(true);
    setPhase('inhale');
    const tick = () => setBreathTimer(t => t + 1);
    breathRef.current = setInterval(tick, 1000);
    runPhase('inhale');
  };

  const runPhase = (p: 'inhale' | 'hold1' | 'exhale' | 'hold2') => {
    setPhase(p);
    if (p === 'inhale') setBreathCount(c => c + 1);
    phaseRef.current = setTimeout(() => {
      const next = phaseConfig[p].next;
      runPhase(next);
    }, phaseConfig[p].dur);
  };

  const stopBreathing = () => {
    setBreathing(false);
    clearInterval(breathRef.current);
    clearTimeout(phaseRef.current);
    const s = getSessions();
    s.breathing += breathCount;
    saveSessions(s);
  };

  const resetBreathing = () => {
    stopBreathing();
    setBreathCount(0);
    setBreathTimer(0);
    setPhase('inhale');
  };

  // Pomodoro
  useEffect(() => {
    if (pomoActive && pomoTime > 0) {
      pomoRef.current = setInterval(() => setPomoTime(t => t - 1), 1000);
      return () => clearInterval(pomoRef.current);
    }
    if (pomoTime === 0 && pomoActive) {
      setPomActive(false);
      if (!isBreak) {
        const s = getSessions();
        s.pomodoro += 1;
        saveSessions(s);
        setIsBreak(true);
        setPomoTime(5 * 60);
      } else {
        setIsBreak(false);
        setPomoTime(25 * 60);
      }
    }
  }, [pomoActive, pomoTime]);

  const formatTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const pomoProgress = isBreak ? (5 * 60 - pomoTime) / (5 * 60) : (25 * 60 - pomoTime) / (25 * 60);
  const sessions = getSessions();

  const breathScale = phase === 'inhale' ? 1.5 : phase === 'exhale' ? 1 : (phase === 'hold1' ? 1.5 : 1);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-1">Wellness</h1>
        <p className="text-muted-foreground mb-8">Nurture your mind and body</p>

        {/* AI Suggestions */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Personalized For You</h2>
          </div>
          {loadingSugg ? (
            <div className="grid gap-3 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass rounded-2xl p-5 space-y-2">
                  <div className="h-4 bg-muted rounded-full w-2/3 animate-pulse" />
                  <div className="h-3 bg-muted rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-muted rounded-full w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {suggestions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-5">
                  <span className="text-2xl">{categories[s.category] || '✨'}</span>
                  <h3 className="font-semibold text-foreground mt-2">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                  <span className="inline-block mt-3 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{s.duration}</span>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Breathing */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Guided Breathing</h2>
          </div>
          <div className="glass rounded-3xl p-8 flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <motion.div
                animate={{ scale: breathScale }}
                transition={{ duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, hsl(var(--primary) / 0.2), hsl(var(--mint) / 0.1))` }}
              />
              <motion.div
                animate={{ scale: breathScale * 0.7 }}
                transition={{ duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 0.3, ease: 'easeInOut' }}
                className="absolute inset-4 rounded-full"
                style={{ background: `radial-gradient(circle, hsl(var(--primary) / 0.3), hsl(var(--mint) / 0.15))` }}
              />
              <span className="relative z-10 font-display text-lg text-foreground">
                {breathing ? phaseConfig[phase].label : 'Ready'}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-3">
              {!breathing ? (
                <button onClick={startBreathing} className="px-6 py-2 rounded-2xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"><Play className="w-4 h-4" /> Start</button>
              ) : (
                <button onClick={stopBreathing} className="px-6 py-2 rounded-2xl bg-muted text-foreground text-sm font-medium flex items-center gap-2"><Pause className="w-4 h-4" /> Pause</button>
              )}
              <button onClick={resetBreathing} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><RotateCcw className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <span>{formatTimer(breathTimer)}</span>
              <span>{breathCount} breaths</span>
              <span>{sessions.breathing + breathCount} total today</span>
            </div>
          </div>
        </section>

        {/* Pomodoro */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Focus Mode (Pomodoro)</h2>
          </div>
          <div className="glass rounded-3xl p-8 flex flex-col items-center">
            <div className="relative w-36 h-36 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pomoProgress) }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground font-body">{formatTimer(pomoTime)}</span>
                <span className="text-[10px] text-muted-foreground">{isBreak ? 'Break' : 'Focus'}</span>
              </div>
            </div>

            <input
              value={pomoLabel}
              onChange={(e) => setPomoLabel(e.target.value)}
              placeholder="What are you working on?"
              className="bg-muted rounded-xl px-3 py-2 text-xs text-foreground text-center mb-3 w-56 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setPomActive(!pomoActive)}
                className="px-5 py-2 rounded-2xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"
              >
                {pomoActive ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
              </button>
              <button
                onClick={() => { setPomActive(false); setPomoTime(isBreak ? 5 * 60 : 25 * 60); }}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSoundOn(!soundOn)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground"
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Completed {sessions.pomodoro} sessions today</p>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
