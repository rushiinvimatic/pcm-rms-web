import React from 'react';
import { MultiStepApplicationForm } from '../../components/forms/MultiStepApplicationForm';

export const NewApplicationPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <MultiStepApplicationForm />
    </div>
  );
};