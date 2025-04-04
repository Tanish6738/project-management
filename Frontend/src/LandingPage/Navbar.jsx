import React, { useState, useEffect } from 'react';
import { InteractiveHoverButton } from '../App/Elements/HoverButton';

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

  // Smooth scroll function
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false); // Close mobile menu if open
    
    const section = document.querySelector(sectionId);
    if (section) {
      const offsetTop = section.offsetTop;
      const navbarHeight = 80; // Approximate navbar height
      
      window.scrollTo({
        top: offsetTop - navbarHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav 
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">ProjectFlow</h1>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <a 
              href="#features" 
              onClick={(e) => scrollToSection(e, '#features')} 
              className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => scrollToSection(e, '#how-it-works')} 
              className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide"
            >
              How It Works
            </a>
            <a 
              href="#about" 
              onClick={(e) => scrollToSection(e, '#about')} 
              className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide"
            >
              About
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => scrollToSection(e, '#pricing')} 
              className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide"
            >
              Pricing
            </a>
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, '#contact')} 
              className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide"
            >
              Contact
            </a>
            <div className="ml-8 flex space-x-4 items-center">
              <button className="text-white hover:text-white transition-colors font-medium text-sm">
                Sign In
              </button>
              <InteractiveHoverButton 
                className="bg-white text-black border-white px-5 py-2.5 font-medium text-sm shadow-md hover:shadow-lg"
              >
                Get Started
              </InteractiveHoverButton>
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
            <a 
              href="#features" 
              onClick={(e) => scrollToSection(e, '#features')} 
              className="text-white/80 hover:text-white transition-colors font-medium py-2 border-b border-white/20"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => scrollToSection(e, '#how-it-works')} 
              className="text-white/80 hover:text-white transition-colors font-medium py-2 border-b border-white/20"
            >
              How It Works
            </a>
            <a 
              href="#about" 
              onClick={(e) => scrollToSection(e, '#about')} 
              className="text-white/80 hover:text-white transition-colors font-medium py-2 border-b border-white/20"
            >
              About
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => scrollToSection(e, '#pricing')} 
              className="text-white/80 hover:text-white transition-colors font-medium py-2 border-b border-white/20"
            >
              Pricing
            </a>
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, '#contact')} 
              className="text-white/80 hover:text-white transition-colors font-medium py-2 border-b border-white/20"
            >
              Contact
            </a>
            <div className="pt-2 flex flex-col space-y-3">
              <button className="text-white hover:text-white transition-colors font-medium py-2">
                Sign In
              </button>
              <InteractiveHoverButton 
                className="bg-white text-black border-white py-3 font-medium shadow-md w-full"
              >
                Get Started
              </InteractiveHoverButton>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
