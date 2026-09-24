import { readFile } from "node:fs/promises";
import path from "node:path";

type Message = { role: "user" | "model"; text: string };

const defaultModel = "gemini-3.6-flash";
const skillFiles = ["training-programs.md", "website-guide.md"];

async function loadKnowledge() {
  const skillDirectory = path.join(process.cwd(), "public", "skills");
  return (await Promise.all(skillFiles.map((file) => readFile(path.join(skillDirectory, file), "utf8")))).join("\n\n---\n\n");
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return Response.json({ error: "The assistant is not configured yet." }, { status: 503 });

    const body = await request.json() as { messages?: Message[] };
    const messages = body.messages?.filter((message) => (message.role === "user" || message.role === "model") && typeof message.text === "string").slice(-12);
    if (!messages?.length) return Response.json({ error: "Please ask a question." }, { status: 400 });

    const knowledge = await loadKnowledge();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || defaultModel}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: `You are the website assistant for Mind Body Flow Rotational Training. Use only the knowledge below. Be concise, warm, and practical. Answer only questions about this website, its training programs, or closely related contact and safety information. If the answer is not in the knowledge, say so and direct the visitor to contact Amit. Never invent facts.\n\nKNOWLEDGE:\n${knowledge}` }] },
        contents: messages.map(({ role, text }) => ({ role, parts: [{ text }] })),
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
      }),
    });

    const data = await response.json();
    if (!response.ok) return Response.json({ error: data.error?.message || "Gemini could not answer right now." }, { status: response.status });

    const answer = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim() || "I’m sorry, I couldn’t find an answer. Please contact Amit directly.";
    return Response.json({ answer });
  } catch {
    return Response.json({ error: "The assistant could not respond right now. Please try again." }, { status: 500 });
  }
}
