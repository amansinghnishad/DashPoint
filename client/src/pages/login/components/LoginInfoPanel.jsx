import { CheckCircle } from "lucide-react";

export const LoginInfoPanel = () => {
  const features = [
    {
      title: "Secure Authentication",
      description:
        "Your credentials are protected with enterprise-grade encryption",
    },
    {
      title: "Data Privacy",
      description: "Your personal information remains private and secure",
    },
    {
      title: "Session Management",
      description: "Automatic session timeout for enhanced security",
    },
  ];
  return (
    <div className="hidden lg:block lg:w-1/2 bg-gray-50 p-4 sm:p-8 border-r border-gray-200">
      <div className="h-full flex flex-col justify-center">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Sign In to Continue
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Access your personalized dashboard with secure authentication. All
              data is encrypted and protected according to industry standards.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="text-green-500 mt-0.5" size={20} />
                <div>
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
