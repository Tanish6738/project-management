import React, { useState } from 'react';

const Pricing = () => {
  const [annual, setAnnual] = useState(true);
  
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams and startups',
      price: annual ? 29 : 39,
      features: [
        'Up to 10 team members',
        'Unlimited projects',
        'Basic analytics',
        '5GB storage',
        'Email support'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      description: 'Ideal for growing teams and businesses',
      price: annual ? 79 : 99,
      features: [
        'Up to 50 team members',
        'Unlimited projects',
        'Advanced analytics',
        '50GB storage',
        'Priority email support',
        'Custom workflows',
        'API access'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with complex needs',
      price: 'Custom',
      features: [
        'Unlimited team members',
        'Unlimited projects',
        'Advanced analytics with custom reports',
        'Unlimited storage',
        '24/7 dedicated support',
        'Custom workflows',
        'API access',
        'SSO & advanced security',
        'Dedicated account manager'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Flexible Pricing for Teams of All Sizes
          </h2>
          <div className="h-1 w-20 bg-indigo-500 mx-auto mb-6"></div>
          <p className="text-lg text-slate-600 mb-8">
            Choose the plan that works best for your team. All plans include a 14-day free trial.
          </p>
          
          {/* Pricing toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 text-sm font-medium ${annual ? 'text-slate-900' : 'text-slate-500'}`}>Annual</span>
            <button 
              onClick={() => setAnnual(!annual)} 
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 focus:outline-none"
              role="switch"
              aria-checked={!annual}
            >
              <span className="sr-only">Toggle billing frequency</span>
              <span 
                className={`${annual ? 'translate-x-1' : 'translate-x-6'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out`} 
              />
            </button>
            <span className={`ml-3 text-sm font-medium ${!annual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
            {annual && <span className="ml-3 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Save 20%</span>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl ${plan.popular ? 'border-2 border-indigo-500 shadow-xl' : 'border border-slate-200 shadow-lg'} bg-white overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider transform translate-x-2 -translate-y-0 rotate-45 origin-bottom-left">
                  Popular
                </div>
              )}
              
              <div className="p-8 flex-grow">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  {typeof plan.price === 'number' ? (
                    <>
                      <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-slate-600 ml-2">/month</span>
                      {annual && <span className="block text-sm text-slate-500 mt-1">Billed annually</span>}
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="px-8 pb-8">
                <button 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Need a custom solution?</h3>
          <p className="text-slate-600 mb-6">
            We offer tailored solutions for enterprises with specific requirements. Our team will work with you to create a custom plan that meets your unique needs.
          </p>
          <button className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-3 rounded-lg font-medium transition-all duration-300">
            Contact Our Sales Team
          </button>
        </div>
        
        <div className="mt-16 bg-slate-50 rounded-xl p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Frequently Asked Questions</h3>
              <p className="text-slate-600">
                Can't find the answer you're looking for? Reach out to our customer support team.
              </p>
            </div>
            <div className="md:w-1/3">
              <a href="#contact" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                View all FAQs
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
