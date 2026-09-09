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

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;
          let eventType = "message";
          let dataStr = "";

          const lines = eventBlock.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataStr += line.slice(5).trim();
            }
          }

          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              if (eventType === "metadata") {
                onMetadata?.(parsed);
              } else if (eventType === "delta") {
                onDelta?.(parsed.text);
              } else if (eventType === "done") {
                onDone?.(parsed);
              } else if (eventType === "error") {
                onError?.(new Error(parsed.message || "Streaming error"));
              }
            } catch {
              // Ignore partial chunk parse error
            }
          }
        }
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
};
