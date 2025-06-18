import { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
} from "lucide-react";
import secureAIService from "../../../services/secureAIService";
import freeAIServices from "../../../services/freeAIServices"; // Fallback for compatibility
import aiTextFormattingService from "../../../services/aiTextFormattingService"; // Fallback for compatibility

export const AIFormattingPanel = ({
  content,
  onContentUpdate,
  className = "",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formattingOptions, setFormattingOptions] = useState({
    correctGrammar: true,
    restorePunctuation: true,
    simplifySentences: true,
    improveStructure: true,
    enhanceReadability: true,
    cleanText: true,
  });
  const [lastResults, setLastResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  // Load suggestions when component mounts or content changes
  useEffect(() => {
    if (content && content.length > 50) {
      loadFormattingSuggestions();
    }
  }, [content]);
  const loadFormattingSuggestions = async () => {
    try {
      // Use the new secure AI service for better performance
      if (secureAIService.isAuthenticated()) {
        const result = await secureAIService.analyzeContent(content, {
          sentiment: true,
          keywords: true,
          summary: false, // Don't need summary for suggestions
        });

        if (result.success) {
          const suggestions = [];

          // Add sentiment-based suggestions
          if (result.data.sentiment) {
            const sentiment = result.data.sentiment;
            if (sentiment.label === "NEGATIVE" && sentiment.score > 0.7) {
              suggestions.push({
                type: "tone",
                message: "Consider using more positive language",
                confidence: sentiment.score,
              });
            }
          }

          // Add keyword-based suggestions
          if (result.data.keywords && result.data.keywords.length > 0) {
            suggestions.push({
              type: "keywords",
              message: `Found ${result.data.keywords.length} key topics`,
              confidence: 0.8,
            });
          }

          setSuggestions(suggestions);
        }
      } else {
        // Fallback to legacy service
        const suggestions =
          (await aiTextFormattingService.getFormattingSuggestions?.(content)) ||
          [];
        setSuggestions(suggestions);
      }
    } catch (error) {
      console.error("Failed to load suggestions:", error);
      setSuggestions([]);
    }
  };
  const handleAIFormatting = async (useAdvanced = false) => {
    if (!content || content.trim().length === 0) return;

    setIsProcessing(true);

    try {
      let result; // Use the new secure AI service for all formatting
      if (secureAIService.isAuthenticated()) {
        if (useAdvanced) {
          // Use comprehensive text enhancement
          result = await secureAIService.enhanceText(content, {
            grammarCheck: formattingOptions.correctGrammar,
            punctuationFix: formattingOptions.restorePunctuation,
            entityExtraction: formattingOptions.improveStructure,
          });
        } else {
          // Use basic text formatting
          result = await secureAIService.formatText(content, formattingOptions);
        }

        // Normalize the result format
        if (result.success) {
          result.confidence = (result.data.confidence || 0.5) * 100;
          result.enhanced = result.data.formatted || result.data.enhanced;
          result.improvements = result.data.improvements || [];
        }
      } else {
        // Fallback to legacy services for unauthenticated users
        if (useAdvanced && aiTextFormattingService.isConfigured()) {
          result = await aiTextFormattingService.formatText(
            content,
            formattingOptions
          );
        } else {
          result = await freeAIServices.enhanceText(content, formattingOptions);
        }
      }
      setLastResults(result);

      if (result.success && result.confidence > 50) {
        const enhancedContent = result.enhanced || result.formatted;
        onContentUpdate(enhancedContent);
      } else {
        console.warn(
          "⚠️ AI formatting had low confidence, results not applied"
        );
      }
    } catch (error) {
      console.error("❌ AI formatting failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOptionChange = (option, value) => {
    setFormattingOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case "readability":
        return <Brain size={16} className="text-blue-500" />;
      case "grammar":
        return <CheckCircle size={16} className="text-green-500" />;
      case "structure":
        return <Settings size={16} className="text-purple-500" />;
      default:
        return <AlertCircle size={16} className="text-orange-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div
      className={`ai-formatting-panel bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles size={20} className="text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            AI Text Formatting
          </h3>
        </div>
        <div className="text-sm text-gray-500">Enhance readability with AI</div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Suggestions
          </h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 p-2 rounded-md border ${getPriorityColor(
                  suggestion.priority
                )}`}
              >
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{suggestion.message}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      suggestion.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : suggestion.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {suggestion.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formatting Options */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Formatting Options
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(formattingOptions).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleOptionChange(key, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, " $1").toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={() => handleAIFormatting(false)}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors duration-200"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Zap size={16} />
              <span>Free AI Enhancement</span>
            </>
          )}
        </button>

        {aiTextFormattingService.isConfigured() && (
          <button
            onClick={() => handleAIFormatting(true)}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-purple-300 disabled:to-blue-300 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Brain size={16} />
                <span>Advanced AI</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Results */}
      {lastResults && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Last Formatting Results
          </h4>
          <div className="bg-gray-50 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Confidence Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      lastResults.confidence > 80
                        ? "bg-green-500"
                        : lastResults.confidence > 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${lastResults.confidence}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {lastResults.confidence}%
                </span>
              </div>
            </div>

            {(lastResults.improvements?.length > 0 ||
              lastResults.enhancements?.length > 0) && (
              <div>
                <span className="text-sm text-gray-600">Applied:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(
                    lastResults.improvements ||
                    lastResults.enhancements ||
                    []
                  ).map((improvement, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {improvement}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
              Processed in {lastResults.processingTime}ms
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
