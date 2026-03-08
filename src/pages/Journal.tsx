import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getJournalEntries, saveJournalEntry, genId, getTodayMood, MOOD_MAP, getTodayHabits, saveTodayHabits } from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { Search, Sparkles, Calendar, X, Tag, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const moodOptions = [
  { key: 'great', emoji: '😄' },
  { key: 'good', emoji: '🙂' },
  { key: 'okay', emoji: '😐' },
  { key: 'low', emoji: '😔' },
  { key: 'overwhelmed', emoji: '😰' },
];

export default function Journal() {
  const [entries, setEntries] = useState(() => getJournalEntries());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(getTodayMood()?.mood || '');
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [reflection, setReflection] = useState('');
  const [loadingReflection, setLoadingReflection] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<typeof entries[0] | null>(null);
  const [showPastEntries, setShowPastEntries] = useState(false);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleReflection = async () => {
    if (!content.trim()) { toast.error('Write something first'); return; }
    setLoadingReflection(true);
    try {
      const r = await callAI(`You are a compassionate journaling coach. Read this journal entry: "${content}". Write a warm 3-paragraph reflection: (1) Validate and name the emotions present, (2) Highlight a strength or insight you notice in their writing, (3) Offer one gentle, specific suggestion for their wellbeing. Keep it personal, not generic.`);
      setReflection(r);
      toast.success('Reflection generated ✦');
    } catch {
      setReflection("Your words carry weight and meaning. Taking time to write is a powerful act of self-awareness. Keep expressing yourself — it's one of the healthiest things you can do for your mental wellbeing. 💙");
    }
    setLoadingReflection(false);
  };

  const handleSave = () => {
    if (!content.trim()) { toast.error('Write something before saving'); return; }
    const entry = {
      id: genId(),
      title: title || 'Untitled Entry',
      date: new Date().toISOString().split('T')[0],
      content,
      mood,
      gratitude: gratitude.filter(Boolean),
      aiReflection: reflection,
      timestamp: Date.now(),
    };
    saveJournalEntry(entry);
    setEntries(getJournalEntries());
    setTitle('');
    setContent('');
    setGratitude(['', '', '']);
    setTags([]);
    setReflection('');
    toast.success('Journal entry saved ✦');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const filtered = entries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase())
  ).reverse();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] lg:h-screen overflow-hidden">
      {/* LEFT — Editor panel */}
      <div className="flex-1 lg:w-[60%] p-4 lg:p-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <h1 className="font-display text-3xl text-foreground mb-1 font-semibold">{today}</h1>
          <p className="text-sm text-muted-foreground font-body flex items-center gap-1 mb-6"><Calendar className="w-3 h-3" /> Journal Entry</p>

          {/* Mood selector */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground font-body">Mood:</span>
            {moodOptions.map(m => (
              <button key={m.key} onClick={() => setMood(m.key)}
                className={`text-xl p-1 rounded-lg transition-all ${mood === m.key ? 'bg-primary/10 scale-125 ring-2 ring-primary' : 'hover:scale-110 opacity-60'}`}>
                {m.emoji}
              </button>
            ))}
          </div>

          {/* Title */}
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your mind today..."
            className="w-full text-2xl font-display bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none mb-4 font-semibold" />

          {/* Content */}
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start writing... Let your thoughts flow freely."
            className="w-full min-h-[200px] bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none resize-none text-sm leading-relaxed font-body" />

          <div className="flex items-center justify-between mt-1 mb-4">
            <span className="text-xs text-muted-foreground font-number">{charCount} chars · {wordCount} words</span>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3 h-3 text-muted-foreground" />
              {tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-body flex items-center gap-1">
                  {t} <button onClick={() => setTags(tags.filter(x => x !== t))} className="hover:text-foreground">×</button>
                </span>
              ))}
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
                placeholder="Add tag..." className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-24 font-body" />
            </div>
          </div>

          {/* Gratitude */}
          <div className="glass-static rounded-2xl p-5 mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">✦ 3 things I'm grateful for today</p>
            <div className="space-y-2">
              {gratitude.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-primary text-xs">✦</span>
                  <input value={g} onChange={(e) => { const next = [...gratitude]; next[i] = e.target.value; setGratitude(next); }}
                    placeholder="I'm grateful for..."
                    className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 font-body" />
                </div>
              ))}
            </div>
          </div>

          {/* Reflection preview (inline for mobile) */}
          {loadingReflection && (
            <div className="glass-static rounded-2xl p-5 mb-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground font-body">SERA is reflecting on your entry...</p>
            </div>
          )}
          {reflection && !loadingReflection && (
            <div className="glass-static rounded-2xl p-5 mb-4 lg:hidden">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-body font-medium">SERA's Reflection</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line font-body">{reflection}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleReflection} disabled={!content.trim() || loadingReflection}
              className="btn-secondary flex items-center gap-1 disabled:opacity-40">
              {loadingReflection ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Get SERA's Reflection
            </button>
            <button onClick={handleSave} disabled={!content.trim()} className="btn-primary disabled:opacity-40">
              Save Entry
            </button>
          </div>

          {/* Mobile past entries toggle */}
          <div className="lg:hidden mt-6">
            <button onClick={() => setShowPastEntries(!showPastEntries)}
              className="flex items-center gap-2 text-sm text-primary font-body font-medium">
              {showPastEntries ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Past Entries ({entries.length})
            </button>
            <AnimatePresence>
              {showPastEntries && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries..."
                      className="w-full bg-muted rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none font-body" />
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filtered.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4 font-body">No entries yet — write your first one above! ✦</p>
                    ) : filtered.map(e => (
                      <button key={e.id} onClick={() => setSelectedEntry(e)} className="w-full p-3 rounded-xl glass-static text-xs text-left">
                        <p className="font-medium text-foreground truncate font-body">{e.title}</p>
                        <p className="text-muted-foreground mt-0.5 font-body">{e.date} {e.mood && MOOD_MAP[e.mood]?.emoji}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* RIGHT — Desktop reflection + past entries */}
      <div className="hidden lg:flex lg:w-[40%] flex-col border-l border-border bg-muted/20 overflow-y-auto">
        <div className="p-6 flex-1">
          <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2 font-semibold">
            <Sparkles className="w-4 h-4 text-primary" /> SERA's Thoughts
          </h3>
          {loadingReflection ? (
            <div className="flex items-center gap-3 p-4">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground font-body">Generating reflection...</p>
            </div>
          ) : reflection ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="glass-static rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground font-body font-medium">SERA's Reflection</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line font-body">{reflection}</p>
              </div>
              <button onClick={handleSave} disabled={!content.trim()} className="mt-3 text-xs text-primary font-body hover:underline">
                Save with reflection →
              </button>
            </motion.div>
          ) : (
            <p className="text-sm text-muted-foreground font-body">Write your thoughts and click "Get SERA's Reflection" for a personalized, supportive response.</p>
          )}
        </div>

        {/* Past entries */}
        <div className="border-t border-border p-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-body">Past Entries ({entries.length})</h4>
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries..."
              className="w-full bg-muted rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none font-body" />
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 w-full font-body">Your first entry is the hardest — start with just one sentence. ✦</p>
            ) : filtered.map(e => (
              <button key={e.id} onClick={() => setSelectedEntry(e)} className="w-full p-3 rounded-xl glass-static text-xs text-left hover:ring-1 hover:ring-primary/20 transition-all">
                <p className="font-medium text-foreground truncate font-body">{e.title}</p>
                <p className="text-muted-foreground mt-0.5 font-body">{e.date} {e.mood && MOOD_MAP[e.mood]?.emoji}</p>
                {e.aiReflection && <span className="text-[10px] text-primary font-body">✦ Has reflection</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Entry detail modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-md"
            onClick={() => setSelectedEntry(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-strong rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl text-foreground font-semibold">{selectedEntry.title}</h3>
                  <p className="text-xs text-muted-foreground font-body">{selectedEntry.date} {selectedEntry.mood && MOOD_MAP[selectedEntry.mood]?.emoji}</p>
                </div>
                <button onClick={() => setSelectedEntry(null)} className="p-1 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line font-body mb-4">{selectedEntry.content}</p>
              {selectedEntry.gratitude?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 font-body">Gratitude:</p>
                  {selectedEntry.gratitude.map((g, i) => <p key={i} className="text-sm text-foreground font-body">✦ {g}</p>)}
                </div>
              )}
              {selectedEntry.aiReflection && (
                <div className="glass-static rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1 font-body">SERA's Reflection:</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line font-body">{selectedEntry.aiReflection}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
