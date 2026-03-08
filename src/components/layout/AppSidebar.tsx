import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, Smile, BookOpen, Leaf, BarChart3, Library, Trophy, Settings, Flame, Shield, Gamepad2, Users, BedDouble, Apple, Timer, Heart, Headphones, Sparkles, Target, LogOut, Moon, Sun
} from 'lucide-react';
import { calculateStreak, getTodayMood, MOOD_MAP, logoutUser } from '@/lib/storage';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

const navSections = [
  {
    label: 'Core',
    items: [
      { path: '/app/chat', label: 'Chat with SERA', icon: MessageCircle },
      { path: '/app/mood', label: 'Mood Check-In', icon: Smile },
      { path: '/app/journal', label: 'Journal', icon: BookOpen },
      { path: '/app/wellness', label: 'Wellness', icon: Leaf },
    ],
  },
  {
    label: 'Track',
    items: [
      { path: '/app/insights', label: 'Insights', icon: BarChart3 },
      { path: '/app/progress', label: 'Progress', icon: Trophy },
      { path: '/app/sleep', label: 'Sleep', icon: BedDouble },
      { path: '/app/diet', label: 'Diet', icon: Apple },
    ],
  },
  {
    label: 'Explore',
    items: [
      { path: '/app/meditation', label: 'Meditation', icon: Timer },
      { path: '/app/gratitude', label: 'Gratitude Wall', icon: Heart },
      { path: '/app/soundscapes', label: 'Soundscapes', icon: Headphones },
      { path: '/app/affirmations', label: 'Affirmations', icon: Sparkles },
      { path: '/app/challenges', label: 'Daily Challenges', icon: Target },
      { path: '/app/games', label: 'Stress Games', icon: Gamepad2 },
    ],
  },
  {
    label: 'More',
    items: [
      { path: '/app/resources', label: 'Resources', icon: Library },
      { path: '/app/community', label: 'Community', icon: Users },
      { path: '/app/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [anon, setAnon] = useState(false);
  const streak = calculateStreak();
  const todayMood = getTodayMood();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('mindease_theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    const saved = localStorage.getItem('mindease_theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogout = () => {
    onClose();
    logoutUser();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
        )}
      </AnimatePresence>

      <motion.aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 w-[260px] flex flex-col border-r border-border/50 bg-sidebar/95 backdrop-blur-xl transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="p-5 pb-4">
          <Link to="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg leading-tight text-foreground font-bold">MindEase</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">AI Wellness Companion</p>
            </div>
          </Link>
        </div>

        {/* Streak pill */}
        {streak > 0 && (
          <div className="mx-4 mb-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-primary/8 to-accent/8 border border-primary/10 flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">{streak} day streak</span>
            {todayMood && <span className="ml-auto text-sm">{MOOD_MAP[todayMood.mood]?.emoji}</span>}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path} onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all relative ${
                        active
                          ? 'text-white'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-xl glow-primary"
                          style={{ background: 'linear-gradient(135deg, hsl(239 84% 74%), hsl(160 84% 67%))' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <item.icon className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/30 space-y-1.5">
          <button onClick={toggleDark} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted/40 transition-colors">
            {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={() => setAnon(!anon)} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted/40 transition-colors">
            <Shield className="w-3.5 h-3.5" /><span>Anonymous Mode</span>
            <span className={`ml-auto w-7 h-4 rounded-full transition-colors flex items-center ${anon ? 'bg-primary justify-end' : 'bg-border justify-start'}`}>
              <span className="w-3 h-3 rounded-full bg-white mx-0.5 shadow-sm" />
            </span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted/40 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
}
