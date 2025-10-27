import React from 'react';
import { MultiStepApplicationForm } from '../../components/forms/MultiStepApplicationForm';

export const NewApplicationPage: React.FC = () => {
  return (
    <div className="py-6">
      <MultiStepApplicationForm />
    </div>
  );
};