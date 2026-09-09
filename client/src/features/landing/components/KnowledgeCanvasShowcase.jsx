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
      className="p-3 sm:p-5 bg-surface-card/90 border border-hairline/80 backdrop-blur-xl shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 hover:border-emerald-500/30"
    >
      <div className="flex flex-col h-[380px] sm:h-[420px] w-full text-left">
        {/* Canvas Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline/60 select-none">
          <div>
            <h4 className="text-xs font-bold text-ink">Infinite Knowledge Canvas</h4>
            <p className="text-[10px] text-muted">Modular Widgets, Voice Notes & RAG</p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
            <span>Canvas Live</span>
          </div>
        </div>

        {/* Modular Grid Area */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 overflow-y-auto text-xs">
          {/* Planner Todo Widget */}
          <div className="p-3 rounded-2xl bg-canvas-soft border border-hairline/80 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline/60 select-none">
                <span className="font-bold text-ink text-[11px]">Sprint Planner</span>
                <span className="text-[10px] text-muted font-semibold">
                  {completedCount}/{todos.length} Done
                </span>
              </div>

              <div className="space-y-2">
                {todos.map((todo) => (
                  <label
                    key={todo.id}
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-center gap-2 cursor-pointer select-none text-[11px]"
                  >
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleTodo(todo.id)}
                      className="rounded border-hairline text-emerald-500 focus:ring-0"
                    />
                    <span className={todo.done ? "line-through opacity-50 text-muted" : "text-ink font-medium"}>
                      {todo.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-surface-card rounded-full h-1.5 mt-3 overflow-hidden border border-hairline/50">
              <motion.div
                className="bg-emerald-500 h-full rounded-full"
                animate={{ width: `${(completedCount / todos.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Voice Dictation & Video Transcript Card */}
          <div className="space-y-3 flex flex-col justify-between">
            {/* Voice Dictation Micro-Widget */}
            <div className="p-3 rounded-2xl bg-canvas-soft border border-hairline/80 shadow-sm select-none">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-ink text-[11px]">Voice Dictation</span>
                <button
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                    isRecording
                      ? "bg-rose-500 text-white animate-pulse shadow-md"
                      : "bg-ink text-canvas hover:opacity-90"
                  }`}
                >
                  {isRecording ? "Listening..." : "Record Note"}
                </button>
              </div>

              {/* Audio Waveform Simulation */}
              <div className="flex items-center gap-1 h-6 py-1">
                {[4, 12, 8, 16, 22, 14, 18, 9, 15, 6, 12, 18].map((h, idx) => (
                  <motion.span
                    key={idx}
                    className="flex-1 bg-emerald-500 rounded-full"
                    animate={{
                      height: isRecording ? [4, h, 6] : 4,
                      opacity: isRecording ? [0.6, 1, 0.6] : 0.3,
                    }}
                    transition={{
                      repeat: isRecording ? Infinity : 0,
                      duration: 0.6,
                      delay: idx * 0.05,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Content RAG Insight Item */}
            <div className="p-3 rounded-2xl bg-canvas-soft border border-hairline/80 shadow-sm select-none space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink text-[11px]">RAG Insight Item</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                  YouTube Audio
                </span>
              </div>
              <p className="text-[10px] text-muted leading-tight">
                "Benchmark vector cosine latency across local collection embeddings."
              </p>
              <button
                type="button"
                onClick={() => setInsightApproved(true)}
                disabled={insightApproved}
                className={`w-full py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                  insightApproved
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                    : "bg-ink text-canvas hover:bg-neutral-800"
                }`}
              >
                {insightApproved ? "✓ Added to Workspace Todos" : "Approve as Action Item"}
              </button>
            </div>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="pt-2 border-t border-hairline/60 flex items-center justify-between text-[10px] text-muted select-none">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Obsidian Markdown & JSON Sync Ready
          </span>
          <span className="font-semibold text-ink">3 Widgets Active</span>
        </div>
      </div>
    </UserCursor>
  );
}
