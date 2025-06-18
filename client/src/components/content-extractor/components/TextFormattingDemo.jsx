import { useState } from "react";
import { FormattedContent } from "./FormattedContent";
import { Wand2, Copy, Check } from "lucide-react";
import { copyToClipboard } from "../../../utils/helpers";

export const TextFormattingDemo = () => {
  const [copied, setCopied] = useState(false);

  const sampleText = `
Web scraping has become an essential tool for data collection in the modern digital landscape. This comprehensive guide will walk you through the fundamentals of extracting valuable information from websites.

What is Web Scraping? Web scraping is the process of automatically extracting data from websites using software tools. It allows you to gather large amounts of information quickly and efficiently.

Benefits of Web Scraping:
• Automated data collection
• Time-saving compared to manual collection
• Ability to gather large datasets
• Real-time data extraction
• Cost-effective solution for research

Popular Tools and Technologies
1. Beautiful Soup - Python library for parsing HTML
2. Scrapy - Comprehensive web scraping framework  
3. Selenium - Browser automation tool
4. Requests - HTTP library for Python

"The key to successful web scraping is understanding the structure of the website you're targeting." - Data Science Expert

Best Practices for Ethical Scraping Always respect robots.txt files, implement appropriate delays between requests, and be mindful of server load. Consider reaching out to website owners for permission when scraping large amounts of data.

Common Challenges and Solutions Rate limiting can be overcome by implementing delays and rotating IP addresses. Dynamic content loaded by JavaScript requires tools like Selenium or Playwright for proper extraction.
`;

  const handleCopy = async () => {
    const success = await copyToClipboard(sampleText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Wand2 size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Text Formatting Demo
            </h3>
            <p className="text-gray-600 text-sm">
              See how our formatter improves readability
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
          title="Copy sample text"
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy Sample</span>
            </>
          )}
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <FormattedContent content={sampleText} />
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">
          🎯 Formatting Features:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>Smart Paragraphs:</strong> Automatically structures
            content into readable paragraphs
          </li>
          <li>
            • <strong>List Detection:</strong> Converts bullet points and
            numbered lists to proper formatting
          </li>
          <li>
            • <strong>Quote Highlighting:</strong> Identifies and styles quoted
            text
          </li>
          <li>
            • <strong>Reading Stats:</strong> Shows word count, reading time,
            and other metrics
          </li>
          <li>
            • <strong>Multiple Views:</strong> Switch between formatted,
            structured, and raw text views
          </li>
          <li>
            • <strong>Clean Text:</strong> Removes unwanted characters and
            navigation elements
          </li>
        </ul>
      </div>
    </div>
  );
};
