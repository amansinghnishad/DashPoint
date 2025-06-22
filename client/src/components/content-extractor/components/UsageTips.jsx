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
        "Paste any website URL to extract clean, readable content in seconds",
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
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "AI Enhancement",
      description:
        "Use AI tools to format and improve extracted content automatically",
    },
  ];
  return (
    <div className="glass-effect rounded-2xl p-8 shadow-xl relative">
      <div className="max-w-6xl mx-auto">
        {/* Close Button */}
        {shouldShow && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
            title="Hide tips"
          >
            <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        )}

        <div className="flex items-center justify-center mb-6">
          <h3 className="text-2xl font-bold gradient-text flex items-center">
            <div className="w-6 h-6 mr-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            Pro Tips & Features
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">{tip.title}</p>
                  <p className="text-gray-700 text-sm">{tip.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
