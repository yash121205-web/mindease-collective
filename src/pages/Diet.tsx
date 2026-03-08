import { useState } from 'react';
import { motion } from 'framer-motion';
import { Apple, Plus, TrendingUp, Sparkles, Droplets, Flame as FireIcon, Leaf } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { callAI } from '@/lib/ai';
import { genId } from '@/lib/storage';
import { toast } from 'sonner';

interface MealLog {
  id: string;
  date: string;
  mealType: string;
  foods: string;
  mood: string;
  water: number;
  timestamp: number;
}

function getMealStorageKey(): string {
  const userId = sessionStorage.getItem('mindease_user_id') || 'anonymous';
  return `mindease_${userId}_meals`;
}
function getMealLogs(): MealLog[] {
  try { return JSON.parse(localStorage.getItem(getMealStorageKey()) || '[]'); } catch { return []; }
}
function saveMealLog(log: MealLog) {
  const logs = getMealLogs();
  logs.push(log);
  localStorage.setItem(getMealStorageKey(), JSON.stringify(logs));
}

const mealTypes = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅', time: '7-10 AM' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️', time: '12-2 PM' },
  { key: 'snack', label: 'Snack', emoji: '🍪', time: 'Anytime' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙', time: '7-9 PM' },
];

const moodAfterEating = [
  { key: 'energized', emoji: '⚡', label: 'Energized' },
  { key: 'satisfied', emoji: '😊', label: 'Satisfied' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
  { key: 'sluggish', emoji: '😴', label: 'Sluggish' },
  { key: 'bloated', emoji: '😣', label: 'Uncomfortable' },
];

const healthySuggestions = [
  { category: 'Mood Boosting Foods', emoji: '😊', items: ['Bananas (serotonin)', 'Dark Chocolate (endorphins)', 'Yogurt (probiotics)', 'Oats (steady energy)', 'Leafy Greens (folate)'],
    detail: 'These foods contain nutrients that directly support serotonin and dopamine production — your brain\'s happiness chemicals.' },
  { category: 'Brain Health Nutrition', emoji: '🧠', items: ['Walnuts (omega-3)', 'Blueberries (antioxidants)', 'Salmon (DHA)', 'Avocado (healthy fats)', 'Eggs (choline)'],
    detail: 'Omega-3 fatty acids and antioxidants protect brain cells and improve cognitive function, memory, and focus.' },
  { category: 'Foods that Reduce Stress', emoji: '💪', items: ['Oranges (vitamin C)', 'Sweet Potatoes (magnesium)', 'Almonds (vitamin E)', 'Chamomile Tea (apigenin)', 'Dark Berries (anthocyanins)'],
    detail: 'Vitamin C lowers cortisol. Magnesium relaxes muscles. These foods actively combat the physical effects of stress.' },
  { category: 'Hydration Tips', emoji: '💧', items: ['8 glasses/day minimum', 'Cucumber & mint water', 'Herbal teas count', 'Coconut water for electrolytes', 'Limit caffeine after 2pm'],
    detail: 'Even mild dehydration (1-2%) impairs mood, concentration, and increases anxiety. Water is the easiest wellness hack.' },
  { category: 'Balanced Diet Ideas', emoji: '🥗', items: ['Colorful plate rule', 'Protein with every meal', 'Whole grains over refined', 'Healthy snack prep', 'Eat mindfully, not rushed'],
    detail: 'A balanced diet stabilizes blood sugar, preventing mood crashes. Aim for variety — different colors mean different nutrients.' },
  { category: 'Sleep-Supporting Foods', emoji: '😴', items: ['Warm milk (tryptophan)', 'Tart Cherries (melatonin)', 'Kiwi (serotonin)', 'Turkey (L-tryptophan)', 'Brown Rice (GABA)'],
    detail: 'Eating these 1-2 hours before bed can naturally boost melatonin production and improve sleep quality.' },
];

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

  const mealDistribution = mealTypes.map(mt => ({
    name: mt.label,
    value: todayLogs.filter(l => l.mealType === mt.key).length || 0,
    color: mt.key === 'breakfast' ? 'hsl(45,70%,55%)' : mt.key === 'lunch' ? 'hsl(125,40%,55%)' : mt.key === 'snack' ? 'hsl(30,60%,60%)' : 'hsl(250,40%,65%)',
  })).filter(m => m.value > 0);

  const handleLog = async () => {
    if (!selectedMeal || !foods.trim()) {
      toast.error('Please select meal type and add what you ate');
      return;
    }
    const log: MealLog = {
      id: genId(),
      date: new Date().toISOString().split('T')[0],
      mealType: selectedMeal,
      foods: foods.trim(),
      mood,
      water,
      timestamp: Date.now(),
    };
    saveMealLog(log);
    setLogs(getMealLogs());
    setShowForm(false);
    setFoods('');
    setSelectedMeal('');
    setMood('');
    setWater(0);
    toast.success('Meal logged! 🍽️');

    // Generate insight
    setLoadingInsight(true);
    try {
      const r = await callAI(
        `User logged ${selectedMeal}: "${foods.trim()}". They felt ${mood || 'neutral'} after eating. Today they had ${todayLogs.length + 1} meals and ${todayWater + water} glasses of water. Give a warm, brief 2-sentence nutrition/wellness insight. Don't start with "I understand".`
      );
      setInsight(r);
    } catch {
      setInsight("Nourishing your body is an act of self-care. Try to include colorful fruits and vegetables in your next meal — they're packed with mood-boosting nutrients! 🌿");
    }
    setLoadingInsight(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <PageHeader title="Diet & Nutrition" subtitle="Fuel your body, fuel your mind" emoji="🍎" gradient="from-mint/10 to-warm-peach/8" />

        {/* Today's stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-static rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground font-number">{todayLogs.length}</p>
            <p className="text-xs text-muted-foreground font-body">Meals Today</p>
          </div>
          <div className="glass-static rounded-2xl p-4 text-center">
            <Droplets className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground font-number">{todayWater} 💧</p>
            <p className="text-xs text-muted-foreground font-body">Glasses</p>
          </div>
          <div className="glass-static rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground font-number">{logs.length}</p>
            <p className="text-xs text-muted-foreground font-body">Total Logs</p>
          </div>
        </div>

        {/* Log button */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="w-full btn-primary flex items-center justify-center gap-2 mb-6">
            <Plus className="w-4 h-4" /> Log a Meal
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-static rounded-3xl p-6 mb-6 space-y-4">
            <h3 className="font-display text-lg text-foreground font-semibold">Log Meal</h3>

            {/* Meal type */}
            <div>
              <label className="text-xs text-muted-foreground font-body mb-2 block">Meal Type</label>
              <div className="grid grid-cols-4 gap-2">
                {mealTypes.map(mt => (
                  <button key={mt.key} onClick={() => setSelectedMeal(mt.key)}
                    className={`p-2 rounded-xl text-center transition-all ${
                      selectedMeal === mt.key ? 'ring-2 ring-primary bg-primary/10 scale-105' : 'bg-muted hover:bg-muted/80'
                    }`}>
                    <span className="text-lg block">{mt.emoji}</span>
                    <span className="text-[10px] text-muted-foreground font-body">{mt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Foods */}
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">What did you eat?</label>
              <textarea value={foods} onChange={e => setFoods(e.target.value)}
                placeholder="e.g., Rice, dal, sabzi, yogurt..."
                className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                rows={2} />
            </div>

            {/* Mood after eating */}
            <div>
              <label className="text-xs text-muted-foreground font-body mb-2 block">How did you feel after eating?</label>
              <div className="flex gap-2">
                {moodAfterEating.map(m => (
                  <button key={m.key} onClick={() => setMood(m.key)}
                    className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
                      mood === m.key ? 'ring-2 ring-primary bg-primary/10' : 'bg-muted'
                    }`}>
                    <span className="text-sm block">{m.emoji}</span>
                    <span className="text-[8px] text-muted-foreground font-body">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Water */}
            <div>
              <label className="text-xs text-muted-foreground font-body mb-2 block">Water glasses with this meal</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map(w => (
                  <button key={w} onClick={() => setWater(w)}
                    className={`w-10 h-10 rounded-xl text-center transition-all ${
                      water === w ? 'ring-2 ring-primary bg-primary/10' : 'bg-muted'
                    }`}>
                    <span className="text-sm font-number">{w}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-body font-medium">Cancel</button>
              <button onClick={handleLog} className="flex-1 btn-primary">Log Meal</button>
            </div>
          </motion.div>
        )}

        {/* Insight */}
        {(insight || loadingInsight) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-static rounded-3xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body">Nutrition Insight</span>
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

        {/* Meal distribution chart */}
        {mealDistribution.length > 0 && (
          <div className="glass-static rounded-3xl p-5 mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Today's Meals</p>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={mealDistribution} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={5}>
                  {mealDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {mealDistribution.map(m => (
                <span key={m.name} className="text-xs font-body text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Wellness Food Guide */}
        <div className="glass-static rounded-3xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-4 h-4 text-secondary" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body">Wellness Food Guide</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {healthySuggestions.map(cat => (
              <div key={cat.category} className="p-4 rounded-xl bg-muted/30">
                <p className="text-sm font-body font-semibold text-foreground mb-1">{cat.emoji} {cat.category}</p>
                <p className="text-[11px] text-muted-foreground font-body leading-relaxed mb-2">{cat.detail}</p>
                <div className="flex flex-wrap gap-1">
                  {cat.items.map(item => (
                    <span key={item} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent logs */}
        {logs.length > 0 && (
          <div className="glass-static rounded-3xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Recent Meals</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[...logs].reverse().slice(0, 7).map(l => (
                <div key={l.id} className="flex items-center gap-3 p-2 rounded-xl bg-muted/30">
                  <span className="text-lg">{mealTypes.find(m => m.key === l.mealType)?.emoji || '🍽️'}</span>
                  <div className="flex-1">
                    <p className="text-xs text-foreground font-body font-medium">{l.foods}</p>
                    <p className="text-[10px] text-muted-foreground font-body">{l.date} · {mealTypes.find(m => m.key === l.mealType)?.label}</p>
                  </div>
                  {l.mood && <span className="text-sm">{moodAfterEating.find(m => m.key === l.mood)?.emoji}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
