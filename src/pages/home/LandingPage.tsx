import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { MainHeader } from '../../components/common/MainHeader';
import { PMCLogo } from '../../components/common/PMCLogo';
import { cn } from '../../utils/cn';

export const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState({
    services: false,
    tracking: false
  });

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '-50px'
    };

    const serviceObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, services: true }));
        }
      },
      observerOptions
    );

    const trackingObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, tracking: true }));
        }
      },
      observerOptions
    );

    const servicesSection = document.getElementById('services-section');
    const trackingSection = document.getElementById('tracking-section');

    if (servicesSection) serviceObserver.observe(servicesSection);
    if (trackingSection) trackingObserver.observe(trackingSection);

    return () => {
      if (servicesSection) serviceObserver.unobserve(servicesSection);
      if (trackingSection) trackingObserver.unobserve(trackingSection);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />
      
      {/* Main content with padding to offset fixed header */}
      <main className="flex-1 pt-16 md:pt-20">
        {/* Hero section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-16 md:py-28 overflow-hidden relative">
          {/* Government seal pattern background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.02\"%3E%3Cpath d=\"M30 0l30 30-30 30L0 30z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
            }}></div>
            <div className="absolute -left-10 -top-10 w-32 h-32 border-2 border-amber-400 rounded-full opacity-10"></div>
            <div className="absolute right-10 bottom-10 w-48 h-48 border border-blue-300 rounded-full opacity-5"></div>
            <div className="absolute right-1/3 top-1/4 w-16 h-16 border border-amber-300 rounded-full opacity-15"></div>
          </div>
          
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
            <div className="md:w-1/2 mb-10 md:mb-0 animate-fadeIn">
              <div className="flex items-center mb-4">
                <div className="h-1 w-16 bg-amber-400 mr-4"></div>
                <span className="text-amber-300 text-sm font-semibold tracking-widest uppercase">Government of Maharashtra</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-amber-300">Pune</span><br/>
                <span className="text-white">Municipal Corporation</span><br/>
                <span className="text-blue-200 text-3xl md:text-4xl lg:text-5xl">Registration Management System</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 max-w-lg leading-relaxed">
                Official digital gateway for municipal services. Secure, transparent, and efficient processing of citizen applications with full government compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-semibold px-8 py-3" 
                  asChild
                >
                  <Link to="/auth/login">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Citizen Portal
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-900 transition-all duration-300 transform hover:-translate-y-1 font-semibold px-8 py-3" 
                  asChild
                >
                  <Link to="/auth/officer-login">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Officer Login
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center animate-floatSlow">
              <div className="w-64 h-64 md:w-80 md:h-80 relative flex items-center justify-center">
                <PMCLogo size="xlarge" />
              </div>
            </div>
          </div>
        </section>

        {/* Services section */}
        <section id="services-section" className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4">
            <div className={cn(
              "transition-all duration-700 transform",
              isVisible.services ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <div className="text-center mb-16">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-1 w-16 bg-slate-800 mr-4"></div>
                  <span className="text-slate-600 text-sm font-medium tracking-wider uppercase">Municipal Services</span>
                  <div className="h-1 w-16 bg-slate-800 ml-4"></div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Government Services</h2>
                <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
                  Pune Municipal Corporation provides comprehensive digital services designed to serve citizens with transparency, efficiency, and accountability.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  {
                    title: 'Online Application System',
                    description: 'Secure digital platform for submitting municipal registration applications with 24/7 availability and real-time confirmation',
                    icon: (
                      <svg className="w-14 h-14 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ),
                    delay: 0,
                    badge: 'Digital Service'
                  },
                  {
                    title: 'Official Verification Process',
                    description: 'Government-compliant document verification with multi-level approval system ensuring accuracy and legal compliance',
                    icon: (
                      <svg className="w-14 h-14 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ),
                    delay: 100,
                    badge: 'Secure Process'
                  },
                  {
                    title: 'Digital Certificate Issuance',
                    description: 'Government-issued digital certificates with QR code verification, tamper-proof security, and instant download capability',
                    icon: (
                      <svg className="w-14 h-14 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    ),
                    delay: 200,
                    badge: 'Official Certificate'
                  }
                ].map((service, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2",
                      "border-l-4 border-slate-800 relative overflow-hidden",
                      isVisible.services ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                    )}
                    style={{ transitionDelay: `${service.delay}ms` }}
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-slate-50 to-transparent w-24 h-24 opacity-50"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-4 bg-slate-100 rounded-lg inline-block">{service.icon}</div>
                        <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">{service.badge}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-slate-900">{service.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Status tracking section */}
        <section id="tracking-section" className="py-24 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className={cn(
                "md:w-1/2 mb-12 md:mb-0 transition-all duration-700",
                isVisible.tracking ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              )}>
                <div className="flex items-center mb-6">
                  <div className="h-1 w-12 bg-amber-400 mr-4"></div>
                  <span className="text-amber-300 text-sm font-medium tracking-wider uppercase">Application Tracking</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Real-Time Application Status</h2>
                <p className="text-slate-300 mb-8 text-lg max-w-lg leading-relaxed">
                  Monitor your application progress through our secure government portal. Complete transparency at every stage of the approval process with official status updates.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-semibold"
                    size="lg"
                    asChild
                  >
                    <Link to="/auth/login">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Check Application Status
                    </Link>
                  </Button>
                </div>
              </div>
              <div className={cn(
                "md:w-1/2 flex justify-center transition-all duration-700",
                isVisible.tracking ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              )}>
                <div className="w-full max-w-md p-8 bg-white border-2 border-slate-200 rounded-xl shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Application Status</h3>
                      <p className="text-sm text-slate-600">#PMC-2024-REG-782</p>
                    </div>
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {[
                      { name: 'Application Received', date: '15 Oct 2024', status: 'completed' },
                      { name: 'Document Verification', date: '16 Oct 2024', status: 'completed' },
                      { name: 'Technical Review', date: '18 Oct 2024', status: 'completed' },
                      { name: 'Officer Approval', date: null, status: 'current' },
                      { name: 'Fee Payment', date: null, status: 'pending' },
                      { name: 'Certificate Generation', date: null, status: 'pending' }
                    ].map((step, index, steps) => (
                      <div key={index} className="relative">
                        {/* Vertical line connecting steps */}
                        {index < steps.length - 1 && (
                          <div 
                            className={`absolute left-4 ml-[2px] w-0.5 h-6 ${
                              step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                            style={{ top: '2rem' }}
                          />
                        )}
                        
                        <div className="flex items-center">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                            step.status === 'completed' ? 'bg-green-500' : 
                            step.status === 'current' ? 'bg-blue-500' : 
                            'bg-gray-200'
                          )}>
                            {step.status === 'completed' ? (
                              <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span className="text-white text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div className="ml-4 flex-grow">
                            <p className={cn(
                              "font-medium",
                              step.status === 'completed' ? 'text-green-600' : 
                              step.status === 'current' ? 'text-blue-600' : 
                              'text-gray-400'
                            )}>
                              {step.name}
                            </p>
                            {step.date ? (
                              <p className="text-xs text-gray-500">Completed on {step.date}</p>
                            ) : step.status === 'current' ? (
                              <p className="text-xs text-blue-500">In progress</p>
                            ) : null}
                          </div>
                          {step.status === 'current' && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 pb-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <PMCLogo size="medium" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">PMC Registration Portal</h3>
                  <p className="text-sm text-amber-400 font-medium">Pune Municipal Corporation</p>
                  <p className="text-xs text-slate-400 mt-1">Government of Maharashtra</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm max-w-md leading-relaxed mb-4">
                Official digital platform for Pune Municipal Corporation registration services. 
                Committed to transparency, efficiency, and citizen-centric governance.
              </p>
              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Secure Portal
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  24/7 Available
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white relative inline-block">
                Quick Links
                <span className="absolute bottom-0 left-0 h-0.5 w-12 bg-amber-400"></span>
              </h4>
              <ul className="space-y-3">
                {['Citizen Services', 'Application Status', 'Document Requirements', 'Support Center', 'RTI Portal'].map((item, index) => (
                  <li key={index}>
                    <Link 
                      to="#" 
                      className="text-slate-400 hover:text-amber-300 text-sm transition-colors duration-200 flex items-center"
                    >
                      <svg className="h-3 w-3 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white relative inline-block">
                Official Contact
                <span className="absolute bottom-0 left-0 h-0.5 w-12 bg-amber-400"></span>
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-3 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <p className="text-slate-300 text-sm font-medium">Municipal Corporation Office</p>
                    <p className="text-slate-400 text-sm">Pune, Maharashtra<br/>Maharashtra 411001</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-slate-300 text-sm font-medium">support@pmc.gov.in</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-slate-300 text-sm font-medium">+91 20 2742 5511</p>
                    <p className="text-slate-400 text-xs">Office Hours: 10:00 AM - 6:00 PM</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-8">
                <p className="text-sm text-slate-400">© {new Date().getFullYear()} Pune Municipal Corporation. All rights reserved.</p>
                <div className="flex items-center space-x-6 text-xs text-slate-500">
                  <a href="#" className="hover:text-amber-400 transition-colors duration-200">Privacy Policy</a>
                  <a href="#" className="hover:text-amber-400 transition-colors duration-200">Terms of Service</a>
                  <a href="#" className="hover:text-amber-400 transition-colors duration-200">RTI Act</a>
                  <a href="#" className="hover:text-amber-400 transition-colors duration-200">Accessibility</a>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-3">
                  <a href="#" className="text-slate-500 hover:text-amber-400 transition-colors duration-200" title="Government of Maharashtra">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                    </svg>
                  </a>
                  <a href="#" className="text-slate-500 hover:text-amber-400 transition-colors duration-200" title="Digital India">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};