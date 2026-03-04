import { useState } from 'react';
import { motion } from 'framer-motion';
import { getUser, saveUser, clearAllData, exportData } from '@/lib/storage';
import { useTheme } from '@/hooks/useTheme';
import { User, Shield, Bell, Palette, Database, Info, Download, Trash2, Key } from 'lucide-react';
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
      toast.success('API key saved');
    } else {
      localStorage.removeItem('mindease_api_key');
      toast.success('API key removed');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground mb-8">Personalize your experience</p>

        <div className="space-y-6">
          {/* Profile */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                <input
                  value={user.name}
                  onChange={(e) => updateUser({ name: e.target.value })}
                  placeholder="Your name"
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Anonymous */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Privacy</h2>
            <button
              onClick={() => updateUser({ anonymous: !user.anonymous, name: user.anonymous ? user.name : '' })}
              className="flex items-center justify-between w-full"
            >
              <span className="text-sm text-foreground">Anonymous Mode</span>
              <span className={`w-10 h-5 rounded-full transition-colors flex items-center ${user.anonymous ? 'bg-primary justify-end' : 'bg-border justify-start'}`}>
                <span className="w-4 h-4 rounded-full bg-primary-foreground mx-0.5 shadow-sm" />
              </span>
            </button>
          </div>

          {/* Theme */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> Theme</h2>
            <div className="flex gap-2">
              {(['light', 'dark', 'auto'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    theme === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Key className="w-3.5 h-3.5" /> AI Integration</h2>
            <p className="text-xs text-muted-foreground mb-2">Add your Anthropic API key for real AI responses. Without it, smart mock responses are used.</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <button onClick={handleSaveApiKey} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                Save
              </button>
            </div>
          </div>

          {/* Data */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Data Management</h2>
            <div className="flex gap-2">
              <button onClick={handleExport} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors">
                <Download className="w-4 h-4" /> Export Data
              </button>
              <button onClick={handleClear} className="flex-1 py-2.5 rounded-xl bg-rose-soft/10 text-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-rose-soft/20 transition-colors">
                <Trash2 className="w-4 h-4" /> Clear All Data
              </button>
            </div>
          </div>

          {/* About */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Info className="w-3.5 h-3.5" /> About</h2>
            <p className="text-sm text-foreground font-medium">MindEase AI</p>
            <p className="text-xs text-muted-foreground">Version 1.0.0 — Your calm in the chaos</p>
            <p className="text-xs text-muted-foreground mt-1">Built with care for student mental wellness 💙</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
