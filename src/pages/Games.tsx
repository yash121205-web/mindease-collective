import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wind, Target, Sparkles, RotateCcw, Play } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const tabs = ['Breathing Rhythm', 'Focus Bubbles', 'Color Calm'];

export default function Games() {
  const [activeTab, setActiveTab] = useState('Breathing Rhythm');

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto overflow-y-auto">
      <PageHeader title="Stress-Relief Games" subtitle="Calm your mind with gentle interactive exercises" emoji="🎮" gradient="from-primary/10 to-warm-lavender/10" />

        <div className="flex gap-1 mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2.5 rounded-xl text-base font-body font-medium whitespace-nowrap transition-all ${
                activeTab === t ? 'btn-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'Breathing Rhythm' && <BreathingRhythmGame />}
        {activeTab === 'Focus Bubbles' && <FocusBubblesGame />}
        {activeTab === 'Color Calm' && <ColorCalmGame />}
    </div>
  );
}

function BreathingRhythmGame() {
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [score, setScore] = useState(0);
  const [clickedInPhase, setClickedInPhase] = useState(false);
  const timerRef = useRef<any>(null);

  const phaseConfig = {
    inhale: { duration: 4000, next: 'hold' as const, label: 'Inhale 🌬️', color: 'bg-primary/20' },
    hold: { duration: 4000, next: 'exhale' as const, label: 'Hold ✋', color: 'bg-secondary/20' },
    exhale: { duration: 6000, next: 'inhale' as const, label: 'Exhale 💨', color: 'bg-rose-soft/20' },
  };

  useEffect(() => {
    if (!playing) return;
    const run = (p: typeof phase) => {
      setPhase(p);
      setClickedInPhase(false);
      timerRef.current = setTimeout(() => run(phaseConfig[p].next), phaseConfig[p].duration);
    };
    run('inhale');
    return () => clearTimeout(timerRef.current);
  }, [playing]);

  const handleTap = () => {
    if (!playing) return;
    if (!clickedInPhase) {
      setScore(s => s + 1);
      setClickedInPhase(true);
    }
  };

  return (
    <div className="glass-static rounded-3xl p-8 max-w-md mx-auto text-center">
      <Wind className="w-8 h-8 text-primary mx-auto mb-3" />
      <h3 className="font-display text-lg text-foreground font-semibold mb-2">Breathing Rhythm</h3>
      <p className="text-sm text-muted-foreground font-body mb-6">Tap the circle in sync with each breathing phase</p>

      <div className="relative w-48 h-48 mx-auto mb-6">
        <motion.div
          animate={{ scale: playing ? (phase === 'inhale' ? 1.4 : phase === 'exhale' ? 0.8 : 1.2) : 1 }}
          transition={{ duration: phase === 'exhale' ? 6 : 4, ease: 'easeInOut' }}
          onClick={handleTap}
          className={`absolute inset-0 rounded-full cursor-pointer transition-colors ${playing ? phaseConfig[phase].color : 'bg-muted'} flex items-center justify-center`}
        >
          <span className="font-display text-lg text-foreground font-semibold">
            {playing ? phaseConfig[phase].label : 'Ready'}
          </span>
        </motion.div>
      </div>

      <p className="text-sm text-muted-foreground font-number mb-4">Score: {score}</p>

      {!playing ? (
        <button onClick={() => { setPlaying(true); setScore(0); }} className="btn-primary flex items-center gap-2 mx-auto">
          <Play className="w-4 h-4" /> Start
        </button>
      ) : (
        <button onClick={() => { setPlaying(false); clearTimeout(timerRef.current); }} className="px-6 py-2 rounded-xl bg-muted text-foreground text-sm font-medium font-body">
          Stop
        </button>
      )}

      <p className="text-xs text-muted-foreground mt-4 font-body">
        "Every breath is a chance to reset." 🌿
      </p>
    </div>
  );
}

function FocusBubblesGame() {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);
  const [score, setScore] = useState(0);
  const [active, setActive] = useState(false);
  const timerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = ['bg-primary/30', 'bg-secondary/30', 'bg-rose-soft/30', 'bg-accent/30'];

  const spawnBubble = useCallback(() => {
    const id = Date.now() + Math.random();
    const size = 40 + Math.random() * 40;
    setBubbles(prev => [...prev, {
      id,
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 10,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
    }]);
    // Auto remove after 4 seconds
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 4000);
  }, []);

  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(spawnBubble, 1200);
    return () => clearInterval(timerRef.current);
  }, [active, spawnBubble]);

  const popBubble = (id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
  };

  return (
    <div className="glass-static rounded-3xl p-8 max-w-md mx-auto text-center">
      <Target className="w-8 h-8 text-primary mx-auto mb-3" />
      <h3 className="font-display text-lg text-foreground font-semibold mb-2">Focus Bubbles</h3>
      <p className="text-sm text-muted-foreground font-body mb-4">Tap the bubbles as they appear to practice mindful focus</p>

      <div ref={containerRef} className="relative w-full h-64 bg-muted/30 rounded-2xl mb-4 overflow-hidden">
        {bubbles.map(b => (
          <motion.button
            key={b.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => popBubble(b.id)}
            className={`absolute rounded-full ${b.color} cursor-pointer hover:opacity-100 transition-opacity`}
            style={{
              width: b.size,
              height: b.size,
              left: `${b.x}%`,
              top: `${b.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground font-body">Tap Start to begin</p>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground font-number mb-4">Bubbles popped: {score}</p>

      {!active ? (
        <button onClick={() => { setActive(true); setScore(0); setBubbles([]); }} className="btn-primary flex items-center gap-2 mx-auto">
          <Play className="w-4 h-4" /> Start
        </button>
      ) : (
        <button onClick={() => { setActive(false); clearInterval(timerRef.current); }} className="px-6 py-2 rounded-xl bg-muted text-foreground text-sm font-medium font-body">
          Stop
        </button>
      )}
    </div>
  );
}

function ColorCalmGame() {
  const [colors, setColors] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState('hsl(200, 60%, 70%)');
  const [rounds, setRounds] = useState(0);

  const palettes = [
    ['hsl(200, 60%, 70%)', 'hsl(180, 50%, 75%)', 'hsl(160, 40%, 70%)', 'hsl(140, 35%, 72%)'],
    ['hsl(330, 50%, 80%)', 'hsl(350, 45%, 78%)', 'hsl(10, 50%, 82%)', 'hsl(30, 55%, 80%)'],
    ['hsl(250, 40%, 75%)', 'hsl(270, 35%, 78%)', 'hsl(290, 30%, 80%)', 'hsl(310, 35%, 78%)'],
    ['hsl(40, 60%, 75%)', 'hsl(50, 55%, 78%)', 'hsl(60, 50%, 80%)', 'hsl(70, 45%, 75%)'],
  ];

  const startNew = () => {
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    const shuffled = [...palette].sort(() => Math.random() - 0.5);
    setColors(shuffled);
    setCurrentColor(palette[0]);
    setRounds(r => r + 1);
  };

  useEffect(() => { startNew(); }, []);

  const handleSelect = (color: string) => {
    if (color === currentColor) {
      startNew();
    }
  };

  return (
    <div className="glass-static rounded-3xl p-8 max-w-md mx-auto text-center">
      <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
      <h3 className="font-display text-lg text-foreground font-semibold mb-2">Color Calm</h3>
      <p className="text-sm text-muted-foreground font-body mb-6">Find the matching color — focus and breathe</p>

      <div className="w-24 h-24 rounded-2xl mx-auto mb-6 shadow-md" style={{ backgroundColor: currentColor }} />
      <p className="text-xs text-muted-foreground font-body mb-4">Find this color below:</p>

      <div className="grid grid-cols-2 gap-3 max-w-[200px] mx-auto mb-6">
        {colors.map((c, i) => (
          <button
            key={i}
            onClick={() => handleSelect(c)}
            className="w-full aspect-square rounded-xl shadow-sm hover:scale-105 transition-transform"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <p className="text-sm text-muted-foreground font-number mb-4">Rounds: {rounds}</p>
      <button onClick={startNew} className="text-xs text-primary font-body hover:underline flex items-center gap-1 mx-auto">
        <RotateCcw className="w-3 h-3" /> New colors
      </button>
    </div>
  );
}
