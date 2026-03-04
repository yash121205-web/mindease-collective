// AI integration helper — Claude API + resilient contextual local fallback

const SYSTEM_PROMPT = `You are SERA, a warm and emotionally intelligent AI wellness companion for students
and young adults. Your role is to provide empathetic, relevant, and personalized
emotional support.
STRICT RULES:

ALWAYS directly address what the user just said. Read their message carefully.
Never give generic responses. Tailor every reply to the specific emotion or
situation they mentioned.
Keep responses to 3-5 sentences max. Be warm but concise.
If they mention stress → acknowledge it specifically and offer one coping tip.
If they mention loneliness → validate the feeling, ask a gentle follow-up question.
If they mention academic pressure → empathize and suggest one practical strategy.
If they mention sadness → be present, don't rush to fix, just acknowledge first.
If they mention crisis keywords (hopeless, end it, can't go on, suicidal) →
respond with care and provide: iCall: 9152987821, Vandrevala: 1860-2662-345
Always end with either a gentle question OR a specific suggestion — never just
a statement.
Never start responses with "I understand" or "I'm sorry to hear" every single
time — vary your openings.`;

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
    .slice(-10)
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

    return ensureNotRepeated(raw || generateMockChatResponse(history), history);
  } catch {
    return ensureNotRepeated(generateMockChatResponse(history), history);
  }
}

function ensureNotRepeated(next: string, history: ChatTurn[]): string {
  const lastAssistant = [...history].reverse().find((m) => m.role === 'assistant')?.content || '';
  const a = normalize(lastAssistant);
  const b = normalize(next);

  if (!b) return 'Thank you for sharing that with me. I want to support you in a way that actually fits what you’re feeling right now — could you tell me a little more about what’s been hardest today?';
  if (!a || a !== b) return next;

  return `${next} To make this more helpful for your exact situation, what feels most urgent right now?`;
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function generateMockSingleResponse(input: string): string {
  return generateMockChatResponse([{ role: 'user', content: input }]);
}

function generateMockChatResponse(messages: ChatTurn[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role !== 'assistant')?.content?.trim() || '';
  const lower = lastUser.toLowerCase();
  const seed = hash(lastUser + String(messages.length));

  if (detectCrisis(lastUser)) {
    return 'Thank you for telling me this — I’m really glad you reached out right now. You deserve immediate human support: iCall: 9152987821 and Vandrevala: 1860-2662-345. If you can, please contact one of them now and stay with someone you trust while you do that. Are you in a safe place right now?';
  }

  if (matches(lower, /(stress|overwhelm|pressure|too much|burnout)/)) {
    const openers = [
      'That sounds like a lot to carry at once.',
      'You’re holding a heavy load right now, and that can drain you fast.',
      'This level of stress can make everything feel urgent.'
    ];
    const tips = [
      'Try one reset cycle now: inhale 4, hold 4, exhale 6, repeat for 2 minutes.',
      'Use a 25-minute focus block on just one task, then take a 5-minute break.',
      'Pick the smallest next step and do only that for the next 10 minutes.'
    ];
    const q = [
      'What part feels heaviest at this moment?',
      'Would you like me to help you break today into 3 manageable steps?',
      'Which task is creating the most pressure right now?'
    ];
    return `${pick(openers, seed)} ${pick(tips, seed + 1)} ${pick(q, seed + 2)}`;
  }

  if (matches(lower, /(lonely|alone|no one understands|isolated)/)) {
    const openers = [
      'Feeling lonely like that can really hurt, even when people are around.',
      'That kind of loneliness can feel deeply personal and exhausting.',
      'You’re not wrong for feeling this way — loneliness is a real emotional weight.'
    ];
    const follow = [
      'You matter, and your need for connection is completely valid.',
      'It makes sense that this is affecting your energy and mood.',
      'Thank you for saying it out loud — that takes courage.'
    ];
    const q = [
      'Who feels safest to message first, even with a simple “hey”?',
      'Would it help to plan one low-pressure social step for today?',
      'When do you feel this loneliness most strongly — daytime or nights?'
    ];
    return `${pick(openers, seed)} ${pick(follow, seed + 1)} ${pick(q, seed + 2)}`;
  }

  if (matches(lower, /(exam|academic|assignment|deadline|college|class|grades)/)) {
    const openers = [
      'Academic pressure can make your brain feel constantly “on.”',
      'Being under study pressure for too long is genuinely exhausting.',
      'When deadlines stack up, even simple tasks can feel huge.'
    ];
    const strategy = [
      'Start with a 3-item priority list: must-do, should-do, could-do.',
      'Use active recall for one chapter instead of rereading everything.',
      'Do one timed sprint on the hardest subject first, then switch to an easier task.'
    ];
    const q = [
      'Which subject is the biggest source of pressure today?',
      'Want me to help build a 1-hour study plan right now?',
      'What exam or deadline is causing the most anxiety right now?'
    ];
    return `${pick(openers, seed)} ${pick(strategy, seed + 1)} ${pick(q, seed + 2)}`;
  }

  if (matches(lower, /(sad|down|empty|depressed|cry)/)) {
    const openers = [
      'That sounds really heavy emotionally.',
      'I hear the sadness in what you shared.',
      'It makes sense you feel low with all of this on you.'
    ];
    const presence = [
      'You don’t need to fix this feeling immediately — we can just sit with it for a moment.',
      'There’s no pressure to force positivity right now.',
      'You’re allowed to feel this without judging yourself for it.'
    ];
    const q = [
      'Do you want to share what triggered this feeling today?',
      'Would a short grounding exercise help right now, or do you want to talk it through first?',
      'What would feel most supportive for you in this moment?'
    ];
    return `${pick(openers, seed)} ${pick(presence, seed + 1)} ${pick(q, seed + 2)}`;
  }

  if (matches(lower, /(anxious|anxiety|panic|nervous|worried|overthink)/)) {
    return 'Anxiety can make everything feel immediate, even when you’re doing your best. Try the 5-4-3-2-1 grounding method right now to pull your mind back into the present moment. Would you like me to guide you through it step by step?';
  }

  if (matches(lower, /(sleep|insomnia|cant sleep|can't sleep|tired|fatigue)/)) {
    return 'Sleep disruption can make emotions feel twice as intense the next day. Try a 20-minute wind-down with no screens, slow breathing, and a quick brain-dump note before bed. What part of the night is hardest for you — falling asleep or waking up?';
  }

  if (matches(lower, /(motivation|procrastinat|lazy|cant focus|can't focus)/)) {
    return 'Low motivation usually means your mind is overloaded, not that you’re failing. Start with a 2-minute action on the smallest task to create momentum, then continue for one short focus block. What’s one tiny step you can take in the next 5 minutes?';
  }

  if (matches(lower, /(hello|hi|hey)/)) {
    return 'Hey — I’m really glad you checked in. I’m SERA, and I’m here to support you with whatever is feeling heavy today. How are you feeling right now, honestly?';
  }

  const contextualLead = lastUser ? `You mentioned: “${truncate(lastUser, 90)}”. ` : '';
  return `${contextualLead}Thanks for sharing this with me. Let’s make this manageable together by choosing one small next step you can do now. Would you like a quick plan for the next 20 minutes?`;
}

function truncate(text: string, max = 90) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
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
  return null;
}

// Crisis detection
export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return !!lower.match(/suicide|suicidal|kill myself|end it|can't go on|hopeless|self.?harm|don't want to live|want to die|no reason to live/);
}
