import { Lightbulb, Shield, Download, X } from "lucide-react";

export const UsageTips = ({ isVisible, onHide }) => {
  if (!isVisible) return null;
  const tips = [
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Start with a URL",
      description: "Paste a page link to extract the readable article text.",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Cleaner reading view",
      description:
        "Removes common clutter so the content is easier to scan and save.",
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: "Export when needed",
      description: "Copy the text or export the entry for external use.",
    },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 relative">
      <button
        onClick={onHide}
        className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-500"
        title="Hide tips"
        aria-label="Hide tips"
        type="button"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-gray-500" />
        <h3 className="text-base font-semibold text-gray-900">Tips</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-0.5 text-gray-500">{tip.icon}</div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {tip.title}
              </div>
              <div className="text-sm text-gray-600">{tip.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
