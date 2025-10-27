import React from 'react';
import { cn } from '../../utils/cn';

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
    <div className={cn("mb-8", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {/* Step circle */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold",
                  currentStep >= step.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-500"
                )}
              >
                {currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm">{step.id}</span>
                )}
              </div>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4",
                    currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                  )}
                />
              )}
            </div>
            
            {/* Step label */}
            <div className="mt-2 text-center">
              <p
                className={cn(
                  "text-sm font-medium",
                  currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                )}
              >
                {step.title}
              </p>
              <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};