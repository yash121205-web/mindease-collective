import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, SkipForward, Headphones } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface Soundscape {
  id: string;
  title: string;
  emoji: string;
  mood: string;
  desc: string;
  color: string;
  frequency: number; // Hz for binaural-style visualization
}

const soundscapes: Soundscape[] = [
  { id: 'calm-rain', title: 'Gentle Rain', emoji: '🌧️', mood: 'Calm', desc: 'Soft rain on leaves for deep relaxation', color: 'from-primary/15 to-sky-soft/20', frequency: 6 },
  { id: 'ocean-waves', title: 'Ocean Waves', emoji: '🌊', mood: 'Peaceful', desc: 'Rhythmic waves for stress relief', color: 'from-primary/10 to-primary/20', frequency: 8 },
  { id: 'forest-birds', title: 'Forest Morning', emoji: '🌲', mood: 'Refreshed', desc: 'Birds and rustling trees for clarity', color: 'from-mint/15 to-primary/10', frequency: 10 },
  { id: 'night-fire', title: 'Campfire Night', emoji: '🔥', mood: 'Cozy', desc: 'Crackling fire under starry skies', color: 'from-warm-peach/20 to-secondary/10', frequency: 4 },
  { id: 'wind-chimes', title: 'Wind Chimes', emoji: '🎐', mood: 'Focused', desc: 'Delicate chimes for gentle focus', color: 'from-warm-lavender/20 to-primary/10', frequency: 12 },
  { id: 'thunder-storm', title: 'Distant Thunder', emoji: '⛈️', mood: 'Sleep', desc: 'Thunder and rain for deep sleep', color: 'from-muted/30 to-primary/10', frequency: 3 },
  { id: 'zen-garden', title: 'Zen Garden', emoji: '⛩️', mood: 'Meditative', desc: 'Water fountain and soft bells', color: 'from-sky-soft/20 to-mint/15', frequency: 7 },
  { id: 'sunrise', title: 'Golden Sunrise', emoji: '🌅', mood: 'Uplifted', desc: 'Warm ambient tones for new beginnings', color: 'from-secondary/15 to-warm-peach/15', frequency: 9 },
];

const moodFilters = ['All', 'Calm', 'Peaceful', 'Focused', 'Sleep', 'Meditative', 'Uplifted'];

export default function Soundscapes() {
  const [activeSound, setActiveSound] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [filter, setFilter] = useState('All');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filtered = filter === 'All' ? soundscapes : soundscapes.filter(s => s.mood === filter);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying]);

  const playSound = (s: Soundscape) => {
    setActiveSound(s);
    setIsPlaying(true);
    setElapsed(0);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const skipNext = () => {
    if (!activeSound) return;
    const idx = soundscapes.findIndex(s => s.id === activeSound.id);
    const next = soundscapes[(idx + 1) % soundscapes.length];
    playSound(next);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <PageHeader title="Mood Soundscapes" subtitle="Curated ambient sounds to match your mood." emoji="🎧" gradient="from-sky-soft/12 to-primary/8" />
      </motion.div>

      {/* Mood filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 flex-wrap mb-6">
        {moodFilters.map(m => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className={`px-4 py-2 rounded-full text-xs font-body font-medium transition-all ${filter === m ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
          >
            {m}
          </button>
        ))}
      </motion.div>

      {/* Sound Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-28">
        {filtered.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => playSound(s)}
            className={`text-left p-5 rounded-2xl bg-gradient-to-br ${s.color} border transition-all group relative overflow-hidden ${activeSound?.id === s.id ? 'border-primary/40 shadow-lg ring-2 ring-primary/20' : 'border-border/50 hover:border-primary/20 hover:shadow-md'}`}
          >
            {/* Animated wave indicator */}
            {activeSound?.id === s.id && isPlaying && (
              <div className="absolute top-3 right-3 flex items-end gap-0.5 h-4">
                {[0, 1, 2].map(j => (
                  <motion.div
                    key={j}
                    className="w-1 rounded-full bg-primary/60"
                    animate={{ height: ['4px', '16px', '4px'] }}
                    transition={{ duration: 0.8, delay: j * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            )}
            <span className="text-3xl block mb-3">{s.emoji}</span>
            <p className="font-body text-sm font-semibold text-foreground">{s.title}</p>
            <p className="font-body text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-background/60 text-[10px] font-body text-muted-foreground">{s.mood}</span>
          </motion.button>
        ))}
      </div>

      {/* Now Playing Bar */}
      {activeSound && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 lg:left-72 z-40 glass-strong rounded-2xl px-5 py-4 flex items-center gap-4"
        >
          <span className="text-2xl">{activeSound.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-semibold text-foreground truncate">{activeSound.title}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{formatTime(elapsed)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button onClick={skipNext} className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 ml-2">
            {volume === 0 ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
            <input
              type="range" min={0} max={100} value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-20 h-1 accent-primary"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
