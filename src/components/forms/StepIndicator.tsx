import React from 'react';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, className }) => {
  return (
    <div className={cn("mb-8 px-4 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100", className)}>
      {/* Mobile view - Simplified */}
      <div className="block lg:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 text-white text-sm font-bold shadow-md">
              {currentStep}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{steps[currentStep - 1]?.title}</p>
              <p className="text-xs text-gray-600">{steps[currentStep - 1]?.description}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-white px-3 py-1.5 rounded-full border border-blue-200 shadow-sm">
            Step {currentStep}/{steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop view - Full stepper */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Progress line background */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-300 rounded-full shadow-inner" style={{ 
            left: '2.5rem',
            right: '2.5rem'
          }} />
          
          {/* Progress line filled */}
          <div 
            className="absolute top-6 left-0 h-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transition-all duration-700 shadow-sm"
            style={{ 
              left: '2.5rem',
              width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 2.5rem)`
            }}
          />

          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isUpcoming = currentStep < step.id;

              return (
                <div key={step.id} className="flex flex-col items-center" style={{ flex: '1 1 0%' }}>
                  {/* Step circle */}
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all duration-300",
                        isCompleted && "bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg border-2 border-green-500",
                        isCurrent && "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl border-2 border-blue-500 ring-2 ring-blue-200",
                        isUpcoming && "bg-white border-2 border-gray-300 text-gray-500 shadow-md"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" strokeWidth={3} />
                      ) : (
                        <span className="text-base font-bold">{step.id}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Step label */}
                  <div className="mt-4 text-center max-w-[140px]">
                    <p
                      className={cn(
                        "text-sm font-bold transition-colors duration-300",
                        isCompleted && "text-green-700",
                        isCurrent && "text-blue-700",
                        isUpcoming && "text-gray-500"
                      )}
                    >
                      {step.title}
                    </p>
                    <p className={cn(
                      "text-xs mt-1 font-medium transition-colors duration-300",
                      isCompleted && "text-gray-600",
                      isCurrent && "text-gray-700",
                      isUpcoming && "text-gray-400"
                    )}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};