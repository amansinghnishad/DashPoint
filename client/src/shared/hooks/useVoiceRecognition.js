import { useCallback, useEffect, useRef, useState } from "react";

export default function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const isMountedRef = useRef(true);

  const isSupported =
    typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const startListening = useCallback(
    ({ continuous = true, lang = "en-US" } = {}) => {
      if (!isSupported) {
        setError("Voice recognition is not supported in this browser.");
        return;
      }

      setError(null);

      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {
            // Ignore
          }
        }

        const SpeechRecognitionClass =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionClass();

        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
          if (isMountedRef.current) {
            setIsListening(true);
            setError(null);
          }
        };

        recognition.onresult = (event) => {
          if (!isMountedRef.current) return;

          let currentInterim = "";
          let finalDelta = "";

          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            const text = result[0]?.transcript || "";

            if (result.isFinal) {
              finalDelta += (finalDelta ? " " : "") + text.trim();
            } else {
              currentInterim += (currentInterim ? " " : "") + text;
            }
          }

          if (finalDelta) {
            setTranscript((prev) => {
              const cleanPrev = prev ? `${prev.trim()} ` : "";
              return `${cleanPrev}${finalDelta}`.trim();
            });
          }

          setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event) => {
          if (!isMountedRef.current) return;
          if (event.error === "no-speech" || event.error === "aborted") return;

          setError(event.error || "Speech recognition error");
          setIsListening(false);
        };

        recognition.onend = () => {
          if (isMountedRef.current) {
            setIsListening(false);
            setInterimTranscript("");
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message || "Failed to start speech recognition");
          setIsListening(false);
        }
      }
    },
    [isSupported],
  );

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
