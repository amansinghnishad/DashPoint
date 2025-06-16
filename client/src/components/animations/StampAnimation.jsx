import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

export const StampAnimation = ({ isVisible, onComplete }) => {
  const [animationState, setAnimationState] = useState("hidden");
  useEffect(() => {
    if (isVisible) {
      // Start animation sequence
      setAnimationState("stamping");

      // Complete animation after stamp effect
      const timer = setTimeout(() => {
        setAnimationState("complete");
      }, 1500);

      // Notify parent component after animation is complete
      const completionTimer = setTimeout(() => {
        onComplete?.();
      }, 2000); // Total time: 1500ms stamp + 500ms delay

      return () => {
        clearTimeout(timer);
        clearTimeout(completionTimer);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div
            className={`mx-auto transition-all duration-1000 ${
              animationState === "stamping"
                ? "animate-bounce scale-150"
                : animationState === "complete"
                ? "scale-100"
                : "scale-0"
            }`}
          >
            <div className="relative">
              {/* Stamp Effect */}
              <div
                className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
                  animationState === "stamping"
                    ? "bg-red-600 transform rotate-12"
                    : "bg-green-600"
                }`}
              >
                <CheckCircle className="text-white" size={48} />
              </div>

              {/* Stamp Border */}
              <div
                className={`absolute inset-0 border-4 border-dashed rounded-full transition-all duration-500 ${
                  animationState === "stamping"
                    ? "border-red-600 animate-pulse"
                    : "border-green-600"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">
            {animationState === "stamping"
              ? "Processing..."
              : "Registration Complete!"}
          </h3>{" "}
          <p className="text-gray-600">
            {animationState === "stamping"
              ? "Creating your account..."
              : "Account created successfully! Redirecting to sign in..."}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-green-600 h-2 rounded-full transition-all duration-1000 ${
                animationState === "complete" ? "w-full" : "w-0"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
