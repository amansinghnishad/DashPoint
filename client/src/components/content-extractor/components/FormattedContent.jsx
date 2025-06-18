import { useState } from "react";
import { Type, List, AlignLeft, Eye, EyeOff } from "lucide-react";
import TextFormatter from "../../../utils/textFormatter";

export const FormattedContent = ({ content, className = "" }) => {
  const [viewMode, setViewMode] = useState("formatted"); // 'formatted', 'structured', 'raw'

  if (!content) return null;

  const formattedText = TextFormatter.formatContent(content);
  const sections = TextFormatter.extractSections(formattedText);
  const stats = TextFormatter.getTextStats(formattedText);
  const renderStructuredContent = () => {
    const processEmphasis = (text) => {
      return text.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-bold text-gray-900">$1</strong>'
      );
    };

    return (
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="fade-in-up">
            {" "}
            {section.type === "heading" && (
              <div className="border-l-4 border-blue-500 pl-6 py-3 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-r-lg">
                <h3
                  className="text-xl font-bold text-gray-900 mb-2"
                  dangerouslySetInnerHTML={{
                    __html: processEmphasis(section.title),
                  }}
                />
              </div>
            )}
            {section.type === "paragraph" && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border-l-4 border-gray-300 hover:border-blue-400 transition-colors duration-300">
                <p
                  className="text-gray-800 leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{
                    __html: processEmphasis(section.content.join(" ")),
                  }}
                />
              </div>
            )}
            {section.type === "list" && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-300 hover:border-indigo-400 transition-colors duration-300">
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-4">
                      <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></span>
                      <span
                        className="text-gray-800 flex-1 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: processEmphasis(
                            item.replace(/^[•\-\*]\s*/, "")
                          ),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  const renderFormattedContent = () => {
    return (
      <div className="prose prose-lg max-w-none">
        <div
          className="text-gray-800 leading-relaxed font-medium"
          style={{
            lineHeight: "1.8",
            fontSize: "16px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {formattedText.split("\n\n").map((paragraph, index) => {
            // Handle emphasis markers
            const processEmphasis = (text) => {
              return text.replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="font-bold text-gray-900">$1</strong>'
              );
            };

            if (
              paragraph.trim().includes("•") ||
              paragraph.trim().match(/^\d+\./)
            ) {
              // Handle lists
              const items = paragraph.split("\n").filter((item) => item.trim());
              return (
                <div key={index} className="my-6">
                  <ul className="space-y-3 list-none pl-0">
                    {items.map((item, itemIndex) => {
                      const cleanItem = item.replace(/^[•\-\*\d+\.]\s*/, "");
                      return (
                        <li
                          key={itemIndex}
                          className="flex items-start space-x-3 py-1"
                        >
                          <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-3 flex-shrink-0 list-item-pulse"></span>
                          <span
                            className="text-gray-800 flex-1 text-enhanced"
                            dangerouslySetInnerHTML={{
                              __html: processEmphasis(cleanItem),
                            }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            } else if (
              paragraph.trim().startsWith('"') &&
              paragraph.trim().endsWith('"')
            ) {
              // Handle quotes
              const quote = paragraph.trim().slice(1, -1);
              return (
                <blockquote
                  key={index}
                  className="border-l-4 border-blue-500 pl-6 py-4 my-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-r-lg italic text-gray-700"
                >
                  <p
                    className="mb-0 text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: processEmphasis(quote) }}
                  />
                </blockquote>
              );
            } else {
              // Regular paragraphs
              return (
                <p
                  key={index}
                  className="mb-6 text-gray-800 leading-relaxed paragraph-hover text-enhanced"
                  dangerouslySetInnerHTML={{
                    __html: processEmphasis(paragraph.trim()),
                  }}
                />
              );
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`formatted-content ${className}`}>
      {" "}
      {/* Content Stats & View Toggle */}
      <div className="flex items-center justify-between mb-6 p-4 content-stats-badge rounded-lg">
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Type size={14} />
            <span>{stats.words} words</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlignLeft size={14} />
            <span>{stats.paragraphs} paragraphs</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye size={14} />
            <span>{stats.readingTime} min read</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("formatted")}
            className={`px-3 py-1 rounded-md text-sm font-medium view-toggle-button ${
              viewMode === "formatted" ? "active" : ""
            }`}
            title="Formatted view"
          >
            <AlignLeft size={14} />
          </button>
          <button
            onClick={() => setViewMode("structured")}
            className={`px-3 py-1 rounded-md text-sm font-medium view-toggle-button ${
              viewMode === "structured" ? "active" : ""
            }`}
            title="Structured view"
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`px-3 py-1 rounded-md text-sm font-medium view-toggle-button ${
              viewMode === "raw" ? "active" : ""
            }`}
            title="Raw text"
          >
            <EyeOff size={14} />
          </button>
        </div>
      </div>
      {/* Content Display */}
      <div className="content-display">
        {viewMode === "formatted" && renderFormattedContent()}
        {viewMode === "structured" && renderStructuredContent()}
        {viewMode === "raw" && (
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap border">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};
