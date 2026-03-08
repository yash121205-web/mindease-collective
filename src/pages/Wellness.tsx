import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayMood, getSessions, saveSessions } from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { Wind, Play, Pause, RotateCcw, Timer, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const exercises = [
  { title: 'Box Breathing', category: 'Breathwork', duration: '4 min', difficulty: 'Beginner',
    description: 'Box breathing is a powerful technique used by Navy SEALs and therapists alike. It works by slowing your nervous system, reducing cortisol, and bringing your focus back to the present moment. Breathe in for 4 counts, hold for 4, out for 4, hold for 4 — repeat 4 cycles.',
    videoId: 'tEmt1Znux58' },
  { title: 'Body Scan Meditation', category: 'Mindfulness', duration: '10 min', difficulty: 'Beginner',
    description: 'A body scan gently directs attention from your toes to your head, helping you release tension you didn\'t even know you were holding. Research shows it reduces anxiety and improves sleep quality significantly. Find a comfortable position, close your eyes, and follow the guided audio.',
    videoId: 'ihwcw_ofuME' },
  { title: 'Progressive Muscle Relaxation', category: 'Movement', duration: '8 min', difficulty: 'Beginner',
    description: 'PMR involves tensing and then releasing each muscle group systematically, teaching your body the difference between tension and relaxation. It\'s clinically proven to reduce stress hormones and ease physical symptoms of anxiety. Start from your feet and work upward.',
    videoId: '86HUcX8ZtAk' },
  { title: '5-4-3-2-1 Grounding', category: 'Cognitive', duration: '3 min', difficulty: 'Beginner',
    description: 'This sensory grounding technique interrupts anxiety spirals by pulling your brain into the present moment. Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. It works because anxiety lives in the future — grounding brings you back to now.',
    videoId: '30VMIEmA114' },
  { title: 'Desk Yoga Stretch', category: 'Movement', duration: '7 min', difficulty: 'Beginner',
    description: 'Sitting for hours compresses the spine and tightens hip flexors, which directly increases cortisol levels. These gentle desk-friendly stretches release physical tension, improve blood flow to the brain, and can be done between study sessions without leaving your chair.',
    videoId: 'tAUf7aajBWE' },
  { title: 'Guided Visualization', category: 'Mindfulness', duration: '6 min', difficulty: 'Intermediate',
    description: 'Mental imagery activates the same neural pathways as real experiences. This guided visualization takes you to a peaceful place in your mind, reducing heart rate, lowering blood pressure, and creating genuine feelings of safety and calm within minutes.',
    videoId: 't1rRo6cgM_E' },
  { title: 'EFT Tapping', category: 'Cognitive', duration: '5 min', difficulty: 'Intermediate',
    description: 'Emotional Freedom Technique involves tapping specific acupressure points while voicing your emotions. Multiple studies show it reduces cortisol by up to 24% in a single session. It sounds unusual but works rapidly for anxiety, exam stress, and emotional overwhelm.',
    videoId: 'pAclBdj20ZU' },
  { title: 'Gratitude Reflection', category: 'Creative', duration: '4 min', difficulty: 'Beginner',
    description: 'Neuroscience shows that consciously noting three specific things you\'re grateful for rewires the brain\'s negativity bias over time. This guided practice helps you go deeper than surface-level gratitude to create genuine emotional shifts and increased resilience.',
    videoId: 'ZToicYcHIqU' },
];

const categoryColors: Record<string, string> = {
  Breathwork: 'bg-primary/10 text-primary',
  Mindfulness: 'bg-mint/20 text-foreground',
  Movement: 'bg-rose-soft/15 text-foreground',
  Cognitive: 'bg-secondary/20 text-foreground',
  Creative: 'bg-accent/10 text-foreground',
};

const tabs = ['Exercises', 'Breathing', 'Focus Timer', "Today's Plan"];

export default function Wellness() {
  const [activeTab, setActiveTab] = useState('Exercises');
  const [expandedEx, setExpandedEx] = useState<number | null>(null);

  // Breathing state
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

  // Plan
  const [plan, setPlan] = useState<any[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const sessions = getSessions();

  // Breathing logic
  const phaseConfig = { inhale: { dur: 4000, next: 'hold1' as const, label: 'Inhale' }, hold1: { dur: 4000, next: 'exhale' as const, label: 'Hold' }, exhale: { dur: 6000, next: 'hold2' as const, label: 'Exhale' }, hold2: { dur: 2000, next: 'inhale' as const, label: 'Hold' } };

  const startBreathing = () => {
    setBreathing(true);
    setPhase('inhale');
    breathRef.current = setInterval(() => setBreathTimer(t => t + 1), 1000);
    runPhase('inhale');
  };

  const runPhase = (p: 'inhale' | 'hold1' | 'exhale' | 'hold2') => {
    setPhase(p);
    if (p === 'inhale') setBreathCount(c => c + 1);
    phaseRef.current = setTimeout(() => runPhase(phaseConfig[p].next), phaseConfig[p].dur);
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
  const breathScale = phase === 'inhale' ? 1.5 : phase === 'exhale' ? 1 : (phase === 'hold1' ? 1.5 : 1);

  const generatePlan = async () => {
    setLoadingPlan(true);
    const mood = getTodayMood()?.mood || 'okay';
    try {
      const r = await callAI(
        `User's mood today is "${mood}". Generate a structured 3-activity wellness plan for a student. Format as JSON array: [{"time":"Morning","activity":"...","duration":"5 min","why":"...","how":"..."}]. Return ONLY JSON.`,
        'You are a wellness advisor. Return ONLY valid JSON, no extra text.'
      );
      const match = r.match(/\[[\s\S]*\]/);
      if (match) setPlan(JSON.parse(match[0]));
      else throw new Error();
    } catch {
      setPlan([
        { time: 'Morning', activity: '5-min guided breathing', duration: '5 min', why: 'Sets a calm tone for the day', how: 'Use the breathing tool above — 4-4-6-2 pattern' },
        { time: 'Afternoon', activity: 'Desk yoga stretch', duration: '7 min', why: 'Releases physical tension from sitting', how: 'Try the desk yoga exercise in the Exercises tab' },
        { time: 'Evening', activity: 'Gratitude reflection', duration: '5 min', why: 'Rewires your brain for positivity', how: 'Write 3 things you are grateful for in your journal' },
      ]);
    }
    setLoadingPlan(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-1 font-semibold">Wellness</h1>
        <p className="text-muted-foreground mb-6 font-body">Nurture your mind and body</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-body font-medium whitespace-nowrap transition-all ${
                activeTab === t ? 'btn-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Exercises Tab */}
        {activeTab === 'Exercises' && (
          <div className="grid gap-4 md:grid-cols-2">
            {exercises.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-static rounded-2xl overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-lg text-foreground font-semibold">{ex.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${categoryColors[ex.category] || 'bg-muted text-muted-foreground'}`}>{ex.category}</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-number">{ex.duration}</span>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-body">{ex.difficulty}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed font-body">{ex.description}</p>
                  <button
                    onClick={() => setExpandedEx(expandedEx === i ? null : i)}
                    className="mt-3 text-xs text-primary font-body font-medium flex items-center gap-1 hover:underline"
                  >
                    {expandedEx === i ? <><ChevronUp className="w-3 h-3" /> Hide Video</> : <><ChevronDown className="w-3 h-3" /> Start Exercise</>}
                  </button>
                </div>
                <AnimatePresence>
                  {expandedEx === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-5">
                        <div className="aspect-video rounded-xl overflow-hidden">
                          <iframe
                            src={ex.video}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={ex.title}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Breathing Tab */}
        {activeTab === 'Breathing' && (
          <div className="glass-static rounded-3xl p-8 flex flex-col items-center max-w-lg mx-auto">
            <h2 className="font-display text-xl text-foreground mb-6 font-semibold">Guided Breathing</h2>
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
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
              <span className="relative z-10 font-display text-lg text-foreground font-semibold">
                {breathing ? phaseConfig[phase].label : 'Ready'}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {!breathing ? (
                <button onClick={startBreathing} className="btn-primary flex items-center gap-2"><Play className="w-4 h-4" /> Start</button>
              ) : (
                <button onClick={stopBreathing} className="px-6 py-2 rounded-xl bg-muted text-foreground text-sm font-medium font-body flex items-center gap-2"><Pause className="w-4 h-4" /> Pause</button>
              )}
              <button onClick={resetBreathing} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><RotateCcw className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-6 text-xs text-muted-foreground font-number">
              <span>{formatTimer(breathTimer)}</span>
              <span>{breathCount} breaths</span>
              <span>{sessions.breathing + breathCount} total</span>
            </div>
          </div>
        )}

        {/* Focus Timer Tab */}
        {activeTab === 'Focus Timer' && (
          <div className="glass-static rounded-3xl p-8 flex flex-col items-center max-w-lg mx-auto">
            <h2 className="font-display text-xl text-foreground mb-6 font-semibold">Focus Mode</h2>
            <div className="relative w-36 h-36 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <motion.circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pomoProgress) }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground font-number">{formatTimer(pomoTime)}</span>
                <span className="text-[10px] text-muted-foreground font-body">{isBreak ? 'Break' : 'Focus'}</span>
              </div>
            </div>
            <input
              value={pomoLabel}
              onChange={(e) => setPomoLabel(e.target.value)}
              placeholder="What are you working on?"
              className="bg-muted rounded-xl px-3 py-2 text-xs text-foreground text-center mb-3 w-56 focus:outline-none focus:ring-1 focus:ring-primary/30 font-body"
            />
            <div className="flex gap-2">
              <button onClick={() => setPomActive(!pomoActive)} className="btn-primary flex items-center gap-2">
                {pomoActive ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
              </button>
              <button onClick={() => { setPomActive(false); setPomoTime(isBreak ? 5 * 60 : 25 * 60); }} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-number">Completed {sessions.pomodoro} sessions</p>
          </div>
        )}

        {/* Today's Plan Tab */}
        {activeTab === "Today's Plan" && (
          <div className="max-w-lg mx-auto">
            {plan.length === 0 ? (
              <div className="glass-static rounded-3xl p-8 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-display text-lg text-foreground mb-2 font-semibold">Your Personalized Plan</h3>
                <p className="text-sm text-muted-foreground mb-4 font-body">Get a tailored wellness plan based on your mood today.</p>
                <button onClick={generatePlan} disabled={loadingPlan} className="btn-primary disabled:opacity-40">
                  {loadingPlan ? 'Generating...' : "Generate Today's Plan"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {plan.map((p: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="glass-static rounded-2xl p-5 flex gap-4">
                    <div className="w-1 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--mint)))' }} />
                    <div>
                      <p className="text-xs text-primary font-body font-medium">{p.time}</p>
                      <h4 className="font-display text-base text-foreground font-semibold">{p.activity}</h4>
                      <p className="text-xs text-muted-foreground font-number mt-0.5">{p.duration}</p>
                      {p.why && <p className="text-xs text-muted-foreground mt-1 font-body">Why: {p.why}</p>}
                      {p.how && <p className="text-xs text-foreground mt-1 font-body">How: {p.how}</p>}
                    </div>
                  </motion.div>
                ))}
                <button onClick={generatePlan} disabled={loadingPlan} className="btn-secondary w-full mt-2 disabled:opacity-40">
                  {loadingPlan ? 'Regenerating...' : 'Regenerate Plan'}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
