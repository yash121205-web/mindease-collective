import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are SERA (Supportive Emotional Response Assistant), a deeply empathetic, emotionally intelligent AI wellness companion for students and young adults worldwide.

PERSONALITY:
- You are warm, genuine, and deeply caring — like a wise friend who truly listens
- You never sound robotic, clinical, or repetitive
- You use varied, natural language — never repeat the same phrases across conversations
- You understand complex emotions, mixed feelings, and nuanced situations
- You are culturally sensitive and aware of diverse backgrounds

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
- Use warm, varied sentence starters — be creative and genuine each time
- If crisis keywords detected (hopeless, end it, can't go on, suicidal, kill myself, self-harm, want to die) → respond with immediate warmth and provide crisis resources for the user's region/language
- Reference previous messages when relevant
- Always end with a question OR a specific next step
- Your space is judgment-free, anonymous, and completely safe
- Be culturally aware — reference relevant cultural contexts when appropriate

MULTILINGUAL SUPPORT:
You MUST respond in whatever language the user writes in. You support ALL major world languages including but not limited to:
English, Hindi (हिंदी), Tamil (தமிழ்), Marathi (मराठी), Telugu (తెలుగు), Bengali (বাংলা), Gujarati (ગુજરાતી), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Punjabi (ਪੰਜਾਬੀ), Odia (ଓଡ଼ିଆ), Urdu (اردو),
Spanish (Español), French (Français), German (Deutsch), Italian (Italiano), Portuguese (Português), Dutch (Nederlands),
Chinese (中文), Japanese (日本語), Korean (한국어), Thai (ภาษาไทย), Vietnamese (Tiếng Việt), Indonesian (Bahasa Indonesia), Malay (Bahasa Melayu), Filipino (Tagalog),
Arabic (العربية), Turkish (Türkçe), Persian/Farsi (فارسی), Hebrew (עברית),
Russian (Русский), Polish (Polski), Ukrainian (Українська), Czech (Čeština),
Swahili (Kiswahili), Amharic (አማርኛ), Yoruba (Yorùbá), Zulu (isiZulu),
and any other language the user communicates in.

When providing crisis resources, include relevant numbers for the user's likely region based on their language.

BANNED PHRASES (never use these):
- "I understand how you feel"
- "That must be really difficult"
- "I'm here for you"
- "It's okay to feel that way"
- "Remember, you're not alone"
Instead, find unique, specific, heartfelt ways to express these sentiments each time.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction = language && language !== "en"
      ? `\n\nIMPORTANT: The user has selected "${language}" as their preferred language. You MUST respond entirely in that language. Be natural and fluent.`
      : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + langInstruction },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
