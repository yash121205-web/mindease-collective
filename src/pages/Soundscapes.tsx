import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface Soundscape {
  id: string;
  title: string;
  emoji: string;
  mood: string;
  desc: string;
  color: string;
}

const soundscapes: Soundscape[] = [
  { id: 'calm-rain', title: 'Gentle Rain', emoji: '🌧️', mood: 'Calm', desc: 'Soft rain on leaves for deep relaxation', color: 'from-primary/15 to-sky-soft/20' },
  { id: 'ocean-waves', title: 'Ocean Waves', emoji: '🌊', mood: 'Peaceful', desc: 'Rhythmic waves for stress relief', color: 'from-primary/10 to-primary/20' },
  { id: 'forest-birds', title: 'Forest Morning', emoji: '🌲', mood: 'Refreshed', desc: 'Birds and rustling trees for clarity', color: 'from-mint/15 to-primary/10' },
  { id: 'night-fire', title: 'Campfire Night', emoji: '🔥', mood: 'Cozy', desc: 'Crackling fire under starry skies', color: 'from-warm-peach/20 to-secondary/10' },
  { id: 'wind-chimes', title: 'Wind Chimes', emoji: '🎐', mood: 'Focused', desc: 'Delicate chimes for gentle focus', color: 'from-warm-lavender/20 to-primary/10' },
  { id: 'thunder-storm', title: 'Distant Thunder', emoji: '⛈️', mood: 'Sleep', desc: 'Thunder and rain for deep sleep', color: 'from-muted/30 to-primary/10' },
  { id: 'zen-garden', title: 'Zen Garden', emoji: '⛩️', mood: 'Meditative', desc: 'Water fountain and soft bells', color: 'from-sky-soft/20 to-mint/15' },
  { id: 'sunrise', title: 'Golden Sunrise', emoji: '🌅', mood: 'Uplifted', desc: 'Warm ambient tones for new beginnings', color: 'from-secondary/15 to-warm-peach/15' },
];

const moodFilters = ['All', 'Calm', 'Peaceful', 'Focused', 'Sleep', 'Meditative', 'Uplifted'];

// --- Web Audio Synthesis ---
function createSoundscape(ctx: AudioContext, id: string, masterGain: GainNode): AudioNode[] {
  const nodes: AudioNode[] = [];
  const sr = ctx.sampleRate;

  const makeNoise = (seconds: number, transform: (sample: number, i: number, prev: number) => number) => {
    const len = seconds * sr;
    const buf = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let prev = 0;
      for (let i = 0; i < len; i++) {
        const raw = Math.random() * 2 - 1;
        d[i] = transform(raw, i, prev);
        prev = d[i];
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  };

  const connect = (...chain: AudioNode[]) => {
    for (let i = 0; i < chain.length - 1; i++) chain[i].connect(chain[i + 1] as AudioNode);
    chain[chain.length - 1].connect(masterGain);
    nodes.push(...chain);
  };

  if (id === 'calm-rain') {
    const src = makeNoise(3, (r, _i, prev) => r * 0.3 + prev * 0.7);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
    const g = ctx.createGain(); g.gain.value = 0.5;
    src.start(); connect(src, f, g);
  }

  if (id === 'ocean-waves') {
    const src = makeNoise(4, (r, _i, prev) => r * 0.15 + prev * 0.85);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 350;
    const g = ctx.createGain(); g.gain.value = 0.6;
    // LFO for wave motion
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08; lfo.type = 'sine';
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.25;
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    lfo.start(); src.start(); connect(src, f, g);
    nodes.push(lfo, lfoGain);
  }

  if (id === 'forest-birds') {
    // Base rustle
    const rustle = makeNoise(4, (r, _i, prev) => r * 0.1 + prev * 0.9);
    const rf = ctx.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 2500;
    const rg = ctx.createGain(); rg.gain.value = 0.2;
    rustle.start(); connect(rustle, rf, rg);
    // Bird-like chirps via high oscillators
    for (let b = 0; b < 3; b++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 1800 + b * 400;
      const og = ctx.createGain(); og.gain.value = 0;
      // Modulate gain for chirps
      const lfo = ctx.createOscillator(); lfo.frequency.value = 2 + b * 1.5;
      const lg = ctx.createGain(); lg.gain.value = 0.03;
      lfo.connect(lg); lg.connect(og.gain);
      osc.start(); lfo.start(); connect(osc, og);
      nodes.push(lfo, lg);
    }
  }

  if (id === 'night-fire') {
    const src = makeNoise(3, (r) => {
      return r * (Math.random() > 0.98 ? 0.8 : 0.15);
    });
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.value = 0.45;
    src.start(); connect(src, f, g);
  }

  if (id === 'wind-chimes') {
    // Gentle wind base
    const wind = makeNoise(3, (r, _i, prev) => r * 0.12 + prev * 0.88);
    const wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 600; wf.Q.value = 0.3;
    const wg = ctx.createGain(); wg.gain.value = 0.15;
    wind.start(); connect(wind, wf, wg);
    // Chime tones
    const chimeFreqs = [523, 659, 784, 880, 1047];
    for (const freq of chimeFreqs) {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
      const og = ctx.createGain(); og.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.15 + Math.random() * 0.3;
      const lg = ctx.createGain(); lg.gain.value = 0.02;
      lfo.connect(lg); lg.connect(og.gain);
      osc.start(); lfo.start(); connect(osc, og);
      nodes.push(lfo, lg);
    }
  }

  if (id === 'thunder-storm') {
    // Heavy rain
    const rain = makeNoise(3, (r, _i, prev) => r * 0.35 + prev * 0.65);
    const rf = ctx.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 700;
    const rg = ctx.createGain(); rg.gain.value = 0.5;
    rain.start(); connect(rain, rf, rg);
    // Low rumble
    const rumble = makeNoise(4, (r, _i, prev) => r * 0.2 + prev * 0.8);
    const tf = ctx.createBiquadFilter(); tf.type = 'lowpass'; tf.frequency.value = 120;
    const tg = ctx.createGain(); tg.gain.value = 0;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
    const lg = ctx.createGain(); lg.gain.value = 0.3;
    lfo.connect(lg); lg.connect(tg.gain);
    lfo.start(); rumble.start(); connect(rumble, tf, tg);
    nodes.push(lfo, lg);
  }

  if (id === 'zen-garden') {
    // Water trickle
    const water = makeNoise(3, (r, _i, prev) => r * 0.2 + prev * 0.8);
    const wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 1200; wf.Q.value = 0.5;
    const wg = ctx.createGain(); wg.gain.value = 0.2;
    water.start(); connect(water, wf, wg);
    // Soft bell tones
    for (const freq of [528, 396, 639]) {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
      const og = ctx.createGain(); og.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.1 + Math.random() * 0.15;
      const lg = ctx.createGain(); lg.gain.value = 0.015;
      lfo.connect(lg); lg.connect(og.gain);
      osc.start(); lfo.start(); connect(osc, og);
      nodes.push(lfo, lg);
    }
  }

  if (id === 'sunrise') {
    // Warm drone
    for (const freq of [110, 165, 220]) {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
      const og = ctx.createGain(); og.gain.value = 0.08;
      osc.start(); connect(osc, og);
    }
    // Gentle shimmer
    const shimmer = makeNoise(4, (r, _i, prev) => r * 0.05 + prev * 0.95);
    const sf = ctx.createBiquadFilter(); sf.type = 'highpass'; sf.frequency.value = 2000;
    const sg = ctx.createGain(); sg.gain.value = 0.08;
    shimmer.start(); connect(shimmer, sf, sg);
  }

  return nodes;
}

export default function Soundscapes() {
  const [activeSound, setActiveSound] = useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [filter, setFilter] = useState('All');
  const [elapsed, setElapsed] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filtered = filter === 'All' ? soundscapes : soundscapes.filter(s => s.mood === filter);

  // Elapsed timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying]);

  // Volume sync
  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  const stopAudio = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.disconnect(); } catch {} });
    nodesRef.current = [];
  }, []);

  const startAudio = useCallback((s: Soundscape) => {
    stopAudio();
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.connect(ctxRef.current.destination);
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    masterRef.current!.gain.value = volume / 100;
    nodesRef.current = createSoundscape(ctx, s.id, masterRef.current!);
  }, [stopAudio, volume]);

  // Pause/resume
  useEffect(() => {
    if (!ctxRef.current) return;
    if (isPlaying) {
      ctxRef.current.resume();
    } else {
      ctxRef.current.suspend();
    }
  }, [isPlaying]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAudio();
      if (ctxRef.current) { ctxRef.current.close().catch(() => {}); ctxRef.current = null; }
    };
  }, [stopAudio]);

  const playSound = (s: Soundscape) => {
    setActiveSound(s);
    setIsPlaying(true);
    setElapsed(0);
    startAudio(s);
  };

  const togglePlay = () => {
    if (!activeSound) return;
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

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

      {/* Mood filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 flex-wrap mb-6">
        {moodFilters.map(m => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === m ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
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
            <p className="text-sm font-semibold text-foreground">{s.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-background/60 text-[10px] text-muted-foreground">{s.mood}</span>
          </motion.button>
        ))}
      </div>

      {/* Now Playing Bar */}
      {activeSound && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 lg:left-72 z-40 bg-card/95 backdrop-blur-lg rounded-2xl px-5 py-4 flex items-center gap-4 border border-border/50 shadow-xl"
        >
          <span className="text-2xl">{activeSound.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{activeSound.title}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{formatTime(elapsed)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform">
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
              className="w-20 h-1.5 accent-primary cursor-pointer"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
