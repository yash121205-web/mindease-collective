import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Wind, Waves, TreePine, CloudRain, Timer, Minus, Plus } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';
import { useAmbientSound } from '@/hooks/useAmbientSound';

const presets = [
  { id: 'quick', label: 'Quick Calm', duration: 120, icon: '🌿', desc: '2 min breathing reset' },
  { id: 'focus', label: 'Deep Focus', duration: 300, icon: '🧘', desc: '5 min mindful focus' },
  { id: 'sleep', label: 'Sleep Prep', duration: 600, icon: '🌙', desc: '10 min wind-down' },
  { id: 'deep', label: 'Deep Meditation', duration: 900, icon: '🕊️', desc: '15 min deep practice' },
];

const ambientSounds = [
  { id: 'none' as const, label: 'Silence', icon: VolumeX },
  { id: 'rain' as const, label: 'Rain', icon: CloudRain },
  { id: 'forest' as const, label: 'Forest', icon: TreePine },
  { id: 'ocean' as const, label: 'Ocean', icon: Waves },
  { id: 'wind' as const, label: 'Wind', icon: Wind },
];

const breathPatterns = [
  { id: 'box', label: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { id: '478', label: '4-7-8 Calm', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  { id: 'relax', label: 'Deep Relax', inhale: 5, hold1: 2, exhale: 8, hold2: 0 },
];

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';
type SoundType = 'none' | 'rain' | 'forest' | 'ocean' | 'wind';

export default function Meditation() {
  const [selectedPreset, setSelectedPreset] = useState(presets[0]);
  const [selectedSound, setSelectedSound] = useState<SoundType>('none');
  const [selectedBreath, setSelectedBreath] = useState(breathPatterns[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(presets[0].duration);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [customMinutes, setCustomMinutes] = useState<number | null>(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    const stored = localStorage.getItem('mindease_meditation_sessions');
    return stored ? parseInt(stored) : 0;
  });
  const [totalMinutes, setTotalMinutes] = useState(() => {
    const stored = localStorage.getItem('mindease_meditation_minutes');
    return stored ? parseInt(stored) : 0;
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const ambient = useAmbientSound();

  const totalBreathCycle = selectedBreath.inhale + selectedBreath.hold1 + selectedBreath.exhale + selectedBreath.hold2;

  const stopAll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathRef.current) clearInterval(breathRef.current);
    timerRef.current = null;
    breathRef.current = null;
  }, []);

  // Play/stop ambient sound
  useEffect(() => {
    if (isPlaying && selectedSound !== 'none') {
      ambient.play(selectedSound, volume);
    } else {
      ambient.stop();
    }
  }, [isPlaying, selectedSound]);

  // Update volume
  useEffect(() => {
    ambient.setVolume(volume);
  }, [volume]);

  // Timer + breathing
  useEffect(() => {
    if (!isPlaying) { stopAll(); return; }

    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          const newCount = sessionsCompleted + 1;
          setSessionsCompleted(newCount);
          localStorage.setItem('mindease_meditation_sessions', String(newCount));
          const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000);
          const newMins = totalMinutes + elapsed;
          setTotalMinutes(newMins);
          localStorage.setItem('mindease_meditation_minutes', String(newMins));
          toast.success('Session complete! 🧘 Great job being present.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    let breathTime = 0;
    breathRef.current = setInterval(() => {
      breathTime += 0.05;
      const cycleTime = breathTime % totalBreathCycle;
      const { inhale, hold1, exhale, hold2 } = selectedBreath;

      if (cycleTime < inhale) {
        setBreathPhase('inhale');
        setBreathProgress(cycleTime / inhale);
      } else if (cycleTime < inhale + hold1) {
        setBreathPhase('hold1');
        setBreathProgress(1);
      } else if (cycleTime < inhale + hold1 + exhale) {
        setBreathPhase('exhale');
        setBreathProgress(1 - (cycleTime - inhale - hold1) / exhale);
      } else {
        setBreathPhase('hold2');
        setBreathProgress(0);
      }
    }, 50);

    return stopAll;
  }, [isPlaying, selectedBreath, totalBreathCycle, sessionsCompleted, totalMinutes, stopAll]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handlePreset = (p: typeof presets[0]) => {
    setSelectedPreset(p);
    setTimeLeft(p.duration);
    setCustomMinutes(null);
    setIsPlaying(false);
  };

  const handleCustomTime = (delta: number) => {
    const current = customMinutes ?? Math.floor(timeLeft / 60);
    const next = Math.max(1, Math.min(60, current + delta));
    setCustomMinutes(next);
    setTimeLeft(next * 60);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimeLeft(customMinutes ? customMinutes * 60 : selectedPreset.duration);
    setBreathPhase('inhale');
    setBreathProgress(0);
  };

  const breathLabel = breathPhase === 'inhale' ? 'Breathe In' : breathPhase === 'exhale' ? 'Breathe Out' : 'Hold';
  const circleScale = 0.6 + breathProgress * 0.4;
  const progressPct = customMinutes
    ? ((customMinutes * 60 - timeLeft) / (customMinutes * 60)) * 100
    : ((selectedPreset.duration - timeLeft) / selectedPreset.duration) * 100;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <PageHeader title="Guided Meditation" subtitle="Find stillness. Follow your breath." emoji="🧘" gradient="from-primary/10 to-mint/8" />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Controls */}
        <div className="space-y-5">
          {/* Presets */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/90 backdrop-blur-sm rounded-3xl p-5 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Timer className="w-3.5 h-3.5" /> Session Length
            </p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePreset(p)}
                  className={`p-3 rounded-2xl text-left transition-all ${selectedPreset.id === p.id && !customMinutes ? 'bg-primary/10 border border-primary/30 shadow-sm' : 'bg-muted/30 hover:bg-muted/50 border border-transparent'}`}
                >
                  <span className="text-lg mb-1 block">{p.icon}</span>
                  <p className="text-sm font-medium text-foreground">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                </button>
              ))}
            </div>
            {/* Custom time */}
            <div className="mt-3 flex items-center justify-between bg-muted/30 rounded-xl px-4 py-2">
              <span className="text-xs text-muted-foreground">Custom</span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleCustomTime(-1)} className="w-7 h-7 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">
                  <Minus className="w-3.5 h-3.5 text-foreground" />
                </button>
                <span className="text-sm font-medium text-foreground w-12 text-center">{customMinutes ?? Math.floor(timeLeft / 60)} min</span>
                <button onClick={() => handleCustomTime(1)} className="w-7 h-7 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5 text-foreground" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Breathing Pattern */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card/90 backdrop-blur-sm rounded-3xl p-5 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Wind className="w-3.5 h-3.5" /> Breathing Pattern
            </p>
            <div className="space-y-2">
              {breathPatterns.map(bp => (
                <button
                  key={bp.id}
                  onClick={() => setSelectedBreath(bp)}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between ${selectedBreath.id === bp.id ? 'bg-secondary/20 border border-secondary/40' : 'hover:bg-muted/40 border border-transparent'}`}
                >
                  <span className="text-sm font-medium text-foreground">{bp.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">{bp.inhale}-{bp.hold1}-{bp.exhale}{bp.hold2 > 0 ? `-${bp.hold2}` : ''}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Ambient Sounds */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/90 backdrop-blur-sm rounded-3xl p-5 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5" /> Ambient Sound
            </p>
            <div className="flex gap-2 flex-wrap">
              {ambientSounds.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSound(s.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedSound === s.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted/40 border border-transparent'}`}
                >
                  <s.icon className="w-3.5 h-3.5" />{s.label}
                </button>
              ))}
            </div>
            {selectedSound !== 'none' && (
              <div className="mt-3 flex items-center gap-3">
                <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 rounded-full accent-primary bg-muted cursor-pointer"
                />
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card/90 backdrop-blur-sm rounded-3xl p-5 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Sessions completed</p>
              <span className="text-lg font-bold text-foreground">{sessionsCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total minutes</p>
              <span className="text-lg font-bold text-foreground">{totalMinutes}</span>
            </div>
          </motion.div>
        </div>

        {/* Timer Visual */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card/90 backdrop-blur-sm rounded-3xl p-8 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden border border-border/50">
          {/* Background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-secondary/5 blur-3xl" />
          </div>

          {/* Progress ring */}
          <div className="relative mb-8">
            <svg className="absolute inset-0 w-48 h-48 -rotate-90" viewBox="0 0 192 192">
              <circle cx="96" cy="96" r="90" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" opacity="0.3" />
              <circle
                cx="96" cy="96" r="90" fill="none"
                stroke="hsl(var(--primary))" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progressPct / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>

            {/* Breath circle */}
            <motion.div
              animate={{ scale: isPlaying ? circleScale : 0.6 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="w-48 h-48 rounded-full flex items-center justify-center relative"
              style={{
                background: `radial-gradient(circle, hsl(var(--primary) / 0.15), hsl(var(--secondary) / 0.08))`,
                boxShadow: isPlaying ? `0 0 60px hsl(var(--primary) / 0.15)` : 'none',
              }}
            >
              <motion.div
                animate={{ scale: isPlaying ? circleScale * 0.85 : 0.55 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="w-36 h-36 rounded-full flex items-center justify-center"
                style={{ background: `radial-gradient(circle, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.1))` }}
              >
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground tabular-nums">{formatTime(timeLeft)}</p>
                  <AnimatePresence mode="wait">
                    {isPlaying && (
                      <motion.p
                        key={breathPhase}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-primary font-medium mt-1"
                      >
                        {breathLabel}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Breath phase indicator */}
          {isPlaying && (
            <div className="flex gap-1 mb-4">
              {(['inhale', 'hold1', 'exhale', 'hold2'] as BreathPhase[])
                .filter(p => p !== 'hold2' || selectedBreath.hold2 > 0)
                .map(p => (
                  <div
                    key={p}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      breathPhase === p ? 'w-8 bg-primary' : 'w-3 bg-muted'
                    }`}
                  />
                ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4 z-10">
            <button onClick={handleReset} className="p-3 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted transition-all hover:scale-105">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:scale-105 transition-all bg-primary"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>
            <div className="w-11" />
          </div>

          <p className="text-xs text-muted-foreground mt-6 text-center max-w-xs">
            {isPlaying ? `Follow the circle. ${breathLabel.toLowerCase()}...` : 'Press play to begin your session'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
