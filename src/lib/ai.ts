// AI integration helper — calls Claude API via proxy or direct
// For the prototype, we provide mock responses when no API key is available

const SYSTEM_PROMPT = `You are SERA (Supportive Emotional Response Assistant), a warm and emotionally intelligent AI wellness companion for students and young adults. Your role is to provide empathetic, relevant, and personalized emotional support.

STRICT RULES:
- ALWAYS directly address what the user just said. Read their message carefully.
- Never give generic responses. Tailor every reply to the specific emotion or situation they mentioned.
- Keep responses to 3-5 sentences max. Be warm but concise.
- If they mention stress → acknowledge it specifically and offer one coping tip.
- If they mention loneliness → validate the feeling, ask a gentle follow-up question.
- If they mention academic pressure → empathize and suggest one practical strategy.
- If they mention sadness → be present, don't rush to fix, just acknowledge first.
- If they mention crisis keywords (hopeless, end it, can't go on, suicidal) → respond with care and provide: iCall: 9152987821, Vandrevala: 1860-2662-345
- Always end with either a gentle question OR a specific suggestion — never just a statement.
- Never start responses with "I understand" or "I'm sorry to hear" every single time — vary your openings.`;

export async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const apiKey = localStorage.getItem('mindease_api_key') || '';
    if (!apiKey) throw new Error('No API key');
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt || SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.content[0].text;
  } catch {
    return generateMockResponse(prompt);
  }
}

export async function callAIChat(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const apiKey = localStorage.getItem('mindease_api_key') || '';
    if (!apiKey) throw new Error('No API key');
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10),
      }),
    });
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.content[0].text;
  } catch {
    return generateMockResponse(messages[messages.length - 1]?.content || '');
  }
}

function generateMockResponse(input: string): string {
  const lower = input.toLowerCase();
  
  if (lower.includes('study') || lower.includes('midsem') || lower.includes('exam') && lower.includes('how')) {
    return "Pre-exam anxiety is so common — you're definitely not alone in feeling this way. Here's what works: break your remaining material into small chunks, focus on understanding key concepts rather than memorizing everything, and take 5-minute breaks every 25 minutes. What subject is weighing on you the most right now? 📚";
  }
  if (lower.includes('stress') || lower.includes('overwhelm') || lower.includes('pressure') || lower.includes('too much')) {
    return "That sounds really heavy — carrying stress like that takes a toll. One thing that can help right now is the 4-7-8 breathing technique: inhale for 4 counts, hold for 7, exhale for 8. It signals your nervous system to calm down. What's the biggest source of this stress for you? 💙";
  }
  if (lower.includes('lonely') || lower.includes('alone') || lower.includes('friend') || lower.includes('no one understands')) {
    return "Loneliness can feel like being in a crowded room and still feeling invisible — that's genuinely painful. You're not broken for feeling this way; connection is a human need. Would you be open to reaching out to one person today, even with just a simple \"hey, how are you?\" Sometimes the smallest step opens the biggest doors. 🤗";
  }
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired') || lower.includes('can\'t sleep')) {
    return "Sleep struggles are exhausting in every sense of the word. Tonight, try this: put your phone in another room 30 minutes before bed, keep your room cool, and do a 2-minute body scan — just noticing each body part from toes to head. What time do you usually try to fall asleep? 🌙";
  }
  if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('worried') || lower.includes('panic') || lower.includes('nervous')) {
    return "Anxiety has a way of making everything feel urgent and overwhelming. Right now, try grounding yourself: name 5 things you can see around you. This pulls your brain out of the anxiety spiral and into the present moment. What specific situation is making you feel most anxious? 🌿";
  }
  if (lower.includes('sad') || lower.includes('depressed') || lower.includes('cry') || lower.includes('down')) {
    return "Thank you for being honest about how you're feeling — that takes courage. Sadness doesn't need to be fixed immediately; sometimes it just needs space to exist. It's okay to sit with it without judging yourself. When did you start feeling this way? 💙";
  }
  if (lower.includes('motivation') || lower.includes('lazy') || lower.includes('can\'t focus') || lower.includes('procrastinat')) {
    return "Feeling unmotivated doesn't mean you're lazy — it often means you're mentally exhausted or overwhelmed by how much there is to do. Try the \"2-minute rule\": pick the smallest possible task and just do that one thing. Momentum builds from action, not from waiting to feel ready. What's one tiny thing you could start with? ⚡";
  }
  if (lower.includes('overthink') || lower.includes('spiral') || lower.includes('can\'t stop thinking')) {
    return "Overthinking is your brain trying to protect you, but it ends up keeping you stuck instead. Here's something that helps: write down every thought that's looping — get it out of your head and onto paper. Once it's external, your mind can release it more easily. What's the main thought that keeps coming back? 🧠";
  }
  if (lower.includes('happy') || lower.includes('great') || lower.includes('good') || lower.includes('amazing')) {
    return "That's genuinely wonderful to hear! 🌟 Positive moments deserve to be savored — really let yourself feel this. What contributed to this feeling? Recognizing what lifts you up helps you return to it when you need it most.";
  }
  if (lower.includes('calm') || lower.includes('relax') || lower.includes('breathe')) {
    return "Let's create a moment of peace together. Close your eyes if you can. Breathe in slowly for 4 counts... hold gently for 4... and exhale slowly for 6 counts. Feel your shoulders dropping, your jaw unclenching. You're doing beautifully. Would you like to try the guided breathing exercise in the Wellness section? 🧘";
  }
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    return "Hey there! 👋 Welcome — I'm SERA, your wellness companion. I'm here to listen without judgment and support you however I can. How are you really feeling right now? No need to sugarcoat it.";
  }
  
  return "I'm here with you. What you're going through matters, and I want to make sure I respond to what you actually need right now. Could you tell me a bit more about what's on your mind? Whether it's stress, emotions, sleep, or anything else — I'm listening. 💙";
}

// Emotion detection
export function detectEmotion(text: string): { emoji: string; label: string } | null {
  const lower = text.toLowerCase();
  if (lower.match(/stress|overwhelm|pressure|too much/)) return { emoji: '😟', label: 'Stress' };
  if (lower.match(/anxious|anxiety|worried|nervous|panic/)) return { emoji: '😰', label: 'Anxiety' };
  if (lower.match(/sad|depressed|cry|hopeless|down/)) return { emoji: '😢', label: 'Sadness' };
  if (lower.match(/angry|frustrated|annoyed|mad/)) return { emoji: '😤', label: 'Frustration' };
  if (lower.match(/lonely|alone|isolated/)) return { emoji: '😔', label: 'Loneliness' };
  if (lower.match(/happy|great|amazing|wonderful|good/)) return { emoji: '😊', label: 'Happiness' };
  if (lower.match(/tired|exhausted|sleep|fatigue/)) return { emoji: '😴', label: 'Fatigue' };
  if (lower.match(/confused|lost|unsure/)) return { emoji: '😵‍💫', label: 'Confusion' };
  if (lower.match(/grateful|thankful|blessed/)) return { emoji: '🙏', label: 'Gratitude' };
  if (lower.match(/calm|peace|relax/)) return { emoji: '😌', label: 'Calm' };
  if (lower.match(/motivat|lazy|procrastinat/)) return { emoji: '😮‍💨', label: 'Low Motivation' };
  if (lower.match(/overthink|spiral|rumnat/)) return { emoji: '🌀', label: 'Overthinking' };
  return null;
}

// Crisis detection
export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return !!lower.match(/suicide|kill myself|end it|can't go on|hopeless|self.?harm|don't want to live|want to die|no reason to live/);
}
