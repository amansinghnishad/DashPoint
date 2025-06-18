import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Clock,
  FileText,
  StickyNote,
  CheckSquare,
  Youtube,
  Cloud,
  Zap,
  Shield,
  Palette,
  Globe,
  BarChart3,
  Smartphone,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const Features = () => {
  const featuresRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        ".features-title",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: ".features-title",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Feature cards stagger animation
      gsap.fromTo(
        ".feature-card",
        { y: 80, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".features-grid",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Main feature showcase animation
      gsap.fromTo(
        ".main-feature",
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: ".main-feature",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".main-feature-visual",
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: ".main-feature-visual",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, featuresRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Clock,
      title: "Real-time Clock",
      description:
        "Stay on track with customizable world clocks and time zones",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: FileText,
      title: "Content Extraction",
      description: "Extract and organize content from any webpage instantly",
      color: "from-green-400 to-green-600",
    },
    {
      icon: StickyNote,
      title: "Smart Notes",
      description: "AI-powered sticky notes that organize themselves",
      color: "from-yellow-400 to-yellow-600",
    },
    {
      icon: CheckSquare,
      title: "Task Management",
      description: "Powerful todo lists with smart prioritization",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: Youtube,
      title: "Media Player",
      description: "Built-in YouTube player for seamless entertainment",
      color: "from-red-400 to-red-600",
    },
    {
      icon: Cloud,
      title: "Weather Widget",
      description: "Live weather updates for your location and favorites",
      color: "from-cyan-400 to-cyan-600",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance for instant responses",
      color: "from-orange-400 to-orange-600",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security for your data",
      color: "from-indigo-400 to-indigo-600",
    },
    {
      icon: Palette,
      title: "Customizable",
      description: "Personalize your dashboard with themes and layouts",
      color: "from-pink-400 to-pink-600",
    },
    {
      icon: Globe,
      title: "Cross Platform",
      description: "Access your dashboard from any device, anywhere",
      color: "from-teal-400 to-teal-600",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track your productivity with detailed insights",
      color: "from-violet-400 to-violet-600",
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Responsive design that works on all screen sizes",
      color: "from-emerald-400 to-emerald-600",
    },
  ];

  return (
    <section
      id="features"
      ref={featuresRef}
      className="py-20 bg-gray-50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="features-title">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Modern Productivity
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to stay organized, productive, and ahead of
              the curve. Our comprehensive dashboard brings all your tools
              together in one beautiful interface.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card glass-card bg-white p-6 rounded-2xl hover-lift group cursor-pointer"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Main Feature Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="main-feature">
            <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="mr-2" size={16} />
              Featured Capability
            </div>

            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              AI-Powered Content Extraction & Organization
            </h3>

            <p className="text-lg text-gray-600 mb-8">
              Our advanced AI algorithms automatically extract, categorize, and
              organize content from any webpage, document, or media source. Save
              time and stay organized with intelligent content management.
            </p>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  Automatic content categorization
                </span>
              </div>

              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Smart tagging and search</span>
              </div>

              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  Cross-platform synchronization
                </span>
              </div>
            </div>
          </div>

          <div className="main-feature-visual">
            <div className="glass-card p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-blue-50">
              {/* Mock Dashboard Interface */}
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Content Dashboard
                  </h4>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Article: "AI in 2024"
                      </p>
                      <p className="text-sm text-gray-500">
                        Extracted 2 minutes ago
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <Youtube className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Video: "Tutorial Series"
                      </p>
                      <p className="text-sm text-gray-500">
                        Added to collection
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <StickyNote className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Note: "Meeting Notes"
                      </p>
                      <p className="text-sm text-gray-500">Auto-categorized</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 animate-float">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  AI Processing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
