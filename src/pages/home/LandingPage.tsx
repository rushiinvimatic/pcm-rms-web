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
        <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12 md:py-24 overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500 rounded-full opacity-10"></div>
            <div className="absolute right-10 bottom-10 w-60 h-60 bg-blue-400 rounded-full opacity-5"></div>
            <div className="absolute right-1/3 top-1/4 w-20 h-20 bg-blue-300 rounded-full opacity-10"></div>
          </div>
          
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
            <div className="md:w-1/2 mb-10 md:mb-0 animate-fadeIn">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                PMC Registration Management System
              </h1>
              <p className="text-xl mb-8 text-blue-100 max-w-lg">
                A streamlined digital platform for processing municipal registration applications with efficiency and transparency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl" 
                  asChild
                >
                  <Link to="/auth/login">Login as Citizen</Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-blue-800 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1" 
                  asChild
                >
                  <Link to="/auth/officer-login">Login as Officer</Link>
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
        <section id="services-section" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className={cn(
              "transition-all duration-700 transform",
              isVisible.services ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">Our Services</h2>
              <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
                We provide a comprehensive suite of services to make the registration process smooth and efficient
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Application Submission',
                    description: 'Submit your registration applications online with ease and convenience, anytime and anywhere',
                    icon: (
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ),
                    delay: 0,
                  },
                  {
                    title: 'Document Verification',
                    description: 'Transparent verification process with real-time status updates at every stage',
                    icon: (
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    ),
                    delay: 100,
                  },
                  {
                    title: 'Certificate Issuance',
                    description: 'Receive your certificates digitally after approval, with secure and tamper-proof verification',
                    icon: (
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    ),
                    delay: 200,
                  }
                ].map((service, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1",
                      "border-t-4 border-blue-600",
                      isVisible.services ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                    )}
                    style={{ transitionDelay: `${service.delay}ms` }}
                  >
                    <div className="mb-6 p-3 bg-blue-50 inline-block rounded-lg">{service.icon}</div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Status tracking section */}
        <section id="tracking-section" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className={cn(
                "md:w-1/2 mb-8 md:mb-0 transition-all duration-700",
                isVisible.tracking ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              )}>
                <h2 className="text-3xl md:text-4xl font-semibold mb-4">Track Your Application</h2>
                <div className="h-1 w-24 bg-blue-600 mb-6"></div>
                <p className="text-gray-600 mb-8 text-lg max-w-lg">
                  Stay informed about your application status with our transparent tracking system. 
                  Know exactly where your application is in the approval process at any time.
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                  size="lg"
                  asChild
                >
                  <Link to="/auth/login">Track Your Application</Link>
                </Button>
              </div>
              <div className={cn(
                "md:w-1/2 flex justify-center transition-all duration-700",
                isVisible.tracking ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              )}>
                <div className="w-full max-w-md p-8 bg-white border border-gray-100 rounded-xl shadow-xl">
                  <h3 className="text-lg font-semibold mb-6 text-gray-800">Application #PMC-20231005-782</h3>
                  <div className="space-y-6">
                    {[
                      { name: 'Submitted', date: '02 Oct 2023', status: 'completed' },
                      { name: 'Document Verification', date: '03 Oct 2023', status: 'completed' },
                      { name: 'Junior Engineer', date: '05 Oct 2023', status: 'completed' },
                      { name: 'Assistant Engineer', date: null, status: 'current' },
                      { name: 'Payment', date: null, status: 'pending' },
                      { name: 'Certificate Issued', date: null, status: 'pending' }
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="mr-3">
                  <PMCLogo size="small" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">PMCRMS</h3>
                  <p className="text-xs text-gray-400">Pune Municipal Corporation</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-3 max-w-md">
                Pune Municipal Corporation Registration Management System. Streamlining the registration process for citizens with digital efficiency and transparency.
              </p>
            </div>
            <div className="md:pl-12">
              <h4 className="text-lg font-medium mb-4 relative inline-block">
                Quick Links
                <span className="absolute bottom-0 left-0 h-0.5 w-10 bg-blue-500"></span>
              </h4>
              <ul className="space-y-3 mt-5">
                {['Home', 'Services', 'About Us', 'Contact', 'FAQ', 'Help'].map((item, index) => (
                  <li key={index}>
                    <Link 
                      to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center"
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
              <h4 className="text-lg font-medium mb-4 relative inline-block">
                Contact
                <span className="absolute bottom-0 left-0 h-0.5 w-10 bg-blue-500"></span>
              </h4>
              <ul className="space-y-3 mt-5">
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-400 text-sm">PMC Building, Main Road<br/>Pune, Maharashtra 411001</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400 text-sm">support@pmcrms.gov.in</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-400 text-sm">+91 20 2345 6789</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-4 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">© {new Date().getFullYear()} Pune Municipal Corporation. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-800 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};