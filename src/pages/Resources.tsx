import { useState } from 'react';
import { motion } from 'framer-motion';
import { callAI } from '@/lib/ai';
import { Phone, MessageCircle, Sparkles, ExternalLink, BookOpen, Heart, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const helplines = [
  { name: 'iCall', number: '9152987821', desc: 'Psychosocial helpline by TISS' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', desc: '24/7 mental health support' },
  { name: 'AASRA', number: '9820466627', desc: 'Crisis intervention center' },
];

const guides = [
  { title: 'Managing Exam Stress', desc: 'Practical tips to stay calm during exam season', icon: '📝' },
  { title: 'Dealing with Loneliness', desc: 'Steps to build connection and combat isolation', icon: '🤝' },
  { title: 'Sleep Hygiene for Students', desc: 'Build better sleep habits for mental clarity', icon: '😴' },
  { title: 'How to Talk About Mental Health', desc: 'Starting conversations with friends and family', icon: '💬' },
  { title: 'Anxiety Grounding (5-4-3-2-1)', desc: 'A sensory technique to calm anxiety fast', icon: '🌿' },
];

export default function Resources() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await callAI(`A student says: "${query}". Suggest 2-3 specific, actionable mental wellness resources or tips. Be warm and concise.`);
      setAiResult(r);
    } catch {
      setAiResult("Take a deep breath. You're taking a great step by seeking help. Consider talking to a trusted person or calling one of the helplines above. 💙");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-1">Resources</h1>
        <p className="text-muted-foreground mb-8">Support when you need it most</p>

        {/* Crisis Helplines */}
        <section className="mb-8">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" /> Crisis Helplines
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {helplines.map(h => (
              <div key={h.name} className="rounded-2xl border-2 border-rose-soft/30 bg-rose-soft/5 p-4">
                <h3 className="font-semibold text-foreground text-sm">{h.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{h.desc}</p>
                <a href={`tel:${h.number}`} className="inline-flex items-center gap-1 mt-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
                  <Phone className="w-3.5 h-3.5" /> {h.number}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Coping Guides */}
        <section className="mb-8">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Coping Guides
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {guides.map((g, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-4 flex items-start gap-3">
                <span className="text-2xl">{g.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{g.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick tools */}
        <section className="mb-8">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Wind className="w-3.5 h-3.5" /> Quick Tools
          </h2>
          <div className="flex gap-3">
            <button onClick={() => navigate('/app/wellness')} className="glass rounded-2xl px-5 py-3 text-sm font-medium text-foreground hover:shadow-md transition-all flex items-center gap-2">
              🧘 Breathing Exercise
            </button>
            <button onClick={() => navigate('/app/wellness')} className="glass rounded-2xl px-5 py-3 text-sm font-medium text-foreground hover:shadow-md transition-all flex items-center gap-2">
              ⏱️ Focus Timer
            </button>
          </div>
        </section>

        {/* AI Resource Recommender */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Resource Finder
          </h2>
          <div className="glass rounded-2xl p-5">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="What are you struggling with?"
                className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <button
                onClick={handleAsk}
                disabled={!query.trim() || loading}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {loading ? '...' : 'Ask'}
              </button>
            </div>
            {aiResult && (
              <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm text-foreground leading-relaxed whitespace-pre-line">
                {aiResult}
              </motion.p>
            )}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
