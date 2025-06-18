import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Users,
  Star,
  Download,
  Globe,
  Zap,
  Clock,
  Shield,
  Heart,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const Stats = () => {
  const statsRef = useRef(null);
  const [animatedValues, setAnimatedValues] = useState({});

  const stats = [
    {
      icon: Users,
      value: 50000,
      suffix: "+",
      label: "Active Users",
      description: "Growing community worldwide",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: Star,
      value: 4.9,
      suffix: "/5",
      label: "User Rating",
      description: "Based on 10K+ reviews",
      color: "from-yellow-400 to-yellow-600",
      decimal: true,
    },
    {
      icon: Download,
      value: 100000,
      suffix: "+",
      label: "Downloads",
      description: "Across all platforms",
      color: "from-green-400 to-green-600",
    },
    {
      icon: Globe,
      value: 150,
      suffix: "+",
      label: "Countries",
      description: "Global user base",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: Zap,
      value: 99.9,
      suffix: "%",
      label: "Uptime",
      description: "Reliable service",
      color: "from-orange-400 to-orange-600",
      decimal: true,
    },
    {
      icon: Clock,
      value: 24,
      suffix: "/7",
      label: "Support",
      description: "Always here to help",
      color: "from-cyan-400 to-cyan-600",
    },
    {
      icon: Shield,
      value: 100,
      suffix: "%",
      label: "Secure",
      description: "Enterprise-grade security",
      color: "from-indigo-400 to-indigo-600",
    },
    {
      icon: Heart,
      value: 95,
      suffix: "%",
      label: "Satisfaction",
      description: "Happy customers",
      color: "from-pink-400 to-pink-600",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initialize animated values
      const initialValues = {};
      stats.forEach((stat, index) => {
        initialValues[index] = 0;
      });
      setAnimatedValues(initialValues);

      // Title animation
      gsap.fromTo(
        ".stats-title",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: ".stats-title",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Stats cards animation
      gsap.fromTo(
        ".stat-card",
        { y: 80, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".stats-grid",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
            onEnter: () => {
              // Animate numbers
              stats.forEach((stat, index) => {
                gsap.to(animatedValues, {
                  [index]: stat.value,
                  duration: 2,
                  ease: "power2.out",
                  delay: index * 0.1,
                  onUpdate: () => {
                    setAnimatedValues({ ...animatedValues });
                  },
                });
              });
            },
          },
        }
      );
    }, statsRef);

    return () => ctx.revert();
  }, []);
  const formatNumber = (num, decimal = false) => {
    const number = parseFloat(num) || 0;
    if (decimal) {
      return number.toFixed(1);
    }
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(0) + "K";
    }
    return Math.floor(number).toString();
  };

  return (
    <section ref={statsRef} className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="stats-title">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Thousands Worldwide
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join a growing community of professionals who have transformed
              their productivity with DashPoint. Our numbers speak for
              themselves.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card glass-card bg-white p-6 lg:p-8 rounded-2xl text-center hover-lift group"
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="text-white" size={32} />
              </div>

              {/* Value */}
              <div className="mb-2">
                <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {formatNumber(animatedValues[index] || 0, stat.decimal)}
                </span>
                <span className="text-2xl lg:text-3xl font-bold text-gray-600">
                  {stat.suffix}
                </span>
              </div>

              {/* Label */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {stat.label}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm">{stat.description}</p>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-6 py-3 rounded-full">
            <Zap className="mr-2" size={20} />
            <span className="font-medium">
              Growing by 1000+ new users every week!
            </span>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 animate-float">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full backdrop-blur-sm"></div>
        </div>

        <div
          className="absolute bottom-10 right-10 animate-float"
          style={{ animationDelay: "1s" }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 rounded-lg backdrop-blur-sm transform rotate-45"></div>
        </div>

        <div
          className="absolute top-1/2 left-5 animate-float"
          style={{ animationDelay: "2s" }}
        >
          <div className="w-12 h-12 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full backdrop-blur-sm"></div>
        </div>
      </div>
    </section>
  );
};
