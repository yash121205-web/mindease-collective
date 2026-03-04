import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, BookmarkPlus, AlertTriangle } from 'lucide-react';
import { callAIChat, detectEmotion, detectCrisis } from '@/lib/ai';
import { getChatHistory, saveChatHistory, genId, type ChatMessage } from '@/lib/storage';

const SUGGESTED = [
  "I'm anxious about my exams 😰",
  "I feel like no one understands me",
  "Help me calm down right now",
  "I can't stop overthinking",
  "I need motivation today",
  "I'm feeling really lonely lately",
];

function SeraAvatar({ emotion }: { emotion?: string }) {
  const tilt = emotion === 'Sadness' || emotion === 'Loneliness' ? 'rotate-[-8deg]' : '';
  const glow = emotion === 'Happiness' || emotion === 'Gratitude';
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center animate-float ${tilt} transition-transform`}
      style={{ background: 'linear-gradient(135deg, hsl(330 100% 90% / 0.3), hsl(197 88% 80% / 0.25))' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="hsl(var(--primary))" opacity={glow ? "0.3" : "0.2"} />
        <circle cx="12" cy="12" r="8" fill="hsl(var(--primary))" opacity="0.15" />
        <g className="animate-blink origin-center">
          <ellipse cx="9" cy="10.5" rx="1.2" ry="1.5" fill="hsl(var(--primary))" />
          <ellipse cx="15" cy="10.5" rx="1.2" ry="1.5" fill="hsl(var(--primary))" />
        </g>
        <path d="M9 14.5Q12 17 15 14.5" stroke="hsl(var(--primary))" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatHistory());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const emotion = detectEmotion(text);
    const crisis = detectCrisis(text);
    if (crisis) setShowCrisis(true);

    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      content: text.trim(),
      emotion: emotion ? `${emotion.emoji} ${emotion.label}` : undefined,
      timestamp: Date.now(),
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    // Simulate typing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

    try {
      const apiMsgs = newMsgs.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const reply = await callAIChat(apiMsgs);
      const aiMsg: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };
      const updated = [...newMsgs, aiMsg];
      setMessages(updated);
      saveChatHistory(updated);
    } catch {
      const errMsg: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: "SERA is taking a moment to think... Please try again. 💙",
        timestamp: Date.now(),
      };
      const updated = [...newMsgs, errMsg];
      setMessages(updated);
      saveChatHistory(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
      {/* Crisis banner */}
      <AnimatePresence>
        {showCrisis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-soft/20 border-b border-rose-soft/30 px-4 py-3 flex items-center gap-3"
          >
            <AlertTriangle className="w-4 h-4 text-rose-soft shrink-0" />
            <p className="text-xs text-foreground font-body">
              If you're in crisis, please reach out: <strong>iCall: 9152987821</strong> · <strong>Vandrevala: 1860-2662-345</strong> · <strong>AASRA: 9820466627</strong>
            </p>
            <button onClick={() => setShowCrisis(false)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-16 lg:pt-24">
            <div className="flex justify-center"><SeraAvatar /></div>
            <div className="mx-auto mt-4 mb-2">
              <h2 className="font-display text-2xl text-foreground font-semibold">Hi, I'm SERA 💙</h2>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto font-body">
                Your Supportive Emotional Response Assistant. I'm here to listen, support, and help you navigate your feelings.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg mx-auto">
              {SUGGESTED.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-4 py-2 rounded-2xl glass-static text-sm text-foreground font-body transition-all hover:scale-[1.02]"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && <SeraAvatar emotion={msg.emotion} />}
            <div className={`max-w-[75%] lg:max-w-[60%]`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed font-body ${
                msg.role === 'user'
                  ? 'text-primary-foreground rounded-br-md'
                  : 'glass-static rounded-bl-md'
              }`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, hsl(330,100%,85%), hsl(197,88%,66%))' } : {}}
              >
                {msg.content}
              </div>
              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-[10px] text-muted-foreground font-number">{formatTime(msg.timestamp)}</span>
                {msg.emotion && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-body">
                    {msg.emotion}
                  </span>
                )}
                {msg.role === 'assistant' && (
                  <button className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 ml-1 font-body">
                    <BookmarkPlus className="w-3 h-3" /> Save
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <SeraAvatar />
            <div className="glass-static px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-background/80 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind..."
            rows={1}
            className="flex-1 resize-none bg-muted rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-body"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-2xl flex items-center justify-center disabled:opacity-40 transition-all shrink-0 text-white hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, hsl(330,100%,85%), hsl(197,88%,66%))' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
