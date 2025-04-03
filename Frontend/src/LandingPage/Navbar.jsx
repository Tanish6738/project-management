import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <nav 
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">ProjectFlow</h1>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#features" className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide">
              Features
            </a>
            <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide">
              How It Works
            </a>
            <a href="#about" className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide">
              About
            </a>
            <a href="#pricing" className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide">
              Pricing
            </a>
            <a href="#contact" className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide">
              Contact
            </a>
            <div className="ml-8 flex space-x-4">
              <button className="text-white hover:text-slate-200 transition-colors font-medium text-sm">
                Sign In
              </button>
              <button className="bg-white text-slate-900 px-5 py-2.5 rounded-md font-medium text-sm hover:bg-slate-100 transition-colors shadow-md hover:shadow-lg">
                Get Started
              </button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-6 space-y-4 flex flex-col animate-fadeIn">
            <a href="#features" className="text-white/80 hover:text-white transition-colors font-medium py-2 border-b border-slate-800">
              Features
            </a>
            <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors font-medium py-2 border-b border-slate-800">
              How It Works
            </a>
            <a href="#about" className="text-white/80 hover:text-white transition-colors font-medium py-2 border-b border-slate-800">
              About
            </a>
            <a href="#pricing" className="text-white/80 hover:text-white transition-colors font-medium py-2 border-b border-slate-800">
              Pricing
            </a>
            <a href="#contact" className="text-white/80 hover:text-white transition-colors font-medium py-2 border-b border-slate-800">
              Contact
            </a>
            <div className="pt-2 flex flex-col space-y-3">
              <button className="text-white hover:text-slate-200 transition-colors font-medium py-2">
                Sign In
              </button>
              <button className="bg-white text-slate-900 py-3 rounded-md font-medium hover:bg-slate-100 transition-colors shadow-md">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
