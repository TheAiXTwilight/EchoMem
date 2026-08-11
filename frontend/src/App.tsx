import { useEffect, useRef, useState } from "react";
import { Lock, Mic, MicOff, Send, Settings } from "lucide-react";
import clsx from "clsx";
import "./index.css";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  citations?: { app: string; title: string; timestamp: number }[];
};

const API = "http://127.0.0.1:8000";

export default function App() {
  const [locked, setLocked] = useState(true);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const msgId = useRef(0);

  useEffect(() => {
    fetch(`${API}/health`).catch(() => {});
    return () => wsRef.current?.close();
  }, []);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch(`${API}/auth/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      setLocked(false);
      setMessages([
        { id: ++msgId.current, role: "assistant", text: "EchoMem unlocked. Say \u201CHey Echo\u201D or type a question." },
      ]);
    }
  }

  async function lock() {
    await fetch(`${API}/auth/lock`, { method: "POST" });
    setLocked(true);
    setPassword("");
  }

  async function toggleCapture(on: boolean) {
    await fetch(`${API}/capture/${on ? "start" : "stop"}`, { method: "POST" });
  }

  async function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: ++msgId.current, role: "user", text }]);
    setInput("");
    setStatus("thinking");
    const r = await fetch(`${API}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await r.json();
    setStatus("idle");
    setMessages((m) => [
      ...m,
      { id: ++msgId.current, role: "assistant", text: data.answer, citations: data.citations },
    ]);
  }

  function toggleMic() {
    // Week 3: open /listen WebSocket and stream mic audio via sounddevice on backend.
    // For now this just toggles a UI state as a placeholder.
    setListening((v) => {
      const next = !v;
      setStatus(next ? "listening" : "idle");
      if (next) toggleCapture(true);
      return next;
    });
  }

  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
        <form onSubmit={unlock} className="w-80 space-y-4 rounded-xl bg-zinc-900/70 p-6 border border-zinc-800">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Lock className="w-5 h-5" />
            EchoMem locked
          </div>
          <p className="text-sm text-zinc-400">Enter your master password to unlock your memory.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Master password"
            autoFocus
          />
          <button className="w-full rounded-md bg-violet-600 hover:bg-violet-500 py-2 text-sm font-medium transition">Unlock</button>
          <p className="text-[11px] text-zinc-500">All data is AES-256-GCM encrypted on disk. Nothing leaves localhost.</p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="font-semibold tracking-tight">EchoMem</h1>
          <span className="text-xs text-zinc-500">local · encrypted · v0.1</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toggleCapture(true)} className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">Start capture</button>
          <button onClick={() => toggleCapture(false)} className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">Stop</button>
          <button className="p-2 rounded-md hover:bg-zinc-800"><Settings className="w-4 h-4" /></button>
          <button onClick={lock} className="p-2 rounded-md hover:bg-zinc-800" title="Lock"><Lock className="w-4 h-4" /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-3xl w-full mx-auto">
        {messages.map((m) => (
          <div key={m.id} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={clsx(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              m.role === "user"
                ? "bg-violet-600 text-white rounded-br-sm"
                : "bg-zinc-900 border border-zinc-800 rounded-bl-sm"
            )}>
              {m.text}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.citations.map((c, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      {c.app} · {new Date(c.timestamp * 1000).toLocaleTimeString()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {status !== "idle" && (
          <div className="text-xs text-zinc-500 italic">{status}…</div>
        )}
      </main>

      <footer className="border-t border-zinc-800/80 px-6 py-4">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="max-w-3xl w-full mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            className={clsx(
              "p-3 rounded-full transition",
              listening ? "bg-rose-600 hover:bg-rose-500" : "bg-zinc-800 hover:bg-zinc-700"
            )}
            title={listening ? "Stop listening" : "Wake / voice input"}
          >
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening\u2026" : "Ask EchoMem anything, or say \u201CHey Echo\u201D"}
            className="flex-1 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm outline-none focus:border-violet-500"
          />
          <button type="submit" className="p-3 rounded-full bg-violet-600 hover:bg-violet-500">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
}
