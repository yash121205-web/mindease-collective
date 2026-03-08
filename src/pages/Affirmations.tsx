import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Copy, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { callAI } from '@/lib/ai';
import { getTodayMood, MOOD_MAP } from '@/lib/storage';
import { toast } from 'sonner';

const categories = [
  { id: 'self-love', label: '💗 Self-Love', prompt: 'self-love and self-acceptance' },
  { id: 'courage', label: '🦁 Courage', prompt: 'courage and facing fears' },
  { id: 'growth', label: '🌱 Growth', prompt: 'personal growth and learning from mistakes' },
  { id: 'calm', label: '🕊️ Inner Peace', prompt: 'inner peace and letting go of worry' },
  { id: 'strength', label: '💪 Strength', prompt: 'inner strength and resilience' },
  { id: 'gratitude', label: '🙏 Gratitude', prompt: 'gratitude and appreciating what you have' },
];

const fallbackAffirmations: Record<string, string[]> = {
  'self-love': [
    "You are worthy of love exactly as you are right now — not a future version of you.",
    "Your imperfections are not flaws. They are the brush strokes that make you a masterpiece.",
    "Loving yourself isn't selfish. It's the foundation from which you love everyone else.",
  ],
  courage: [
    "Bravery isn't the absence of fear — it's taking that first step while your knees are shaking.",
    "Every time you choose to try instead of hide, you rewrite the story fear told you.",
    "The comfort zone is comfortable, but nothing ever bloomed there.",
  ],
  growth: [
    "You are not behind. You are exactly where you need to be for your unique journey.",
    "Every setback has secretly been a setup for something your future self will thank you for.",
    "Growth feels uncomfortable because you're becoming someone who hasn't existed before.",
  ],
  calm: [
    "This moment is enough. You are enough. Breathe into that truth.",
    "Peace isn't found by rearranging the world. It's found by rearranging your mind.",
    "Let go of the need to control everything. Trust that things are unfolding as they should.",
  ],
  strength: [
    "You have survived 100% of your worst days. That track record is undefeated.",
    "The same storm that others couldn't weather — you walked through it and grew flowers.",
    "Your strength isn't loud. It's the quiet voice at the end of the day saying, 'I'll try again tomorrow.'",
  ],
  gratitude: [
    "Today, somewhere, something beautiful is happening because you exist.",
    "Gratitude turns ordinary moments into gifts you didn't know you were receiving.",
    "The life you're living right now is the life someone else is praying for.",
  ],
};

const cardColors = [
  'from-primary/10 via-sky-soft/10 to-warm-lavender/10',
  'from-secondary/10 via-rose-soft/10 to-primary/10',
  'from-mint/10 via-primary/10 to-warm-lavender/10',
  'from-warm-peach/10 via-secondary/10 to-primary/10',
  'from-sky-soft/10 via-primary/10 to-secondary/10',
  'from-warm-lavender/10 via-mint/10 to-primary/10',
];

export default function Affirmations() {
  const [category, setCategory] = useState(categories[0]);
  const [affirmation, setAffirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('mindease_fav_affirmations') || '[]'); } catch { return []; }
  });
  const [cardIndex, setCardIndex] = useState(0);
  const [showFavs, setShowFavs] = useState(false);

  const isFaved = favorites.includes(affirmation);
  const todayMood = getTodayMood();
  const colorClass = cardColors[categories.indexOf(category) % cardColors.length];

  useEffect(() => {
    loadAffirmation(category);
  }, []);

  const loadAffirmation = async (cat: typeof categories[0]) => {
    setCategory(cat);
    setLoading(true);
    const mood = todayMood?.mood ? MOOD_MAP[todayMood.mood]?.label : 'neutral';
    try {
      const result = await callAI(
        `Generate one powerful, beautiful affirmation about ${cat.prompt} for a student feeling ${mood}. Make it deeply personal and poetic. 1-2 sentences. No quotes, no hashtags, no emojis.`
      );
      setAffirmation(result.trim().replace(/^["']|["']$/g, ''));
    } catch {
      const pool = fallbackAffirmations[cat.id] || fallbackAffirmations['self-love'];
      setAffirmation(pool[Math.floor(Math.random() * pool.length)]);
    }
    setCardIndex(prev => prev + 1);
    setLoading(false);
  };

  const toggleFav = () => {
    let updated: string[];
    if (isFaved) {
      updated = favorites.filter(f => f !== affirmation);
    } else {
      updated = [...favorites, affirmation];
      toast.success('Saved to favorites 💗');
    }
    setFavorites(updated);
    localStorage.setItem('mindease_fav_affirmations', JSON.stringify(updated));
  };

  const shareAffirmation = () => {
    if (navigator.share) {
      navigator.share({ text: affirmation, title: 'Daily Affirmation — MindEase AI' });
    } else {
      navigator.clipboard.writeText(affirmation);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-secondary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <h1 className="font-display text-3xl text-foreground font-semibold">Daily Affirmations</h1>
        </div>
        <p className="text-muted-foreground font-body mb-8 ml-[52px]">Beautiful words to nurture your inner world.</p>
      </motion.div>

      {/* Category Pills */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 flex-wrap mb-8">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => loadAffirmation(cat)}
            className={`px-4 py-2 rounded-full text-xs font-body font-medium transition-all ${category.id === cat.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Affirmation Card */}
      <div className="relative min-h-[280px] flex items-center justify-center mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={cardIndex}
            initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
            transition={{ duration: 0.4 }}
            className={`w-full max-w-lg rounded-3xl p-10 bg-gradient-to-br ${colorClass} border border-border/50 text-center relative overflow-hidden`}
          >
            {/* Organic decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-secondary/5 blur-3xl" />

            {loading ? (
              <div className="py-8 flex flex-col items-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw className="w-6 h-6 text-primary" />
                </motion.div>
                <p className="text-sm text-muted-foreground font-body">Crafting your affirmation...</p>
              </div>
            ) : (
              <>
                <span className="text-4xl block mb-6">✨</span>
                <p className="font-display text-xl lg:text-2xl text-foreground leading-relaxed font-semibold italic relative z-10">
                  "{affirmation}"
                </p>
                <div className="flex items-center justify-center gap-3 mt-8 relative z-10">
                  <button onClick={toggleFav} className={`p-2.5 rounded-full transition-all ${isFaved ? 'bg-secondary/20 text-secondary' : 'bg-muted/50 text-muted-foreground hover:text-secondary'}`}>
                    <Heart className={`w-5 h-5 ${isFaved ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(affirmation); toast.success('Copied!'); }} className="p-2.5 rounded-full bg-muted/50 text-muted-foreground hover:text-primary transition-all">
                    <Copy className="w-5 h-5" />
                  </button>
                  <button onClick={shareAffirmation} className="p-2.5 rounded-full bg-muted/50 text-muted-foreground hover:text-primary transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <button onClick={() => loadAffirmation(category)} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 text-muted-foreground hover:text-foreground shadow-md hover:shadow-lg transition-all hidden md:flex">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => loadAffirmation(category)} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 text-muted-foreground hover:text-foreground shadow-md hover:shadow-lg transition-all hidden md:flex">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Generate button */}
      <div className="text-center mb-10">
        <button onClick={() => loadAffirmation(category)} disabled={loading} className="btn-primary inline-flex items-center gap-2 disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Generate New
        </button>
      </div>

      {/* Favorites section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <button onClick={() => setShowFavs(!showFavs)} className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-secondary" />
          <span className="font-body text-sm font-medium text-foreground">Saved Affirmations ({favorites.length})</span>
        </button>

        <AnimatePresence>
          {showFavs && favorites.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
              {favorites.map((fav, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass-static rounded-xl px-5 py-3 flex items-start gap-3">
                  <span className="text-secondary mt-0.5">💗</span>
                  <p className="font-body text-sm text-foreground italic flex-1">"{fav}"</p>
                  <button onClick={() => { navigator.clipboard.writeText(fav); toast.success('Copied!'); }} className="p-1 text-muted-foreground hover:text-primary">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
