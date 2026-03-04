// AI integration helper — calls Claude API via proxy or direct
// For the prototype, we provide mock responses when no API key is available

const SYSTEM_PROMPT = `You are Ease, a warm, empathetic AI mental wellness companion for students. Respond with compassion, never judgment. Keep responses concise (2–4 sentences). Detect emotional distress and respond with care. If user mentions self-harm or crisis, gently recommend professional resources like iCall (9152987821) or Vandrevala Foundation (1860-2662-345). Never give medical advice.`;

export async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  // Try calling Claude API — if no key or error, return smart mock
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": localStorage.getItem('mindease_api_key') || '',
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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": localStorage.getItem('mindease_api_key') || '',
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
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
  
  if (lower.includes('stress') || lower.includes('exam') || lower.includes('academic')) {
    return "I hear you — academic pressure can feel really heavy. Remember, your worth isn't defined by a grade. Try breaking your study sessions into 25-minute blocks with short breaks. You've got this. 💙";
  }
  if (lower.includes('lonely') || lower.includes('alone') || lower.includes('friend')) {
    return "Feeling lonely is more common than you might think, especially among students. You're brave for acknowledging it. Consider reaching out to one person today — even a small connection can make a big difference. 🤗";
  }
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired')) {
    return "Sleep struggles are tough. Try putting your phone away 30 minutes before bed, and keep your room cool and dark. A short breathing exercise before sleep can work wonders. You deserve rest. 🌙";
  }
  if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('worried') || lower.includes('panic')) {
    return "Anxiety can feel overwhelming, but you're not alone in this. Try the 5-4-3-2-1 grounding technique: notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste. It helps bring you back to the present. 🌿";
  }
  if (lower.includes('sad') || lower.includes('depressed') || lower.includes('cry')) {
    return "It's okay to feel sad — your emotions are valid. Sometimes just letting yourself feel without judgment is the bravest thing you can do. If this feeling persists, talking to someone you trust can really help. I'm here for you. 💙";
  }
  if (lower.includes('calm') || lower.includes('relax') || lower.includes('breathe')) {
    return "Let's take a moment together. Close your eyes if you can. Breathe in for 4 counts... hold for 4... and slowly exhale for 6 counts. Feel your body relaxing with each breath. You're doing beautifully. 🧘";
  }
  if (lower.includes('happy') || lower.includes('great') || lower.includes('good') || lower.includes('amazing')) {
    return "That's wonderful to hear! 🌟 Savor this feeling — you've earned it. What's one thing that contributed to this positive mood? Recognizing what lifts us up helps us return to it.";
  }
  if (lower.includes('overwhelm')) {
    return "When everything feels like too much, remember: you only need to take the next small step. Not everything needs to be solved today. What's one thing you can let go of right now? 💙";
  }
  
  return "Thank you for sharing that with me. Your feelings matter, and I'm glad you're taking the time to check in with yourself. Remember, small steps lead to big changes. What would feel most supportive for you right now? 💙";
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
  return null;
}

// Crisis detection
export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return !!lower.match(/suicide|kill myself|end it|can't go on|hopeless|self.?harm|don't want to live|want to die|no reason to live/);
}
