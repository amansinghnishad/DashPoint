import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Calendar,
  CheckCircle2,
  Circle,
  FileText,
  Layers,
  Play,
  Plus,
  Sparkles,
  Youtube,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { APP_ROUTES } from "../../../app/routes/paths";
import UserCursor from "../../../shared/ui/Cursor/UserCursor";

const CAPABILITY_TABS = [
  {
    id: "ai-assistant",
    number: "01",
    title: "AI Chat & Tool Execution",
    badge: "Agentic Intelligence",
    icon: Brain,
    description:
      "Conversational RAG (Retrieval-Augmented Generation) that doesn't just answer questions—it connects directly to your calendar, documents, and YouTube transcripts with autonomous tool execution.",
    actionLabel: "Try AI Assistant",
    cursorName: "AI Co-pilot",
    cursorColor: "#F99149",
  },
  {
    id: "smart-calendar",
    number: "02",
    title: "Smart Calendar & Scheduling",
    badge: "Autonomous Planning",
    icon: Calendar,
    description:
      "Context-aware scheduling algorithms that analyze task deadlines, meeting commitments, and deep-work slots to prevent calendar conflicts automatically.",
    actionLabel: "Explore Calendar",
    cursorName: "Scheduler",
    cursorColor: "#3B82F6",
  },
  {
    id: "spatial-canvas",
    number: "03",
    title: "Spatial Canvas & Widgets",
    badge: "Infinite Workspace",
    icon: Layers,
    description:
      "Free-form workspace combining todo lists, daily schedules, appointments, and rich markdown notes with full undo/redo state history and Obsidian export.",
    actionLabel: "Open Canvas",
    cursorName: "Designer",
    cursorColor: "#10B981",
  },
  {
    id: "content-hub",
    number: "04",
    title: "Video Transcripts & Insights",
    badge: "Universal Indexing",
    icon: Youtube,
    description:
      "Instant timestamped video transcripts, AI document summaries, and semantic cosine vector search fallback for effortless local and cloud data retrieval.",
    actionLabel: "Explore Hub",
    cursorName: "Researcher",
    cursorColor: "#8B5CF6",
  },
];

export default function InteractiveCapabilities() {
  const [activeTab, setActiveTab] = useState(CAPABILITY_TABS[0].id);

  // 01. AI Demo State
  const [chatStep, setChatStep] = useState(0);
  const [chatStreamingText, setChatStreamingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 02. Calendar Demo State
  const [events, setEvents] = useState([
    { id: 1, time: "09:00 AM", title: "Product Architecture Review", tag: "Strategy", active: true },
    { id: 2, time: "11:30 AM", title: "Sprint 42 Backlog Refinement", tag: "Engineering", active: false },
    { id: 3, time: "02:00 PM", title: "AI Agent Tool-Calling Demo", tag: "AI / ML", active: true },
    { id: 4, time: "04:30 PM", title: "Deep Work: Vector Similarity", tag: "Focus", active: false },
  ]);

  // 03. Canvas Demo State
  const [todos, setTodos] = useState([
    { id: 1, text: "Verify OAuth token refresh flow", done: true },
    { id: 2, text: "Benchmark cosine similarity fallback", done: false },
    { id: 3, text: "Deploy Server-Sent Events stream", done: true },
    { id: 4, text: "Export workspace to Obsidian Markdown", done: false },
  ]);
  const [noteText, setNoteText] = useState("DashPoint v2.0 delivers 85ms token responses with local vector cache.");

  // 04. YouTube & Insights State
  const [selectedTimestamp, setSelectedTimestamp] = useState("02:15");
  const [insightApproved, setInsightApproved] = useState(false);

  const activeConfig = CAPABILITY_TABS.find((t) => t.id === activeTab) || CAPABILITY_TABS[0];

  // AI Chat Simulation Typing Effect
  const FULL_AI_RESPONSE =
    "I've indexed 14 YouTube transcripts, synced 3 calendar events, and extracted 2 urgent action items for your team.";

  useEffect(() => {
    if (activeTab === "ai-assistant") {
      setIsTyping(true);
      setChatStreamingText("");
      let index = 0;
      const interval = setInterval(() => {
        if (index < FULL_AI_RESPONSE.length) {
          setChatStreamingText(FULL_AI_RESPONSE.slice(0, index + 1));
          index += 1;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 22);
      return () => clearInterval(interval);
    }
  }, [activeTab, chatStep]);

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  };

  const toggleEvent = (id) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e)),
    );
  };

  return (
    <section className="px-4 sm:px-8 md:px-xxl py-16 sm:py-24 bg-canvas relative" id="capabilities">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Live Interactive Capabilities
            </div>
            <h2 className="font-waldenburg-light text-3xl sm:text-5xl text-ink tracking-tight">
              An Operable Journal of Workflow
            </h2>
          </div>
          <p className="text-sm sm:text-base text-muted max-w-md">
            Interact with live simulated interfaces below. Click, type, and explore real DashPoint tools in action.
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-8">
          {CAPABILITY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 ${
                  isActive
                    ? "bg-surface-card border-amber-500/50 shadow-[0_4px_24px_rgba(249,145,73,0.18)] scale-[1.02]"
                    : "bg-surface-card/40 border-hairline/60 hover:bg-surface-card/80 hover:border-hairline opacity-75 hover:opacity-100"
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? "bg-amber-500 text-white" : "bg-ink/5 dark:bg-white/5 text-ink"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] font-bold tracking-wider text-muted uppercase">
                    {tab.number}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-ink truncate">
                    {tab.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Showcase Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Explanation Column */}
          <div className="lg:col-span-4 flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-hairline bg-surface-card shadow-lg">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-waldenburg-light text-3xl font-bold text-amber-500 opacity-90">
                  {activeConfig.number}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-ink/5 dark:bg-white/10 text-xs font-semibold text-ink">
                  {activeConfig.badge}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-ink mb-4 tracking-tight">
                {activeConfig.title}
              </h3>
              <p className="text-sm sm:text-base text-muted leading-relaxed mb-6">
                {activeConfig.description}
              </p>

              {/* Interactive Sandbox Hints */}
              <div className="p-4 rounded-2xl bg-canvas border border-hairline space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                  Live Sandbox Controls
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {activeTab === "ai-assistant" && "Click the prompt pills to test RAG retrieval & autonomous agent execution."}
                  {activeTab === "smart-calendar" && "Click events on the calendar to toggle and observe schedule state updates."}
                  {activeTab === "spatial-canvas" && "Check off items on the todo list and test notes reactivity."}
                  {activeTab === "content-hub" && "Click video transcript timestamps to navigate quotes and approve insights."}
                </p>
              </div>
            </div>

            <Link
              to={APP_ROUTES.REGISTER}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-ink text-canvas text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {activeConfig.actionLabel} →
            </Link>
          </div>

          {/* Live Operable Mockup Surface with UserCursor Follower */}
          <div className="lg:col-span-8">
            <UserCursor
              name={activeConfig.cursorName}
              color={activeConfig.cursorColor}
              className="w-full h-full min-h-[420px] rounded-3xl border border-hairline/80 bg-canvas-soft/80 shadow-2xl backdrop-blur-md p-4 sm:p-6 flex flex-col justify-between"
            >
              {/* Window Title Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-hairline/60 mb-4 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-xs font-bold text-muted uppercase tracking-wider">
                    DashPoint Studio — {activeConfig.badge}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Engine Active
                  </span>
                </div>
              </div>

              {/* Dynamic Live Demo Views */}
              <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {activeTab === "ai-assistant" && (
                    <motion.div
                      key="ai-assistant-demo"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      {/* User Prompt */}
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl bg-surface-card border border-hairline px-4 py-2.5 text-xs sm:text-sm text-ink shadow-sm">
                          Summarize my quarterly sprint backlog and create calendar sync events.
                        </div>
                      </div>

                      {/* Tool Calling Execution Status */}
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-muted py-1 px-3 rounded-full bg-ink/5 dark:bg-white/5 w-fit border border-hairline">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Tools: GoogleCalendar.createEvent, VectorSearch.query ($vectorSearch)</span>
                      </div>

                      {/* Assistant Stream */}
                      <div className="max-w-[90%] rounded-2xl bg-surface-card border border-amber-500/30 p-4 shadow-md space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-ink text-canvas flex items-center justify-center text-[9px] font-bold">
                            DP
                          </div>
                          <span className="text-xs font-bold text-ink">DashPoint Intelligence</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold uppercase">
                            Fast Routing
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-ink leading-relaxed font-mono min-h-[40px]">
                          {chatStreamingText}
                          {isTyping && <span className="inline-block w-1.5 h-3.5 bg-amber-500 ml-1 animate-pulse" />}
                        </p>
                      </div>

                      {/* Interactive Prompt Chips */}
                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        <span className="text-xs text-muted font-medium">Quick Prompts:</span>
                        <button
                          type="button"
                          onClick={() => setChatStep((s) => s + 1)}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-surface-card border border-hairline hover:border-amber-500/50 text-ink transition-colors"
                        >
                          ⚡ Re-run query
                        </button>
                        <button
                          type="button"
                          onClick={() => setChatStep((s) => s + 1)}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-surface-card border border-hairline hover:border-amber-500/50 text-ink transition-colors"
                        >
                          📅 Add to Google Calendar
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "smart-calendar" && (
                    <motion.div
                      key="calendar-demo"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-ink">Tuesday, August 25, 2026</div>
                        <span className="text-[11px] text-muted font-medium">Click event to toggle state</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {events.map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => toggleEvent(event.id)}
                            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                              event.active
                                ? "bg-surface-card border-blue-500/40 shadow-md scale-[1.01]"
                                : "bg-surface-card/60 border-hairline opacity-70 hover:opacity-100"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-mono text-muted">{event.time}</span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase">
                                {event.tag}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-ink">{event.title}</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "spatial-canvas" && (
                    <motion.div
                      key="canvas-demo"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {/* Interactive Checklist Widget */}
                      <div className="p-4 rounded-2xl bg-surface-card border border-hairline shadow-md space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Sprint Deliverables
                          </span>
                          <span className="text-[10px] text-muted font-mono">
                            {todos.filter((t) => t.done).length}/{todos.length} Done
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {todos.map((todo) => (
                            <button
                              key={todo.id}
                              type="button"
                              onClick={() => toggleTodo(todo.id)}
                              className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-canvas text-left transition-colors text-xs text-ink"
                            >
                              {todo.done ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted shrink-0" />
                              )}
                              <span className={todo.done ? "line-through opacity-50" : "font-medium"}>
                                {todo.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interactive Sticky Note Widget */}
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-md flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            Quick Architecture Memo
                          </span>
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            rows={3}
                            className="w-full bg-transparent border-none text-xs text-ink focus:outline-none resize-none leading-relaxed font-sans"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
                          <span>Obsidian Sync Ready</span>
                          <span>⌘Z / ⌘⇧Z Supported</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "content-hub" && (
                    <motion.div
                      key="content-hub-demo"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-3"
                    >
                      <div className="p-4 rounded-2xl bg-surface-card border border-hairline shadow-md flex flex-col sm:flex-row gap-4 items-center">
                        <div className="w-full sm:w-48 aspect-video bg-neutral-900 rounded-xl overflow-hidden flex items-center justify-center relative shrink-0">
                          <Play className="w-8 h-8 text-white fill-white opacity-80" />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 rounded font-mono">
                            08:42
                          </span>
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink">Building Agentic Systems with LLMs</span>
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                              Indexed
                            </span>
                          </div>
                          <p className="text-xs text-muted leading-relaxed">
                            Vector search extracted 4 relevant sliding windows from video timestamps.
                          </p>
                          <div className="flex items-center gap-2">
                            {["01:30", "02:15", "04:50"].map((ts) => (
                              <button
                                key={ts}
                                type="button"
                                onClick={() => setSelectedTimestamp(ts)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                                  selectedTimestamp === ts
                                    ? "bg-purple-500 text-white font-bold"
                                    : "bg-canvas border border-hairline text-muted hover:text-ink"
                                }`}
                              >
                                ▶ {ts}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Content Insight Approve / Reject Simulation */}
                      <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs font-semibold text-ink">
                            Insight: "Use sliding transcript window with 50-token overlap."
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInsightApproved(!insightApproved)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            insightApproved
                              ? "bg-emerald-500 text-white"
                              : "bg-ink text-canvas hover:opacity-90"
                          }`}
                        >
                          {insightApproved ? "✓ Approved" : "Approve Insight"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Interactive Status Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-hairline/60 text-[11px] text-muted select-none mt-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  DashPoint v2.0 Sandbox Runtime
                </span>
                <span className="hidden sm:inline font-mono">Move cursor inside to test follower physics</span>
              </div>
            </UserCursor>
          </div>
        </div>
      </div>
    </section>
  );
}
