import { CheckSquare, Mic, MicOff, RotateCcw, StickyNote } from "lucide-react";
import { useEffect, useState } from "react";

import useVoiceRecognition from "../../../../../shared/hooks/useVoiceRecognition";
import Modal from "../../../../../shared/ui/modals/Modal";

export default function VoiceNoteModal({
  open,
  onClose,
  onSaveAsNote,
  onSaveAsTodoList,
}) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useVoiceRecognition();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      resetTranscript();
    } else {
      stopListening();
    }
  }, [open, resetTranscript, stopListening]);

  const displayedText = (transcript + (interimTranscript ? ` ${interimTranscript}` : "")).trim();

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSaveNote = async () => {
    if (!displayedText || saving) return;
    try {
      setSaving(true);
      await onSaveAsNote?.(displayedText);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTodoList = async () => {
    if (!displayedText || saving) return;
    try {
      setSaving(true);
      // Split text by lines or sentence punctuation into todo items
      const items = displayedText
        .split(/(?:\r?\n|(?<=[.!?])\s+)/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((text, idx) => ({
          id: `todo-${Date.now()}-${idx}`,
          text: text.replace(/^[-*•\d.)\s]+/, "").trim(),
          completed: false,
        }))
        .filter((it) => it.text.length > 0);

      await onSaveAsTodoList?.(items.length ? items : [{ id: `todo-${Date.now()}`, text: displayedText, completed: false }]);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!saving) onClose();
      }}
      title="Voice Dictation"
      description="Speak clearly into your microphone to dictate notes or to-do lists."
      size="md"
    >
      <div className="space-y-4 pt-1">
        {!isSupported ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.
          </div>
        ) : (
          <>
            {/* Visualizer & Mic Toggle Bar */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-hairline bg-surface-card p-6 text-center">
              <button
                type="button"
                onClick={handleToggleListening}
                className={`relative inline-flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
                  isListening
                    ? "bg-rose-500 text-white shadow-[0_0_24px_rgba(244,63,94,0.5)] scale-105"
                    : "bg-primary text-canvas hover:bg-primary-active shadow-sm"
                }`}
                title={isListening ? "Stop listening" : "Start speaking"}
              >
                {isListening ? (
                  <>
                    <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-30" />
                    <MicOff size={26} />
                  </>
                ) : (
                  <Mic size={26} />
                )}
              </button>

              <p className="mt-3 text-xs font-semibold text-ink">
                {isListening ? (
                  <span className="flex items-center gap-1.5 text-rose-500">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    Listening... Speak now
                  </span>
                ) : (
                  "Tap the microphone to start"
                )}
              </p>
            </div>

            {error ? (
              <p className="text-xs font-medium text-rose-500">{error}</p>
            ) : null}

            {/* Editable Transcript Textarea */}
            <div>
              <label htmlFor="voice-dictation-transcript" className="block text-xs font-semibold text-muted-soft mb-1.5 uppercase tracking-wider">
                Transcript
              </label>
              <textarea
                id="voice-dictation-transcript"
                rows={4}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={isListening ? "Listening to your voice..." : "Your speech transcript will appear here..."}
                className="w-full rounded-2xl border border-hairline bg-canvas-soft p-3.5 text-sm text-ink outline-none focus:bg-white focus:ring-1 focus:ring-primary/20 resize-none transition-all"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={resetTranscript}
                disabled={!displayedText || saving}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-ink disabled:opacity-30 transition-colors"
              >
                <RotateCcw size={13} />
                Clear
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveTodoList}
                  disabled={!displayedText || saving}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-card hover:bg-canvas-soft px-4 py-2 text-xs font-semibold text-ink disabled:opacity-30 transition-all shadow-sm"
                >
                  <CheckSquare size={14} className="text-primary" />
                  Save as To-Do
                </button>

                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={!displayedText || saving}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary-active text-canvas px-4 py-2 text-xs font-semibold disabled:opacity-30 transition-all shadow-sm"
                >
                  <StickyNote size={14} />
                  Save as Note
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
