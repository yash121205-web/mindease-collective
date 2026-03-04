import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import AppLayout from "@/components/layout/AppLayout";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import Mood from "./pages/Mood";
import Journal from "./pages/Journal";
import Wellness from "./pages/Wellness";
import Insights from "./pages/Insights";
import Resources from "./pages/Resources";
import Progress from "./pages/Progress";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<AppLayout />}>
              <Route path="/app/chat" element={<Chat />} />
              <Route path="/app/mood" element={<Mood />} />
              <Route path="/app/journal" element={<Journal />} />
              <Route path="/app/wellness" element={<Wellness />} />
              <Route path="/app/insights" element={<Insights />} />
              <Route path="/app/resources" element={<Resources />} />
              <Route path="/app/progress" element={<Progress />} />
              <Route path="/app/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
