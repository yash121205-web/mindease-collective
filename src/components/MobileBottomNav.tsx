import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, MessageCircle, Smile, BookOpen, Compass } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: MessageCircle, label: 'Chat', path: '/app/chat' },
  { icon: Smile, label: 'Mood', path: '/app/mood' },
  { icon: BookOpen, label: 'Journal', path: '/app/journal' },
  { icon: Compass, label: 'Explore', path: '/app/wellness' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border/30 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-primary to-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
