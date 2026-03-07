// AI integration — Lovable Cloud AI Gateway + local fallback

type ChatTurn = { role: string; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

// ─── Streaming chat via edge function ───
export async function callAIChat(
  messages: ChatTurn[],
  language?: string,
  onDelta?: (chunk: string) => void
): Promise<string> {
  const history = messages
    .filter((m) => m?.content?.trim())
    .slice(-10)
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.trim() }));

  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: history, language }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      console.error('AI gateway error:', resp.status, errData);
      throw new Error(errData.error || 'AI request failed');
    }

    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let fullText = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullText += content;
            onDelta?.(content);
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullText += content;
            onDelta?.(content);
          }
        } catch { /* ignore */ }
      }
    }

    return fullText || generateMockChatResponse(history, language);
  } catch (e) {
    console.warn('AI gateway failed, using mock:', e);
    return generateMockChatResponse(history, language);
  }
}

// Simple single-prompt call (for insights, reflections, etc.)
export async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        language: 'en',
      }),
    });

    if (!resp.ok) throw new Error('AI error');
    if (!resp.body) throw new Error('No body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, idx);
        textBuffer = textBuffer.slice(idx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) fullText += content;
        } catch { break; }
      }
    }

    return fullText || generateMockSingleResponse(prompt);
  } catch {
    return generateMockSingleResponse(prompt);
  }
}

function generateMockSingleResponse(input: string): string {
  return generateMockChatResponse([{ role: 'user', content: input }]);
}

// ─── Mock fallback responses ───
const openers = {
  stress: [
    "The weight you're carrying right now is real, and your body is telling you it needs a break.",
    "When everything piles up at once, it can feel like you're drowning even in shallow water.",
    "Pressure like this doesn't mean you're failing — it means you care deeply about getting things right.",
  ],
  anxiety: [
    "Your mind is working overtime trying to protect you, even from things that haven't happened yet.",
    "Anxiety has a way of making every 'what if' feel like a certainty — but feelings aren't facts.",
    "The courage it takes to name this feeling is already a step toward loosening its grip.",
  ],
  sadness: [
    "There's a heaviness in your words that tells me this runs deeper than just a bad day.",
    "Sadness like this deserves space — not to be fixed immediately, but to be felt and honored.",
    "The fact that you're reaching out while carrying this weight shows remarkable self-awareness.",
  ],
  loneliness: [
    "Feeling disconnected in a world full of people is one of the most painful paradoxes of being human.",
    "Loneliness isn't about the number of people around you — it's about feeling truly seen by someone.",
    "That ache for connection you're describing? It's one of the most human feelings there is.",
  ],
  academic: [
    "Academic pressure can make your entire identity feel like it's riding on a single grade.",
    "When studying feels impossible, it's usually not about intelligence — it's about emotional bandwidth.",
    "Your worth as a person has never been determined by a transcript or a test score.",
  ],
  happiness: [
    "That brightness you're feeling deserves to be celebrated — positive moments are fuel for harder days!",
    "I can feel the energy shift in your words! This kind of joy is worth savoring and remembering.",
    "Moments like these are worth anchoring in memory — they become lighthouses during storms.",
  ],
  gratitude: [
    "Thank you for saying that — knowing I could be even a small help genuinely means a lot.",
    "Your gratitude reflects something beautiful about you — the ability to notice goodness even during difficulty.",
    "I'm glad our conversation helped. Remember, YOU did the hard work of showing up and being honest.",
  ],
  greeting: [
    "Hey there! 💙 I'm genuinely glad you're here. I'm SERA — your safe space to talk about anything, judgment-free. What's really going on with you today?",
    "Welcome! 💙 This is a completely safe, anonymous space. I'm SERA, and I'm here to listen — really listen. How are you actually feeling right now?",
  ],
};

const tips = {
  stress: [
    "Right now, try this: write every single thing weighing on you, then circle just TWO that actually need attention today.",
    "Here's a quick pressure valve: inhale for 4, hold for 4, out for 6. Three rounds. Feel the difference.",
  ],
  anxiety: [
    "Ground yourself right now: press your feet flat on the floor, feel 5 textures around you, name 3 sounds you hear.",
    "Box breathing works in seconds: breathe in 4 counts, hold 4, out 4, hold 4. Your parasympathetic system kicks in by round 2.",
  ],
  sadness: [
    "Be gentle with yourself right now: wrap up warm, make your favorite drink, and just allow this feeling without fighting it.",
    "Try naming exactly what you feel in 3 words. Neuroscience shows that labeling emotions literally reduces their intensity.",
  ],
  loneliness: [
    "Send one genuine message to someone today — even just 'hey, thinking of you.' Connection starts with tiny brave moves.",
    "Write a letter to yourself from the perspective of someone who loves you. What would they say about who you are?",
  ],
  academic: [
    "The Pomodoro technique really works: 25 minutes focused, then a real 5-minute break.",
    "Make a 'done list' alongside your to-do list. Seeing what you've accomplished fights the feeling of never doing enough.",
  ],
  general: [
    "Take 2 minutes right now to write down exactly what's bothering you most. Externalizing thoughts reduces their emotional charge.",
    "Place one hand on your chest and breathe slowly. Physical self-touch activates your parasympathetic system.",
  ],
};

const questions = {
  stress: ['What part of this feels heaviest right now?', 'If you could take just one thing off your plate, what would it be?'],
  anxiety: ['What specific thought keeps circling back?', 'Would you like me to walk you through a calming exercise right now?'],
  sadness: ['Do you want to tell me more about what triggered this?', 'What usually helps you feel even 1% better on days like this?'],
  loneliness: ['When do you feel this most — during the day or at night?', 'Is there one person you wish you could talk to right now?'],
  academic: ['Which subject or deadline is weighing on you most?', 'What\'s the smallest step you could take on this today?'],
  general: ['What feels most urgent to you right now?', 'Would talking more about this help, or would you prefer a calming exercise?'],
};

const langResponses: Record<string, string> = {
  hi: "मैं समझ सकती हूँ कि आप क्या महसूस कर रहे हैं। आपकी भावनाएँ मायने रखती हैं, और यहाँ आना बहुत बहादुरी का काम है। 💙 क्या आप मुझे और बताना चाहेंगे कि क्या हो रहा है?",
  ta: "நீங்கள் என்ன உணர்கிறீர்கள் என்பதை நான் புரிந்துகொள்கிறேன். உங்கள் உணர்வுகள் முக்கியமானவை. 💙 இதைப் பற்றி மேலும் பேச விரும்புகிறீர்களா?",
  mr: "तुम्ही काय अनुभवत आहात ते मला समजतंय. तुमच्या भावना महत्त्वाच्या आहेत. 💙 तुम्हाला याबद्दल अधिक बोलायला आवडेल का?",
  te: "మీరు ఏమి అనుభవిస్తున్నారో నాకు అర్థమవుతోంది. మీ భావాలు ముఖ్యమైనవి. 💙 దీని గురించి మరింత మాట్లాడాలనుకుంటున్నారా?",
  bn: "আপনি কী অনুভব করছেন তা আমি বুঝতে পারি। আপনার অনুভূতি গুরুত্বপূর্ণ। 💙 এ বিষয়ে আরও কথা বলতে চান?",
};

function generateMockChatResponse(messages: ChatTurn[], language?: string): string {
  const lastUser = [...messages].reverse().find((m) => m.role !== 'assistant')?.content?.trim() || '';
  const lower = lastUser.toLowerCase();
  const msgCount = messages.length;
  const timeSeed = Math.floor(Date.now() / 1000);
  const seed = hash(lastUser + String(msgCount) + String(timeSeed));

  if (detectCrisis(lastUser)) {
    return "What you just shared takes enormous courage, and I want you to know — your life matters deeply. Please reach out: iCall: 9152987821 · Vandrevala: 1860-2662-345 · AASRA: 9820466627. Are you somewhere safe right now?";
  }

  // Non-English language response
  if (language && language !== 'en' && langResponses[language]) {
    return langResponses[language];
  }

  // Script detection fallback
  if (/[\u0900-\u097F]/.test(lastUser)) return langResponses.hi;
  if (/[\u0B80-\u0BFF]/.test(lastUser)) return langResponses.ta;
  if (/[\u0B00-\u0B7F]/.test(lastUser)) return langResponses.te;
  if (/[\u0980-\u09FF]/.test(lastUser)) return langResponses.bn;

  let category = 'general';
  if (matches(lower, /(stress|overwhelm|pressure|too much|burnout)/)) category = 'stress';
  else if (matches(lower, /(anxious|anxiety|panic|nervous|worried|overthink)/)) category = 'anxiety';
  else if (matches(lower, /(sad|depressed|cry|crying|empty|down|hopeless)/)) category = 'sadness';
  else if (matches(lower, /(lonely|alone|isolated|no friends|no one understands)/)) category = 'loneliness';
  else if (matches(lower, /(exam|test|study|academic|assignment|deadline|college|class|grades|fail)/)) category = 'academic';
  else if (matches(lower, /(happy|great|amazing|wonderful|good|better|positive|excited)/)) category = 'happiness';
  else if (matches(lower, /(thank|thanks|helpful|appreciate)/)) category = 'gratitude';
  else if (matches(lower, /(hello|hi|hey|sup|what's up)/)) category = 'greeting';

  if (category === 'greeting') return pickSeeded(openers.greeting, seed);
  if (category === 'gratitude') return pickSeeded(openers.gratitude, seed) + " Is there anything else on your mind?";
  if (category === 'happiness') return pickSeeded(openers.happiness, seed) + " What do you think contributed most to this feeling?";

  const openerPool = openers[category as keyof typeof openers] || openers.stress;
  const tipPool = tips[category as keyof typeof tips] || tips.general;
  const questionPool = questions[category as keyof typeof questions] || questions.general;

  return `${pickSeeded(openerPool, seed)} ${pickSeeded(tipPool, seed + 7)} ${pickSeeded(questionPool, seed + 13)}`;
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
  if (lower.match(/exam|test|study|deadline/)) return { emoji: '📚', label: 'Academic Stress' };
  if (lower.match(/fear|scared|afraid/)) return { emoji: '😨', label: 'Fear' };
  if (lower.match(/hope|optimis|looking forward/)) return { emoji: '🌱', label: 'Hope' };
  return null;
}

// Voice tone analysis
export function analyzeVoiceTone(text: string): string {
  const emotion = detectEmotion(text);
  if (!emotion) return "Based on what you shared, I'm picking up a mix of emotions. How does that feel?";
  const toneMessages: Record<string, string[]> = {
    Stress: ["Based on your words, you might be carrying more stress than usual today.", "I'm sensing some tension — your mind seems under pressure."],
    Anxiety: ["There seems to be some anxious energy in what you're sharing.", "I'm picking up on some worry in your words."],
    Sadness: ["There's a softness and heaviness in what you're expressing.", "Your words carry a quiet sadness today. It's okay to sit with that."],
    Happiness: ["There's a wonderful lightness in what you're sharing!", "I can feel the brightness in your words — something good is flowing!"],
    Fatigue: ["You sound like you could really use some rest.", "There's a weariness in what you're sharing."],
  };
  const msgs = toneMessages[emotion.label] || [`Based on your expression, you might be feeling ${emotion.label.toLowerCase()} today. ${emotion.emoji}`];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// Crisis detection
export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return !!lower.match(/suicide|suicidal|kill myself|end it|can't go on|hopeless|self.?harm|don't want to live|want to die|no reason to live/);
}
