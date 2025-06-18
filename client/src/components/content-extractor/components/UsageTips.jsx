import { useState, useEffect } from "react";
import {
  Lightbulb,
  Zap,
  Shield,
  Download,
  Eye,
  Archive,
  X,
} from "lucide-react";

export const UsageTips = ({ isVisible: propIsVisible, onVisibilityChange }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Load visibility state from localStorage on component mount
  useEffect(() => {
    const savedVisibility = localStorage.getItem("contentExtractorTipsVisible");
    if (savedVisibility !== null) {
      const visibility = JSON.parse(savedVisibility);
      setIsVisible(visibility);
      // Sync with parent component if callback exists
      if (onVisibilityChange) {
        onVisibilityChange(visibility);
      }
    }
  }, [onVisibilityChange]);

  // Use prop visibility if provided, otherwise use internal state
  const shouldShow = propIsVisible !== undefined ? propIsVisible : isVisible;

  // Handle close button click
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("contentExtractorTipsVisible", JSON.stringify(false));
    // Notify parent component if callback exists
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  // Don't render if not visible
  if (!shouldShow) {
    return null;
  }

  const tips = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Quick Extraction",
      description:
        "Enter any website URL to extract clean, readable content in seconds",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Auto-Cleaned",
      description:
        "Content is automatically cleaned and formatted for optimal reading",
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: "Export Options",
      description:
        "Copy extracted text to clipboard or export as JSON for external use",
    },
    {
      icon: <Archive className="w-5 h-5" />,
      title: "Local Storage",
      description:
        "All extracted content is saved locally for quick access anytime",
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Easy Navigation",
      description:
        "Click on any item in the list to view the full content details",
    },
  ];

  return (
    <div className="mt-12 max-w-6xl mx-auto fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
          title="Hide tips"
        >
          <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
          <div className="flex items-center space-x-3 pr-10">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">
                How to Use Content Extractor
              </h4>
              <p className="text-sm text-gray-600">
                Get the most out of your content extraction experience
              </p>
            </div>
          </div>
        </div>

        {/* Tips Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="group bg-gray-50 rounded-xl p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 hover:shadow-lg border border-transparent hover:border-blue-100"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    {tip.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-900 mb-1 text-sm">
                      {tip.title}
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
