import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  MessageCircle,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { useDashboard } from "../../context/DashboardContext";
import { apiClient } from "../../services/api";
import "./ConversationalInterface.css";

const ConversationalInterface = () => {
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);
  const conversationRef = useRef(null);
  const { showToast } = useToast();
  const { loadDashboardData } = useDashboard();

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!command.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: command.trim(),
      timestamp: new Date(),
    };

    setConversation((prev) => [...prev, userMessage]);
    setCommand("");
    setIsProcessing(true);

    try {
      const response = await apiClient.post("/conversational/command", {
        command: userMessage.content,
        context: {
          timestamp: userMessage.timestamp.toISOString(),
          interface: "web",
        },
      });

      const result = response.data;

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: result.message || "Command processed",
        timestamp: new Date(),
        action: result.action,
        confidence: result.confidence,
        success: result.success,
        executionResult: result.execution_result,
      };

      setConversation((prev) => [...prev, botMessage]);

      if (result.success) {
        showToast(result.message || "Command executed successfully", "success");

        // Refresh dashboard data for actions that modify data
        if (
          result.action &&
          ["add_note", "add_todo", "complete_todo"].includes(result.action)
        ) {
          try {
            await loadDashboardData();
          } catch (refreshError) {
            console.error("Failed to refresh dashboard data:", refreshError);
          }
        }
      } else {
        showToast(result.message || "Command failed", "error");
      }
    } catch (error) {
      console.error("Error processing command:", error);

      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          "Sorry, I encountered an error processing your command. Please try again.",
        timestamp: new Date(),
        success: false,
        error: error.message,
      };

      setConversation((prev) => [...prev, errorMessage]);
      showToast("Failed to process command", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getStatusIcon = (message) => {
    if (message.type === "user") return null;

    if (message.success === true) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (message.success === false) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getExampleCommands = () => [
    'add note "Meeting at 3pm tomorrow"',
    'add todo "Review project documentation"',
    "summarize https://www.youtube.com/watch?v=example",
    "extract content from https://example.com",
    "weather for New York",
    "explain machine learning",
  ];

  if (!isExpanded) {
    return (
      <div className="conversational-toggle">
        <button
          onClick={() => setIsExpanded(true)}
          className="conversational-toggle-btn"
          title="Open conversational interface"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Ask DashPoint</span>
        </button>
      </div>
    );
  }

  return (
    <div className="conversational-interface">
      <div className="conversational-header">
        <div className="conversational-title">
          <MessageCircle className="w-5 h-5" />
          <span>Conversational Interface</span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="conversational-close"
          title="Close conversational interface"
        >
          ×
        </button>
      </div>

      <div className="conversational-body">
        <div className="conversation-history" ref={conversationRef}>
          {conversation.length === 0 && (
            <div className="conversation-welcome">
              <MessageCircle className="w-8 h-8 text-blue-500 mb-2" />
              <h3>Welcome to DashPoint AI!</h3>
              <p>Try natural language commands like:</p>
              <ul className="example-commands">
                {getExampleCommands().map((example, index) => (
                  <li key={index} onClick={() => setCommand(example)}>
                    "{example}"
                  </li>
                ))}
              </ul>
            </div>
          )}

          {conversation.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                {message.action && (
                  <div className="message-meta">
                    Action: {message.action}
                    {message.confidence && (
                      <span className="confidence">
                        ({Math.round(message.confidence * 100)}% confident)
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="message-status">
                {getStatusIcon(message)}
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="message bot processing">
              <div className="message-content">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing your command...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="conversational-input">
          <div className="input-container">
            <textarea
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a natural language command... (e.g., 'add note about meeting')"
              className="command-input"
              rows={1}
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!command.trim() || isProcessing}
              className="send-button"
              title="Send command"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversationalInterface;
