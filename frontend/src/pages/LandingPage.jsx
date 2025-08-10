import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Dashboard from '../assets/Dashboard.png';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white text-white">
      {/* Sticky Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-blue-900/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-800" />
              </div>
              <div className="text-2xl ml-2 font-bold bg-white to-purple-500 bg-clip-text text-transparent">
                FormBuilder
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('features')} className="hover:text-blue-400 transition-colors">Features</button>
              <button onClick={() => scrollToSection('solutions')} className="hover:text-blue-400 transition-colors">Solutions</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-blue-400 transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('testimonials')} className="hover:text-blue-400 transition-colors">Testimonials</button>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login"><button className="text-sm hover:text-blue-400 transition-colors">Sign In</button></Link>
              <Link to="/register">
                <button className="bg-white text-blue-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-400 transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
<section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-blue-800">
  {/* Animated Background Shapes */}
  <div className="absolute inset-0">
    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
    <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200/10 rounded-full blur-2xl animate-pulse delay-500"></div>
  </div>

  <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
    <div className="transform transition-all duration-1000 translate-y-0 opacity-100">
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
        Transform Your Workflow with
        <br />
        <span className="text-blue-200">
          AI-Powered Solutions
        </span>
      </h1>
      <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
        Streamline operations, boost productivity, and scale your business with our intelligent Form Builder platform
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/register">
        <button className="bg-white text-blue-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-100 transform hover:scale-105 transition-all shadow-lg">
          Get Started
        </button>
        </Link>
        {/* <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-800 transform hover:scale-105 transition-all">
          Learn More
        </button> */}
      </div>
    </div>
  </div>

  {/* Scroll Indicator */}
  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </div>
</section>


      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-blue-800">Why Choose FormBuilder</h2>
            <p className="text-xl text-blue-500 max-w-2xl mx-auto">
              Discover how our cutting-edge features can transform your business operations
            </p>
          </div>

          <div className="grid grid-cols-1 place-items-center md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-blue-800 p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl border border-blue-700/50">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-200 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Real-time Collaboration</h3>
              <p className="text-blue-100">Work seamlessly with your team in real-time</p>
            </div>

            <div className="bg-blue-800 p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl border border-blue-700/50">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-300 to-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Advanced Security</h3>
              <p className="text-blue-100">Enterprise-grade security to protect your data</p>
            </div>

            <div className="bg-blue-800 p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl border border-blue-700/50">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-200 to-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Seamless Integration</h3>
              <p className="text-blue-100">Connect with your favorite tools effortlessly</p>
            </div>
          </div>
        </div>
      </section>


      {/* Product Showcase */}
      <section id="solutions" className="py-20 text-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Built for Modern Teams</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Intuitive Dashboard Design</h3>
                    <p className="text-blue-400">Clean, modern interface that your team will love to use every day</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Advanced Reporting Capabilities</h3>
                    <p className="text-blue-400">Generate comprehensive reports with real-time data visualization</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Customizable Workflows</h3>
                    <p className="text-blue-400">Tailor the platform to match your unique business processes</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">24/7 Dedicated Support</h3>
                    <p className="text-blue-400">Get help whenever you need it with our expert support team</p>
                  </div>
                </div>
              </div>

              {/* <button className="mt-8 text-white bg-blue-800 px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:bg-blue-900">
                Schedule Demo
              </button> */}
            </div>

            <div className="relative">
              <div className="bg-blue-800 rounded-2xl p-8 shadow-2xl">
                <img src={Dashboard} alt="" />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-blue-800 font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-blue-400">See what our customers have to say about their experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-blue-800/80 p-8 rounded-2xl border border-blue-700/50">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-blue-300 mb-6 italic">
                "FormBuilder has revolutionized how we manage our operations. The AI-powered insights are game-changing."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">SJ</span>
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-blue-400 text-sm">CEO, TechFlow</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-blue-800/80 p-8 rounded-2xl border border-blue-700/50">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-blue-300 mb-6 italic">
                "The platform's security features and seamless integration capabilities have exceeded our expectations."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">MC</span>
                </div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-blue-400 text-sm">CTO, SecureLink</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-blue-800/80 p-8 rounded-2xl border border-blue-700/50">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-blue-300 mb-6 italic">
                "Outstanding support team and robust features. FormBuilder has become an essential part of our stack."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">ED</span>
                </div>
                <div>
                  <h4 className="font-semibold">Emily Davis</h4>
                  <p className="text-blue-400 text-sm">Director, GrowthTech</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
<section id="pricing" className="py-20  text-blue-800">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-4xl font-bold text-center mb-12">Pricing Plans</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* Free Plan */}
      <div className="bg-white text-blue-800 rounded-2xl shadow-lg p-8 flex flex-col">
        <h3 className="text-2xl font-bold mb-4">Free</h3>
        <p className="text-lg mb-6">For individuals just getting started</p>
        <p className="text-4xl font-bold mb-6">Rs.0<span className="text-lg font-normal">/mo</span></p>
        <ul className="flex-1 mb-6 space-y-3">
          <li>✔ Basic form building</li>
          <li>✔ Up to 3 forms</li>
          <li>✔ 100 submissions/month</li>
        </ul>
        <Link to="/register">
        <button className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition">
          Get Started
        </button>
        </Link>
      </div>

      {/* Pro Plan (Highlighted) */}
      <div className="bg-white text-blue-800 rounded-xl shadow-lg p-8 flex flex-col transform scale-105 border-4 border-blue-800">
        <h3 className="text-2xl font-bold mb-4">Pro</h3>
        <p className="text-lg mb-6">For professionals who need more power</p>
        <p className="text-4xl font-bold mb-6">Rs.500<span className="text-lg font-normal">/mo</span></p>
        <ul className="flex-1 mb-6 space-y-3">
          <li>✔ Unlimited forms</li>
          <li>✔ Unlimited submissions</li>
          <li>✔ Priority support</li>
          <li>✔ Advanced analytics</li>
        </ul>
        <Link to="/login"> 
        <button className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition">
          Upgrade to Pro
        </button>
        </Link>
      </div>

      {/* Standard Plan */}
      <div className="bg-white text-blue-800 rounded-xl shadow-lg p-8 flex flex-col">
        <h3 className="text-2xl font-bold mb-4">Standard</h3>
        <p className="text-lg mb-6">For growing teams</p>
        <p className="text-4xl font-bold mb-6">Rs.100<span className="text-lg font-normal">/mo</span></p>
        <ul className="flex-1 mb-6 space-y-3">
          <li>✔ Up to 20 forms</li>
          <li>✔ 10,000 submissions/month</li>
          <li>✔ Email support</li>
        </ul>
        <Link to="/login"> 
        <button className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition">
          Choose Standard
        </button>
        </Link>
      </div>

    </div>
  </div>
</section>


      {/* Footer */}
      <footer className="bg-blue-900  py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold bg-white bg-clip-text text-transparent mb-4">
                FormBuilder
              </div>
              <p className="text-white mb-4">
                Transforming businesses with intelligent Form Builder solutions
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg  font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('features')} className="text-white hover:text-gray-400 transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('solutions')} className="text-white hover:text-gray-400 transition-colors">Solutions</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-white hover:text-gray-400 transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="text-white hover:text-gray-400 transition-colors">Testimonials</button></li> {/* Assuming Updates is now Testimonials or similar */}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-white hover:text-gray-400 transition-colors">About</Link></li> {/* Example internal link */}
                <li><Link to="/blog" className="text-white hover:text-gray-400 transition-colors">Blog</Link></li> {/* Example internal link */}
                <li><a href="#" className="text-white hover:text-gray-400 transition-colors">Careers</a></li> {/* Placeholder for now */}
                <li><a href="#" className="text-white hover:text-gray-400 transition-colors">Press</a></li> {/* Placeholder for now */}
                <li><a href="#" className="text-white hover:text-gray-400 transition-colors">Partners</a></li> {/* Placeholder for now */}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:text-gray-400 transition-colors">Documentation</a></li> {/* Placeholder for now */}
                <li><a href="#" className="text-white hover:text-gray-400 transition-colors">Support</a></li> {/* Placeholder for now */}
                <li><a href="#" className="text-white hover:text-gray-400 transition-colors">API</a></li> {/* Placeholder for now */}
                <li><a href="#" className="text-white hover:text-gray-400 transition-colors">Community</a></li> {/* Placeholder for now */}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white pt-8 mt-8 text-center">
            <p className="text-white">
              © 2024 FormBuilder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
