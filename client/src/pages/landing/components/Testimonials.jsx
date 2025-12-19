import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Quote, ChevronLeft, ChevronRight, Play } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const Testimonials = () => {
  const testimonialsRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "Tech Corp",
      avatar: "/api/placeholder/80/80",
      rating: 5,
      content:
        "DashPoint has completely transformed how I manage my daily tasks. The AI-powered content extraction feature alone has saved me hours every week. The interface is intuitive and the performance is outstanding.",
      videoTestimonial: true,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Freelance Designer",
      company: "Independent",
      avatar: "/api/placeholder/80/80",
      rating: 5,
      content:
        "As a freelancer, staying organized is crucial. DashPoint's dashboard gives me everything I need in one place. The customization options and smooth animations make it a joy to use every day.",
      videoTestimonial: false,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "StartupXYZ",
      avatar: "/api/placeholder/80/80",
      rating: 5,
      content:
        "The content extraction and organization features are game-changers. I can quickly gather research from multiple sources and have everything categorized automatically. Incredible productivity boost!",
      videoTestimonial: true,
    },
    {
      id: 4,
      name: "David Kim",
      role: "Software Engineer",
      company: "DevCorp",
      avatar: "/api/placeholder/80/80",
      rating: 5,
      content:
        "Clean code, beautiful design, and powerful features. DashPoint feels like it was built by developers who actually understand user needs. The performance is lightning fast even with lots of data.",
      videoTestimonial: false,
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Business Analyst",
      company: "Finance Pro",
      avatar: "/api/placeholder/80/80",
      rating: 5,
      content:
        "The analytics and reporting features help me track my productivity trends. The AI suggestions are surprisingly accurate and have helped me optimize my workflow significantly.",
      videoTestimonial: true,
    },
    {
      id: 6,
      name: "James Thompson",
      role: "Content Creator",
      company: "Media House",
      avatar: "/api/placeholder/80/80",
      rating: 5,
      content:
        "Perfect for content creators! The YouTube integration and media management features are exactly what I needed. Plus, the note-taking system keeps all my ideas organized and accessible.",
      videoTestimonial: false,
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        ".testimonials-title",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: ".testimonials-title",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Testimonial cards animation
      gsap.fromTo(
        ".testimonial-card",
        { y: 80, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".testimonials-grid",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Featured testimonial animation
      gsap.fromTo(
        ".featured-testimonial",
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: ".featured-testimonial",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, testimonialsRef);

    return () => ctx.revert();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section
      id="testimonials"
      ref={testimonialsRef}
      className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23667eea' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="testimonials-title">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              What Our Users
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Are Saying
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Hear from real users who have
              transformed their productivity with DashPoint.
            </p>
          </div>
        </div>

        {/* Featured Testimonial Carousel */}
        <div className="featured-testimonial mb-16">
          <div className="glass-card bg-white p-8 lg:p-12 rounded-3xl max-w-4xl mx-auto relative">
            {/* Quote Icon */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Quote className="text-white" size={24} />
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* User Info */}
              <div className="text-center md:text-left">
                <div className="relative mb-4">
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    className="w-20 h-20 rounded-full mx-auto md:mx-0 object-cover border-4 border-purple-200"
                  />
                  {testimonials[currentIndex].videoTestimonial && (
                    <button className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center hover:bg-black/40 transition-colors">
                      <Play className="text-white ml-1" size={20} />
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {testimonials[currentIndex].name}
                </h3>
                <p className="text-purple-600 font-medium mb-1">
                  {testimonials[currentIndex].role}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  {testimonials[currentIndex].company}
                </p>

                <div className="flex justify-center md:justify-start mb-4">
                  {renderStars(testimonials[currentIndex].rating)}
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="md:col-span-2">
                <blockquote className="text-lg lg:text-xl text-gray-700 leading-relaxed mb-6">
                  "{testimonials[currentIndex].content}"
                </blockquote>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? "bg-purple-600 scale-125"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={prevTestimonial}
                      className="p-2 bg-gray-100 hover:bg-purple-100 rounded-full transition-colors group"
                    >
                      <ChevronLeft
                        className="text-gray-600 group-hover:text-purple-600"
                        size={20}
                      />
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="p-2 bg-gray-100 hover:bg-purple-100 rounded-full transition-colors group"
                    >
                      <ChevronRight
                        className="text-gray-600 group-hover:text-purple-600"
                        size={20}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="testimonials-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial) => (
            <div
              key={testimonial.id}
              className="testimonial-card glass-card bg-white p-6 rounded-2xl hover-lift group"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {testimonial.videoTestimonial && (
                      <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                        <Play className="text-white" size={12} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex">{renderStars(testimonial.rating)}</div>
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 text-sm leading-relaxed mb-4">
                "{testimonial.content.substring(0, 120)}..."
              </blockquote>

              {/* Company */}
              <div className="text-xs text-purple-600 font-medium">
                {testimonial.company}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-400 fill-current" size={24} />
              <div>
                <div className="font-bold text-gray-900">4.9/5</div>
                <div className="text-sm text-gray-500">Average Rating</div>
              </div>
            </div>

            <div className="w-px h-12 bg-gray-200"></div>

            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
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
              <div>
                <div className="font-bold text-gray-900">12,000+</div>
                <div className="text-sm text-gray-500">Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
