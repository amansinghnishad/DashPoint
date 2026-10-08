import { motion } from "framer-motion";
import { useState } from "react";

import UserCursor from "../../../shared/ui/Cursor/UserCursor";

const INITIAL_TODOS = [
  { id: "t1", text: "Index YouTube video transcripts", done: true },
  { id: "t2", text: "Export canvas to Obsidian Markdown", done: false },
  { id: "t3", text: "Approve 3 extracted insight items", done: false },
];

export default function KnowledgeCanvasShowcase() {
  const [todos, setTodos] = useState(INITIAL_TODOS);
  const [isRecording, setIsRecording] = useState(false);
  const [insightApproved, setInsightApproved] = useState(false);

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const completedCount = todos.filter((t) => t.done).length;

  return (
    <UserCursor
      name="Elena / Design"
      color="#10B981"
      className="rounded-[26px] border border-hairline/80 bg-surface-card p-2 shadow-[0_24px_70px_rgba(22,18,14,0.12)] transition-shadow duration-500 hover:shadow-[0_28px_80px_rgba(22,18,14,0.16)]"
    >
      <div className="relative flex h-[380px] w-full flex-col overflow-hidden rounded-[20px] bg-canvas text-left sm:h-[420px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_42%)]" />
        <div className="relative flex items-center justify-between border-b border-hairline/70 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">✳</div>
            <div className="min-w-0">
              <h4 className="truncate text-xs font-bold text-ink">Knowledge canvas</h4>
              <p className="mt-0.5 truncate text-[10px] text-muted">demmo <span className="mx-1.5 text-muted-soft">·</span> 3 blocks</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-hairline bg-surface-card px-2.5 py-1 text-[9px] font-semibold text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Saved
          </div>
        </div>

        <div className="relative grid min-h-0 flex-1 grid-cols-2 gap-2.5 overflow-y-auto bg-[radial-gradient(var(--dp-border)_0.7px,transparent_0.7px)] [background-size:18px_18px] p-3 sm:gap-3 sm:p-4">
          <div className="flex min-h-[185px] flex-col rounded-2xl border border-hairline/80 bg-surface-card/95 p-3 shadow-[0_8px_24px_rgba(22,18,14,0.06)] sm:p-3.5">
            <div className="mb-2.5 flex items-center justify-between border-b border-hairline/60 pb-2">
              <span className="text-[10px] font-bold text-ink">Sprint planner</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-300">{completedCount}/{todos.length}</span>
            </div>
            <div className="space-y-2.5">
              {todos.map((todo) => (
                <label key={todo.id} className="flex cursor-pointer items-start gap-2 text-[9px] leading-snug select-none">
                  <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} className="mt-0.5 h-3 w-3 shrink-0 rounded border-hairline accent-emerald-600" />
                  <span className={todo.done ? "text-muted line-through" : "font-medium text-ink"}>{todo.text}</span>
                </label>
              ))}
            </div>
            <div className="mt-auto pt-3">
              <div className="mb-1.5 flex items-center justify-between text-[8px] text-muted"><span>Weekly progress</span><span>{Math.round((completedCount / todos.length) * 100)}%</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-canvas-soft">
                <motion.div className="h-full rounded-full bg-emerald-500" animate={{ width: `${(completedCount / todos.length) * 100}%` }} transition={{ duration: 0.35 }} />
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-2.5">
            <div className="rounded-2xl border border-hairline/80 bg-surface-card/95 p-3 shadow-[0_8px_24px_rgba(22,18,14,0.06)] sm:p-3.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-ink">Voice note</span>
                <button
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  aria-pressed={isRecording}
                  className={`rounded-full px-2.5 py-1 text-[8px] font-bold transition-colors ${isRecording ? "bg-rose-500 text-white" : "bg-ink text-canvas hover:opacity-85"}`}
                >
                  {isRecording ? "Stop recording" : "Record"}
                </button>
              </div>
              <div className="flex h-6 items-center gap-1" aria-label={isRecording ? "Recording audio" : "Audio waveform preview"}>
                {[4, 12, 8, 16, 22, 14, 18, 9, 15, 6, 12, 18].map((height, index) => (
                  <motion.span
                    key={index}
                    className="flex-1 rounded-full bg-emerald-500"
                    animate={{ height: isRecording ? [4, height, 6] : 4, opacity: isRecording ? [0.6, 1, 0.6] : 0.28 }}
                    transition={{ repeat: isRecording ? Infinity : 0, duration: 0.8, delay: index * 0.04 }}
                  />
                ))}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-hairline/80 bg-surface-card/95 p-3 shadow-[0_8px_24px_rgba(22,18,14,0.06)] sm:p-3.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-ink">Insight captured</span>
                <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700 dark:text-amber-300">VIDEO</span>
              </div>
              <p className="line-clamp-3 text-[9px] leading-relaxed text-muted">“Benchmark vector cosine latency across local collection embeddings.”</p>
              <button
                type="button"
                onClick={() => setInsightApproved(true)}
                disabled={insightApproved}
                className={`mt-auto w-full rounded-xl py-2 text-[8px] font-bold transition-colors ${insightApproved ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-canvas-soft text-ink hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300"}`}
              >
                {insightApproved ? "✓ Added to planner" : "Add to planner +"}
              </button>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-hairline/70 px-4 py-2.5 text-[9px] text-muted sm:px-5">
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Autosaved just now</span>
          <span className="font-medium text-ink">Markdown · JSON</span>
        </div>
      </div>
    </UserCursor>
  );
}
