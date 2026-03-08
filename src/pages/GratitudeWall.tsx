import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Sparkles, X, Send, Search, Calendar, Filter, Flame, Trash2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { genId } from '@/lib/storage';
import { toast } from 'sonner';

interface GratitudeNote {
  id: string;
  text: string;
  color: string;
  emoji: string;
  category: string;
  date: string;
  timestamp: number;
  liked: boolean;
}

const noteColors = [
  'from-primary/15 to-primary/5',
  'from-secondary/20 to-secondary/5',
  'from-rose-soft/20 to-rose-soft/5',
  'from-warm-lavender/30 to-warm-lavender/10',
  'from-sky-soft/30 to-sky-soft/10',
  'from-mint/15 to-mint/5',
];

const emojisByCategory: Record<string, string[]> = {
  people: ['💛', '💙', '🤗', '👫', '🫂'],
  nature: ['🌸', '🌿', '☀️', '🌻', '🍃'],
  moments: ['✨', '🌈', '🕊️', '🫧', '🦋'],
  self: ['💪', '🧘', '🌱', '🪷', '🫀'],
  simple: ['☕', '📖', '🎵', '🛌', '🍳'],
};

const categories = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'people', label: 'People', emoji: '💛' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'moments', label: 'Moments', emoji: '🌈' },
  { id: 'self', label: 'Self', emoji: '🧘' },
  { id: 'simple', label: 'Simple Joys', emoji: '☕' },
];

const prompts: Record<string, string[]> = {
  people: ["Who made your day brighter?", "Which friend or family member are you thankful for?", "Who believed in you recently?"],
  nature: ["What in nature took your breath away?", "What weather are you grateful for today?", "What natural sound soothes your soul?"],
  moments: ["What unexpected joy found you today?", "What memory makes you smile right now?", "What tiny moment felt magical?"],
  self: ["What about yourself are you proud of?", "What skill or strength helped you recently?", "How did you show up for yourself today?"],
  simple: ["What simple pleasure brought you peace?", "What routine comfort are you thankful for?", "What everyday item made your life easier?"],
};

const allPrompts = Object.values(prompts).flat();

function getStoredNotes(): GratitudeNote[] {
  try {
    const raw = localStorage.getItem('mindease_gratitude_wall');
    const parsed = raw ? JSON.parse(raw) : [];
    // Migrate old notes
    return parsed.map((n: any) => ({
      ...n,
      category: n.category || 'moments',
      timestamp: n.timestamp || Date.now(),
      liked: n.liked ?? false,
    }));
  } catch { return []; }
}

function storeNotes(notes: GratitudeNote[]) {
  localStorage.setItem('mindease_gratitude_wall', JSON.stringify(notes));
}

function getStreak(notes: GratitudeNote[]): number {
  if (notes.length === 0) return 0;
  const dates = new Set(notes.map(n => n.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (dates.has(key)) streak++;
    else break;
  }
  return streak;
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function GratitudeWall() {
  const [notes, setNotes] = useState<GratitudeNote[]>(getStoredNotes);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('moments');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [prompt, setPrompt] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const pool = prompts[selectedCategory] || allPrompts;
    setPrompt(pool[Math.floor(Math.random() * pool.length)]);
  }, [showAdd, selectedCategory]);

  useEffect(() => {
    if (showAdd) {
      const emojis = emojisByCategory[selectedCategory] || emojisByCategory.moments;
      setSelectedEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    }
  }, [showAdd, selectedCategory]);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (filterCat !== 'all') result = result.filter(n => n.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(n => n.text.toLowerCase().includes(q));
    }
    return result;
  }, [notes, filterCat, search]);

  const streak = useMemo(() => getStreak(notes), [notes]);
  const todayCount = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return notes.filter(n => n.date === today).length;
  }, [notes]);

  const addNote = () => {
    if (!newText.trim()) return;
    const emojis = emojisByCategory[selectedCategory] || emojisByCategory.moments;
    const note: GratitudeNote = {
      id: genId(),
      text: newText.trim(),
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      emoji: selectedEmoji || emojis[Math.floor(Math.random() * emojis.length)],
      category: selectedCategory,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: Date.now(),
      liked: false,
    };
    const updated = [note, ...notes];
    setNotes(updated);
    storeNotes(updated);
    setNewText('');
    setShowAdd(false);
    toast.success('Gratitude planted! 🌱');
  };

  const toggleLike = (id: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, liked: !n.liked } : n);
    setNotes(updated);
    storeNotes(updated);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    storeNotes(updated);
    toast('Note removed');
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <PageHeader title="Gratitude Wall" subtitle="Plant seeds of thankfulness. Watch them bloom." emoji="🌸" gradient="from-secondary/10 to-rose-soft/8" />

      {/* Stats bar */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-4 border border-border/50 text-center">
          <p className="text-2xl font-bold text-foreground">{notes.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Notes</p>
        </div>
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-4 border border-border/50 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-primary" />
            <p className="text-2xl font-bold text-foreground">{streak}</p>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Day Streak</p>
        </div>
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-4 border border-border/50 text-center">
          <p className="text-2xl font-bold text-foreground">{todayCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Today</p>
        </div>
      </motion.div>

      {/* Action bar */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="flex items-center gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Gratitude
        </button>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`p-2.5 rounded-xl transition-all ${showSearch ? 'bg-primary/10 text-primary' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}
        >
          <Search className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filterCat === c.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted/40 border border-transparent'}`}
            >
              <span className="text-sm">{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Search */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search your gratitude notes..."
              className="w-full px-4 py-3 rounded-xl bg-card/90 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card rounded-3xl p-6 max-w-md w-full shadow-xl border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">New Gratitude</h2>
                </div>
                <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-muted/50">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Category selector */}
              <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
                {categories.filter(c => c.id !== 'all').map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === c.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted/40 border border-transparent'}`}
                  >
                    <span>{c.emoji}</span> {c.label}
                  </button>
                ))}
              </div>

              <p className="text-sm text-primary italic mb-3">💡 {prompt}</p>

              {/* Emoji picker */}
              <div className="flex gap-1.5 mb-3">
                {(emojisByCategory[selectedCategory] || emojisByCategory.moments).map(e => (
                  <button
                    key={e}
                    onClick={() => setSelectedEmoji(e)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${selectedEmoji === e ? 'bg-primary/15 scale-110 border border-primary/30' : 'hover:bg-muted/40 border border-transparent'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="I'm grateful for..."
                className="w-full h-28 p-4 rounded-2xl bg-muted/30 border border-border text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addNote(); }}
              />

              <div className="flex items-center justify-between mt-4">
                <p className="text-[10px] text-muted-foreground">⌘+Enter to submit</p>
                <button
                  onClick={addNote}
                  disabled={!newText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40"
                >
                  <Send className="w-4 h-4" /> Plant this gratitude
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filteredNotes.length === 0 && !search && filterCat === 'all' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <span className="text-6xl block mb-4">🌱</span>
          <p className="text-xl font-semibold text-foreground mb-2">Your wall is empty</p>
          <p className="text-muted-foreground text-sm mb-6">Start planting gratitude to grow your garden of joy.</p>
          <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
            Plant your first gratitude
          </button>
        </motion.div>
      )}

      {filteredNotes.length === 0 && (search || filterCat !== 'all') && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <span className="text-4xl block mb-3">🔍</span>
          <p className="text-foreground font-medium mb-1">No notes found</p>
          <p className="text-muted-foreground text-sm">Try a different filter or search term.</p>
        </motion.div>
      )}

      {/* Notes Grid — masonry */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        <AnimatePresence>
          {filteredNotes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className={`break-inside-avoid rounded-2xl p-4 bg-gradient-to-br ${note.color} border border-border/50 relative group hover:shadow-md transition-shadow`}
            >
              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleLike(note.id)}
                  className={`p-1.5 rounded-full transition-all ${note.liked ? 'bg-rose-soft/30 text-rose-soft' : 'bg-background/80 text-muted-foreground hover:text-rose-soft'}`}
                >
                  <Heart className={`w-3 h-3 ${note.liked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1.5 rounded-full bg-background/80 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <span className="text-2xl block mb-2">{note.emoji}</span>
              <p className="text-sm text-foreground leading-relaxed">{note.text}</p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] text-muted-foreground">{note.date}</p>
                <span className="text-[10px] text-muted-foreground/60 capitalize">{note.category}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
