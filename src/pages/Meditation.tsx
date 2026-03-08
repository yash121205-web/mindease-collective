import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Leaf, Wind, Waves, TreePine, CloudRain, Timer } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

const presets = [
  { id: 'quick', label: 'Quick Calm', duration: 120, icon: '🌿', desc: '2 min breathing reset' },
  { id: 'focus', label: 'Deep Focus', duration: 300, icon: '🧘', desc: '5 min mindful focus' },
  { id: 'sleep', label: 'Sleep Prep', duration: 600, icon: '🌙', desc: '10 min wind-down' },
  { id: 'deep', label: 'Deep Meditation', duration: 900, icon: '🕊️', desc: '15 min deep practice' },
];

const ambientSounds = [
  { id: 'none', label: 'Silence', icon: VolumeX },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'forest', label: 'Forest', icon: TreePine },
  { id: 'ocean', label: 'Ocean', icon: Waves },
  { id: 'wind', label: 'Wind', icon: Wind },
];

const breathPatterns = [
  { id: 'box', label: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { id: '478', label: '4-7-8 Calm', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  { id: 'relax', label: 'Deep Relax', inhale: 5, hold1: 2, exhale: 8, hold2: 0 },
];

export default function Meditation() {
  const [selectedPreset, setSelectedPreset] = useState(presets[0]);
  const [selectedSound, setSelectedSound] = useState('none');
  const [selectedBreath, setSelectedBreath] = useState(breathPatterns[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(presets[0].duration);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    const stored = localStorage.getItem('mindease_meditation_sessions');
    return stored ? parseInt(stored) : 0;
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalBreathCycle = selectedBreath.inhale + selectedBreath.hold1 + selectedBreath.exhale + selectedBreath.hold2;

  const stopAll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathRef.current) clearInterval(breathRef.current);
    timerRef.current = null;
    breathRef.current = null;
  }, []);

  useEffect(() => {
    if (!isPlaying) { stopAll(); return; }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          const newCount = sessionsCompleted + 1;
          setSessionsCompleted(newCount);
          localStorage.setItem('mindease_meditation_sessions', String(newCount));
          toast.success('Session complete! 🧘 Great job being present.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    let breathTime = 0;
    breathRef.current = setInterval(() => {
      breathTime += 0.1;
      const cycleTime = breathTime % totalBreathCycle;
      
      if (cycleTime < selectedBreath.inhale) {
        setBreathPhase('inhale');
        setBreathProgress(cycleTime / selectedBreath.inhale);
      } else if (cycleTime < selectedBreath.inhale + selectedBreath.hold1) {
        setBreathPhase('hold1');
        setBreathProgress(1);
      } else if (cycleTime < selectedBreath.inhale + selectedBreath.hold1 + selectedBreath.exhale) {
        setBreathPhase('exhale');
        setBreathProgress(1 - (cycleTime - selectedBreath.inhale - selectedBreath.hold1) / selectedBreath.exhale);
      } else {
        setBreathPhase('hold2');
        setBreathProgress(0);
      }
    }, 100);

    return stopAll;
  }, [isPlaying, selectedBreath, totalBreathCycle, sessionsCompleted, stopAll]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handlePreset = (p: typeof presets[0]) => {
    setSelectedPreset(p);
    setTimeLeft(p.duration);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimeLeft(selectedPreset.duration);
    setBreathPhase('inhale');
    setBreathProgress(0);
  };

  const breathLabel = breathPhase === 'inhale' ? 'Breathe In' : breathPhase === 'exhale' ? 'Breathe Out' : 'Hold';
  const circleScale = 0.6 + breathProgress * 0.4;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl text-foreground font-semibold">Guided Meditation</h1>
        </div>
        <p className="text-muted-foreground font-body mb-8 ml-[52px]">Find stillness. Follow your breath.</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Controls */}
        <div className="space-y-5">
          {/* Presets */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-static rounded-3xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body flex items-center gap-2">
              <Timer className="w-3.5 h-3.5" /> Session Length
            </p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePreset(p)}
                  className={`p-3 rounded-2xl text-left transition-all ${selectedPreset.id === p.id ? 'bg-primary/10 border border-primary/30 shadow-sm' : 'bg-muted/30 hover:bg-muted/50 border border-transparent'}`}
                >
                  <span className="text-lg mb-1 block">{p.icon}</span>
                  <p className="font-body text-sm font-medium text-foreground">{p.label}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{p.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Breathing Pattern */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-static rounded-3xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body flex items-center gap-2">
              <Wind className="w-3.5 h-3.5" /> Breathing Pattern
            </p>
            <div className="space-y-2">
              {breathPatterns.map(bp => (
                <button
                  key={bp.id}
                  onClick={() => setSelectedBreath(bp)}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between ${selectedBreath.id === bp.id ? 'bg-secondary/20 border border-secondary/40' : 'hover:bg-muted/40 border border-transparent'}`}
                >
                  <span className="font-body text-sm font-medium text-foreground">{bp.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">{bp.inhale}-{bp.hold1}-{bp.exhale}{bp.hold2 > 0 ? `-${bp.hold2}` : ''}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Ambient Sounds */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-static rounded-3xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5" /> Ambient Sound
            </p>
            <div className="flex gap-2 flex-wrap">
              {ambientSounds.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSound(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-medium transition-all ${selectedSound === s.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted/40 border border-transparent'}`}
                >
                  <s.icon className="w-3.5 h-3.5" />{s.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-static rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-body">Sessions completed</p>
              <span className="font-number text-lg font-bold text-foreground">{sessionsCompleted}</span>
            </div>
          </motion.div>
        </div>

        {/* Timer Visual */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-static rounded-3xl p-8 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
          {/* Organic background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-secondary/8 blur-3xl" />
          </div>

          {/* Breath circle */}
          <div className="relative mb-8">
            <motion.div
              animate={{ scale: isPlaying ? circleScale : 0.6 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-48 h-48 rounded-full flex items-center justify-center relative"
              style={{
                background: `radial-gradient(circle, hsl(var(--primary) / 0.15), hsl(var(--secondary) / 0.08))`,
                boxShadow: isPlaying ? `0 0 60px hsl(var(--primary) / 0.15)` : 'none',
              }}
            >
              <motion.div
                animate={{ scale: isPlaying ? circleScale * 0.85 : 0.55 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-36 h-36 rounded-full flex items-center justify-center"
                style={{ background: `radial-gradient(circle, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.1))` }}
              >
                <div className="text-center">
                  <p className="font-number text-4xl font-bold text-foreground">{formatTime(timeLeft)}</p>
                  <AnimatePresence mode="wait">
                    {isPlaying && (
                      <motion.p
                        key={breathPhase}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs font-body text-primary font-medium mt-1"
                      >
                        {breathLabel}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>

            {/* Orbiting dot */}
            {isPlaying && (
              <motion.div
                className="absolute w-3 h-3 rounded-full bg-primary shadow-lg"
                style={{ top: '50%', left: '50%', marginTop: -6, marginLeft: -6 }}
                animate={{ rotate: 360 }}
                transition={{ duration: totalBreathCycle, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-3 h-3 rounded-full" style={{ transform: 'translateY(-96px)' }}>
                  <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/30" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 z-10">
            <button onClick={handleReset} className="p-3 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted transition-all hover:scale-105">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>
            <div className="w-11" /> {/* Spacer for centering */}
          </div>

          <p className="text-xs text-muted-foreground font-body mt-6 text-center max-w-xs">
            {isPlaying ? `Follow the circle. ${breathLabel.toLowerCase()}...` : 'Press play to begin your session'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
