import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { Check, Star, Zap, Gift, ArrowRight, Calendar } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const Pricing = () => {
  const pricingRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        ".pricing-title",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: ".pricing-title",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Pricing cards animation
      gsap.fromTo(
        ".pricing-card",
        { y: 80, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".pricing-cards",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Features animation
      gsap.fromTo(
        ".feature-item",
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".current-features",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, pricingRef);

    return () => ctx.revert();
  }, []);

  const currentFeatures = [
    "Real-time Clock with Multiple Timezones",
    "AI-Powered Content Extraction",
    "Smart Sticky Notes",
    "Advanced Task Management",
    "YouTube Media Player",
    "Weather Widget",
    "Customizable Dashboard",
    "Cross-Platform Access",
    "Secure Data Storage",
    "Community Support",
  ];

  const comingSoonFeatures = [
    "Premium AI Assistant",
    "Advanced Analytics & Reporting",
    "Team Collaboration Tools",
    "API Access & Integrations",
    "Priority Support (24/7)",
    "Custom Themes & Branding",
    "Advanced Automation",
    "Data Export & Backup",
    "Mobile Apps (iOS/Android)",
    "Enterprise Security Features",
  ];

  return (
    <section
      id="pricing"
      ref={pricingRef}
      className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="pricing-title">
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Gift className="mr-2" size={16} />
              Launch Special - Everything Free!
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're launching with all features completely free! Premium
              subscriptions with advanced features will be available soon.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Plan - Current */}
          <div className="pricing-card glass-card bg-white p-8 rounded-3xl hover-lift border-2 border-green-200 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                Available Now
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-white" size={32} />
              </div>

              <h3 className="text-2xl font-bold text-cyan-100 mb-2">
                Free Plan
              </h3>
              <p className="text-gray-300 mb-4">Perfect for getting started</p>

              <div className="mb-6">
                <span className="text-5xl font-bold text-cyan-100">$0</span>
                <span className="text-gray-300 ml-2">/month</span>
              </div>

              <Link
                to="/register"
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 hover-lift flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </div>

            <div className="current-features space-y-3">
              <h4 className="font-semibold text-cyan-100 mb-4">
                Everything included:
              </h4>
              {currentFeatures.map((feature, index) => (
                <div key={index} className="feature-item flex items-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Check className="text-white" size={12} />
                  </div>
                  <span className="text-gray-400">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Premium Plan - Coming Soon */}
          <div className="pricing-card glass-card bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-3xl hover-lift border-2 border-purple-200 relative opacity-90">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                Coming Soon
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="text-white" size={32} />
              </div>

              <h3 className="text-2xl font-bold text-cyan-100 mb-2">
                Premium Plan
              </h3>
              <p className="text-gray-300 mb-4">
                Advanced features for power users
              </p>

              <div className="mb-6">
                <span className="text-5xl font-bold text-cyan-100">$9.99</span>
                <span className="text-gray-300 ml-2">/month</span>
              </div>

              <button
                disabled
                className="w-full bg-gray-300 text-gray-200 px-8 py-3 rounded-full font-semibold cursor-not-allowed flex items-center justify-center"
              >
                <Calendar className="mr-2" size={16} />
                Notify Me
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-cyan-100 mb-4">
                Everything in Free, plus:
              </h4>
              {comingSoonFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="feature-item flex items-center opacity-70"
                >
                  <div className="w-5 h-5 bg-purple-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Check className="text-white" size={12} />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>{" "}
        </div>
      </div>
    </section>
  );
};
