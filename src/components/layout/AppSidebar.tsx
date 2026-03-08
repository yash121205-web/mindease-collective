import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, Smile, BookOpen, Leaf, BarChart3, Library, Trophy, Settings, Flame, Shield, Gamepad2, Users, BedDouble, Apple, Timer, Heart, Headphones, Sparkles, Target
} from 'lucide-react';
import { calculateStreak, getTodayMood, MOOD_MAP, logoutUser } from '@/lib/storage';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/app/chat', label: 'Chat with SERA', icon: MessageCircle },
  { path: '/app/mood', label: 'Mood Check-In', icon: Smile },
  { path: '/app/journal', label: 'Journal', icon: BookOpen },
  { path: '/app/wellness', label: 'Wellness', icon: Leaf },
  { path: '/app/insights', label: 'Insights', icon: BarChart3 },
  { path: '/app/resources', label: 'Resources', icon: Library },
  { path: '/app/progress', label: 'Progress', icon: Trophy },
  { path: '/app/sleep', label: 'Sleep', icon: BedDouble },
  { path: '/app/diet', label: 'Diet', icon: Apple },
  { path: '/app/meditation', label: 'Meditation', icon: Timer },
  { path: '/app/gratitude', label: 'Gratitude Wall', icon: Heart },
  { path: '/app/soundscapes', label: 'Soundscapes', icon: Headphones },
  { path: '/app/affirmations', label: 'Affirmations', icon: Sparkles },
  { path: '/app/challenges', label: 'Daily Challenges', icon: Target },
  { path: '/app/games', label: 'Stress Games', icon: Gamepad2 },
  { path: '/app/community', label: 'Community', icon: Users },
  { path: '/app/settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [anon, setAnon] = useState(false);
  const streak = calculateStreak();
  const todayMood = getTodayMood();

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

      <motion.aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 w-64 flex flex-col border-r border-border bg-sidebar transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(207,90%,72%), hsl(260,60%,78%))' }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg leading-tight text-foreground font-semibold">MindEase AI</h1>
              <p className="text-[10px] text-muted-foreground leading-tight font-body">Your calm in the chaos</p>
            </div>
          </Link>
        </div>

        {streak > 0 && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-secondary/20 flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground font-body">{streak} day streak</span>
            {todayMood && <span className="ml-auto text-sm">{MOOD_MAP[todayMood.mood]?.emoji}</span>}
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-body transition-all ${
                  active ? 'text-white shadow-md' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                }`}
                style={active ? { background: 'linear-gradient(135deg, hsl(207,90%,72%), hsl(260,60%,78%))' } : {}}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button onClick={() => setAnon(!anon)} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-sidebar-accent transition-colors font-body">
            <Shield className="w-3.5 h-3.5" /><span>Anonymous Mode</span>
            <span className={`ml-auto w-7 h-4 rounded-full transition-colors flex items-center ${anon ? 'bg-primary justify-end' : 'bg-border justify-start'}`}>
              <span className="w-3 h-3 rounded-full bg-white mx-0.5 shadow-sm" />
            </span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-sidebar-accent transition-colors font-body">
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
}
