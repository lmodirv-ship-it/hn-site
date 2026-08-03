import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { askAssistant } from "@/lib/assistant.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

const QUICK_REPLIES = [
  { label: "⚡ How it works", text: "How does your 24-48h delivery process work?" },
  { label: "💰 Estimate Price", text: "How much would my project cost?" },
  { label: "📅 Book a Call", text: "I'd like to book a call about my project." },
];

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "👋 Hi, I'm HN Assistant. We launch production web apps in 24–48 hours — 200+ shipped. Ask me about packages, pricing, or your idea. (English / العربية)",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askAssistant);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const value = text.trim();
    if (!value || loading) return;
    const next = [...messages, { role: "user" as const, content: value }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({
        data: { messages: next.slice(-12).map((m) => ({ role: m.role, content: m.content })) },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach the assistant. Email info@hnchat.net and we'll reply today.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant chat"
          className="glow-primary fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan text-primary-foreground transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bot className="size-6" aria-hidden />
          <span className="absolute -right-0.5 -top-0.5 size-3 animate-pulse rounded-full bg-cyan" />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="HN Group AI assistant"
          className="animate-rise glass-strong fixed bottom-4 right-4 z-50 flex h-[min(560px,80vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl shadow-[var(--shadow-card)]"
        >
          <header className="flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-3">
            <span className="glow-cyan flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan">
              <Sparkles className="size-4 text-primary-foreground" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold">HN Assistant</p>
              <p className="text-xs text-cyan">Online · replies instantly</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          </header>

          <div className="flex flex-wrap gap-2 border-b border-border px-3 py-2.5">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => void send(q.text)}
                disabled={loading}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-cyan disabled:opacity-50"
              >
                {q.label}
              </button>
            ))}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                dir="auto"
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-primary-foreground"
                    : "text-foreground",
                )}
              >
                {m.role === "assistant" ? m.content.replace(/\*\*/g, "") : m.content}
              </div>
            ))}
            {loading && (
              <p className="animate-pulse text-sm text-muted-foreground">Thinking…</p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-end gap-2 border-t border-border p-3"
          >
            <textarea
              ref={inputRef}
              dir="auto"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask anything… / اكتب سؤالك"
              aria-label="Message"
              className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-input bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              type="submit"
              size="icon"
              variant="hero"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send className="size-4" aria-hidden />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
