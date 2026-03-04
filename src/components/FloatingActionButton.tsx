import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageCircle, Smile, BookOpen, Wind, X } from 'lucide-react';

const actions = [
  { icon: MessageCircle, label: 'Chat with SERA', path: '/app/chat' },
  { icon: Smile, label: 'Log Mood', path: '/app/mood' },
  { icon: BookOpen, label: 'New Journal Entry', path: '/app/journal' },
  { icon: Wind, label: 'Start Breathing', path: '/app/wellness' },
];

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 right-0 flex flex-col gap-2 items-end mb-2"
          >
            {actions.map((a, i) => (
              <motion.button
                key={a.path}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { navigate(a.path); setOpen(false); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-static text-sm font-body font-medium text-foreground whitespace-nowrap"
              >
                <a.icon className="w-4 h-4 text-primary" />
                {a.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center text-primary-foreground shadow-lg transition-all bg-primary hover:scale-[1.02]"
      >
        {open ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </button>
    </div>
  );
}
