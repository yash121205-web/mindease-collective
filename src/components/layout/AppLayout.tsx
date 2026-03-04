import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import AppSidebar from './AppSidebar';
import FloatingActionButton from '../FloatingActionButton';
import StreakBanner from '../StreakBanner';
import { motion } from 'framer-motion';

export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full grain gradient-mesh">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Streak banner */}
        <StreakBanner />

        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center px-4 border-b border-border bg-background/80 backdrop-blur-lg">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <span className="ml-3 font-display text-foreground text-lg font-semibold">MindEase AI</span>
        </header>

        <main className="flex-1">
          {children || (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          )}
        </main>

        <FloatingActionButton />
      </div>
    </div>
  );
}
