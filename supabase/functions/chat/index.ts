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
English, Hindi, Tamil, Marathi, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu,
Spanish, French, German, Italian, Portuguese, Dutch,
Chinese, Japanese, Korean, Thai, Vietnamese, Indonesian, Malay, Filipino,
Arabic, Turkish, Persian/Farsi, Hebrew,
Russian, Polish, Ukrainian, Czech,
Swahili, Amharic, Yoruba, Zulu,
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

    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GOOGLE_GEMINI_API_KEY && !LOVABLE_API_KEY) {
      throw new Error("No AI API key configured. Set GOOGLE_GEMINI_API_KEY or LOVABLE_API_KEY.");
    }

    const langInstruction = language && language !== "en"
      ? `\n\nIMPORTANT: The user has selected "${language}" as their preferred language. You MUST respond entirely in that language. Be natural and fluent.`
      : "";

    const systemContent = SYSTEM_PROMPT + langInstruction;

    // Try Google Gemini first, fall back to Lovable AI gateway
    if (GOOGLE_GEMINI_API_KEY) {
      const geminiResult = await callGoogleGemini(GOOGLE_GEMINI_API_KEY, systemContent, messages);
      if (geminiResult) return geminiResult;
      console.warn("Google Gemini failed, falling back to Lovable AI gateway");
    }

    if (LOVABLE_API_KEY) {
      return await callLovableGateway(LOVABLE_API_KEY, systemContent, messages);
    }

    throw new Error("All AI providers failed");
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── Google Gemini (direct API) ───
async function callGoogleGemini(
  apiKey: string,
  systemContent: string,
  messages: Array<{ role: string; content: string }>
): Promise<Response | null> {
  try {
    const geminiMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemContent }] },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      return null; // Signal to fall back
    }

    // Transform Gemini SSE into OpenAI-compatible SSE so the client parser works unchanged
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let idx;
            while ((idx = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);

              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  // Emit OpenAI-compatible chunk
                  const chunk = JSON.stringify({
                    choices: [{ index: 0, delta: { content: text, role: "assistant" }, finish_reason: null }],
                  });
                  controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
                }

                const finishReason = parsed.candidates?.[0]?.finishReason;
                if (finishReason && finishReason !== "FINISH_REASON_UNSPECIFIED") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                }
              } catch {
                // partial JSON, skip
              }
            }
          }
          // Final done signal
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("Stream transform error:", err);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Gemini call failed:", e);
    return null;
  }
}

// ─── Lovable AI Gateway (fallback) ───
async function callLovableGateway(
  apiKey: string,
  systemContent: string,
  messages: Array<{ role: string; content: string }>
): Promise<Response> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: systemContent }, ...messages],
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
    console.error("Lovable AI gateway error:", response.status, t);
    return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}
