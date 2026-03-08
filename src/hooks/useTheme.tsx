import { ReactNode } from 'react';

// Theme is permanently light — no dark mode for this wellness app
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const useTheme = () => ({
  theme: 'light' as const,
  setTheme: (_t: string) => {},
  isDark: false,
});
