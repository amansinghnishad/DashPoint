import { CheckCircle, Gift, Star, Zap } from "lucide-react";

export const LoginInfoPanel = () => {
  const features = [
    {
      icon: Gift,
      title: "Everything Free",
      description:
        "Access all premium features at no cost during our launch phase",
      color: "text-green-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance for instant productivity boosts",
      color: "text-yellow-500",
    },
    {
      icon: Star,
      title: "Premium Experience",
      description: "Full-featured dashboard with AI-powered tools included",
      color: "text-purple-500",
    },
  ];
  return (
    <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-8 border-r border-gray-200">
      <div className="h-full flex flex-col justify-center">
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Gift className="mr-2" size={16} />
              Launch Special - All Free!
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Welcome Back to DashPoint
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Sign in to access your personalized productivity dashboard.
              Everything is completely free during our launch - no
              subscriptions, no hidden fees, just pure productivity.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <feature.icon className={`${feature.color} mt-0.5`} size={20} />
                <div>
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border border-purple-200">
            <h3 className="font-medium text-purple-900 mb-2">
              🎉 Launch Benefits
            </h3>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• All premium features unlocked</li>
              <li>• No payment required</li>
              <li>• Early bird advantage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
