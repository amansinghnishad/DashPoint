import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { Play, ArrowRight, Star, Zap } from "lucide-react";

export const Hero = () => {
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Hero entrance animation
      tl.fromTo(
        ".hero-title",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      )
        .fromTo(
          ".hero-subtitle",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
          "-=0.5"
        )
        .fromTo(
          ".hero-buttons",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          ".hero-stats",
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
          "-=0.3"
        )
        .fromTo(
          ".hero-visual",
          { x: 100, opacity: 0 },
          { x: 0, opacity: 1, duration: 1, ease: "power3.out" },
          "-=0.8"
        );

      // Floating elements animation
      gsap.to(".floating-element-1", {
        y: -20,
        rotation: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });

      gsap.to(".floating-element-2", {
        y: -15,
        rotation: -3,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 1,
      });

      gsap.to(".floating-element-3", {
        y: -25,
        rotation: 8,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 0.5,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const playDemo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Elements */}
      <div className="parallax-bg"></div>
      <div className="absolute inset-0 gradient-mesh"></div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 left-10 floating-element-1">
        <div className="w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm"></div>
      </div>
      <div className="absolute top-40 right-20 floating-element-2">
        <div className="w-32 h-32 bg-yellow-300/20 rounded-lg backdrop-blur-sm transform rotate-45"></div>
      </div>
      <div className="absolute bottom-40 left-20 floating-element-3">
        <div className="w-16 h-16 bg-purple-400/30 rounded-full backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="hero-title">
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Your Ultimate
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Dashboard Hub
                </span>
              </h1>
            </div>{" "}
            <div className="hero-subtitle">
              <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl">
                Streamline your workflow with our all-in-one dashboard. Manage
                tasks, extract content, take notes, and boost productivity like
                never before.{" "}
                <span className="text-yellow-300 font-semibold">
                  Now available for free!
                </span>
              </p>
            </div>{" "}
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/register"
                className="group bg-gradient-to-r from-yellow-400 to-pink-400 text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover-lift transition-all duration-300 flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </Link>

              <button
                onClick={playDemo}
                className="group glass-card text-white px-8 py-4 rounded-full font-semibold text-lg hover-glow flex items-center justify-center"
              >
                <Play
                  className="mr-2 group-hover:scale-110 transition-transform"
                  size={20}
                />
                Watch Demo
              </button>
            </div>{" "}
            {/* Launch Info */}
            <div className="hero-stats grid grid-cols-2 gap-8 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="text-yellow-300 mr-2" size={24} />
                  <span className="text-3xl font-bold text-white">FREE</span>
                </div>
                <p className="text-white/70 text-sm">Launch Offer</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="text-yellow-300 mr-2" size={24} />
                  <span className="text-3xl font-bold text-white">NEW</span>
                </div>
                <p className="text-white/70 text-sm">Just Launched</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="hero-visual relative">
            <div className="glass-card p-8 rounded-3xl">
              {/* Demo Video/Screenshot */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-blue-900/50 aspect-video mb-6">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster="/api/placeholder/800/450"
                  controls={false}
                  muted
                  loop
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                </video>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={playDemo}
                    className="bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-all duration-300 hover:scale-110"
                  >
                    <Play className="text-white ml-1" size={32} />
                  </button>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-xl hover-lift">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-lg flex items-center justify-center mb-3">
                    <Zap className="text-purple-900" size={20} />
                  </div>
                  <h3 className="text-white font-semibold mb-1">
                    Lightning Fast
                  </h3>
                  <p className="text-white/70 text-sm">Optimized performance</p>
                </div>

                <div className="glass-card p-4 rounded-xl hover-lift">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center mb-3">
                    <Star className="text-white" size={20} />
                  </div>
                  <h3 className="text-white font-semibold mb-1">AI Powered</h3>
                  <p className="text-white/70 text-sm">Smart automation</p>
                </div>
              </div>
            </div>

            {/* Floating UI Elements */}
            <div className="absolute -top-4 -right-4 animate-float">
              <div className="glass-card p-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">Live Updates</span>
                </div>
              </div>
            </div>

            <div
              className="absolute -bottom-4 -left-4 animate-float"
              style={{ animationDelay: "1s" }}
            >
              <div className="glass-card p-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Star className="text-yellow-400" size={16} />
                  <span className="text-white text-sm">Premium Features</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
