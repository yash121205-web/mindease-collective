import { useState } from 'react';
import { motion } from 'framer-motion';
import { getUser, saveUser, clearAllData, exportData } from '@/lib/storage';
import { useTheme } from '@/hooks/useTheme';
import { User, Shield, Palette, Database, Info, Download, Trash2, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(getUser);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mindease_api_key') || '');

  const updateUser = (partial: Partial<typeof user>) => {
    const next = { ...user, ...partial };
    setUser(next);
    saveUser(next);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindease-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleClear = () => {
    if (confirm('Are you sure? This will delete all your data.')) {
      clearAllData();
      toast.success('All data cleared');
      window.location.reload();
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('mindease_api_key', apiKey.trim());
      toast.success('API key saved — SERA will now use live AI');
    } else {
      localStorage.removeItem('mindease_api_key');
      toast.success('API key removed — using smart mock responses');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-1 font-semibold">Settings</h1>
        <p className="text-muted-foreground mb-8 font-body">Personalize your experience</p>

        <div className="space-y-6">
          {/* Profile */}
          <div className="glass-static rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2 font-body"><User className="w-3.5 h-3.5" /> Profile</h2>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block font-body">Name</label>
              <input
                value={user.name}
                onChange={(e) => updateUser({ name: e.target.value })}
                placeholder="Your name"
                className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Anonymous */}
          <div className="glass-static rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 font-body"><Shield className="w-3.5 h-3.5" /> Privacy</h2>
            <button
              onClick={() => updateUser({ anonymous: !user.anonymous, name: user.anonymous ? user.name : '' })}
              className="flex items-center justify-between w-full"
            >
              <span className="text-sm text-foreground font-body">Anonymous Mode</span>
              <span className={`w-10 h-5 rounded-full transition-colors flex items-center ${user.anonymous ? 'bg-primary justify-end' : 'bg-border justify-start'}`}>
                <span className="w-4 h-4 rounded-full bg-primary-foreground mx-0.5 shadow-sm" />
              </span>
            </button>
          </div>

          {/* Theme */}
          <div className="glass-static rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 font-body"><Palette className="w-3.5 h-3.5" /> Theme</h2>
            <div className="flex gap-2">
              {(['light', 'dark', 'auto'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all font-body ${
                    theme === t ? 'btn-primary' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="glass-static rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 font-body"><Key className="w-3.5 h-3.5" /> AI Integration</h2>
            <p className="text-xs text-muted-foreground mb-2 font-body">Add your Anthropic API key for live SERA responses. Without it, smart mock responses are used.</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <button onClick={handleSaveApiKey} className="btn-primary">Save</button>
            </div>
          </div>

          {/* Data */}
          <div className="glass-static rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 font-body"><Database className="w-3.5 h-3.5" /> Data Management</h2>
            <div className="flex gap-2">
              <button onClick={handleExport} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-body font-medium flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors">
                <Download className="w-4 h-4" /> Export Data
              </button>
              <button onClick={handleClear} className="flex-1 py-2.5 rounded-xl bg-rose-soft/10 text-foreground text-sm font-body font-medium flex items-center justify-center gap-2 hover:bg-rose-soft/20 transition-colors">
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            </div>
          </div>

          {/* About */}
          <div className="glass-static rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 font-body"><Info className="w-3.5 h-3.5" /> About</h2>
            <p className="text-sm text-foreground font-body font-medium">MindEase AI</p>
            <p className="text-xs text-muted-foreground font-body">Version 1.0.0 — Your calm in the chaos</p>
            <p className="text-xs text-muted-foreground mt-1 font-body">AI companion: SERA (Supportive Emotional Response Assistant)</p>
            <p className="text-xs text-muted-foreground mt-1 font-body">Built with care for student mental wellness 💙</p>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              sessionStorage.removeItem('mindease_logged_in');
              window.location.href = '/login';
            }}
            className="w-full py-3 rounded-xl border border-border text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
