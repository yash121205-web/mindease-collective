import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, ArrowLeft, Home, Leaf } from 'lucide-react';
import AppSidebar from './AppSidebar';
import FloatingActionButton from '../FloatingActionButton';
import StreakBanner from '../StreakBanner';
import DecorativeBlobs from '../DecorativeBlobs';
import MobileBottomNav from '../MobileBottomNav';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="flex min-h-screen w-full gradient-mesh grain relative">
      <DecorativeBlobs />
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <StreakBanner />

        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center px-4 border-b border-border/30 bg-background/80 backdrop-blur-xl gap-2">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          
          {!isDashboard && (
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors" title="Go back">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          )}

          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors" title="Home">
            <Home className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="ml-1 flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-foreground text-base font-semibold">MindEase</span>
          </div>
        </header>

        {/* Desktop back button */}
        {!isDashboard && (
          <div className="hidden lg:flex items-center gap-2 px-8 pt-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-xs text-border">·</span>
            <button onClick={() => navigate('/dashboard')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Home
            </button>
          </div>
        )}

        <main className="flex-1">
          {children || (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* Bottom padding for mobile nav */}
        <div className="lg:hidden h-16" />

        <FloatingActionButton />
        <MobileBottomNav />
      </div>
    </div>
  );
}
