import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import AppLayout from "@/components/layout/AppLayout";
import SplashScreen from "@/components/SplashScreen";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import Mood from "./pages/Mood";
import Journal from "./pages/Journal";
import Wellness from "./pages/Wellness";
import Insights from "./pages/Insights";
import Resources from "./pages/Resources";
import Progress from "./pages/Progress";
import SettingsPage from "./pages/Settings";
import Games from "./pages/Games";
import PopulationInsights from "./pages/PopulationInsights";
import Sleep from "./pages/Sleep";
import Diet from "./pages/Diet";
import Meditation from "./pages/Meditation";
import GratitudeWall from "./pages/GratitudeWall";
import Soundscapes from "./pages/Soundscapes";
import Affirmations from "./pages/Affirmations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const loggedIn = sessionStorage.getItem('mindease_logged_in') === 'true';
  if (!loggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('mindease_splash_shown'));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence>
          {showSplash && (
            <SplashScreen onDone={() => {
              sessionStorage.setItem('mindease_splash_shown', 'true');
              setShowSplash(false);
            }} />
          )}
        </AnimatePresence>
        {!showSplash && (
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected dashboard */}
              <Route path="/dashboard" element={<AuthGuard><AppLayout><Landing /></AppLayout></AuthGuard>} />
              <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
                <Route path="/app/chat" element={<Chat />} />
                <Route path="/app/mood" element={<Mood />} />
                <Route path="/app/journal" element={<Journal />} />
                <Route path="/app/wellness" element={<Wellness />} />
                <Route path="/app/insights" element={<Insights />} />
                <Route path="/app/resources" element={<Resources />} />
                <Route path="/app/progress" element={<Progress />} />
                <Route path="/app/games" element={<Games />} />
                <Route path="/app/community" element={<PopulationInsights />} />
                <Route path="/app/sleep" element={<Sleep />} />
                <Route path="/app/diet" element={<Diet />} />
                <Route path="/app/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
