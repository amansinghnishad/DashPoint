import { useState } from "react";
import { Play, RefreshCw, Eye, EyeOff } from "lucide-react";
import { AIFormattingPanel } from "./AIFormattingPanel";
import { FormattedContent } from "./FormattedContent";

export const AIFormattingDemo = () => {
  const [selectedExample, setSelectedExample] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const [demoContent, setDemoContent] = useState("");

  const examples = [
    {
      title: "Poorly Formatted Web Content",
      description: "Common webpage text with artifacts and poor formatting",
      content: `this is some really badly formatted text from a webpage that needs help.   it has multiple    spaces and no proper capitalization. some sentences are way too long and hard to read because they contain multiple clauses and subclauses that make comprehension difficult for the average reader who just wants to quickly understand the main points without having to parse through unnecessary complexity.

• bullet point without proper spacing
•another bullet point
*mixed bullet styles
-different bullet types

there are also issues with punctuation,grammar and spelling errrors. the text also contains unwanted web artifacts like Click here Read more Subscribe Follow Like Facebook Twitter Advertisement Sponsored Related Articles Tags Filed under Share this Privacy Policy Terms of Service Accept Decline.

some SENTENCES ARE IN ALL CAPS WHICH IS HARD TO READ. others have"weird quotes"and'mixed quote styles'.

this text really needs ai formatting to make it readable and professional!`,
    },
    {
      title: "Academic Paper Abstract",
      description: "Dense academic text that needs simplification",
      content: `The proliferation of artificial intelligence methodologies in contemporary computational linguistics has precipitated unprecedented opportunities for automated text processing paradigms.This research investigates the efficacy of transformer-based architectures in the contextualization and semantic enhancement of unstructured textual data repositories.Our methodology encompasses a comprehensive evaluation framework utilizing multiple baseline models including BERT,GPT,and T5 implementations.Results demonstrate statistically significant improvements in text coherence metrics with p<0.05 across all evaluated datasets.The implications of these findings suggest that automated text enhancement systems can substantially augment human comprehension while maintaining semantic fidelity.Future research directions should focus on multilingual applications and domain-specific optimization strategies.`,
    },
    {
      title: "Technical Documentation",
      description:
        "Complex technical content requiring readability improvements",
      content: `The API endpoint configuration requires initialization of the authentication middleware before instantiating the database connection pool.Parameters must be validated using the schema definition provided in the configuration object.Error handling should implement try-catch blocks with appropriate logging mechanisms to ensure system stability and debugging capabilities.

Configuration steps:
1)Install dependencies
2)Configure environment variables
3)Initialize database
4)Start server
5)Test endpoints

Note:The system architecture utilizes microservices design patterns with containerization using Docker.Each service communicates via RESTful APIs with JSON payloads.Monitoring is implemented using Prometheus with Grafana dashboards for visualization.`,
    },
  ];

  const handleDemoStart = () => {
    setDemoContent(examples[selectedExample].content);
    setShowDemo(true);
  };

  const handleContentUpdate = (newContent) => {
    setDemoContent(newContent);
  };

  const resetDemo = () => {
    setDemoContent(examples[selectedExample].content);
  };

  return (
    <div className="ai-formatting-demo bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Text Formatting Demo
        </h2>
        <p className="text-gray-600">
          Try our AI-powered text formatting with real examples. See how
          unreadable text transforms into professional content.
        </p>
      </div>

      <div className="p-6">
        {!showDemo ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Choose an Example
              </h3>
              <div className="grid gap-4">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedExample === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedExample(index)}
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {example.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {example.description}
                    </p>
                    <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded font-mono line-clamp-3">
                      {example.content.substring(0, 150)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={handleDemoStart}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
              >
                <Play size={20} />
                <span>Start AI Formatting Demo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Demo: {examples[selectedExample].title}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetDemo}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-1 transition-colors duration-200"
                >
                  <RefreshCw size={16} />
                  <span>Reset</span>
                </button>
                <button
                  onClick={() => setShowDemo(false)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-1 transition-colors duration-200"
                >
                  <EyeOff size={16} />
                  <span>Close Demo</span>
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* AI Formatting Panel */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  AI Formatting Controls
                </h4>
                <AIFormattingPanel
                  content={demoContent}
                  onContentUpdate={handleContentUpdate}
                />
              </div>

              {/* Formatted Output */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Formatted Output
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <FormattedContent content={demoContent} />
                </div>
              </div>
            </div>

            {/* Before/After Comparison */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Before vs After Comparison
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-red-700 mb-2">
                    Before (Original)
                  </h5>
                  <div className="bg-white p-3 rounded border text-sm text-gray-700 max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans">
                      {examples[selectedExample].content}
                    </pre>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-green-700 mb-2">
                    After (AI Formatted)
                  </h5>
                  <div className="bg-white p-3 rounded border text-sm text-gray-700 max-h-40 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <FormattedContent content={demoContent} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Highlight */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                ✨ AI Formatting Benefits
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-800">
                    Grammar & Spelling
                  </div>
                  <div className="text-blue-700">
                    Fixes errors automatically
                  </div>
                </div>
                <div>
                  <div className="font-medium text-blue-800">Readability</div>
                  <div className="text-blue-700">
                    Improves sentence structure
                  </div>
                </div>
                <div>
                  <div className="font-medium text-blue-800">
                    Professional Format
                  </div>
                  <div className="text-blue-700">Clean, consistent styling</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
