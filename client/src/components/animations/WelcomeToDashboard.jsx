import { useState, useEffect } from "react";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";

export const WelcomeToDashboard = ({ isVisible, onComplete }) => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const steps = [
        { duration: 1000, step: 1 }, // Welcome message
        { duration: 1500, step: 2 }, // Features showcase
        { duration: 1000, step: 3 }, // Ready message
      ];

      let currentTimeout;

      const runAnimationSequence = (stepIndex) => {
        if (stepIndex < steps.length) {
          setAnimationStep(steps[stepIndex].step);
          currentTimeout = setTimeout(() => {
            runAnimationSequence(stepIndex + 1);
          }, steps[stepIndex].duration);
        } else {
          // Animation complete
          currentTimeout = setTimeout(() => {
            onComplete?.();
          }, 500);
        }
      };

      runAnimationSequence(0);

      return () => {
        if (currentTimeout) {
          clearTimeout(currentTimeout);
        }
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/95 to-purple-900/95 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 text-center shadow-2xl">
        {/* Step 1: Welcome Message */}
        <div
          className={`transition-all duration-1000 ${
            animationStep >= 1
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-8"
          }`}
        >
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Sparkles className="text-white animate-pulse" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to DashPoint!
            </h1>
            <p className="text-gray-600">
              Your personalized productivity dashboard is ready
            </p>
          </div>
        </div>

        {/* Step 2: Features Showcase */}
        <div
          className={`transition-all duration-1000 delay-500 ${
            animationStep >= 2
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-8"
          }`}
        >
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-4 bg-blue-50 rounded-lg p-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                📝
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Task Management</h3>
                <p className="text-sm text-gray-600">
                  Organize your todos and stay productive
                </p>
              </div>
              <CheckCircle className="text-green-500" size={20} />
            </div>

            <div className="flex items-center space-x-4 bg-green-50 rounded-lg p-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                📚
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Collections</h3>
                <p className="text-sm text-gray-600">
                  Save and organize your content
                </p>
              </div>
              <CheckCircle className="text-green-500" size={20} />
            </div>

            <div className="flex items-center space-x-4 bg-purple-50 rounded-lg p-4">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                🎵
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Media Player</h3>
                <p className="text-sm text-gray-600">
                  YouTube integration and more
                </p>
              </div>
              <CheckCircle className="text-green-500" size={20} />
            </div>
          </div>
        </div>

        {/* Step 3: Ready Message */}
        <div
          className={`transition-all duration-1000 delay-1000 ${
            animationStep >= 3
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-8"
          }`}
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-center space-x-2">
              <span className="font-medium">Ready to get started!</span>
              <ArrowRight className="animate-bounce" size={20} />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ${
                animationStep === 1
                  ? "w-1/3"
                  : animationStep === 2
                  ? "w-2/3"
                  : animationStep >= 3
                  ? "w-full"
                  : "w-0"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
