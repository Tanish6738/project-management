import React from 'react';
import { RippleButton } from '../App/Elements/RippleButton';
import { MagicCard } from '../App/Elements/MagicCard';

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-24 pb-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-black z-0"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-5 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black z-0"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 -right-64 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
      <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            <span className="block">Streamline Your Projects with</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white">Real-Time Collaboration</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white max-w-3xl mx-auto mb-10 leading-relaxed">
            Empower your team with our intuitive project management platform. Track progress, collaborate in real-time, and deliver exceptional results—all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <RippleButton 
              className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              rippleColor="rgba(0, 0, 0, 0.3)"
              style={{color: 'black'}}
            >
              Start Your Free Trial
            </RippleButton>
            <RippleButton 
              className="bg-transparent text-white hover:bg-white/10 border border-white/30 px-8 py-4 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-1"
              rippleColor="rgba(255, 255, 255, 0.2)"
            >
              Schedule a Demo
            </RippleButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <MagicCard 
              className="rounded-xl overflow-hidden border border-gray-800 md:border-transparent"
              gradientFrom="rgba(66, 153, 225, 0.9)" 
              gradientTo="rgba(236, 72, 153, 0.9)"
              gradientOpacity={0.2}
              gradientColor="rgba(255, 255, 255, 0.1)"
              gradientSize={250}
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-black/50 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-black/70 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2 text-center">Real-Time Updates</h3>
                <p className="text-white/70 text-center">See changes as they happen with instant synchronization across all devices.</p>
              </div>
            </MagicCard>
            
            <MagicCard 
              className="rounded-xl overflow-hidden border border-gray-800 md:border-transparent"
              gradientFrom="rgba(134, 239, 172, 0.9)"
              gradientTo="rgba(59, 130, 246, 0.9)"
              gradientOpacity={0.2}
              gradientColor="rgba(255, 255, 255, 0.1)"
              gradientSize={250}
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-black/50 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-black/70 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2 text-center">Team Collaboration</h3>
                <p className="text-white/70 text-center">Work together seamlessly with intuitive tools designed for modern teams.</p>
              </div>
            </MagicCard>
            
            <MagicCard 
              className="rounded-xl overflow-hidden border border-gray-800 md:border-transparent"
              gradientFrom="rgba(244, 63, 94, 0.9)"
              gradientTo="rgba(251, 113, 133, 0.9)"
              gradientOpacity={0.2}
              gradientColor="rgba(255, 255, 255, 0.1)"
              gradientSize={250}
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-black/50 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-black/70 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2 text-center">Advanced Analytics</h3>
                <p className="text-white/70 text-center">Make data-driven decisions with comprehensive project insights and reports.</p>
              </div>
            </MagicCard>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-white/70 text-sm mb-2">Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1">
          <div className="w-1.5 h-3 bg-white/70 rounded-full animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
