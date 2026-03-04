import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getJournalEntries, saveJournalEntry, genId, getTodayMood, MOOD_MAP } from '@/lib/storage';
import { callAI } from '@/lib/ai';
import { Search, PenLine, Sparkles, Calendar, X, FileText } from 'lucide-react';

export default function Journal() {
  const [entries, setEntries] = useState(() => getJournalEntries());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [reflection, setReflection] = useState('');
  const [loadingReflection, setLoadingReflection] = useState(false);
  const [search, setSearch] = useState('');
  const [showEntries, setShowEntries] = useState(false);
  const todayMood = getTodayMood();

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const handleReflection = async () => {
    if (!content.trim()) return;
    setLoadingReflection(true);
    try {
      const r = await callAI(`Read this journal entry and provide a warm, supportive 3-paragraph reflection. Identify emotions, validate feelings, and offer one gentle suggestion.\n\nEntry: "${content}"`);
      setReflection(r);
    } catch {
      setReflection("Your words matter. Taking time to reflect is a powerful act of self-care. Keep writing — it helps more than you know. 💙");
    }
    setLoadingReflection(false);
  };

  const handleSave = () => {
    const entry = {
      id: genId(),
      title: title || 'Untitled Entry',
      date: new Date().toISOString().split('T')[0],
      content,
      mood: todayMood?.mood || '',
      gratitude: gratitude.filter(Boolean),
      aiReflection: reflection,
      timestamp: Date.now(),
    };
    saveJournalEntry(entry);
    setEntries(getJournalEntries());
    setTitle('');
    setContent('');
    setGratitude(['', '', '']);
    setReflection('');
  };

  const filtered = entries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase())
  ).reverse();

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen">
      {/* Main editor */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor panel */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-3xl text-foreground">Journal</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {today}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowEntries(!showEntries)} className="lg:hidden p-2 rounded-xl glass text-muted-foreground">
                  <FileText className="w-4 h-4" />
                </button>
                {todayMood && (
                  <span className="px-3 py-1 rounded-full glass text-sm">{MOOD_MAP[todayMood.mood]?.emoji} {MOOD_MAP[todayMood.mood]?.label}</span>
                )}
              </div>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title..."
              className="w-full text-xl font-display bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none mb-4"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing... Let your thoughts flow freely."
              className="w-full min-h-[250px] bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none resize-none text-sm leading-relaxed"
            />

            <div className="flex items-center justify-between mt-2 mb-6">
              <span className="text-xs text-muted-foreground">{wordCount} words</span>
              <div className="flex gap-2">
                <button
                  onClick={handleReflection}
                  disabled={!content.trim() || loadingReflection}
                  className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Get AI Reflection
                </button>
                <button
                  onClick={handleSave}
                  disabled={!content.trim()}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Save Entry
                </button>
              </div>
            </div>

            {/* Gratitude */}
            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">🙏 Gratitude — 3 things you're grateful for</p>
              <div className="space-y-2">
                {gratitude.map((g, i) => (
                  <input
                    key={i}
                    value={g}
                    onChange={(e) => {
                      const next = [...gratitude];
                      next[i] = e.target.value;
                      setGratitude(next);
                    }}
                    placeholder={`${i + 1}. I'm grateful for...`}
                    className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Reflection panel */}
        <div className="hidden lg:block w-80 border-l border-border p-6 overflow-y-auto bg-muted/30">
          <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Reflection</h3>
          {loadingReflection ? (
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded-full w-full animate-pulse" />
              <div className="h-3 bg-muted rounded-full w-3/4 animate-pulse" />
              <div className="h-3 bg-muted rounded-full w-5/6 animate-pulse" />
            </div>
          ) : reflection ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {reflection}
            </motion.p>
          ) : (
            <p className="text-sm text-muted-foreground">Write your thoughts and click "Get AI Reflection" for a personalized, supportive response.</p>
          )}
        </div>
      </div>

      {/* Past entries drawer */}
      <AnimatePresence>
        {showEntries && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 bottom-0 w-72 bg-card border-l border-border z-50 p-4 overflow-y-auto shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">Past Entries</h3>
              <button onClick={() => setShowEntries(false)} className="p-1 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries..."
                className="w-full bg-muted rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              {filtered.map(e => (
                <div key={e.id} className="p-3 rounded-xl glass text-xs">
                  <p className="font-medium text-foreground truncate">{e.title}</p>
                  <p className="text-muted-foreground mt-0.5">{e.date} {e.mood && MOOD_MAP[e.mood]?.emoji}</p>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No entries yet. Start writing!</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
