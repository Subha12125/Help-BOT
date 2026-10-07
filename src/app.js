import cors from "cors";
import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both root and src directory if present
dotenv.config();
dotenv.config({ path: path.join(__dirname, ".env") });

export const SYSTEM_PROMPT = `You are Rani, a warm, compassionate, and attentive AI mental health and emotional well-being companion.

Your primary mission is to provide a safe, non-judgmental, soothing space where individuals can freely explore their emotions, talk through everyday challenges, decompress, and discover healthy coping strategies.

Key Persona & Communication Guidelines:
1. Warmth & Validation: Meet the user with genuine empathy and patience. Acknowledge and validate their emotional state first before offering perspective or suggestions (e.g., "It makes complete sense that you're feeling that way given everything you're carrying right now.").
2. Conversational & Approachable: Speak with a calm, grounded, gentle tone. Avoid sterile clinical jargon, cold formality, or dismissive toxic positivity.
3. Digestible & Mindful Responses: Keep responses concise (usually 2-3 short, easily readable paragraphs or bullet points). When people are anxious, exhausted, or overwhelmed, large blocks of text can increase cognitive load.
4. Active & Reflective Inquiries: Conclude with at most one thoughtful, gentle, open question to help the user unpack their feelings at their own pace, or invite them to try a calming technique if appropriate.
5. Evidence-Informed Coping Strategies:
   - Somatic & Grounding: 5-4-3-2-1 sensory grounding, 4-4-4-4 box breathing, belly breathing, progressive muscle relaxation.
   - Cognitive Reframing: Gently helping identify unhelpful thought habits (like catastrophizing, mind-reading, or all-or-nothing thinking) with kind curiosity.
   - Self-Compassion: Guiding the user toward treating themselves with the same kindness they'd offer a dear friend.
   - Behavioral micro-steps: Encouraging small, tangible acts of self-care (hydrating, taking a 5-minute break, getting fresh air).

Boundaries & Crisis Safety Protocols:
- You are an AI wellness companion, NOT a medical doctor, licensed psychotherapist, or psychiatric emergency service.
- You cannot diagnose medical/mental conditions or prescribe medication.
- If the user expresses thoughts of suicide, severe self-harm, extreme despair, or immediate physical danger:
  1. Immediately respond with warmth, care, and utmost seriousness.
  2. Clearly prioritize their safety and emphasize that their life matters.
  3. Provide direct, accessible 24/7 crisis support hotlines:
     • In the US/Canada: Call or text 988 (Suicide & Crisis Lifeline - free & confidential 24/7).
     • In India: Tele-MANAS (14416 or 1800-891-4416) or KIRAN (1800-599-0019).
     • In the UK: Call 111 or text "SHOUT" to 85258.
     • International: Visit https://findahelpline.com or https://befrienders.org to find confidential local support.
  4. Encourage them to immediately contact a loved one, counselor, or emergency service.`;

const app = express();

const apiKey = process.env.GROQ_API_KEY;
const client = new OpenAI({
  apiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

const defaultModel = process.env.GROQ_MODEL || process.env.Model || "openai/gpt-oss-120b";
const history = [];

// Serialize history operations so simultaneous requests do not interleave turns
let historyQueue = Promise.resolve();
function useHistory(operation) {
  const result = historyQueue.then(operation);
  historyQueue = result.catch(() => {});
  return result;
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.text({ type: ["text/plain", "text/*"] }));

// Serve frontend UI
app.use(express.static(path.join(__dirname, "../public")));

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    bot: "RaniBot",
    model: defaultModel,
    connected: Boolean(apiKey),
  });
});

// Chat endpoint supporting both JSON and plain-text
app.post("/api/chat", async (req, res, next) => {
  let userMessage = "";
  let isJsonRequest = false;

  if (typeof req.body === "string") {
    userMessage = req.body.trim();
  } else if (req.body && typeof req.body === "object") {
    userMessage = (req.body.message || "").trim();
    isJsonRequest = true;
  }

  if (!userMessage) {
    return res.status(400).json({ error: "Bad Request: message is required." });
  }

  try {
    const answer = await useHistory(async () => {
      history.push({ role: "user", content: userMessage });

      // Keep sliding window of history to prevent token overflow
      const recentHistory = history.slice(-12);

      let replyContent = "";
      try {
        const response = await client.chat.completions.create({
          model: defaultModel,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...recentHistory,
          ],
          temperature: 0.7,
          max_tokens: 1024,
        });

        replyContent = response.choices?.[0]?.message?.content || "";
      } catch (primaryErr) {
        console.warn(`Primary model ${defaultModel} failed (${primaryErr.message}), trying fallback qwen/qwen3.8-27b...`);
        const fallbackResponse = await client.chat.completions.create({
          model: "qwen/qwen3.8-27b",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...recentHistory,
          ],
          temperature: 0.7,
          max_tokens: 1024,
        });

        replyContent = fallbackResponse.choices?.[0]?.message?.content || "";
      }

      if (!replyContent) {
        replyContent = "I am here with you. Take a gentle breath—could you tell me a little more about how you are feeling right now?";
      }

      history.push({ role: "assistant", content: replyContent });
      return replyContent;
    });

    if (isJsonRequest || req.headers.accept?.includes("application/json")) {
      return res.json({ reply: answer, model: defaultModel });
    }
    return res.type("text/plain").send(answer);
  } catch (err) {
    next(err);
  }
});

// Reset conversation history
app.delete(["/api", "/api/chat"], async (_req, res, next) => {
  try {
    await useHistory(async () => {
      history.length = 0;
    });
    res.status(200).json({ success: true, message: "Conversation history cleared." });
  } catch (error) {
    next(error);
  }
});

// Global error handler
app.use((error, _req, res, _next) => {
  console.error("Chat Server Error:", error.message || error);
  res.status(500).json({
    error: "Unable to process the chat request. Please verify your connection or try again shortly.",
    details: error.message,
  });
});

export default app;