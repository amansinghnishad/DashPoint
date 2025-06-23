import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import {
  Zap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  ArrowUp,
  Heart,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Footer sections animation
      gsap.fromTo(
        ".footer-section",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".footer-content",
            start: "top 90%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Social icons animation
      gsap.fromTo(
        ".social-icon",
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".social-icons",
            start: "top 90%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const quickLinks = [
    { name: "Features", href: "#features" },
    { name: "Demo", href: "#showcase" },
    { name: "Pricing", href: "#pricing" },
    { name: "About Us", href: "#about" },
    { name: "Contact", href: "#contact" },
    { name: "Help Center", href: "#help" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms of Service", href: "#terms" },
    { name: "Cookie Policy", href: "#cookies" },
    { name: "GDPR", href: "#gdpr" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#facebook", color: "hover:text-blue-500" },
    { icon: Twitter, href: "#twitter", color: "hover:text-blue-400" },
    { icon: Instagram, href: "#instagram", color: "hover:text-pink-500" },
    { icon: Linkedin, href: "#linkedin", color: "hover:text-blue-600" },
    { icon: Github, href: "#github", color: "hover:text-gray-400" },
  ];

  return (
    <footer
      ref={footerRef}
      className="bg-gray-900 text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23667eea' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="footer-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="footer-section">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-yellow-400 to-pink-400 p-2 rounded-xl mr-3">
                  <Zap className="h-8 w-8 text-purple-900" />
                </div>
                <span className="text-2xl font-bold">
                  Dash<span className="text-yellow-300">Point</span>
                </span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Transform your productivity with our all-in-one dashboard
                solution. Streamline workflows, organize content, and boost
                efficiency like never before.
                <span className="block text-green-400 font-semibold mt-2">
                  Now available completely free!
                </span>
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-400">
                  <Mail className="mr-3 flex-shrink-0" size={16} />
                  <span>hello@dashpoint.com</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Phone className="mr-3 flex-shrink-0" size={16} />
                  <span>+91 7340XXXXXXXX</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="mr-3 flex-shrink-0" size={16} />
                  <span>Lucknow , UP</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-section">
              <h3 className="text-lg font-semibold mb-6">Legal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Newsletter */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold mb-4">Stay Updated</h4>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  <button className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-r-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
                    <Mail size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Social & Support */}
            <div className="footer-section">
              <h3 className="text-lg font-semibold mb-6">Connect With Us</h3>

              {/* Social Icons */}
              <div className="social-icons flex space-x-4 mb-8">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`social-icon w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:bg-gray-700`}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>

              {/* Support Section */}
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">24/7 Support</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Need help? Our support team is always here for you.
                  </p>
                  <Link
                    to="/support"
                    className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    Get Support
                    <ArrowUp className="ml-1 rotate-45" size={12} />
                  </Link>
                </div>{" "}
                <div className="bg-gradient-to-r from-green-800/50 to-blue-800/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">🎉 Launch Special</h4>
                  <p className="text-gray-300 text-sm">
                    All features free during our launch phase. Join now!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {" "}
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center text-gray-400 text-sm">
                <span>© 2025 DashPoint. Made with</span>
                <Heart className="mx-1 text-red-500 fill-current" size={16} />
                <span>by Team Hackademics</span>
              </div>

              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Version 2.1.0</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-400 text-sm">
                    All systems operational
                  </span>
                </div>

                {/* Scroll to Top Button */}
                <button
                  onClick={scrollToTop}
                  className="bg-gray-800 hover:bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
