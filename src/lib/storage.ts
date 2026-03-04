// localStorage utility functions for MindEase AI

export interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  moodScore: number;
  note: string;
  factors: string[];
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  content: string;
  mood: string;
  gratitude: string[];
  aiReflection: string;
  timestamp: number;
}

export interface HabitDay {
  meditated: boolean;
  journaled: boolean;
  water: boolean;
  exercise: boolean;
  sleep: boolean;
  screenFree: boolean;
  gratitude: boolean;
}

export interface SessionData {
  breathing: number;
  pomodoro: number;
  lastActive: number;
}

export interface UserPrefs {
  name: string;
  theme: 'light' | 'dark' | 'auto';
  anonymous: boolean;
  streakDays: number;
  lastCheckIn: string;
}

const KEYS = {
  moods: 'mindease_moods',
  journal: 'mindease_journal',
  habits: 'mindease_habits',
  sessions: 'mindease_sessions',
  user: 'mindease_user',
  chatHistory: 'mindease_chat',
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Moods
export function getMoods(): MoodEntry[] { return get(KEYS.moods, []); }
export function saveMood(entry: MoodEntry) {
  const moods = getMoods();
  moods.push(entry);
  set(KEYS.moods, moods);
}
export function getTodayMood(): MoodEntry | null {
  const today = new Date().toISOString().split('T')[0];
  return getMoods().find(m => m.date === today) || null;
}

// Journal
export function getJournalEntries(): JournalEntry[] { return get(KEYS.journal, []); }
export function saveJournalEntry(entry: JournalEntry) {
  const entries = getJournalEntries();
  const idx = entries.findIndex(e => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry; else entries.push(entry);
  set(KEYS.journal, entries);
}

// Habits
export function getHabits(): Record<string, HabitDay> { return get(KEYS.habits, {}); }
export function saveHabits(habits: Record<string, HabitDay>) { set(KEYS.habits, habits); }
export function getTodayHabits(): HabitDay {
  const today = new Date().toISOString().split('T')[0];
  const all = getHabits();
  return all[today] || { meditated: false, journaled: false, water: false, exercise: false, sleep: false, screenFree: false, gratitude: false };
}
export function saveTodayHabits(habits: HabitDay) {
  const today = new Date().toISOString().split('T')[0];
  const all = getHabits();
  all[today] = habits;
  set(KEYS.habits, all);
}

// Sessions
export function getSessions(): SessionData { return get(KEYS.sessions, { breathing: 0, pomodoro: 0, lastActive: Date.now() }); }
export function saveSessions(data: SessionData) { set(KEYS.sessions, data); }

// User
export function getUser(): UserPrefs {
  return get(KEYS.user, { name: '', theme: 'light' as const, anonymous: false, streakDays: 0, lastCheckIn: '' });
}
export function saveUser(prefs: UserPrefs) { set(KEYS.user, prefs); }

// Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  timestamp: number;
}
export function getChatHistory(): ChatMessage[] { return get(KEYS.chatHistory, []); }
export function saveChatHistory(messages: ChatMessage[]) { set(KEYS.chatHistory, messages); }

// Streak calculation
export function calculateStreak(): number {
  const moods = getMoods();
  const journal = getJournalEntries();
  const habits = getHabits();
  const allDates = new Set<string>();
  moods.forEach(m => allDates.add(m.date));
  journal.forEach(j => allDates.add(j.date));
  Object.keys(habits).forEach(d => allDates.add(d));
  
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (allDates.has(key)) streak++; else break;
  }
  return streak;
}

// Mood score mapping
export const MOOD_MAP: Record<string, { score: number; emoji: string; label: string }> = {
  great: { score: 100, emoji: '😄', label: 'Great' },
  good: { score: 75, emoji: '🙂', label: 'Good' },
  okay: { score: 50, emoji: '😐', label: 'Okay' },
  low: { score: 25, emoji: '😔', label: 'Low' },
  overwhelmed: { score: 10, emoji: '😰', label: 'Overwhelmed' },
};

// Emotional Health Score
export function calculateEHS(): number {
  const moods = getMoods().slice(-7);
  const habits = getHabits();
  const journal = getJournalEntries().slice(-7);
  const sessions = getSessions();

  // Mood average (60%)
  const moodAvg = moods.length > 0
    ? moods.reduce((sum, m) => sum + m.moodScore, 0) / moods.length
    : 50;
  
  // Habit completion (20%)
  const todayH = getTodayHabits();
  const habitKeys = Object.values(todayH);
  const habitPct = habitKeys.length > 0 ? (habitKeys.filter(Boolean).length / habitKeys.length) * 100 : 0;

  // Journal frequency (10%)
  const journalPct = Math.min(journal.length / 3 * 100, 100);

  // Breathing sessions (10%)
  const breathPct = Math.min(sessions.breathing / 3 * 100, 100);

  return Math.round(moodAvg * 0.6 + habitPct * 0.2 + journalPct * 0.1 + breathPct * 0.1);
}

// Clear all data
export function clearAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

// Export data
export function exportData() {
  return {
    moods: getMoods(),
    journal: getJournalEntries(),
    habits: getHabits(),
    sessions: getSessions(),
    user: getUser(),
  };
}

// ID generator
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
