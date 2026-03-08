import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { callAI } from '@/lib/ai';
import { Phone, Sparkles, BookOpen, Heart, ExternalLink, ChevronDown, ChevronUp, Search, Shield, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';

const helplines = [
  { name: 'iCall', number: '9152987821', desc: 'Psychosocial helpline by TISS', hours: 'Mon–Sat, 8am–10pm' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', desc: '24/7 mental health support', hours: '24/7' },
  { name: 'AASRA', number: '9820466627', desc: 'Crisis intervention center', hours: '24/7' },
  { name: 'iCall Online Chat', number: '', desc: 'Chat-based support', hours: 'Mon–Sat', link: 'https://icallhelpline.org' },
];

const copingGuides = [
  { title: 'Managing Exam Stress', icon: '📝', tags: ['stress', 'exam', 'academic', 'study', 'pressure'],
    content: 'Exam stress is one of the most common experiences among students, yet few know how to manage it effectively. The pressure to perform can trigger physical symptoms like headaches, insomnia, and muscle tension. Understanding that some stress is normal — even helpful — is the first step.\n\nWhen stress becomes overwhelming, it impairs memory and concentration, making studying less effective. The key is working with your stress, not against it.',
    tips: ['Break study sessions into 25-min blocks with 5-min breaks (Pomodoro)', 'Practice the 4-7-8 breathing technique before each session', 'Avoid comparing your progress with others — focus on your own pace'] },
  { title: 'Dealing with Loneliness', icon: '🤝', tags: ['lonely', 'alone', 'isolation', 'friends', 'social'],
    content: 'Loneliness is not about being alone — it\'s about feeling disconnected. Many students experience it, especially after moving to a new city or during demanding academic periods. Research shows loneliness can be as harmful to health as smoking 15 cigarettes a day.\n\nThe good news is that connection doesn\'t require grand gestures. Small, consistent interactions build meaningful relationships over time.',
    tips: ['Send one message to someone you care about today', 'Join a club or group aligned with your interests', 'Volunteer — helping others creates natural connection'] },
  { title: 'Sleep Hygiene for Students', icon: '😴', tags: ['sleep', 'insomnia', 'tired', 'rest', 'fatigue'],
    content: 'Sleep is the foundation of mental health. During sleep, your brain consolidates memories, processes emotions, and repairs itself. Yet students are among the most sleep-deprived populations, averaging just 6 hours when 7-9 is recommended.\n\nPoor sleep creates a vicious cycle: you can\'t focus, so you study longer, which cuts into sleep further.',
    tips: ['Set a consistent wake time (even weekends)', 'No screens 30 minutes before bed', 'Keep your room cool (65-68°F) and dark'] },
  { title: 'Understanding Anxiety', icon: '😰', tags: ['anxiety', 'anxious', 'panic', 'worry', 'nervous'],
    content: 'Anxiety is your brain\'s alarm system — it evolved to protect you from danger. But in modern life, it often fires at situations that aren\'t truly threatening: exams, social situations, future uncertainty. Understanding this helps you respond rather than react.\n\nAnxiety disorders are the most common mental health condition among young adults, affecting roughly 30% of students.',
    tips: ['Try the 5-4-3-2-1 grounding technique when anxiety spikes', 'Regular exercise reduces anxiety by up to 20%', 'Write down your worries — externalize them from your mind'] },
  { title: 'How to Talk About Mental Health', icon: '💬', tags: ['talk', 'communication', 'help', 'support', 'feelings'],
    content: 'Starting a conversation about mental health can feel daunting. You might worry about being judged, misunderstood, or burdening others. But research consistently shows that talking about feelings reduces their intensity — it\'s called "affect labeling."\n\nYou don\'t need to have a crisis to talk about your mental health. Regular check-ins with trusted people build emotional resilience.',
    tips: ['Start simple: "I\'ve been feeling stressed lately"', 'Choose someone you trust and a private setting', 'If they don\'t respond well, it\'s about them, not you'] },
  { title: 'Overcoming Procrastination', icon: '⏰', tags: ['procrastination', 'motivation', 'lazy', 'focus', 'productivity'],
    content: 'Procrastination isn\'t laziness — it\'s an emotional regulation problem. We avoid tasks that trigger negative emotions like anxiety, boredom, or fear of failure. Understanding this is key: you\'re not procrastinating because you\'re undisciplined, but because your brain is trying to protect you from discomfort.\n\nThe good news is that starting is the hardest part. Once you begin, motivation often follows.',
    tips: ['Use the 2-minute rule: if it takes less than 2 minutes, do it now', 'Break large tasks into ridiculously small steps', 'Remove distractions before starting — put phone in another room'] },
  { title: 'Building Emotional Resilience', icon: '💪', tags: ['resilience', 'strength', 'coping', 'recovery', 'mindset'],
    content: 'Resilience isn\'t about never struggling — it\'s about recovering from setbacks. Think of it as emotional fitness: it\'s built through regular practice, not through avoiding challenges. Research shows resilience can be developed at any age through specific practices.\n\nThe most resilient people share common traits: they maintain perspective, connect with others, and practice self-compassion.',
    tips: ['Reframe setbacks: "What can I learn from this?"', 'Build a support network before you need it', 'Practice self-compassion — talk to yourself like you would a friend'] },
  { title: 'Healthy Social Media Habits', icon: '📱', tags: ['social media', 'phone', 'digital', 'screen', 'comparison'],
    content: 'Social media is designed to capture attention, not to make you feel good. The comparison trap is real: you\'re comparing your behind-the-scenes to everyone else\'s highlight reel. Studies link heavy social media use to increased anxiety, depression, and loneliness among young adults.\n\nThe goal isn\'t to quit entirely, but to develop a healthier relationship with these platforms.',
    tips: ['Set daily time limits (2 hours max)', 'Unfollow accounts that make you feel worse about yourself', 'Do a 24-hour digital detox once a month'] },
];

const articles = [
  { title: 'Why Your Brain Needs Rest as Much as Your Body', readTime: '4 min', author: 'MindEase Editorial Team', tags: ['rest', 'brain', 'sleep', 'productivity'],
    preview: 'Your brain consumes 20% of your body\'s energy despite being only 2% of its weight. Without proper rest, cognitive function declines rapidly.',
    content: 'Your brain consumes 20% of your body\'s energy despite being only 2% of its weight. Without proper rest, cognitive function declines rapidly — studies show that going without sleep for 24 hours impairs judgment as much as a blood alcohol level of 0.10%.\n\nRest isn\'t just sleep. Your brain also needs wakeful rest: moments of unfocused, mind-wandering time. This activates the Default Mode Network (DMN), which is crucial for creativity, problem-solving, and self-reflection.\n\nThe most productive students aren\'t the ones who study the longest — they\'re the ones who strategically alternate between focused work and genuine rest. Try scheduling "brain breaks" into your day: 10 minutes of doing absolutely nothing, no phone, no music. Let your mind wander. You\'ll return to work with renewed clarity.' },
  { title: 'The Science of Why Journaling Works', readTime: '3 min', author: 'MindEase Editorial Team', tags: ['journaling', 'writing', 'emotions', 'mental health'],
    preview: 'Writing about emotions doesn\'t just feel good — it literally changes brain activity, reducing amygdala reactivity and strengthening emotional regulation.',
    content: 'Writing about emotions doesn\'t just feel good — it literally changes brain activity. Research by Dr. Matthew Lieberman at UCLA found that putting feelings into words — called "affect labeling" — reduces activity in the amygdala, your brain\'s alarm center.\n\nJournaling also engages the prefrontal cortex, strengthening your ability to regulate emotions over time. It\'s like strength training for your emotional brain.\n\nYou don\'t need to write poetry or pages of prose. Even 5 minutes of free-writing about your day can provide these benefits. The key is consistency, not quality. Write badly. Write honestly. The act of translating internal experience into words is where the magic happens.' },
  { title: 'Digital Detox: A Student\'s Guide', readTime: '5 min', author: 'MindEase Editorial Team', tags: ['digital', 'phone', 'detox', 'focus', 'social media'],
    preview: 'The average student checks their phone 96 times a day. Each interruption takes 23 minutes to fully recover from.',
    content: 'The average student checks their phone 96 times a day. Research by UC Irvine found that each interruption takes an average of 23 minutes and 15 seconds to fully recover from. Do the math: most of your "study time" is actually recovery time.\n\nA digital detox doesn\'t mean throwing your phone in a lake. Start small: designate one meal per day as phone-free. Set your phone to grayscale in the evening. Use "Do Not Disturb" mode during study sessions.\n\nThe goal is to reclaim your attention — your most valuable cognitive resource. When you reduce digital noise, you\'ll notice improved focus, better sleep, and surprisingly, less anxiety about what you might be missing.' },
  { title: 'How Sleep Affects Academic Performance', readTime: '4 min', author: 'MindEase Editorial Team', tags: ['sleep', 'academic', 'study', 'performance', 'grades'],
    preview: 'Students who sleep 8 hours before an exam perform 40% better on memory tasks than those who pulled all-nighters.',
    content: 'Here\'s a counterintuitive truth: sleeping more can improve your grades more than studying more. Students who sleep 8 hours before an exam perform 40% better on memory tasks than those who pulled all-nighters.\n\nDuring deep sleep (Stage 3-4), your brain replays and consolidates information learned during the day. Without adequate sleep, this process is interrupted, and newly learned material is literally lost.\n\nREM sleep, which occurs more in the later hours of sleep, is crucial for creative problem-solving and emotional processing. Cutting sleep short means missing the most valuable REM cycles. The optimal study strategy: learn material during the day, review briefly before bed, then sleep 7-8 hours. Your sleeping brain does the heavy lifting.' },
  { title: 'Mindfulness in 5 Minutes: A Beginner\'s Guide', readTime: '3 min', author: 'MindEase Editorial Team', tags: ['mindfulness', 'meditation', 'calm', 'breathing', 'beginner'],
    preview: 'You don\'t need an hour of meditation to see benefits. Just 5 minutes of mindfulness practice can reduce cortisol and improve focus.',
    content: 'Mindfulness isn\'t about emptying your mind — that\'s a common misconception. It\'s about noticing what\'s happening in your mind without getting caught up in it. Think of thoughts like clouds passing through the sky: you see them, but you don\'t have to fly in them.\n\nStart with this 5-minute practice: Sit comfortably. Close your eyes. Focus on the sensation of breathing — the air entering your nostrils, your chest rising, your belly expanding. When your mind wanders (it will), gently redirect to the breath. That redirect IS the practice.\n\nResearch shows that even brief mindfulness practice reduces cortisol (stress hormone) levels, improves attention span, and strengthens the prefrontal cortex. Try it for 5 minutes every morning for one week. Most people notice a difference by day 3.' },
  { title: 'Understanding the Stress-Performance Curve', readTime: '4 min', author: 'MindEase Editorial Team', tags: ['stress', 'performance', 'balance', 'burnout', 'productivity'],
    preview: 'Some stress actually improves performance. The Yerkes-Dodson law explains the sweet spot between boredom and burnout.',
    content: 'Not all stress is bad. The Yerkes-Dodson law, discovered over a century ago, describes an inverted-U relationship between stress and performance: too little stress leads to boredom and poor performance, while too much leads to anxiety and poor performance. The sweet spot is in the middle — what psychologists call "eustress" or positive stress.\n\nThe challenge is that this sweet spot is different for everyone and varies by task. Simple or well-practiced tasks benefit from higher arousal, while complex or new tasks require lower stress levels to perform well.\n\nTo find your sweet spot: notice when you\'re performing best. What\'s your stress level? That\'s your target. Use breathing exercises to lower stress when you\'re too activated, and set small challenges to increase engagement when you\'re under-stimulated. Managing your stress curve is a skill that will serve you for life.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function Resources() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const handleAsk = async () => {
    if (!aiQuery.trim()) return;
    setLoading(true);
    try {
      const r = await callAI(
        `A student is struggling with: "${aiQuery}". Recommend 3 specific, actionable mental wellness strategies with titles and 2-sentence explanations each. Format as JSON [{"title":"...","explanation":"...","action":"..."}]. Return ONLY JSON.`,
        'You are a wellness advisor. Return ONLY valid JSON, no extra text.'
      );
      const match = r.match(/\[[\s\S]*\]/);
      if (match) setAiResults(JSON.parse(match[0]));
      else throw new Error();
    } catch {
      setAiResults([
        { title: 'Start with Breathing', explanation: 'Deep breathing activates your parasympathetic nervous system, bringing immediate calm.', action: 'Try 3 rounds of 4-7-8 breathing right now.' },
        { title: 'Write It Down', explanation: 'Externalizing your thoughts reduces their emotional intensity by engaging your prefrontal cortex.', action: 'Spend 5 minutes journaling about what\'s bothering you.' },
        { title: 'Move Your Body', explanation: 'Even 10 minutes of movement releases endorphins and reduces cortisol levels significantly.', action: 'Take a short walk or try the desk yoga in our Wellness section.' },
      ]);
    }
    setLoading(false);
  };

  const lowerSearch = searchQuery.toLowerCase();
  const filteredGuides = searchQuery
    ? copingGuides.filter(g => g.title.toLowerCase().includes(lowerSearch) || g.tags.some(t => t.includes(lowerSearch)) || g.content.toLowerCase().includes(lowerSearch))
    : copingGuides;
  const filteredArticles = searchQuery
    ? articles.filter(a => a.title.toLowerCase().includes(lowerSearch) || a.tags.some(t => t.includes(lowerSearch)) || a.preview.toLowerCase().includes(lowerSearch))
    : articles;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto overflow-y-auto">
      <PageHeader title="Resources" subtitle="Support when you need it most" emoji="📚" gradient="from-rose-soft/10 to-secondary/8" />

      {/* Search Bar */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="relative mb-6">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search topics like "anxiety", "sleep", "exam stress"...'
          className="w-full bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/20 font-body transition-all"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs">✕</button>
        )}
      </motion.div>

      {searchQuery && filteredGuides.length === 0 && filteredArticles.length === 0 && (
        <div className="text-center py-8 mb-6 bg-card/80 border border-border/40 rounded-2xl">
          <p className="text-muted-foreground font-body">No results for "{searchQuery}". Try a different keyword or ask SERA below.</p>
        </div>
      )}

      {/* ─── Crisis Support Banner ─── */}
      <motion.section {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }} className="mb-8">
        <div className="relative rounded-2xl overflow-hidden border border-rose-soft/25">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-rose-soft via-secondary to-primary" />
          <div className="p-5 bg-gradient-to-br from-rose-soft/5 to-card/80">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-soft/15 border border-rose-soft/15 flex items-center justify-center">
                <Shield className="w-4 h-4 text-rose-soft" />
              </div>
              <div>
                <p className="text-sm text-foreground font-display font-semibold">Crisis Support</p>
                <p className="text-[11px] text-muted-foreground font-body">You're not alone. Reach out anytime.</p>
              </div>
            </div>
            <div className="grid gap-2.5 md:grid-cols-2">
              {helplines.map(h => (
                <div key={h.name} className="flex items-start gap-3 p-3 rounded-xl bg-card/70 border border-border/30 hover:border-rose-soft/20 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-rose-soft/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-rose-soft" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-body font-semibold text-foreground text-sm">{h.name}</p>
                      <span className="text-[9px] font-body text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md shrink-0">{h.hours}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-body mt-0.5">{h.desc}</p>
                    {h.number ? (
                      <a href={`tel:${h.number}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors font-number mt-1 inline-block">{h.number}</a>
                    ) : (
                      <a href={h.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-body flex items-center gap-1 mt-1">
                        Visit website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── SERA AI Recommender ─── */}
      <motion.section {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }} className="mb-8">
        <div className="relative rounded-2xl overflow-hidden border border-primary/15"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--card)), hsl(var(--mint) / 0.05))' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
          <div className="relative z-10 p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-foreground">Ask SERA</p>
                <p className="text-[11px] text-muted-foreground font-body">AI-powered wellness recommendations</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="What are you struggling with right now?"
                className="flex-1 bg-card/80 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-body"
              />
              <button onClick={handleAsk} disabled={!aiQuery.trim() || loading} className="btn-primary disabled:opacity-40 px-5">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : 'Ask'}
              </button>
            </div>
            {aiResults.length > 0 && (
              <div className="grid gap-2.5 mt-4 md:grid-cols-3">
                {aiResults.map((r: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="bg-card/80 border border-border/30 rounded-xl p-4 hover:border-primary/15 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{i === 0 ? '🎯' : i === 1 ? '💡' : '✨'}</span>
                      <h4 className="font-display text-sm text-foreground font-semibold">{r.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed">{r.explanation}</p>
                    {r.action && (
                      <button
                        onClick={() => {
                          if (r.action.toLowerCase().includes('breathing') || r.action.toLowerCase().includes('yoga') || r.action.toLowerCase().includes('wellness')) {
                            navigate('/app/wellness');
                          } else if (r.action.toLowerCase().includes('journal')) {
                            navigate('/app/journal');
                          } else {
                            toast.info(r.action);
                          }
                        }}
                        className="text-xs text-primary font-body mt-2.5 font-medium hover:underline flex items-center gap-1"
                      >
                        {r.action} <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ─── Coping Guides ─── */}
      {filteredGuides.length > 0 && (
        <motion.section {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="font-display text-lg text-foreground font-semibold">Coping Guides</h2>
            {searchQuery && <span className="text-xs text-muted-foreground font-body bg-muted/50 px-2 py-0.5 rounded-md">{filteredGuides.length} results</span>}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredGuides.map((g, i) => {
              const realIdx = copingGuides.indexOf(g);
              const isOpen = expandedGuide === realIdx;
              return (
                <motion.div key={realIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <button
                    onClick={() => setExpandedGuide(isOpen ? null : realIdx)}
                    className={`w-full text-left bg-card/90 backdrop-blur-sm border rounded-2xl p-4 transition-all ${isOpen ? 'border-primary/20 shadow-md' : 'border-border/40 hover:border-primary/15'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/5 flex items-center justify-center shrink-0">
                        <span className="text-xl">{g.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-sm text-foreground font-semibold">{g.title}</h3>
                        <p className="text-[11px] text-muted-foreground font-body mt-0.5 line-clamp-2 leading-relaxed">{g.content.split('\n')[0]}</p>
                      </div>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      </motion.div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="bg-card/80 border border-border/30 border-t-0 rounded-b-2xl p-5 -mt-2 pt-6">
                          <p className="text-sm text-foreground leading-relaxed font-body whitespace-pre-line mb-4">{g.content}</p>
                          <div className="border-t border-border/30 pt-3 mb-4">
                            <p className="text-[11px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Quick Tips</p>
                            <div className="space-y-2">
                              {g.tips.map((t, j) => (
                                <div key={j} className="flex items-start gap-2">
                                  <span className="text-primary text-xs mt-0.5">●</span>
                                  <p className="text-sm text-foreground font-body leading-relaxed">{t}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => navigate('/app/chat')} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" /> Talk to SERA
                            </button>
                            <button onClick={() => navigate('/app/wellness')} className="text-xs text-primary font-body font-medium hover:underline flex items-center gap-1">
                              Wellness exercises <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ─── Wellness Articles ─── */}
      {filteredArticles.length > 0 && (
        <motion.section {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary/15 to-mint/10 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-secondary" />
            </div>
            <h2 className="font-display text-lg text-foreground font-semibold">Wellness Articles</h2>
            {searchQuery && <span className="text-xs text-muted-foreground font-body bg-muted/50 px-2 py-0.5 rounded-md">{filteredArticles.length} results</span>}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredArticles.map((a, i) => {
              const realIdx = articles.indexOf(a);
              const isOpen = expandedArticle === realIdx;
              return (
                <motion.div key={realIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className={`bg-card/90 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all ${isOpen ? 'border-secondary/20 shadow-md' : 'border-border/40 hover:border-secondary/15'}`}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-body">{a.readTime} read</span>
                    </div>
                    <h3 className="font-display text-sm text-foreground font-semibold mb-1.5 leading-snug">{a.title}</h3>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed">{a.preview}</p>
                    <button
                      onClick={() => setExpandedArticle(isOpen ? null : realIdx)}
                      className="mt-3 text-xs text-primary font-body font-medium hover:underline flex items-center gap-1"
                    >
                      {isOpen ? 'Show less' : <>Read more <ArrowRight className="w-3 h-3" /></>}
                    </button>
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="px-5 pb-5 border-t border-border/20 pt-4">
                          <p className="text-sm text-foreground leading-relaxed font-body whitespace-pre-line">{a.content}</p>
                          <div className="flex gap-3 mt-4 pt-3 border-t border-border/20">
                            <button onClick={() => navigate('/app/journal')} className="text-xs text-primary font-body font-medium hover:underline flex items-center gap-1">
                              Write about this <ArrowRight className="w-3 h-3" />
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(a.content); toast.success('Article copied!'); }} className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors">
                              Copy article
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}
    </div>
  );
}
