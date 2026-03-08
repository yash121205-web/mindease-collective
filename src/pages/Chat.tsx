import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, BookmarkPlus, AlertTriangle, Mic, MicOff, Globe, Shield, Smile, BookOpen, Wind, Gamepad2, ChevronDown } from 'lucide-react';
import { callAIChat, detectEmotion, detectCrisis, analyzeVoiceTone } from '@/lib/ai';
import { getChatHistory, saveChatHistory, genId, type ChatMessage } from '@/lib/storage';

function QuickActions({ navigate, onSend }: { navigate: (path: string) => void; onSend: (text: string) => void }) {
  const actions = [
    { icon: Smile, label: 'Log mood', action: () => navigate('/app/mood') },
    { icon: BookOpen, label: 'Journal', action: () => navigate('/app/journal') },
    { icon: Wind, label: 'Breathe', action: () => navigate('/app/wellness') },
    { icon: Gamepad2, label: 'Games', action: () => navigate('/app/games') },
  ];
  return (
    <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-border/50">
      {actions.map(a => (
        <button key={a.label} onClick={a.action}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted text-xs font-body text-muted-foreground hover:text-foreground transition-all whitespace-nowrap shrink-0">
          <a.icon className="w-3.5 h-3.5" /> {a.label}
        </button>
      ))}
    </div>
  );
}

const SUGGESTED = [
  "I'm anxious about my exams 😰",
  "I feel like no one understands me",
  "Help me calm down right now",
  "I can't stop overthinking",
  "I need motivation today",
  "I'm feeling really lonely lately",
];

const LANGUAGES = [
  // Global
  { code: 'en', label: 'English', flag: '🇬🇧' },
  // South Asian
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', label: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', label: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'ne', label: 'नेपाली', flag: '🇳🇵' },
  { code: 'si', label: 'සිංහල', flag: '🇱🇰' },
  // East Asian
  { code: 'zh', label: '中文 (简体)', flag: '🇨🇳' },
  { code: 'zh-TW', label: '中文 (繁體)', flag: '🇹🇼' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'mn', label: 'Монгол', flag: '🇲🇳' },
  // Southeast Asian
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tl', label: 'Filipino', flag: '🇵🇭' },
  { code: 'my', label: 'မြန်မာစာ', flag: '🇲🇲' },
  { code: 'km', label: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  { code: 'lo', label: 'ພາສາລາວ', flag: '🇱🇦' },
  // European — Western
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'pt-PT', label: 'Português (PT)', flag: '🇵🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'ca', label: 'Català', flag: '🇪🇸' },
  { code: 'gl', label: 'Galego', flag: '🇪🇸' },
  { code: 'eu', label: 'Euskara', flag: '🇪🇸' },
  // European — Nordic
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'is', label: 'Íslenska', flag: '🇮🇸' },
  // European — Eastern
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', label: 'Slovenčina', flag: '🇸🇰' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
  { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
  { code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'bg', label: 'Български', flag: '🇧🇬' },
  { code: 'hr', label: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', label: 'Српски', flag: '🇷🇸' },
  { code: 'sl', label: 'Slovenščina', flag: '🇸🇮' },
  { code: 'et', label: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', label: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', label: 'Lietuvių', flag: '🇱🇹' },
  { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
  // European — Celtic & Insular
  { code: 'ga', label: 'Gaeilge', flag: '🇮🇪' },
  { code: 'cy', label: 'Cymraeg', flag: '🏴' },
  // Middle Eastern
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'ku', label: 'Kurdî', flag: '🇮🇶' },
  { code: 'ps', label: 'پښتو', flag: '🇦🇫' },
  // African
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'yo', label: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', label: 'Igbo', flag: '🇳🇬' },
  { code: 'zu', label: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh', label: 'isiXhosa', flag: '🇿🇦' },
  { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
  { code: 'so', label: 'Soomaali', flag: '🇸🇴' },
  { code: 'af', label: 'Afrikaans', flag: '🇿🇦' },
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'sn', label: 'ChiShona', flag: '🇿🇼' },
  { code: 'ti', label: 'ትግርኛ', flag: '🇪🇷' },
  // Caucasus & Central Asian
  { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
  { code: 'hy', label: 'Հայերեն', flag: '🇦🇲' },
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
  { code: 'uz', label: 'Oʻzbekcha', flag: '🇺🇿' },
  // Oceanian
  { code: 'mi', label: 'Te Reo Māori', flag: '🇳🇿' },
  { code: 'sm', label: 'Gagana Sāmoa', flag: '🇼🇸' },
];

const LANG_NAMES: Record<string, string> = {};
LANGUAGES.forEach(l => { LANG_NAMES[l.code] = l.label; });

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
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatHistory());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [langSearch, setLangSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const filteredLangs = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) || l.code.includes(langSearch.toLowerCase())
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceFeedback("Voice input isn't supported in your browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLang === 'en' ? 'en-US' : selectedLang;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
      setInput(transcript);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (input.trim()) {
        const toneFeedback = analyzeVoiceTone(input);
        setVoiceFeedback(toneFeedback);
        setTimeout(() => setVoiceFeedback(''), 8000);
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceFeedback("Couldn't hear you clearly. Please try again.");
      setTimeout(() => setVoiceFeedback(''), 4000);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [selectedLang, input]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const emotion = detectEmotion(text);
    const crisis = detectCrisis(text);
    if (crisis) setShowCrisis(true);

    const userMsg: ChatMessage = {
      id: genId(), role: 'user', content: text.trim(),
      emotion: emotion ? `${emotion.emoji} ${emotion.label}` : undefined, timestamp: Date.now(),
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setVoiceFeedback('');
    setLoading(true);

    const assistantId = genId();
    let assistantContent = '';

    try {
      const apiMsgs = newMsgs.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const reply = await callAIChat(apiMsgs, selectedLang, (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.id === assistantId) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
          }
          return [...prev, { id: assistantId, role: 'assistant' as const, content: assistantContent, timestamp: Date.now() }];
        });
      });

      const finalContent = assistantContent || reply;
      setMessages(prev => {
        const hasAssistant = prev.some(m => m.id === assistantId);
        if (hasAssistant) return prev.map(m => m.id === assistantId ? { ...m, content: finalContent } : m);
        return [...prev, { id: assistantId, role: 'assistant' as const, content: finalContent, timestamp: Date.now() }];
      });

      setTimeout(() => { setMessages(prev => { saveChatHistory(prev); return prev; }); }, 100);
    } catch {
      const errMsg: ChatMessage = { id: assistantId, role: 'assistant', content: "SERA is taking a moment to gather her thoughts... Please try again. 💙", timestamp: Date.now() };
      setMessages(prev => {
        const hasAssistant = prev.some(m => m.id === assistantId);
        if (hasAssistant) return prev.map(m => m.id === assistantId ? errMsg : m);
        return [...prev, errMsg];
      });
      setTimeout(() => { setMessages(prev => { saveChatHistory(prev); return prev; }); }, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
      {/* Safe space banner */}
      <div className="bg-primary/5 border-b border-border px-4 py-2 flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-primary" />
        <p className="text-[11px] text-muted-foreground font-body">
          🔒 This is a <strong>safe, anonymous, judgment-free</strong> space. Your conversations are private.
        </p>
      </div>

      {/* Crisis banner */}
      <AnimatePresence>
        {showCrisis && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-rose-soft/20 border-b border-rose-soft/30 px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-soft shrink-0" />
            <p className="text-xs text-foreground font-body">
              If you're in crisis, please reach out: <strong>iCall: 9152987821</strong> · <strong>Vandrevala: 1860-2662-345</strong> · <strong>AASRA: 9820466627</strong>
            </p>
            <button onClick={() => setShowCrisis(false)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice feedback */}
      <AnimatePresence>
        {voiceFeedback && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-primary/5 border-b border-primary/10 px-4 py-2.5 flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs text-foreground font-body">{voiceFeedback}</p>
            <button onClick={() => setVoiceFeedback('')} className="ml-auto text-xs text-muted-foreground hover:text-foreground">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language indicator */}
      {selectedLang !== 'en' && (
        <div className="bg-primary/5 border-b border-border px-4 py-1.5 text-center">
          <p className="text-[10px] text-primary font-body font-medium">
            🌐 SERA is responding in {LANG_NAMES[selectedLang] || selectedLang}
          </p>
        </div>
      )}

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-16 lg:pt-24">
            <div className="flex justify-center"><SeraAvatar /></div>
            <div className="mx-auto mt-4 mb-2">
              <h2 className="font-display text-2xl text-foreground font-semibold">Hi, I'm SERA 💙</h2>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto font-body">
                Your Supportive Emotional Response Assistant. I'm here to listen without judgment and help you navigate whatever you're going through.
              </p>
              <p className="text-muted-foreground text-xs mt-2 max-w-xs mx-auto font-body opacity-70">
                🔒 Anonymous and confidential · 🌍 Speaks 30+ languages
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg mx-auto">
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="px-4 py-2 rounded-2xl glass-static text-sm text-foreground font-body transition-all hover:scale-[1.02] hover:shadow-md">
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <SeraAvatar emotion={msg.emotion} />}
            <div className="max-w-[75%] lg:max-w-[60%]">
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed font-body ${
                msg.role === 'user'
                  ? 'text-primary-foreground rounded-br-md'
                  : 'glass-static rounded-bl-md border-l-2 border-primary/30'
              }`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, hsl(207,90%,72%), hsl(260,60%,78%))' } : {}}>
                {msg.content}
              </div>
              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-[10px] text-muted-foreground font-number">{formatTime(msg.timestamp)}</span>
                {msg.emotion && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-body">{msg.emotion}</span>
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

        {loading && !messages.some(m => m.role === 'assistant' && m.content === '') && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-2.5">
            <SeraAvatar />
            <div className="glass-static px-4 py-3 rounded-2xl rounded-bl-md border-l-2 border-primary/30">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      {messages.length > 0 && !loading && (
        <QuickActions navigate={navigate} onSend={sendMessage} />
      )}

      {/* Input */}
      <div className="border-t border-border p-4 bg-background/80 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            {/* Language picker */}
            <div className="relative">
              <button onClick={() => setShowLangPicker(!showLangPicker)}
                className="w-11 h-11 rounded-2xl flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title="Change language">
                <Globe className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showLangPicker && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-14 left-0 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[180px] max-h-[320px] z-10 overflow-hidden flex flex-col">
                    <input value={langSearch} onChange={e => setLangSearch(e.target.value)}
                      placeholder="Search language..."
                      className="w-full px-3 py-1.5 text-xs font-body border-b border-border mb-1 bg-transparent focus:outline-none placeholder:text-muted-foreground" />
                    <div className="overflow-y-auto flex-1">
                      {filteredLangs.map(lang => (
                        <button key={lang.code}
                          onClick={() => { setSelectedLang(lang.code); setShowLangPicker(false); setLangSearch(''); }}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs font-body text-left flex items-center gap-2 ${
                            selectedLang === lang.code ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
                          }`}>
                          <span>{lang.flag}</span> {lang.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Voice input */}
            <button onClick={isListening ? stopListening : startListening}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                isListening ? 'bg-rose-soft/20 text-rose-soft animate-pulse' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title={isListening ? 'Stop listening' : 'Speak to SERA'}>
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening... 🎙️" : "Share what's on your mind..."}
              rows={1}
              className="flex-1 resize-none bg-muted rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-body" />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-2xl flex items-center justify-center disabled:opacity-40 transition-all shrink-0 text-white hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, hsl(207,90%,72%), hsl(260,60%,78%))' }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
