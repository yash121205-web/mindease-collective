import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  emoji?: string;
  icon?: LucideIcon;
  gradient?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, emoji, icon: Icon, gradient = 'from-primary/10 to-secondary/8', children }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-3xl bg-gradient-to-br ${gradient} p-6 md:p-8 mb-8 overflow-hidden`}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/15 blur-xl pointer-events-none" />
      <div className="absolute top-4 right-6 w-4 h-4 rounded-full bg-white/25 animate-pulse" />
      <div className="absolute bottom-6 right-20 w-2.5 h-2.5 rounded-full bg-white/20" />

      <div className="relative z-10 flex items-start gap-4">
        {(emoji || Icon) && (
          <div className="w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center shadow-sm shrink-0">
            {emoji ? (
              <span className="text-2xl">{emoji}</span>
            ) : Icon ? (
              <Icon className="w-7 h-7 text-foreground/80" />
            ) : null}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl md:text-3xl text-foreground font-semibold leading-tight">{title}</h1>
          <p className="text-muted-foreground font-body mt-1 text-sm md:text-base">{subtitle}</p>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </motion.div>
  );
}
