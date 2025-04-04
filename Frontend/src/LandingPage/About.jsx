import React from 'react';

const About = () => {
  const values = [
    {
      title: "Innovation",
      description: "We constantly push the boundaries of what's possible in project management technology.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: "Excellence",
      description: "We're committed to delivering the highest quality product and service to our customers.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      title: "Collaboration",
      description: "We believe in the power of teamwork, both within our company and in the products we build.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: "Integrity",
      description: "We operate with transparency and honesty in all our interactions and decisions.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  return (
    <section id="about" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            About ProjectFlow
          </h2>
          <div className="h-1 w-20 bg-white/30 mx-auto mb-6"></div>
          <p className="text-lg text-white">
            We're on a mission to transform how teams collaborate and deliver projects.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Our Mission</h3>
            <p className="text-white mb-6 leading-relaxed">
              At ProjectFlow, our mission is to empower teams with intuitive tools that enhance collaboration, streamline workflows, and drive exceptional results. We believe that when teams work better together, they can achieve remarkable outcomes.
            </p>
            <p className="text-white leading-relaxed">
              We're dedicated to creating a platform that adapts to your team's unique needs, eliminating unnecessary complexity and focusing on what truly matters: helping you deliver successful projects on time and within budget.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-lg z-0"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-lg z-0"></div>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Team collaboration" 
              className="rounded-lg shadow-xl relative z-10 w-full h-auto object-cover"
            />
          </div>
        </div>
        
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Our Story</h3>
          <div className="bg-black p-8 rounded-xl shadow-sm border border-white/10">
            <p className="text-white mb-4 leading-relaxed">
              ProjectFlow was born out of frustration with existing project management tools that were either too complex or too simplistic. Our founders, experienced project managers themselves, set out to create a solution that struck the perfect balance between power and usability.
            </p>
            <p className="text-white leading-relaxed">
              Since our founding in 2018, we've grown from a small startup to a company serving thousands of teams worldwide. Through continuous innovation and a deep commitment to our users' success, we've built a platform that transforms how teams work together and deliver results.
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-black rounded-xl p-6 shadow-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-md group"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4 text-white group-hover:bg-black/80 transition-all duration-300 border border-white/20">
                  {value.icon}
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">{value.title}</h4>
                <p className="text-white/70">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
