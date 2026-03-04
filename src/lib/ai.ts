// AI integration helper — Claude API + resilient contextual local fallback

const SYSTEM_PROMPT = `You are SERA, a warm and emotionally intelligent AI wellness companion for students and young adults.

STRICT RULES:
1. ALWAYS start by repeating back what the user said in your own words to show you're listening. Example: "I hear that you failed your exam."
2. Then address their SPECIFIC situation — not generic advice.
3. Give exactly ONE practical, actionable tip that matches their problem.
4. Keep responses to 3-5 sentences max.
5. If they mention crisis keywords (hopeless, end it, can't go on, suicidal, kill myself, self-harm, want to die) → respond with care and provide: iCall: 9152987821, Vandrevala: 1860-2662-345
6. Never start with "I understand" or "I'm sorry to hear that."
7. Always end with either a gentle question OR a specific next step.
8. Remember previous messages and reference them when relevant.`;

type ChatTurn = { role: string; content: string };

export async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const apiKey = localStorage.getItem('mindease_api_key') || '';
    if (!apiKey) throw new Error('No API key');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        temperature: 0.7,
        system: systemPrompt || SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data?.content?.[0]?.text || generateMockSingleResponse(prompt);
  } catch {
    return generateMockSingleResponse(prompt);
  }
}

export async function callAIChat(messages: ChatTurn[]): Promise<string> {
  const history = messages
    .filter((m) => m?.content?.trim())
    .slice(-5)
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.trim() }));

  try {
    const apiKey = localStorage.getItem('mindease_api_key') || '';
    if (!apiKey) throw new Error('No API key');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 700,
        temperature: 0.75,
        system: SYSTEM_PROMPT,
        messages: history,
      }),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const raw = data?.content?.[0]?.text || '';
    return raw || generateMockChatResponse(history);
  } catch {
    return generateMockChatResponse(history);
  }
}

function generateMockSingleResponse(input: string): string {
  return generateMockChatResponse([{ role: 'user', content: input }]);
}

function generateMockChatResponse(messages: ChatTurn[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role !== 'assistant')?.content?.trim() || '';
  const lower = lastUser.toLowerCase();
  const seed = hash(lastUser + String(messages.length) + String(Date.now()));

  // Always start by echoing back what the user said
  const userSummary = summarizeUserMessage(lastUser);

  if (detectCrisis(lastUser)) {
    return `${userSummary} I'm really glad you told me this — it takes courage. You deserve immediate human support right now. Please reach out: iCall: 9152987821, Vandrevala: 1860-2662-345. Are you in a safe place right now?`;
  }

  if (matches(lower, /(fail|failed|flunk|didn't pass|bad grade|low marks|poor score)/)) {
    const tips = [
      'Here\'s what helps most students: take a break today, then look at what went wrong tomorrow when emotions are calmer.',
      'One thing that works: write down exactly which topics tripped you up, then tackle just the first one tomorrow with fresh eyes.',
      'Try this: give yourself 24 hours before analyzing what happened. Your brain processes setbacks better after rest.'
    ];
    return `${userSummary} That's really tough, and it's okay to feel disappointed. ${pick(tips, seed)} What subject was it?`;
  }

  if (matches(lower, /(stress|overwhelm|pressure|too much|burnout)/)) {
    const tips = [
      'Try this right now: write down every task weighing on you, then circle just the top 2 that actually matter today.',
      'One reset that works: inhale for 4 counts, hold for 4, exhale for 6. Do 3 rounds right now.',
      'Here\'s a quick win: pick the smallest task on your list and finish just that one. Momentum builds from there.'
    ];
    return `${userSummary} That level of pressure is genuinely exhausting. ${pick(tips, seed)} What part feels heaviest right now?`;
  }

  if (matches(lower, /(lonely|alone|no one understands|isolated|no friends)/)) {
    const tips = [
      'One step that helps: message one person today — even just "hey, how are you?" Connection starts with small moves.',
      'Try this: join one online or campus community around something you enjoy. Shared interests make connecting easier.',
      'Here\'s what I\'d suggest: write down 3 people you feel even slightly comfortable with and reach out to one this week.'
    ];
    return `${userSummary} That kind of loneliness can feel really heavy, even when people are physically nearby. ${pick(tips, seed)} When do you feel this most — during the day or at night?`;
  }

  if (matches(lower, /(exam|test|study|academic|assignment|deadline|college|class|grades)/)) {
    const tips = [
      'Start with this: make a 3-item priority list — must-do, should-do, could-do. Focus only on must-do first.',
      'Try the Pomodoro method: 25 minutes of focused study, then a 5-minute break. It tricks your brain into starting.',
      'Here\'s what works: study the hardest topic for just 20 minutes first when your energy is highest, then switch to easier material.'
    ];
    return `${userSummary} Academic pressure can make your brain feel like it's always "on" with no off switch. ${pick(tips, seed)} Which subject or deadline is weighing on you most?`;
  }

  if (matches(lower, /(sad|down|empty|depressed|cry|crying)/)) {
    const tips = [
      'One gentle step: put on a song that matches how you feel (not to cheer up, just to feel heard), then journal for 5 minutes.',
      'Try this: wrap yourself in something comfortable, make a warm drink, and just allow yourself to feel without judging it.',
      'Here\'s what might help: write down what you\'re feeling in 3 words. Naming emotions literally reduces their intensity — neuroscience backs this up.'
    ];
    return `${userSummary} I can feel the weight in your words, and it's okay to sit with this for a moment. ${pick(tips, seed)} Do you want to tell me more about what triggered this?`;
  }

  if (matches(lower, /(anxious|anxiety|panic|nervous|worried|overthink)/)) {
    const tips = [
      'Try the 5-4-3-2-1 grounding right now: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
      'Here\'s a quick reset: press your feet firmly into the floor, squeeze your hands tight for 5 seconds, then release. Feel the difference.',
      'One technique that works fast: write your worried thought on paper, then ask "Is this definitely true, or is my brain catastrophizing?"'
    ];
    return `${userSummary} Anxiety can make everything feel urgent even when it's not. ${pick(tips, seed)} Would you like me to walk you through a calming exercise right now?`;
  }

  if (matches(lower, /(sleep|insomnia|cant sleep|can't sleep|tired|exhausted|fatigue)/)) {
    return `${userSummary} Poor sleep makes everything feel twice as hard — your emotions, focus, and energy all suffer. Try this tonight: no screens 30 minutes before bed, do 3 rounds of slow breathing (4-7-8 pattern), and write a quick brain dump of tomorrow's tasks so your mind can let go. What part of sleeping is hardest — falling asleep or staying asleep?`;
  }

  if (matches(lower, /(motivation|procrastinat|lazy|cant focus|can't focus|unmotivated)/)) {
    return `${userSummary} Low motivation usually isn't laziness — it's your brain feeling overwhelmed by the gap between where you are and where you need to be. Here's what works: set a timer for just 2 minutes and start the smallest possible version of your task. Most people keep going once they start. What's the one thing you're putting off the most right now?`;
  }

  if (matches(lower, /(happy|great|amazing|wonderful|good|better|positive|excited)/)) {
    return `${userSummary} I love hearing that! Positive moments matter — they're not "less important" than hard ones. Try this: write down specifically what made you feel this way so you can intentionally recreate it. What do you think contributed most to this feeling?`;
  }

  if (matches(lower, /(thank|thanks|helpful|appreciate)/)) {
    return `${userSummary} I'm genuinely glad I could help. Remember, showing up for yourself like this IS the work — you're doing it. Is there anything else on your mind, or would you like to try a quick wellness exercise?`;
  }

  if (matches(lower, /(hello|hi|hey|sup|what's up)/)) {
    return `Hey — I'm really glad you're here. I'm SERA, and I'm here to support you with whatever's on your mind today. No judgment, no pressure. How are you actually feeling right now — honestly?`;
  }

  if (matches(lower, /(relationship|breakup|broke up|boyfriend|girlfriend|partner|crush|love)/)) {
    return `${userSummary} Relationship situations can take over your whole emotional bandwidth, and that's completely natural. One helpful step: write down what you're feeling right now without editing — getting it out of your head reduces the spinning. What part of this is hitting you hardest?`;
  }

  if (matches(lower, /(family|parents|mom|dad|home|sibling)/)) {
    return `${userSummary} Family dynamics can be really complicated, especially when you're also dealing with your own growth and pressures. Here's one thing that helps: identify what's in your control vs. what isn't, and focus your energy only on what you can actually change. What specific situation is bothering you most?`;
  }

  // Generic but still echoes back
  return `${userSummary} Thank you for sharing this with me. Let's work through this together — sometimes just talking it out makes things clearer. Here's my suggestion: take 2 minutes right now to write down exactly what's bothering you most, then we can tackle it step by step. What feels most urgent to you right now?`;
}

function summarizeUserMessage(msg: string): string {
  if (!msg || msg.length < 5) return 'I hear you.';
  const trimmed = msg.length > 80 ? msg.slice(0, 77) + '...' : msg;
  return `I hear you — you said "${trimmed}."`;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function matches(text: string, pattern: RegExp) {
  return pattern.test(text);
}

// Emotion detection
export function detectEmotion(text: string): { emoji: string; label: string } | null {
  const lower = text.toLowerCase();
  if (lower.match(/stress|overwhelm|pressure|too much|burnout/)) return { emoji: '😟', label: 'Stress' };
  if (lower.match(/anxious|anxiety|worried|nervous|panic/)) return { emoji: '😰', label: 'Anxiety' };
  if (lower.match(/sad|depressed|cry|hopeless|down|empty/)) return { emoji: '😢', label: 'Sadness' };
  if (lower.match(/angry|frustrated|annoyed|mad/)) return { emoji: '😤', label: 'Frustration' };
  if (lower.match(/lonely|alone|isolated/)) return { emoji: '😔', label: 'Loneliness' };
  if (lower.match(/happy|great|amazing|wonderful|good/)) return { emoji: '😊', label: 'Happiness' };
  if (lower.match(/tired|exhausted|sleep|fatigue/)) return { emoji: '😴', label: 'Fatigue' };
  if (lower.match(/confused|lost|unsure/)) return { emoji: '😵‍💫', label: 'Confusion' };
  if (lower.match(/grateful|thankful|blessed/)) return { emoji: '🙏', label: 'Gratitude' };
  if (lower.match(/calm|peace|relax/)) return { emoji: '😌', label: 'Calm' };
  if (lower.match(/motivat|lazy|procrastinat/)) return { emoji: '😮‍💨', label: 'Low Motivation' };
  if (lower.match(/overthink|spiral|ruminat/)) return { emoji: '🌀', label: 'Overthinking' };
  if (lower.match(/fail|failed|flunk/)) return { emoji: '😞', label: 'Disappointment' };
  if (lower.match(/exam|test|study|deadline/)) return { emoji: '📚', label: 'Academic Stress' };
  return null;
}

// Crisis detection
export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return !!lower.match(/suicide|suicidal|kill myself|end it|can't go on|hopeless|self.?harm|don't want to live|want to die|no reason to live/);
}
