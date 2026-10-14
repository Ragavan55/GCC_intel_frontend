"use client";

import { useRef, useState, type FormEvent } from "react";
import { Bot, Copy, CornerDownLeft, LoaderCircle, MessageCircle, Minimize2, Plus, Send, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button, IconButton, Textarea, useToast } from "@/components/ui";

interface ChatSource { source: string; url: string }
interface ChatReply { session_id: number; reply: string; sources: ChatSource[] }
interface ChatTurn { id: string; role: "user" | "assistant"; content: string; sources: ChatSource[]; failed?: boolean }

const suggestions = ["Which cities are tracked?", "Compare Bengaluru and Hyderabad", "Show recent GCC news signals"];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [pending, setPending] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  async function sendMessage(event?: FormEvent<HTMLFormElement>, override?: string) {
    event?.preventDefault();
    const content = (override ?? message).trim();
    if (!content || pending) return;
    setMessage("");
    setRetryMessage(null);
    setTurns((current) => [...current, { id: `user-${Date.now()}`, role: "user", content, sources: [] }]);
    setPending(true);
    try {
      const response = await apiFetch<ChatReply>("chat", {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, message: content }),
      });
      setSessionId(response.session_id);
      setTurns((current) => [...current, {
        id: `assistant-${response.session_id}-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        sources: response.sources,
      }]);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "The chat service could not be reached.";
      setRetryMessage(content);
      setTurns((current) => [...current, { id: `error-${Date.now()}`, role: "assistant", content: detail, sources: [], failed: true }]);
    } finally {
      setPending(false);
    }
  }

  function startNewChat() {
    setSessionId(null);
    setTurns([]);
    setRetryMessage(null);
    setMessage("");
  }

  async function copyReply(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      toast("Reply copied", "success");
    } catch {
      toast("Could not copy this reply", "error");
    }
  }

  return <>
    {open && <section aria-label="GCC intelligence chat" className="fixed inset-x-0 bottom-0 z-50 flex h-[100dvh] flex-col border border-line bg-paper shadow-lift sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[min(680px,calc(100dvh-130px))] sm:w-[min(430px,calc(100vw-32px))] sm:rounded-panel">
      <header className="flex min-h-[72px] shrink-0 items-center justify-between border-b border-line px-4">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-panel bg-accent text-white"><Bot size={20} /></span><span><strong className="block text-sm">GCC Intelligence</strong><span className="block text-xs text-muted">Answers from your data</span></span></div>
        <div className="flex items-center gap-1"><IconButton label="Start a new chat" onClick={startNewChat}><Plus size={18} /></IconButton><IconButton label="Minimize chat" className="hidden sm:inline-flex" onClick={() => setOpen(false)}><Minimize2 size={17} /></IconButton><IconButton label="Close chat" className="sm:hidden" onClick={() => setOpen(false)}><X size={18} /></IconButton></div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {turns.length === 0 && <div className="flex min-h-full flex-col justify-center">
          <p className="font-display text-2xl">What are you exploring?</p>
          <p className="mt-2 text-sm text-muted">Ask about tracked cities, GCC records, incentives, or ingested news. Answers include their sources.</p>
          <div className="mt-5 grid gap-2">{suggestions.map((prompt) => <Button key={prompt} type="button" variant="secondary" size="sm" className="justify-start text-left" onClick={() => void sendMessage(undefined, prompt)}>{prompt}</Button>)}</div>
        </div>}
        {turns.map((turn) => <div key={turn.id} className={cn("flex", turn.role === "user" ? "justify-end" : "justify-start")}>
          <div className={cn("max-w-[88%] rounded-panel px-3.5 py-3", turn.role === "user" ? "bg-accent text-white dark:text-[#10231f]" : turn.failed ? "border border-signal/40 bg-signal/5 text-ink" : "border border-line bg-paper text-ink")}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{turn.content}</p>
            {turn.role === "assistant" && !turn.failed && <div className="mt-2 flex items-center justify-between gap-3 border-t border-line/70 pt-2">
              <details className="min-w-0 text-xs"><summary className="cursor-pointer text-muted">Sources / data used ({turn.sources.length})</summary><ul className="mt-2 grid gap-1">{turn.sources.length ? turn.sources.map((source, index) => <li key={`${source.source}-${index}`} className="break-words">{source.url ? <a href={source.url} target="_blank" rel="noreferrer" className="text-accent-deep underline">{source.source}</a> : source.source}</li>) : <li className="text-muted">Database records</li>}</ul></details>
              <IconButton label="Copy reply" className="size-8 shrink-0" onClick={() => void copyReply(turn.content)}><Copy size={14} /></IconButton>
            </div>}
          </div>
        </div>)}
        {pending && <div className="flex items-center gap-2 text-sm text-muted"><span className="grid size-8 place-items-center rounded-panel bg-accent-soft text-accent-deep"><Bot size={16} /></span><LoaderCircle size={16} className="animate-spin" /> Looking through saved data…</div>}
        {retryMessage && !pending && <div className="pl-10"><Button variant="secondary" size="sm" icon={<CornerDownLeft size={15} />} onClick={() => void sendMessage(undefined, retryMessage)}>Retry</Button></div>}
      </div>

      <form onSubmit={(event) => void sendMessage(event)} className="shrink-0 border-t border-line p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2"><Textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Ask about India's GCC landscape…" rows={2} className="min-h-[48px] max-h-32 resize-none" aria-label="Message the GCC intelligence assistant" /><Button type="submit" aria-label="Send message" disabled={!message.trim() || pending} className="size-12 shrink-0 px-0"><Send size={17} /></Button></div>
        <p className="mt-2 text-center text-[10px] text-muted">Database-grounded · Enter to send · Shift+Enter for a new line</p>
      </form>
    </section>}
    <Button type="button" aria-label={open ? "Close GCC intelligence chat" : "Open GCC intelligence chat"} onClick={() => setOpen((value) => !value)} className={cn("fixed bottom-20 right-4 z-[51] size-14 rounded-full px-0 shadow-lift sm:bottom-6 sm:right-6", open && "hidden")}>
      <MessageCircle size={23} />
    </Button>
  </>;
}
