import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff, Check, Globe, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
/* ─── helpers ─── */
interface StoredAccount { name: string; email: string; password: string; googleLogin?: boolean; }

function getAccounts(): StoredAccount[] {
  try { return JSON.parse(localStorage.getItem('mindease_accounts') || '[]'); } catch { return []; }
}
function saveAccount(acc: StoredAccount) {
  const accounts = getAccounts();
  const idx = accounts.findIndex(a => a.email === acc.email);
  if (idx >= 0) accounts[idx] = acc; else accounts.push(acc);
  localStorage.setItem('mindease_accounts', JSON.stringify(accounts));
}

function generateUserId(email: string): string {
  // Deterministic ID from email so the same email always maps to the same user data
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'u_' + Math.abs(hash).toString(36);
}

function loginUser(name: string, email: string, opts?: { anonymous?: boolean; google?: boolean }) {
  const userId = opts?.anonymous ? 'anon_' + Date.now().toString(36) : generateUserId(email);
  sessionStorage.setItem('mindease_user_id', userId);
  sessionStorage.setItem('mindease_logged_in', 'true');
  // Save user prefs scoped to this userId
  const userKey = `mindease_${userId}_user`;
  const existing = localStorage.getItem(userKey);
  if (!existing) {
    localStorage.setItem(userKey, JSON.stringify({ name, theme: 'light', anonymous: !!opts?.anonymous, streakDays: 0, lastCheckIn: '' }));
  }
  if (opts?.google) localStorage.setItem('mindease_google_login', 'true');
}

interface FieldErrors { name?: string; email?: string; password?: string; confirmPassword?: string; }

/* ─── Decorative cards ─── */
function MoodChartCard() {
  const bars = [
    { h: 60, color: 'hsl(var(--primary))' },
    { h: 80, color: 'hsl(var(--rose-soft))' },
    { h: 45, color: 'hsl(var(--primary))' },
    { h: 90, color: 'hsl(var(--rose-soft))' },
    { h: 70, color: 'hsl(var(--primary))' },
  ];
  return (
    <motion.div className="bg-white rounded-2xl p-5 w-56 shadow-lg border border-border" animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
      <p className="text-[11px] font-body font-semibold text-muted-foreground uppercase tracking-widest mb-3">This Week's Mood</p>
      <div className="flex items-end gap-2 h-20">
        {bars.map((b, i) => (
          <motion.div key={i} className="flex-1 rounded-t-md" style={{ backgroundColor: b.color, height: `${b.h}%` }} initial={{ height: 0 }} animate={{ height: `${b.h}%` }} transition={{ delay: 1 + i * 0.12, duration: 0.6 }} />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-body">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => <span key={d}>{d}</span>)}
      </div>
    </motion.div>
  );
}

function ChatBubbleCard() {
  return (
    <motion.div className="bg-white rounded-2xl p-5 w-64 shadow-lg border border-border" animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}>
      <div className="space-y-3">
        <div className="flex justify-end">
          <div className="text-white text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%] font-body" style={{ background: 'linear-gradient(135deg, hsl(207,90%,72%), hsl(260,60%,78%))' }}>
            I'm feeling anxious today
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-muted text-foreground text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] font-body">
            I'm here with you. Let's take it one step at a time 💕
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main ─── */
export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('mindease_logged_in') === 'true') navigate('/dashboard', { replace: true });
  }, [navigate]);

  const validate = useCallback((): FieldErrors => {
    const e: FieldErrors = {};
    if (isSignUp && !name.trim()) e.name = 'Please enter your name';
    if (!email.trim() || !email.includes('@') || !email.includes('.')) e.email = 'Please enter a valid email';
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters';
    if (isSignUp && password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  }, [name, email, password, confirmPassword, isSignUp]);

  const isValid = useCallback(() => Object.keys(validate()).length === 0, [validate]);
  const fieldOk = (field: string) => touched[field] && !(validate() as any)[field];

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      if (isSignUp) {
        if (getAccounts().find(a => a.email === email.trim())) { setErrors({ email: 'Account already exists. Please sign in.' }); setLoading(false); return; }
        saveAccount({ name: name.trim(), email: email.trim(), password });
        loginUser(name.trim(), email.trim());
        toast.success(`Welcome, ${name.trim()}! 🌸`);
      } else {
        const acc = getAccounts().find(a => a.email === email.trim());
        if (!acc || acc.password !== password) { setErrors({ email: 'Email or password incorrect.' }); setLoading(false); return; }
        loginUser(acc.name, acc.email);
        toast.success(`Welcome back, ${acc.name}! 💕`);
      }
      navigate('/dashboard', { replace: true });
    }, 1000);
  };

  const handleGoogle = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error('Google sign-in failed. Please try again.');
        console.error('Google OAuth error:', result.error);
      }
      // If redirected, page will reload and onAuthStateChange will handle session
    } catch (err) {
      console.error('Google login error:', err);
      toast.error('Google sign-in failed.');
    }
  };

  // Listen for OAuth callback session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        loginUser(displayName, user.email || '', { google: true });
        toast.success(`Signed in as ${displayName} via Google 🎉`);
        navigate('/dashboard', { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAnonymous = () => {
    loginUser('Friend', '', { anonymous: true });
    toast.success('Welcome, Friend! 🕶️ Your session is completely private.');
    navigate('/dashboard', { replace: true });
  };

  const inputClass = (field: string) => {
    const hasError = errors[field as keyof FieldErrors];
    const ok = fieldOk(field);
    return `w-full rounded-2xl px-4 py-3 text-sm font-body transition-all border focus:outline-none focus:ring-2 ${
      hasError ? 'border-destructive bg-destructive/5 focus:ring-destructive/30 text-foreground'
      : ok ? 'border-primary bg-primary/5 focus:ring-primary/30 text-foreground'
      : 'border-border bg-white focus:ring-primary/20 text-foreground placeholder:text-muted-foreground'
    }`;
  };

  const stagger = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 + i * 0.08, duration: 0.45 } });

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* LEFT PANEL */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        style={{ background: 'linear-gradient(135deg, hsl(207,90%,88%) 0%, hsl(263,55%,85%) 50%, hsl(156,50%,88%) 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 40%, hsla(207,90%,92%,0.4) 0%, transparent 60%)' }} />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/15" />
        <div className="absolute -bottom-40 -left-24 w-[420px] h-[420px] rounded-full bg-white/10" />

        <div className="relative z-10">
          <motion.div className="flex items-center gap-4 mb-14" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-white font-display text-3xl font-bold tracking-tight">MindEase AI</h2>
              <p className="text-white/70 text-sm font-body">Mental Wellness Companion</p>
            </div>
          </motion.div>

          <motion.h1 className="font-display text-5xl text-white font-bold leading-[1.15] mb-6 italic" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}>
            Your calm<br />in the chaos.
          </motion.h1>

          <motion.div className="flex flex-wrap gap-3 mb-14" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
            {['💬 AI Chat', '😊 Mood Tracking', '📓 Journaling', '🌿 Wellness Tools'].map(label => (
              <span key={label} className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white text-sm font-body font-medium border border-white/15">{label}</span>
            ))}
          </motion.div>

          <motion.div className="flex gap-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
            <MoodChartCard />
            <ChatBubbleCard />
          </motion.div>
        </div>

        <div className="relative z-10">
          <div className="w-16 h-px bg-white/25 mb-4" />
          <p className="text-white/60 text-sm font-body italic leading-relaxed max-w-md">
            "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, or stressed."
            <span className="block mt-1 not-italic text-white/40">— Lori Deschene</span>
          </p>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative bg-background">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, hsl(207,90%,95%,0.3) 0%, transparent 70%)' }} />
        <motion.div className="w-full max-w-md relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <motion.div className="flex items-center justify-center gap-3 mb-10" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(207,90%,72%), hsl(263,60%,76%))' }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">MindEase AI</h2>
              <p className="text-muted-foreground text-[11px] font-body">Your calm in the chaos</p>
            </div>
          </motion.div>

          <motion.div {...stagger(0)} className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">{isSignUp ? 'Get Started ✨' : 'Welcome back 💙'}</h1>
            <p className="text-muted-foreground font-body text-sm">{isSignUp ? 'Create your wellness space' : 'Continue your wellness journey'}</p>
          </motion.div>

          <div className="space-y-4">
            {isSignUp && (
              <motion.div {...stagger(1)}>
                <label className="text-[11px] font-body text-muted-foreground mb-1.5 block font-semibold uppercase tracking-wider">Your Name <span className="text-destructive">*</span></label>
                <div className="relative">
                  <input value={name} onChange={e => { setName(e.target.value); setTouched(t => ({ ...t, name: true })); setErrors(er => ({ ...er, name: undefined })); }} placeholder="What should we call you?" className={inputClass('name')} />
                  {fieldOk('name') && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />}
                </div>
                {errors.name && <p className="text-destructive text-xs mt-1 font-body">{errors.name}</p>}
              </motion.div>
            )}

            <motion.div {...stagger(2)}>
              <label className="text-[11px] font-body text-muted-foreground mb-1.5 block font-semibold uppercase tracking-wider">Email Address <span className="text-destructive">*</span></label>
              <div className="relative">
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setTouched(t => ({ ...t, email: true })); setErrors(er => ({ ...er, email: undefined })); }} placeholder="you@example.com" className={inputClass('email')} />
                {fieldOk('email') && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />}
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1 font-body">{errors.email}</p>}
            </motion.div>

            <motion.div {...stagger(3)}>
              <label className="text-[11px] font-body text-muted-foreground mb-1.5 block font-semibold uppercase tracking-wider">Password <span className="text-destructive">*</span></label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setTouched(t => ({ ...t, password: true })); setErrors(er => ({ ...er, password: undefined })); }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder={isSignUp ? 'Create a password' : '••••••••'} className={inputClass('password')} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                {fieldOk('password') && !showPw && <Check className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />}
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1 font-body">{errors.password}</p>}
            </motion.div>

            {isSignUp && (
              <motion.div {...stagger(4)}>
                <label className="text-[11px] font-body text-muted-foreground mb-1.5 block font-semibold uppercase tracking-wider">Confirm Password <span className="text-destructive">*</span></label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setTouched(t => ({ ...t, confirmPassword: true })); setErrors(er => ({ ...er, confirmPassword: undefined })); }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="Re-enter your password" className={inputClass('confirmPassword')} />
                  {fieldOk('confirmPassword') && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />}
                </div>
                {errors.confirmPassword && <p className="text-destructive text-xs mt-1 font-body">{errors.confirmPassword}</p>}
              </motion.div>
            )}

            <motion.div {...stagger(5)}>
              <button type="button" onClick={handleSubmit} disabled={!isValid() || loading}
                className={`w-full py-3.5 rounded-2xl text-sm font-body font-semibold transition-all flex items-center justify-center gap-2 ${
                  isValid() && !loading ? 'text-white cursor-pointer shadow-[0_4px_20px_hsl(207_80%_75%/0.4)] hover:shadow-[0_6px_28px_hsl(207_80%_72%/0.5)] hover:scale-[1.02]' : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                style={isValid() && !loading ? { background: 'linear-gradient(135deg, hsl(207,90%,72%), hsl(260,60%,78%))' } : undefined}
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Enter MindEase ✨</>}
              </button>
            </motion.div>

            <motion.div {...stagger(6)} className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-border" /><span className="text-muted-foreground text-xs font-body">or</span><div className="flex-1 h-px bg-border" />
            </motion.div>

            <motion.div {...stagger(7)}>
              <button type="button" onClick={handleGoogle} className="w-full py-3 rounded-2xl bg-white text-foreground text-sm font-body font-medium flex items-center justify-center gap-3 hover:shadow-lg transition-all border border-border">
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            </motion.div>

            <motion.div {...stagger(8)}>
              <button type="button" onClick={handleAnonymous} className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors font-body py-1">Continue Anonymously →</button>
            </motion.div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-7 font-body">
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setErrors({}); setTouched({}); setConfirmPassword(''); }} className="text-primary hover:underline font-medium">
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Get started'}
            </button>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-3 font-body">
            <button type="button" onClick={() => navigate('/')} className="text-muted-foreground hover:text-primary transition-colors">
              ← Back to Landing Page
            </button>
          </p>
        </motion.div>
      </div>

      <style>{`@keyframes glowMove { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
    </div>
  );
}
