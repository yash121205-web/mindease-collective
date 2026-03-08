import { useState } from 'react';
import { motion } from 'framer-motion';
import { Apple, Plus, Sparkles, Droplets, Leaf, UtensilsCrossed } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { callAI } from '@/lib/ai';
import { genId } from '@/lib/storage';
import { toast } from 'sonner';

interface MealLog {
  id: string; date: string; mealType: string; foods: string; mood: string; water: number; timestamp: number;
}

function getMealStorageKey(): string {
  const userId = sessionStorage.getItem('mindease_user_id') || 'anonymous';
  return `mindease_${userId}_meals`;
}
function getMealLogs(): MealLog[] {
  try { return JSON.parse(localStorage.getItem(getMealStorageKey()) || '[]'); } catch { return []; }
}
function saveMealLog(log: MealLog) {
  const logs = getMealLogs(); logs.push(log);
  localStorage.setItem(getMealStorageKey(), JSON.stringify(logs));
}

const mealTypes = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅', time: '7-10 AM' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️', time: '12-2 PM' },
  { key: 'snack', label: 'Snack', emoji: '🍪', time: 'Anytime' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙', time: '7-9 PM' },
];

const mealColors: Record<string, string> = {
  breakfast: 'hsl(var(--warm-peach))',
  lunch: 'hsl(var(--mint))',
  snack: 'hsl(var(--primary))',
  dinner: 'hsl(var(--secondary))',
};

const moodAfterEating = [
  { key: 'energized', emoji: '⚡', label: 'Energized' },
  { key: 'satisfied', emoji: '😊', label: 'Satisfied' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
  { key: 'sluggish', emoji: '😴', label: 'Sluggish' },
  { key: 'bloated', emoji: '😣', label: 'Uncomfortable' },
];

const healthySuggestions = [
  { category: 'Mood Boosting Foods', emoji: '😊', items: ['Bananas (serotonin)', 'Dark Chocolate (endorphins)', 'Yogurt (probiotics)', 'Oats (steady energy)', 'Leafy Greens (folate)'],
    detail: 'These foods support serotonin and dopamine production — your brain\'s happiness chemicals.' },
  { category: 'Brain Health Nutrition', emoji: '🧠', items: ['Walnuts (omega-3)', 'Blueberries (antioxidants)', 'Salmon (DHA)', 'Avocado (healthy fats)', 'Eggs (choline)'],
    detail: 'Omega-3s and antioxidants protect brain cells and improve memory and focus.' },
  { category: 'Stress-Reducing Foods', emoji: '💪', items: ['Oranges (vitamin C)', 'Sweet Potatoes (magnesium)', 'Almonds (vitamin E)', 'Chamomile Tea', 'Dark Berries'],
    detail: 'Vitamin C lowers cortisol. Magnesium relaxes muscles. These foods combat stress.' },
  { category: 'Hydration Tips', emoji: '💧', items: ['8 glasses/day minimum', 'Cucumber & mint water', 'Herbal teas count', 'Coconut water', 'Limit caffeine after 2pm'],
    detail: 'Even mild dehydration impairs mood, concentration, and increases anxiety.' },
  { category: 'Balanced Diet Ideas', emoji: '🥗', items: ['Colorful plate rule', 'Protein with every meal', 'Whole grains over refined', 'Healthy snack prep', 'Eat mindfully'],
    detail: 'A balanced diet stabilizes blood sugar, preventing mood crashes.' },
  { category: 'Sleep-Supporting Foods', emoji: '😴', items: ['Warm milk (tryptophan)', 'Tart Cherries (melatonin)', 'Kiwi (serotonin)', 'Turkey (L-tryptophan)', 'Brown Rice (GABA)'],
    detail: 'Eating these 1-2 hours before bed can naturally boost melatonin.' },
];

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-mint/15 to-primary/10 flex items-center justify-center">
        <Icon className="w-3 h-3 text-mint" />
      </div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">{label}</p>
    </div>
  );
}

export default function Diet() {
  const [logs, setLogs] = useState<MealLog[]>(getMealLogs);
  const [showForm, setShowForm] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('');
  const [foods, setFoods] = useState('');
  const [mood, setMood] = useState('');
  const [water, setWater] = useState(0);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  const todayLogs = logs.filter(l => l.date === new Date().toISOString().split('T')[0]);
  const todayWater = todayLogs.reduce((s, l) => s + l.water, 0);
  const waterGoalPct = Math.min(100, Math.round((todayWater / 8) * 100));

  const mealDistribution = mealTypes.map(mt => ({
    name: mt.label, value: todayLogs.filter(l => l.mealType === mt.key).length || 0, color: mealColors[mt.key],
  })).filter(m => m.value > 0);

  const handleLog = async () => {
    if (!selectedMeal || !foods.trim()) { toast.error('Please select meal type and add what you ate'); return; }
    const log: MealLog = { id: genId(), date: new Date().toISOString().split('T')[0], mealType: selectedMeal, foods: foods.trim(), mood, water, timestamp: Date.now() };
    saveMealLog(log);
    setLogs(getMealLogs());
    setShowForm(false);
    setFoods(''); setSelectedMeal(''); setMood(''); setWater(0);
    toast.success('Meal logged! 🍽️');
    setLoadingInsight(true);
    try {
      const r = await callAI(`User logged ${selectedMeal}: "${foods.trim()}". They felt ${mood || 'neutral'} after eating. Today they had ${todayLogs.length + 1} meals and ${todayWater + water} glasses of water. Give a warm, brief 2-sentence nutrition/wellness insight. Don't start with "I understand".`);
      setInsight(r);
    } catch {
      setInsight("Nourishing your body is an act of self-care. Try to include colorful fruits and vegetables in your next meal — they're packed with mood-boosting nutrients! 🌿");
    }
    setLoadingInsight(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <PageHeader title="Diet & Nutrition" subtitle="Fuel your body, fuel your mind" emoji="🍎" gradient="from-mint/10 to-warm-peach/8" />

      {/* ─── Stats Row ─── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <UtensilsCrossed className="w-3.5 h-3.5 text-mint" />
            <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">Today</p>
          </div>
          <p className="text-2xl font-bold text-foreground font-number">{todayLogs.length}</p>
          <p className="text-[10px] text-muted-foreground font-body mt-0.5">meals logged</p>
        </div>
        <div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-3.5 h-3.5 text-primary" />
            <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">Water</p>
          </div>
          <p className="text-2xl font-bold text-foreground font-number">{todayWater}<span className="text-sm font-normal text-muted-foreground">/8</span></p>
          <div className="mt-1.5 h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" initial={{ width: 0 }} animate={{ width: `${waterGoalPct}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
        <div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Apple className="w-3.5 h-3.5 text-warm-peach" />
            <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">Total</p>
          </div>
          <p className="text-2xl font-bold text-foreground font-number">{logs.length}</p>
          <p className="text-[10px] text-muted-foreground font-body mt-0.5">all-time meals</p>
        </div>
      </motion.div>

      {/* ─── Log Form ─── */}
      {!showForm ? (
        <motion.button {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }}
          onClick={() => setShowForm(true)}
          className="w-full btn-primary flex items-center justify-center gap-2 mb-6">
          <Plus className="w-4 h-4" /> Log a Meal
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="relative bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden mb-6">
          <div className="h-1 bg-gradient-to-r from-mint via-primary to-warm-peach" />
          <div className="p-5 space-y-4">
            <h3 className="font-display text-base text-foreground font-semibold">Log Meal</h3>

            {/* Meal type */}
            <div>
              <label className="text-[11px] text-muted-foreground font-body font-semibold uppercase tracking-wider mb-2 block">Meal Type</label>
              <div className="grid grid-cols-4 gap-2">
                {mealTypes.map(mt => (
                  <button key={mt.key} onClick={() => setSelectedMeal(mt.key)}
                    className={`p-2.5 rounded-xl text-center transition-all border ${
                      selectedMeal === mt.key
                        ? 'border-primary/30 bg-primary/10 scale-[1.03] shadow-sm'
                        : 'border-border/30 bg-card hover:bg-muted/30'
                    }`}>
                    <span className="text-xl block">{mt.emoji}</span>
                    <span className="text-[10px] text-muted-foreground font-body block mt-0.5">{mt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Foods */}
            <div>
              <label className="text-[11px] text-muted-foreground font-body font-semibold uppercase tracking-wider mb-1.5 block">What did you eat?</label>
              <textarea value={foods} onChange={e => setFoods(e.target.value)}
                placeholder="e.g., Rice, dal, sabzi, yogurt..."
                className="w-full bg-muted/30 border border-border/30 rounded-xl px-3 py-2.5 text-sm text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={2} />
            </div>

            {/* Mood after eating */}
            <div>
              <label className="text-[11px] text-muted-foreground font-body font-semibold uppercase tracking-wider mb-2 block">How did you feel after?</label>
              <div className="flex gap-2">
                {moodAfterEating.map(m => (
                  <button key={m.key} onClick={() => setMood(m.key)}
                    className={`flex-1 py-2 rounded-xl text-center transition-all border ${
                      mood === m.key
                        ? 'border-primary/30 bg-primary/10'
                        : 'border-border/30 bg-card hover:bg-muted/30'
                    }`}>
                    <span className="text-base block">{m.emoji}</span>
                    <span className="text-[8px] text-muted-foreground font-body mt-0.5 block">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Water */}
            <div>
              <label className="text-[11px] text-muted-foreground font-body font-semibold uppercase tracking-wider mb-2 block">Water with this meal</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map(w => (
                  <button key={w} onClick={() => setWater(w)}
                    className={`w-11 h-11 rounded-xl text-center transition-all border flex items-center justify-center ${
                      water === w
                        ? 'border-primary/30 bg-primary/10'
                        : 'border-border/30 bg-card hover:bg-muted/30'
                    }`}>
                    <span className="text-sm font-number font-bold">{w}</span>
                  </button>
                ))}
                <span className="text-[10px] text-muted-foreground font-body self-center ml-1">glasses</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-body font-medium hover:bg-muted/50 transition-colors">Cancel</button>
              <button onClick={handleLog} className="flex-1 btn-primary">Log Meal</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── AI Insight ─── */}
      {(insight || loadingInsight) && (
        <motion.div {...fadeUp} transition={{ duration: 0.4 }}
          className="relative bg-card/90 backdrop-blur-sm border border-primary/15 rounded-2xl overflow-hidden mb-6"
          style={{ background: 'linear-gradient(135deg, hsl(var(--mint) / 0.04), hsl(var(--card)), hsl(var(--primary) / 0.04))' }}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-mint/20 to-primary/15 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-mint" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body">Nutrition Insight</span>
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

      {/* ─── Today's Meal Distribution ─── */}
      {mealDistribution.length > 0 && (
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5 mb-5">
          <SectionLabel icon={Apple} label="Today's Meals" />
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={mealDistribution} cx="50%" cy="50%" innerRadius={32} outerRadius={52} dataKey="value" paddingAngle={4} strokeWidth={0}>
                  {mealDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {mealDistribution.map(m => (
                <div key={m.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="text-xs font-body text-foreground font-medium">{m.name}</span>
                  <span className="text-xs font-number text-muted-foreground ml-auto">{m.value}×</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Wellness Food Guide ─── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden mb-5">
        <div className="h-1 bg-gradient-to-r from-mint via-warm-peach to-secondary" />
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-mint/20 to-secondary/15 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-mint" />
            </div>
            <h3 className="font-display text-base text-foreground font-semibold">Wellness Food Guide</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {healthySuggestions.map(cat => (
              <div key={cat.category} className="p-4 rounded-xl bg-muted/15 border border-border/20 hover:border-primary/15 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{cat.emoji}</span>
                  <p className="text-xs font-body font-semibold text-foreground">{cat.category}</p>
                </div>
                <p className="text-[11px] text-muted-foreground font-body leading-relaxed mb-2.5">{cat.detail}</p>
                <div className="flex flex-wrap gap-1">
                  {cat.items.map(item => (
                    <span key={item} className="text-[10px] px-2 py-0.5 rounded-lg bg-primary/8 border border-primary/10 text-primary font-body">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── Recent Logs ─── */}
      {logs.length > 0 && (
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
          <SectionLabel icon={UtensilsCrossed} label="Recent Meals" />
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {[...logs].reverse().slice(0, 7).map(l => (
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/15 border border-border/20">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${mealColors[l.mealType]}20` }}>
                  <span className="text-lg">{mealTypes.find(m => m.key === l.mealType)?.emoji || '🍽️'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground font-body font-medium truncate">{l.foods}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{l.date} · {mealTypes.find(m => m.key === l.mealType)?.label}</p>
                </div>
                {l.mood && <span className="text-base">{moodAfterEating.find(m => m.key === l.mood)?.emoji}</span>}
                {l.water > 0 && <span className="text-[10px] text-primary font-number font-bold">💧{l.water}</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
