import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUser, saveUser, clearAllData } from '@/lib/storage';
import { Leaf, Eye, EyeOff, MessageCircle, BarChart3, BookOpen, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface StoredAccount {
  name: string;
  email: string;
  password: string;
  googleLogin?: boolean;
}

function getAccounts(): StoredAccount[] {
  try {
    return JSON.parse(localStorage.getItem('mindease_accounts') || '[]');
  } catch { return []; }
}

function saveAccount(acc: StoredAccount) {
  const accounts = getAccounts();
  const idx = accounts.findIndex(a => a.email === acc.email);
  if (idx >= 0) accounts[idx] = acc; else accounts.push(acc);
  localStorage.setItem('mindease_accounts', JSON.stringify(accounts));
}

// Floating orb component
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        y: [0, -30, 0, 20, 0],
        x: [0, 15, -10, 5, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{ duration: 12, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    // Clear stale app data on login page load (not accounts)
    clearAllData();
    const loggedIn = sessionStorage.getItem('mindease_logged_in') === 'true';
    if (loggedIn) navigate('/', { replace: true });
  }, [navigate]);

  const validate = () => {
    if (isSignUp && !isAnonymous && !name.trim()) { setError('Name is required'); return false; }
    if (!email.trim() || !email.includes('@')) { setError('Valid email is required'); return false; }
    if (!password.trim() || password.length < 4) { setError('Password must be at least 4 characters'); return false; }
    return true;
  };

  const handleSignUp = () => {
    setError('');
    if (!validate()) return;
    const accounts = getAccounts();
    if (accounts.find(a => a.email === email.trim())) {
      setError('Account already exists. Please sign in.');
      return;
    }
    const displayName = isAnonymous ? 'Anonymous' : name.trim();
    saveAccount({ name: displayName, email: email.trim(), password });
    const user = getUser();
    saveUser({ ...user, anonymous: isAnonymous, name: displayName });
    sessionStorage.setItem('mindease_logged_in', 'true');
    toast.success(`Welcome, ${displayName}! 🌿`);
    navigate('/', { replace: true });
  };

  const handleSignIn = () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required'); return; }
    const accounts = getAccounts();
    const acc = accounts.find(a => a.email === email.trim());
    if (!acc || acc.password !== password) {
      setError('Email or password incorrect.');
      return;
    }
    const user = getUser();
    saveUser({ ...user, anonymous: false, name: acc.name });
    sessionStorage.setItem('mindease_logged_in', 'true');
    toast.success(`Welcome back, ${acc.name}! 👋`);
    navigate('/', { replace: true });
  };

  const handleGoogle = () => {
    setError('');
    const googleNames = ['Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Ananya Singh', 'Vikram Mehta'];
    const randomName = googleNames[Math.floor(Math.random() * googleNames.length)];
    const googleEmail = `${randomName.toLowerCase().replace(' ', '.')}@gmail.com`;
    saveAccount({ name: randomName, email: googleEmail, password: 'google_oauth_token', googleLogin: true });
    const user = getUser();
    saveUser({ ...user, anonymous: false, name: randomName });
    localStorage.setItem('mindease_google_login', 'true');
    sessionStorage.setItem('mindease_logged_in', 'true');
    toast.success(`Signed in as ${randomName} via Google 🎉`);
    navigate('/', { replace: true });
  };

  const handleSubmit = () => {
    if (isSignUp) handleSignUp();
    else handleSignIn();
  };

  const features = [
    { icon: MessageCircle, label: 'AI Companion' },
    { icon: BarChart3, label: 'Mood Tracking' },
    { icon: BookOpen, label: 'Journaling' },
    { icon: Heart, label: 'Wellness Tools' },
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated background orbs — whole page */}
      <FloatingOrb className="w-[500px] h-[500px] bg-[hsl(var(--primary)/0.15)] top-[-100px] left-[-100px]" />
      <FloatingOrb className="w-[400px] h-[400px] bg-[hsl(var(--mint)/0.18)] bottom-[-80px] right-[-80px]" delay={3} />
      <FloatingOrb className="w-[300px] h-[300px] bg-[hsl(var(--indigo)/0.10)] top-[40%] left-[50%]" delay={6} />

      {/* ─── LEFT PANEL ─── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(237 97% 74% / 0.9), hsl(237 80% 60%), hsl(155 62% 50% / 0.7))',
        }}>
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-24 w-[420px] h-[420px] rounded-full bg-white/5" />

        {/* Logo + tagline */}
        <div className="relative z-10">
          <button type="button" onClick={() => navigate('/home')} className="flex items-center gap-4 mb-14 text-left group">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-white font-display text-2xl font-bold tracking-tight">MindEase AI</h2>
              <p className="text-white/60 text-sm font-body">Your calm in the chaos</p>
            </div>
          </button>

          <h1 className="font-display text-5xl text-white font-bold leading-[1.15] mb-4">
            Your mental<br />wellness,<br />reimagined.
          </h1>
          <p className="text-white/70 font-body text-base mb-10 max-w-sm leading-relaxed">
            Track moods, journal your thoughts, chat with an AI companion, and build healthy habits — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mb-12">
            {features.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-white text-sm font-body font-medium">
                <Icon className="w-4 h-4" />
                {label}
              </span>
            ))}
          </div>

          {/* Floating preview cards */}
          <div className="flex gap-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 w-52 border border-white/10"
            >
              <p className="text-white/60 text-xs font-body mb-3 uppercase tracking-wider">Today's Mood</p>
              <div className="flex gap-3 mb-2">
                {['😄', '🙂', '😐', '😔'].map(e => <span key={e} className="text-2xl">{e}</span>)}
              </div>
              <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                <motion.div className="h-full rounded-full bg-white/50" initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ delay: 1, duration: 1.2 }} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 w-56 border border-white/10"
            >
              <p className="text-white/60 text-xs font-body mb-3 uppercase tracking-wider">SERA says</p>
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-white text-sm font-body leading-relaxed">"You're doing better than you think. Keep going. 💙"</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom quote */}
        <p className="text-white/40 text-sm font-body italic relative z-10 max-w-sm leading-relaxed">
          "You don't have to be positive all the time. It's okay to feel sad, angry, or stressed. It means you're human."
        </p>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, hsl(237 97% 74% / 0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, hsl(155 62% 80% / 0.05) 0%, transparent 50%), hsl(var(--background))',
        }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          {/* Mobile logo */}
          <motion.button
            type="button"
            onClick={() => navigate('/home')}
            className="lg:hidden flex items-center gap-3 mb-8 text-left"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">MindEase AI</h2>
              <p className="text-muted-foreground text-xs font-body">Your calm in the chaos</p>
            </div>
          </motion.button>

          {/* Desktop logo glow */}
          <motion.div
            className="hidden lg:flex items-center gap-3 mb-10"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">MindEase AI</h2>
              <p className="text-muted-foreground text-xs font-body">Your calm in the chaos</p>
            </div>
          </motion.div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            {isSignUp ? (isAnonymous ? 'Anonymous Mode 🕶️' : 'Get Started 🌿') : 'Welcome back 👋'}
          </h1>
          <p className="text-muted-foreground font-body mb-7 text-sm">
            {isSignUp ? (isAnonymous ? 'Stay private — just email & password' : 'Create your wellness space') : 'Sign in with your email & password'}
          </p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-body">{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            {isSignUp && !isAnonymous && (
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1.5 block font-medium">Your Name <span className="text-destructive">*</span></label>
                <input
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  placeholder="What should we call you?"
                  className="w-full bg-muted/60 rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 border border-border/50 transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-body text-muted-foreground mb-1.5 block font-medium">Email <span className="text-destructive">*</span></label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="w-full bg-muted/60 rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 border border-border/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-body text-muted-foreground mb-1.5 block font-medium">Password <span className="text-destructive">*</span></label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full bg-muted/60 rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 pr-10 border border-border/50 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="button" onClick={handleSubmit} className="w-full btn-primary py-3 text-base font-semibold rounded-xl">
              {isSignUp ? 'Create Account ✨' : 'Sign In ✨'}
            </button>

            {/* Google button — white with colored G */}
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full py-3 rounded-xl bg-white border border-border text-sm font-body font-medium text-foreground flex items-center justify-center gap-3 hover:shadow-md transition-all dark:bg-card"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {!isAnonymous ? (
              <button type="button" onClick={() => { setIsAnonymous(true); setIsSignUp(true); setName(''); }} className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors font-body">
                Continue Anonymously →
              </button>
            ) : (
              <button type="button" onClick={() => { setIsAnonymous(false); setIsSignUp(true); }} className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors font-body">
                ← Back to regular sign up
              </button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 font-body">
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setIsAnonymous(false); setError(''); }} className="text-primary hover:underline font-medium">
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Get started'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
