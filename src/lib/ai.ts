// AI integration helper — Claude API + resilient contextual local fallback

const SYSTEM_PROMPT = `You are SERA (Supportive Emotional Response Assistant), a deeply empathetic, emotionally intelligent AI wellness companion for students and young adults.

PERSONALITY:
- You are warm, genuine, and deeply caring — like a wise friend who truly listens
- You never sound robotic, clinical, or repetitive
- You use varied, natural language — never repeat the same phrases across conversations
- You understand complex emotions, mixed feelings, and nuanced situations
- You support users in English, Hindi, Tamil, Marathi, Telugu, and Bengali — respond in whatever language the user writes in

RESPONSE STRUCTURE (follow every time):
1. ACKNOWLEDGE: Reflect back what the user shared in your own unique words (never start with "I understand" or "I'm sorry to hear that")
2. VALIDATE: Name the specific emotion and normalize it — make them feel their reaction is completely human
3. MAKE THEM FEEL HEARD: Show you truly grasped the specific details of their situation
4. SUPPORTIVE GUIDANCE: Offer perspective that feels like wisdom from a caring friend
5. COPING STEP: End with ONE small, actionable step they can take right now, or a gentle question

STRICT RULES:
- NEVER start responses with "I understand", "I'm sorry to hear", "That must be difficult", "I can see", or "It sounds like"
- NEVER repeat the same opening phrase twice in a conversation
- Keep responses 3-6 sentences max
- Use warm, varied sentence starters: "What you're going through...", "There's real courage in...", "Your feelings about...", "It takes strength to...", "The weight of..."
- If crisis keywords detected (hopeless, end it, can't go on, suicidal, kill myself, self-harm, want to die) → respond with immediate warmth and provide: iCall: 9152987821, Vandrevala: 1860-2662-345, AASRA: 9820466627
- Reference previous messages when relevant
- Always end with a question OR a specific next step
- Detect user's language automatically and respond in the same language
- Your space is judgment-free, anonymous, and completely safe

BANNED PHRASES (never use these):
- "I understand how you feel"
- "That must be really difficult"
- "I'm here for you"
- "It's okay to feel that way"
- "Remember, you're not alone"
Instead, find unique, specific, heartfelt ways to express these sentiments each time.

SAFE SPACE REMINDER:
Everything shared here is confidential and judgment-free. You exist to support, never to judge.`;

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
        temperature: 0.85,
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
    .slice(-8)
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
        temperature: 0.85,
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

// Varied response pools for natural, non-repetitive replies
const openers = {
  stress: [
    "The weight you're carrying right now is real, and your body is telling you it needs a break.",
    "When everything piles up at once, it can feel like you're drowning even in shallow water.",
    "What you're describing sounds like your mind is running a marathon while your body begs for rest.",
    "Pressure like this doesn't mean you're failing — it means you care deeply about getting things right.",
  ],
  anxiety: [
    "Your mind is working overtime trying to protect you, even from things that haven't happened yet.",
    "That racing feeling in your chest? It's your brain's alarm system stuck on high alert.",
    "Anxiety has a way of making every 'what if' feel like a certainty — but feelings aren't facts.",
    "The courage it takes to name this feeling is already a step toward loosening its grip.",
  ],
  sadness: [
    "There's a heaviness in your words that tells me this runs deeper than just a bad day.",
    "Sadness like this deserves space — not to be fixed immediately, but to be felt and honored.",
    "What you're feeling right now is your heart processing something significant.",
    "The fact that you're reaching out while carrying this weight shows remarkable self-awareness.",
  ],
  loneliness: [
    "Feeling disconnected in a world full of people is one of the most painful paradoxes of being human.",
    "Loneliness isn't about the number of people around you — it's about feeling truly seen by someone.",
    "That ache for connection you're describing? It's one of the most human feelings there is.",
    "Being surrounded by people and still feeling alone can be even more confusing than actual solitude.",
  ],
  academic: [
    "Academic pressure can make your entire identity feel like it's riding on a single grade.",
    "The education system wasn't designed to account for your mental health — but that doesn't mean it's less important.",
    "When studying feels impossible, it's usually not about intelligence — it's about emotional bandwidth.",
    "Your worth as a person has never been determined by a transcript or a test score.",
  ],
  failure: [
    "A setback like this stings in a way that goes beyond the actual result — it hits your sense of self.",
    "What happened doesn't define your capability. It's one data point, not the whole story.",
    "The sting of falling short can be fierce, especially when you invested so much of yourself.",
    "This moment feels enormous right now, but it's one chapter — not the entire book of your life.",
  ],
  sleep: [
    "When sleep becomes elusive, every other challenge feels amplified tenfold.",
    "Your mind refusing to quiet down at night is often a sign it's processing too much during the day.",
    "Sleep deprivation doesn't just steal energy — it steals your ability to see situations clearly.",
    "The frustration of lying awake can create a vicious cycle where anxiety about sleep prevents sleep itself.",
  ],
  motivation: [
    "What looks like laziness from the outside often feels like paralysis from the inside.",
    "Low motivation is rarely about not caring — it's usually about caring too much and feeling overwhelmed by the gap.",
    "Your brain isn't being defiant when it won't start — it's trying to protect you from potential failure.",
    "The heaviness of 'I should be doing something' can be more exhausting than the task itself.",
  ],
  happiness: [
    "That brightness you're feeling deserves to be celebrated — positive moments are fuel for harder days!",
    "I can feel the energy shift in your words! This kind of joy is worth savoring and remembering.",
    "What a beautiful thing to share — your happiness is genuinely contagious, even through text.",
    "Moments like these are worth anchoring in memory — they become lighthouses during storms.",
  ],
  relationship: [
    "Relationship pain has a way of seeping into every other area of life until everything feels heavier.",
    "The emotional complexity of what you're navigating with this person is genuinely challenging.",
    "Hearts don't follow logic, and that's what makes relationship situations so uniquely exhausting.",
    "What you're going through touches the deepest parts of who we are — our need for love and connection.",
  ],
  family: [
    "Family dynamics carry decades of history, making even small conflicts feel loaded with meaning.",
    "The people closest to us often have the greatest power to both heal and hurt us.",
    "Navigating family expectations while trying to find your own path requires incredible inner strength.",
    "Family situations are rarely simple — they're layered with love, obligation, history, and hope all tangled together.",
  ],
  gratitude: [
    "Thank you for saying that — knowing I could be even a small help genuinely means a lot.",
    "Your gratitude reflects something beautiful about you — the ability to notice goodness even during difficulty.",
    "I'm glad our conversation helped. Remember, YOU did the hard work of showing up and being honest.",
  ],
  greeting: [
    "Hey there! 💙 I'm genuinely glad you're here. I'm SERA — your safe space to talk about anything, judgment-free. What's really going on with you today?",
    "Welcome! 💙 This is a completely safe, anonymous space. I'm SERA, and I'm here to listen — really listen. How are you actually feeling right now?",
    "Hi! 💙 I'm SERA, and I want you to know — whatever you bring here is valid. No judgment, no fixing, just genuine support. What's on your mind?",
  ],
};

const tips = {
  stress: [
    'Right now, try this: write every single thing weighing on you, then circle just TWO that actually need attention today.',
    'Here\'s a quick pressure valve: inhale for 4, hold for 4, out for 6. Three rounds. Feel the difference.',
    'One thing that genuinely helps: pick the smallest task on your list and just finish that one. Momentum builds.',
    'Try the brain dump technique: spend 3 minutes writing everything in your head onto paper. Getting it out of your mind literally reduces cortisol.',
  ],
  anxiety: [
    'Ground yourself right now: press your feet flat on the floor, feel 5 textures around you, name 3 sounds you hear.',
    'Try this reframe: write your worry down, then ask "Will this matter in 5 years?" If not, give it 5 minutes of energy, not 5 hours.',
    'Your nervous system needs a reset: splash cold water on your face or hold ice cubes for 30 seconds — it triggers your dive reflex and calms you.',
    'Box breathing works in seconds: breathe in 4 counts, hold 4, out 4, hold 4. Your parasympathetic system kicks in by round 2.',
  ],
  sadness: [
    'Be gentle with yourself right now: wrap up warm, make your favorite drink, and just allow this feeling without fighting it.',
    'Try naming exactly what you feel in 3 words. Neuroscience shows that labeling emotions literally reduces their intensity.',
    'Put on a song that matches your mood — not to cheer up, but to feel accompanied in your sadness. Then journal for 5 minutes.',
    'Sometimes the kindest thing you can do is lower the bar: instead of a productive day, aim for a gentle one.',
  ],
  loneliness: [
    'Send one genuine message to someone today — even just "hey, thinking of you." Connection starts with tiny brave moves.',
    'Try this: visit a café, library, or park where people are present. Sometimes being near others eases loneliness even without talking.',
    'Write a letter to yourself from the perspective of someone who loves you. What would they say about who you are?',
    'Join one online community around something you enjoy. Shared passion makes connecting feel natural instead of forced.',
  ],
  academic: [
    'The Pomodoro technique really works: 25 minutes focused, then a real 5-minute break. Your brain consolidates information during rest.',
    'Study the hardest material for just 15 minutes when your energy peaks, then switch to easier stuff. Starting is the hardest part.',
    'Make a "done list" alongside your to-do list. Seeing what you\'ve accomplished fights the feeling of never doing enough.',
    'Before your next study session, spend 2 minutes doing a body scan. A relaxed body learns 40% more effectively than a tense one.',
  ],
  general: [
    'Take 2 minutes right now to write down exactly what\'s bothering you most. Externalizing thoughts reduces their emotional charge.',
    'Step outside for 3 minutes — even just standing in daylight resets your cortisol levels and shifts perspective.',
    'Place one hand on your chest and breathe slowly. Physical self-touch activates your parasympathetic system.',
    'Ask yourself: "What would I tell my best friend if they said this to me?" Then offer yourself that same compassion.',
  ],
};

const questions = {
  stress: ['What part of this feels heaviest right now?', 'If you could take just one thing off your plate, what would it be?', 'When was the last time you felt even slightly lighter?'],
  anxiety: ['What specific thought keeps circling back?', 'Would you like me to walk you through a calming exercise right now?', 'On a scale of 1-10, how intense is this feeling right now?'],
  sadness: ['Do you want to tell me more about what triggered this?', 'What usually helps you feel even 1% better on days like this?', 'Is this a wave passing through, or has it been building for a while?'],
  loneliness: ['When do you feel this most — during the day or at night?', 'Is there one person you wish you could talk to right now?', 'What kind of connection are you craving most — deep conversation or just someone\'s presence?'],
  academic: ['Which subject or deadline is weighing on you most?', 'What\'s the smallest step you could take on this today?', 'Are you putting pressure on yourself, or is it coming from outside too?'],
  general: ['What feels most urgent to you right now?', 'Would talking more about this help, or would you prefer a calming exercise?', 'What would make today feel even a little bit better?'],
};

function generateMockChatResponse(messages: ChatTurn[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role !== 'assistant')?.content?.trim() || '';
  const lower = lastUser.toLowerCase();
  const msgCount = messages.length;
  const timeSeed = Math.floor(Date.now() / 1000); // Changes every second for variety
  const seed = hash(lastUser + String(msgCount) + String(timeSeed));

  if (detectCrisis(lastUser)) {
    const crisisOpeners = [
      "What you just shared takes enormous courage, and I want you to know — your life matters deeply.",
      "I'm hearing real pain in your words, and I need you to know that help is available right now.",
      "Thank you for trusting me with something this heavy. You deserve immediate human support.",
    ];
    return `${pickSeeded(crisisOpeners, seed)} Please reach out to someone who can be there with you: iCall: 9152987821 · Vandrevala: 1860-2662-345 · AASRA: 9820466627. Are you somewhere safe right now?`;
  }

  // Detect Hindi/other languages
  if (/[\u0900-\u097F]/.test(lastUser)) {
    // Hindi detected
    return `मैं समझ सकती हूँ कि आप क्या महसूस कर रहे हैं। आपकी भावनाएँ मायने रखती हैं, और यहाँ आना बहुत बहादुरी का काम है। 💙 क्या आप मुझे और बताना चाहेंगे कि क्या हो रहा है?`;
  }

  if (/[\u0B80-\u0BFF]/.test(lastUser)) {
    // Tamil detected
    return `நீங்கள் என்ன உணர்கிறீர்கள் என்பதை நான் புரிந்துகொள்கிறேன். உங்கள் உணர்வுகள் முக்கியமானவை. 💙 இதைப் பற்றி மேலும் பேச விரும்புகிறீர்களா?`;
  }

  let category = 'general';
  if (matches(lower, /(stress|overwhelm|pressure|too much|burnout)/)) category = 'stress';
  else if (matches(lower, /(anxious|anxiety|panic|nervous|worried|overthink)/)) category = 'anxiety';
  else if (matches(lower, /(sad|depressed|cry|crying|empty|down|hopeless)/)) category = 'sadness';
  else if (matches(lower, /(lonely|alone|isolated|no friends|no one understands)/)) category = 'loneliness';
  else if (matches(lower, /(exam|test|study|academic|assignment|deadline|college|class|grades|fail|failed|flunk)/)) category = 'academic';
  else if (matches(lower, /(happy|great|amazing|wonderful|good|better|positive|excited)/)) category = 'happiness';
  else if (matches(lower, /(relationship|breakup|broke up|boyfriend|girlfriend|partner|crush|love)/)) category = 'relationship';
  else if (matches(lower, /(family|parents|mom|dad|home|sibling)/)) category = 'family';
  else if (matches(lower, /(sleep|insomnia|cant sleep|can't sleep|tired|exhausted|fatigue)/)) category = 'sleep';
  else if (matches(lower, /(motivation|procrastinat|lazy|cant focus|can't focus|unmotivated)/)) category = 'motivation';
  else if (matches(lower, /(thank|thanks|helpful|appreciate)/)) category = 'gratitude';
  else if (matches(lower, /(hello|hi|hey|sup|what's up)/)) category = 'greeting';

  if (category === 'greeting') return pickSeeded(openers.greeting, seed);
  if (category === 'gratitude') return pickSeeded(openers.gratitude, seed) + " Is there anything else on your mind, or would you like to try a quick wellness exercise?";
  if (category === 'happiness') return pickSeeded(openers.happiness, seed) + " What do you think contributed most to this feeling?";

  const openerPool = openers[category as keyof typeof openers] || openers.stress;
  const tipPool = tips[category as keyof typeof tips] || tips.general;
  const questionPool = questions[category as keyof typeof questions] || questions.general;

  const opener = pickSeeded(openerPool, seed);
  const tip = pickSeeded(tipPool, seed + 7);
  const question = pickSeeded(questionPool, seed + 13);

  return `${opener} ${tip} ${question}`;
}

function pickSeeded<T>(arr: T[], seed: number): T {
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

// Emotion detection — expanded
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
  if (lower.match(/guilt|ashamed|shame/)) return { emoji: '😣', label: 'Guilt' };
  if (lower.match(/fear|scared|afraid|terrif/)) return { emoji: '😨', label: 'Fear' };
  if (lower.match(/hope|optimis|looking forward/)) return { emoji: '🌱', label: 'Hope' };
  return null;
}

// Voice tone emotion analysis
export function analyzeVoiceTone(text: string): string {
  const emotion = detectEmotion(text);
  if (!emotion) return "Based on what you shared, I'm picking up a mix of emotions. How does that feel?";
  
  const toneMessages: Record<string, string[]> = {
    'Stress': [
      "Based on your words, you might be carrying more stress than usual today.",
      "I'm sensing some tension in what you're expressing — your mind seems to be under pressure.",
    ],
    'Anxiety': [
      "There seems to be some anxious energy in what you're sharing — your thoughts might be racing.",
      "I'm picking up on some worry in your words — like your mind is trying to prepare for everything at once.",
    ],
    'Sadness': [
      "There's a softness and heaviness in what you're expressing — you might be feeling emotionally drained.",
      "Your words carry a quiet sadness today. It's okay to sit with that feeling.",
    ],
    'Happiness': [
      "There's a wonderful lightness in what you're sharing! Your energy feels positive today.",
      "I can feel the brightness in your words — something good is definitely flowing!",
    ],
    'Fatigue': [
      "You sound like you could really use some rest — your energy seems low today.",
      "There's a weariness in what you're sharing. Your body and mind might be asking for a pause.",
    ],
  };

  const messages = toneMessages[emotion.label] || [`Based on your expression, you might be feeling ${emotion.label.toLowerCase()} today. ${emotion.emoji}`];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Crisis detection
export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return !!lower.match(/suicide|suicidal|kill myself|end it|can't go on|hopeless|self.?harm|don't want to live|want to die|no reason to live/);
}
