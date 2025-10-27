import React from 'react';
import { cn } from '../../../utils/cn';

interface StatusProgressProps {
  currentStatus: string;
  className?: string;
}

const statusSteps = [
  { key: 'SUBMITTED', label: 'Submitted', description: 'Application received' },
  { key: 'ASSIGNED_TO_JE', label: 'JE Review', description: 'Assigned to Junior Engineer' },
  { key: 'APPOINTMENT_SCHEDULED', label: 'Appointment', description: 'Appointment scheduled' },
  { key: 'DOCUMENTS_VERIFIED', label: 'Verified', description: 'Documents verified' },
  { key: 'FORWARDED_TO_AE', label: 'AE Review', description: 'With Assistant Engineer' },
  { key: 'REVIEWED_BY_AE', label: 'AE Approved', description: 'Assistant Engineer approved' },
  { key: 'FORWARDED_TO_EE', label: 'EE Stage 1', description: 'With Executive Engineer' },
  { key: 'SIGNED_BY_EE_STAGE1', label: 'EE Signed', description: 'Executive Engineer signed' },
  { key: 'FORWARDED_TO_CE_STAGE1', label: 'CE Stage 1', description: 'With City Engineer' },
  { key: 'APPROVED_BY_CE_STAGE1', label: 'CE Approved', description: 'City Engineer approved' },
  { key: 'PAYMENT_PENDING', label: 'Payment', description: 'Payment required' },
  { key: 'PAYMENT_COMPLETED', label: 'Paid', description: 'Payment completed' },
  { key: 'FORWARDED_TO_CLERK', label: 'Clerk', description: 'With Clerk' },
  { key: 'PROCESSED_BY_CLERK', label: 'Processed', description: 'Clerk processed' },
  { key: 'FORWARDED_TO_EE_STAGE2', label: 'EE Stage 2', description: 'Final EE review' },
  { key: 'SIGNED_BY_EE_STAGE2', label: 'EE Final', description: 'EE final signature' },
  { key: 'FORWARDED_TO_CE_STAGE2', label: 'CE Stage 2', description: 'Final CE review' },
  { key: 'SIGNED_BY_CE_STAGE2', label: 'CE Final', description: 'CE final signature' },
  { key: 'CERTIFICATE_ISSUED', label: 'Issued', description: 'Certificate issued' },
];

export const StatusProgress: React.FC<StatusProgressProps> = ({ 
  currentStatus, 
  className 
}) => {
  const currentIndex = statusSteps.findIndex(step => step.key === currentStatus);
  
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {statusSteps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;
          
          return (
            <div key={step.key} className="flex items-center min-w-0">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors",
                    {
                      "bg-green-500 border-green-500 text-white": isCompleted,
                      "bg-blue-500 border-blue-500 text-white": isCurrent,
                      "bg-gray-200 border-gray-300 text-gray-500": isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-1 text-center">
                  <div className={cn(
                    "text-xs font-medium",
                    {
                      "text-green-600": isCompleted,
                      "text-blue-600": isCurrent,
                      "text-gray-500": isUpcoming,
                    }
                  )}>
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 max-w-16 truncate">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < statusSteps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8 mx-2 transition-colors",
                    {
                      "bg-green-500": isCompleted,
                      "bg-blue-500": isCurrent && index === currentIndex - 1,
                      "bg-gray-300": isUpcoming || (isCurrent && index !== currentIndex - 1),
                    }
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};