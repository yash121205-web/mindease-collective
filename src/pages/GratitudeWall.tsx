import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Sparkles, X, Send } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { genId } from '@/lib/storage';

interface GratitudeNote {
  id: string;
  text: string;
  color: string;
  emoji: string;
  date: string;
  rotation: number;
}

const noteColors = [
  'from-primary/15 to-primary/5',
  'from-secondary/20 to-secondary/5',
  'from-rose-soft/20 to-rose-soft/5',
  'from-warm-lavender/30 to-warm-lavender/10',
  'from-sky-soft/30 to-sky-soft/10',
  'from-mint/15 to-mint/5',
];

const emojis = ['🌸', '🌿', '☀️', '💛', '🦋', '🌻', '🍃', '✨', '🌈', '💙', '🕊️', '🫧'];

const prompts = [
  "What made you smile today?",
  "Name something you're proud of.",
  "Who made your life better recently?",
  "What simple pleasure are you grateful for?",
  "What challenge taught you something valuable?",
  "What part of your body are you thankful for today?",
];

function getStoredNotes(): GratitudeNote[] {
  try {
    const raw = localStorage.getItem('mindease_gratitude_wall');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function storeNotes(notes: GratitudeNote[]) {
  localStorage.setItem('mindease_gratitude_wall', JSON.stringify(notes));
}

export default function GratitudeWall() {
  const [notes, setNotes] = useState<GratitudeNote[]>(getStoredNotes);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  }, [showAdd]);

  const addNote = () => {
    if (!newText.trim()) return;
    const note: GratitudeNote = {
      id: genId(),
      text: newText.trim(),
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rotation: (Math.random() - 0.5) * 6,
    };
    const updated = [note, ...notes];
    setNotes(updated);
    storeNotes(updated);
    setNewText('');
    setShowAdd(false);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    storeNotes(updated);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <PageHeader title="Gratitude Wall" subtitle="Plant seeds of thankfulness. Watch them bloom." emoji="🌸" gradient="from-secondary/10 to-rose-soft/8" />
      </motion.div>

      {/* Stats bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-static rounded-2xl px-5 py-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground font-body">
            <span className="font-number font-bold text-foreground text-lg">{notes.length}</span> gratitude notes
          </span>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Gratitude
        </button>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-strong rounded-3xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl font-semibold text-foreground">New Gratitude</h2>
                </div>
                <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-muted/50">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <p className="text-sm text-primary font-body italic mb-3">💡 {prompt}</p>

              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="I'm grateful for..."
                className="w-full h-28 p-4 rounded-2xl bg-muted/30 border border-border text-foreground font-body text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                autoFocus
              />

              <button
                onClick={addNote}
                disabled={!newText.trim()}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Send className="w-4 h-4" /> Plant this gratitude
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {notes.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <span className="text-6xl block mb-4">🌱</span>
          <p className="font-display text-xl text-foreground mb-2">Your wall is empty</p>
          <p className="text-muted-foreground font-body text-sm mb-6">Start planting gratitude to grow your garden of joy.</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">Plant your first gratitude</button>
        </motion.div>
      )}

      {/* Notes Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        <AnimatePresence>
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.04 }}
              className={`break-inside-avoid rounded-2xl p-4 bg-gradient-to-br ${note.color} border border-border/50 relative group`}
              style={{ transform: `rotate(${note.rotation}deg)` }}
            >
              <button
                onClick={() => deleteNote(note.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-background/80 text-muted-foreground hover:text-destructive transition-all"
              >
                <X className="w-3 h-3" />
              </button>
              <span className="text-2xl block mb-2">{note.emoji}</span>
              <p className="font-body text-sm text-foreground leading-relaxed">{note.text}</p>
              <p className="text-[10px] text-muted-foreground font-body mt-3">{note.date}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
