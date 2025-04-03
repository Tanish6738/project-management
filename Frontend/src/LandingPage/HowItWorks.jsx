import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Your Project',
      description: 'Set up your project in minutes with our intuitive interface. Define goals, timelines, and team members.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      number: '02',
      title: 'Assign Tasks',
      description: 'Distribute work efficiently among team members. Set priorities, deadlines, and dependencies.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      number: '03',
      title: 'Collaborate in Real-Time',
      description: 'Work together seamlessly with instant updates, comments, and file sharing capabilities.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      )
    },
    {
      number: '04',
      title: 'Track Progress & Succeed',
      description: 'Monitor project advancement with visual dashboards and analytics. Celebrate your success.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            How ProjectFlow Works
          </h2>
          <div className="h-1 w-20 bg-indigo-500 mx-auto mb-6"></div>
          <p className="text-lg text-slate-600">
            Our streamlined workflow takes you from project kickoff to successful completion in four simple steps.
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-blue-600 hidden lg:block"></div>
          
          <div className="space-y-24">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`flex flex-col lg:flex-row items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Step number for mobile */}
                  <div className="lg:hidden mb-6 flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                  
                  <div className="lg:w-1/2 lg:px-12">
                    <div className={`bg-white p-8 rounded-xl shadow-lg border border-slate-100 ${index % 2 === 0 ? 'lg:mr-12' : 'lg:ml-12'} relative z-10 hover:shadow-xl transition-shadow duration-300`}>
                      <div className="flex items-start mb-4">
                        <div className="bg-indigo-100 rounded-lg p-3 mr-4 text-indigo-600">
                          {step.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                          <p className="text-slate-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step number for desktop */}
                  <div className="hidden lg:flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xl shadow-lg absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    {step.number}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-24 text-center">
          <a href="#pricing" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
            Ready to get started?
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
