import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Shield, Zap, Check } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const CTA = () => {
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main CTA animation
      gsap.fromTo(
        ".cta-content",
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cta-content",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Features list animation
      gsap.fromTo(
        ".cta-feature",
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".cta-features",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Floating elements animation
      gsap.to(".floating-cta-1", {
        y: -20,
        rotation: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });

      gsap.to(".floating-cta-2", {
        y: -15,
        rotation: -3,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 1,
      });

      gsap.to(".floating-cta-3", {
        y: -25,
        rotation: 8,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 0.5,
      });
    }, ctaRef);

    return () => ctx.revert();
  }, []);

  const features = [
    "Free 14-day trial, no credit card required",
    "Access to all premium features",
    "Priority customer support",
    "Cancel anytime, no questions asked",
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Get started in under 2 minutes",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is always protected",
    },
    {
      icon: Star,
      title: "Premium Support",
      description: "24/7 expert assistance",
    },
  ];

  return (
    <section
      ref={ctaRef}
      className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/80"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 left-10 floating-cta-1">
        <div className="w-24 h-24 bg-yellow-400/20 rounded-full backdrop-blur-sm"></div>
      </div>
      <div className="absolute top-40 right-20 floating-cta-2">
        <div className="w-32 h-32 bg-pink-400/20 rounded-lg backdrop-blur-sm transform rotate-45"></div>
      </div>
      <div className="absolute bottom-40 left-20 floating-cta-3">
        <div className="w-20 h-20 bg-cyan-400/30 rounded-full backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="cta-content text-center lg:text-left">
            <div className="inline-flex items-center bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Star className="mr-2 text-yellow-300" size={16} />
              Limited Time Offer
            </div>

            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Transform Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Productivity?
              </span>
            </h2>

            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Join thousands of professionals who have revolutionized their
              workflow with DashPoint. Start your free trial today and
              experience the future of productivity.
            </p>

            {/* Feature List */}
            <div className="cta-features space-y-3 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="cta-feature flex items-center text-white/90"
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Check className="text-white" size={16} />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                to="/register"
                className="group bg-gradient-to-r from-yellow-400 to-pink-400 text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover-lift transition-all duration-300 flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </Link>

              <Link
                to="/login"
                className="group glass-card text-white px-8 py-4 rounded-full font-semibold text-lg hover-glow flex items-center justify-center border border-white/20"
              >
                Sign In
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-white/70 text-sm">
              <div className="flex items-center">
                <Shield className="mr-2 text-green-400" size={16} />
                SSL Secured
              </div>
              <div className="flex items-center">
                <Star className="mr-2 text-yellow-400" size={16} />
                4.9/5 Rating
              </div>
              <div className="flex items-center">
                <Zap className="mr-2 text-blue-400" size={16} />
                99.9% Uptime
              </div>
            </div>
          </div>

          {/* Right Content - Benefits Cards */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-2xl hover-lift flex items-center space-x-4"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="text-purple-900" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-white/70">{benefit.description}</p>
                </div>
              </div>
            ))}

            {/* Special Offer Card */}
            <div className="glass-card p-6 rounded-2xl border-2 border-yellow-400/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-pink-400 text-purple-900 px-3 py-1 text-xs font-bold rounded-bl-lg">
                50% OFF
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                First Month Special
              </h3>
              <p className="text-white/80 mb-4">
                Get your first month at 50% off when you upgrade from the free
                trial.
              </p>

              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">$9.99</span>
                <span className="text-lg text-white/60 line-through">
                  $19.99
                </span>
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                  SAVE 50%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <p className="text-white/60 text-sm mb-4">
            Trusted by 50,000+ professionals worldwide
          </p>

          {/* Company Logos */}
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
              <span className="text-white font-semibold">TechCorp</span>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
              <span className="text-white font-semibold">StartupXYZ</span>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
              <span className="text-white font-semibold">DevStudio</span>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm">
              <span className="text-white font-semibold">CreativeInc</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
