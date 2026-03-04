import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUser, saveUser } from '@/lib/storage';
import { Leaf, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('mindease_logged_in') === 'true';
    if (loggedIn) navigate('/', { replace: true });
  }, [navigate]);

  const handleEnter = () => {
    const user = getUser();
    const normalizedName = name.trim() || (email.includes('@') ? email.split('@')[0] : 'Friend');

    saveUser({
      ...user,
      anonymous: false,
      name: normalizedName,
    });

    sessionStorage.setItem('mindease_logged_in', 'true');
    navigate('/', { replace: true });
  };

  const handleAnonymous = () => {
    const user = getUser();
    saveUser({
      ...user,
      anonymous: true,
      name: '',
    });

    sessionStorage.setItem('mindease_logged_in', 'true');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex gradient-mesh">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-primary to-mint">
        <div className="relative z-10">
          <button type="button" onClick={() => navigate('/home')} className="flex items-center gap-3 mb-16 text-left">
            <div className="w-10 h-10 rounded-xl bg-background/20 backdrop-blur flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-primary-foreground font-display text-xl font-semibold">MindEase AI</h2>
              <p className="text-primary-foreground/70 text-xs font-body">Your calm in the chaos</p>
            </div>
          </button>

          <h1 className="font-display text-5xl text-primary-foreground font-bold leading-tight mb-6">
            Your mental<br />wellness,<br />reimagined.
          </h1>

          <div className="flex flex-wrap gap-2 mb-10">
            {['AI Companion', 'Mood Tracking', 'Wellness Tools'].map((f) => (
              <span key={f} className="px-4 py-1.5 rounded-full bg-background/15 backdrop-blur text-primary-foreground text-sm font-body font-medium">
                {f}
              </span>
            ))}
          </div>

          <div className="flex gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-background/15 backdrop-blur-lg rounded-2xl p-4 w-48"
            >
              <p className="text-primary-foreground/80 text-xs font-body mb-2">Today's Mood</p>
              <div className="flex gap-2">
                {['😄', '🙂', '😐', '😔'].map((e) => <span key={e} className="text-xl">{e}</span>)}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-background/15 backdrop-blur-lg rounded-2xl p-4 w-52"
            >
              <p className="text-primary-foreground/80 text-xs font-body mb-2">SERA says</p>
              <p className="text-primary-foreground text-sm font-body">"You're doing better than you think. 💙"</p>
            </motion.div>
          </div>
        </div>

        <p className="text-primary-foreground/60 text-sm font-body italic relative z-10">
          "Mental health is not a destination, but a process." — Noam Shpancer
        </p>

        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-background/5" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-background/5" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button type="button" onClick={() => navigate('/home')} className="lg:hidden flex items-center gap-3 mb-8 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">MindEase AI</h2>
              <p className="text-muted-foreground text-xs font-body">Your calm in the chaos</p>
            </div>
          </button>

          <h1 className="font-display text-3xl font-semibold text-foreground mb-1">
            {isSignUp ? 'Get Started 🌿' : 'Welcome back 👋'}
          </h1>
          <p className="text-muted-foreground font-body mb-8">
            {isSignUp ? 'Create your wellness space' : 'Continue your wellness journey'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Your Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="button" onClick={handleEnter} className="w-full btn-primary py-3 text-base font-semibold">
              Enter MindEase ✨
            </button>

            <button type="button" className="w-full py-3 rounded-xl border border-border text-sm font-body font-medium text-foreground flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <button type="button" onClick={handleAnonymous} className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors font-body">
              Continue Anonymously →
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 font-body">
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline">
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Get started'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
