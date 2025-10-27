import React, { useState } from 'react';
import { ProfessionalDetailsStep } from './ProfessionalDetailsStep';
import { PersonalInfoStep } from './PersonalInfoStep';
import { ReviewStep } from './ReviewStep';
import { DocumentUploadStep } from './DocumentUploadStep';
import { useNavigate, useNavigation } from 'react-router-dom';
import type { ApplicationFormData } from '../../types/application';

type Step = 'personal' | 'professional' | 'documents' | 'review';

export const ApplicationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [formData, setFormData] = useState<Partial<ApplicationFormData>>({});
  const navigate = useNavigate();

  const updateFormData = (data: Partial<ApplicationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'personal':
        setCurrentStep('professional');
        break;
      case 'professional':
        setCurrentStep('documents');
        break;
      case 'documents':
        setCurrentStep('review');
        break;
    }
  };

  const handlePrevStep = () => {
    switch (currentStep) {
      case 'professional':
        setCurrentStep('personal');
        break;
      case 'documents':
        setCurrentStep('professional');
        break;
      case 'review':
        setCurrentStep('documents');
        break;
    }
  };

  const handleSubmit = async () => {
    try {
      // Submit form data to API
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();
      
      // Show success message and redirect to tracking page
      navigate(`/applications/${result.applicationId}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      // Show error toast
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Application Form</h1>
        <p className="text-gray-600 mt-2">
          Please fill out all required information carefully
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {['Personal Information', 'Professional Details', 'Documents', 'Review'].map((step, index) => (
            <div
              key={step}
              className={`flex items-center ${
                index < getStepNumber(currentStep)
                  ? 'text-blue-600'
                  : index === getStepNumber(currentStep)
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  index < getStepNumber(currentStep)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : index === getStepNumber(currentStep)
                    ? 'border-blue-600 text-blue-600'
                    : 'border-gray-400'
                }`}
              >
                {index < getStepNumber(currentStep) ? '✓' : index + 1}
              </div>
              <span className="ml-2 text-sm font-medium">{step}</span>
              {index < 3 && (
                <div
                  className={`h-0.5 w-12 mx-4 ${
                    index < getStepNumber(currentStep)
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white rounded-lg shadow p-6">
        {currentStep === 'personal' && (
          <PersonalInfoStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNextStep}
          />
        )}

        {currentStep === 'professional' && (
          <ProfessionalDetailsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        )}

        {currentStep === 'documents' && (
          <DocumentUploadStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        )}

        {currentStep === 'review' && (
          <ReviewStep
            data={formData}
            onSubmit={handleSubmit}
            onPrev={handlePrevStep}
          />
        )}
      </div>
    </div>
  );
};

// Helper function to convert step to number
const getStepNumber = (step: Step): number => {
  switch (step) {
    case 'personal':
      return 0;
    case 'professional':
      return 1;
    case 'documents':
      return 2;
    case 'review':
      return 3;
  }
};