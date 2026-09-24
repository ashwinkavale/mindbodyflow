'use client';

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

type Message = { role: "user" | "model"; text: string };

const skillFiles = ["/skills/training-programs.md", "/skills/website-guide.md"];
const defaultModel = "gemini-3.6-flash";

const welcome: Message = {
  role: "model",
  text: "Hi, I’m the Mind Body Flow assistant. Ask me about the training tools, courses, ROAR challenge, sessions, or how to contact Amit.",
};

async function loadKnowledge() {
  const responses = await Promise.all(skillFiles.map((file) => fetch(file)));
  if (responses.some((response) => !response.ok)) throw new Error("Knowledge files could not be loaded.");
  return (await Promise.all(responses.map((response) => response.text()))).join("\n\n---\n\n");
}

async function askGemini(messages: Message[], knowledge: string) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Add NEXT_PUBLIC_GEMINI_API_KEY to your local environment to enable the assistant.");

  const contents = messages.map(({ role, text }) => ({ role, parts: [{ text }] }));
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.NEXT_PUBLIC_GEMINI_MODEL || defaultModel}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: `You are the website assistant for Mind Body Flow Rotational Training. Use only the knowledge below. Be concise, warm, and practical. Answer only questions about this website, its training programs, or closely related contact and safety information. If the answer is not in the knowledge, say so and direct the visitor to contact Amit. Never invent facts.\n\nKNOWLEDGE:\n${knowledge}` }] },
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Gemini could not answer right now.");
  return data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim() || "I’m sorry, I couldn’t find an answer. Please contact Amit directly.";
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [knowledge, setKnowledge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || knowledge) return;
    let active = true;
    loadKnowledge()
      .then((content) => {
        if (active) setKnowledge(content);
      })
      .catch(() => {
        if (active) setError("I couldn’t load my training information. Please try again.");
      });
    return () => {
      active = false;
    };
  }, [open, knowledge]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    const nextMessages = [...messages, { role: "user" as const, text: question }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const answer = await askGemini(nextMessages.slice(1), knowledge);
      setMessages((current) => [...current, { role: "model", text: answer }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7">
    {open && <section aria-label="Mind Body Flow assistant" className="mb-4 flex h-[min(620px,calc(100vh-120px))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#fbfaf7] shadow-2xl">
      <div className="flex items-center justify-between bg-[#141414] px-5 py-4 text-white"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#d9a441] text-[#141414]"><Bot size={18} /></span><div><p className="text-sm font-bold">Mind Body Flow assistant</p><p className="text-xs text-white/55">Training program guide</p></div></div><button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full p-2 text-white/65 hover:bg-white/10 hover:text-white"><X size={18} /></button></div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto rounded-br-sm bg-[#141414] text-white" : "rounded-bl-sm bg-[#f2eee5] text-[#141414]"}`}>{message.text}</div>)}{loading && <div className="w-fit rounded-2xl rounded-bl-sm bg-[#f2eee5] px-4 py-3 text-sm text-black/55">Thinking…</div>}{error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">{error}</p>}<div ref={endRef} /></div>
      <form onSubmit={handleSubmit} className="border-t border-black/10 p-3"><div className="flex items-end gap-2 rounded-xl border border-black/15 bg-white p-2 focus-within:border-[#9a6c18]"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} placeholder="Ask about a program…" aria-label="Your question" className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-black/35" /><button type="submit" disabled={!input.trim() || loading} aria-label="Send question" className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#d9a441] text-[#141414] transition hover:bg-[#e8b858] disabled:cursor-not-allowed disabled:opacity-40"><Send size={17} /></button></div><p className="mt-2 px-1 text-[10px] leading-4 text-black/40">For general information only. Consult your doctor before starting a fitness program.</p></form>
    </section>}
    <button type="button" onClick={() => setOpen((current) => !current)} aria-label={open ? "Close training assistant" : "Open training assistant"} className="ml-auto grid size-14 place-items-center rounded-full bg-[#d9a441] text-[#141414] shadow-lg transition hover:-translate-y-1 hover:bg-[#e8b858]">{open ? <X size={23} /> : <MessageCircle size={23} />}</button>
  </div>;
}
