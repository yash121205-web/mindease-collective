import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, ArrowLeft, Home } from 'lucide-react';
import AppSidebar from './AppSidebar';
import FloatingActionButton from '../FloatingActionButton';
import StreakBanner from '../StreakBanner';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="flex min-h-screen w-full grain gradient-mesh">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <StreakBanner />

        {/* Header with back navigation */}
        <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center px-4 border-b border-border bg-background/80 backdrop-blur-lg gap-2">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          
          {!isDashboard && (
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors" title="Go back">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          )}

          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Home">
            <Home className="w-4 h-4 text-muted-foreground" />
          </button>

          <span className="ml-1 font-display text-foreground text-lg font-semibold">MindEase AI</span>
        </header>

        {/* Desktop back button */}
        {!isDashboard && (
          <div className="hidden lg:flex items-center gap-2 px-8 pt-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-body">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-xs text-border">·</span>
            <button onClick={() => navigate('/dashboard')} className="text-xs text-muted-foreground hover:text-foreground transition-colors font-body">
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
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        <FloatingActionButton />
      </div>
    </div>
  );
}
