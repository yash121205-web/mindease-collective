import { useState, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import AppLayout from "@/components/layout/AppLayout";
import SplashScreen from "@/components/SplashScreen";
import { ThemeProvider } from "@/hooks/useTheme";

// Lazy-loaded pages for faster initial load
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Landing = lazy(() => import("./pages/Landing"));
const Chat = lazy(() => import("./pages/Chat"));
const Mood = lazy(() => import("./pages/Mood"));
const Journal = lazy(() => import("./pages/Journal"));
const Wellness = lazy(() => import("./pages/Wellness"));
const Insights = lazy(() => import("./pages/Insights"));
const Resources = lazy(() => import("./pages/Resources"));
const Progress = lazy(() => import("./pages/Progress"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const Games = lazy(() => import("./pages/Games"));
const PopulationInsights = lazy(() => import("./pages/PopulationInsights"));
const Sleep = lazy(() => import("./pages/Sleep"));
const Diet = lazy(() => import("./pages/Diet"));
const Meditation = lazy(() => import("./pages/Meditation"));
const GratitudeWall = lazy(() => import("./pages/GratitudeWall"));
const Soundscapes = lazy(() => import("./pages/Soundscapes"));
const Affirmations = lazy(() => import("./pages/Affirmations"));
const DailyChallenges = lazy(() => import("./pages/DailyChallenges"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const loggedIn = sessionStorage.getItem('mindease_logged_in') === 'true';
  if (!loggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
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
                  <Route path="/app/meditation" element={<Meditation />} />
                  <Route path="/app/gratitude" element={<GratitudeWall />} />
                  <Route path="/app/soundscapes" element={<Soundscapes />} />
                  <Route path="/app/affirmations" element={<Affirmations />} />
                  <Route path="/app/challenges" element={<DailyChallenges />} />
                  <Route path="/app/settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
