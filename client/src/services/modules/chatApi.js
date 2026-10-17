import { API_BASE_URL, apiClient } from "../../shared/api/httpClient";
import { getResponseData } from "../../shared/api/httpUtils";
import { getAuthToken } from "../../shared/auth/authSession";

export const chatApi = {
  sendMessage(payload) {
    return getResponseData(apiClient.post("/chat", payload));
  },

  async streamChat({ payload, onMetadata, onDelta, onDone, onError, signal }) {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("The chat connection did not return a response stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let receivedTerminalEvent = false;

      const handleEventBlock = (eventBlock) => {
        if (!eventBlock.trim() || eventBlock.trimStart().startsWith(":")) return;

        let eventType = "message";
        const dataLines = [];

        for (const line of eventBlock.split(/\r?\n/)) {
          if (line.startsWith("event:")) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).replace(/^ /, ""));
          }
        }

        if (!dataLines.length) return;

        let parsed;
        try {
          parsed = JSON.parse(dataLines.join("\n"));
        } catch {
          return;
        }

        if (eventType === "metadata") {
          onMetadata?.(parsed);
        } else if (eventType === "delta") {
          onDelta?.(parsed.text);
        } else if (eventType === "done") {
          receivedTerminalEvent = true;
          onDone?.(parsed);
        } else if (eventType === "error") {
          receivedTerminalEvent = true;
          onError?.(new Error(parsed.message || "Streaming error"));
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || "";

        for (const eventBlock of events) {
          handleEventBlock(eventBlock);
        }
      }

      if (buffer.trim()) handleEventBlock(buffer);
      if (!receivedTerminalEvent) {
        throw new Error("The chat connection ended before the response was complete. Please try again.");
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      onError?.(err);
      throw err;
    }
  },

  getSessions(includeArchived = false) {
    return getResponseData(
      apiClient.get("/chat/sessions", {
        params: { includeArchived },
      }),
    );
  },

  createSession(payload = {}) {
    return getResponseData(apiClient.post("/chat/sessions", payload));
  },

  getSessionMessages(sessionId) {
    return getResponseData(apiClient.get(`/chat/sessions/${sessionId}/messages`));
  },

  updateSession(sessionId, payload) {
    return getResponseData(apiClient.patch(`/chat/sessions/${sessionId}`, payload));
  },

  deleteSession(sessionId) {
    return getResponseData(apiClient.delete(`/chat/sessions/${sessionId}`));
  },

  extractActionItems(payload) {
    return getResponseData(apiClient.post("/chat/action-items/extract", payload));
  },

  approveActionItems(payload) {
    return getResponseData(apiClient.post("/chat/action-items/approve", payload));
  },

  commitAction(actionId, collectionId = "") {
    return getResponseData(apiClient.post("/chat/actions/commit", { actionId, collectionId }));
  },

  dismissAction(actionId) {
    return getResponseData(apiClient.post("/chat/actions/dismiss", { actionId }));
  },
};
