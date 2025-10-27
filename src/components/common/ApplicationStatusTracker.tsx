import React from 'react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Calendar,
  User,
  FileText,
  MessageSquare
} from 'lucide-react';

interface StatusStep {
  id: string;
  title: string;
  position: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  completedDate?: string;
  comments?: string;
  rejectionReason?: string;
  officerName?: string;
  expectedDuration?: string;
}

interface ApplicationStatusTrackerProps {
  applicationNumber: string;
  currentStatus: string;
  submissionDate: string;
  steps: StatusStep[];
  showDetails?: boolean;
}

export const ApplicationStatusTracker: React.FC<ApplicationStatusTrackerProps> = ({
  applicationNumber,
  currentStatus,
  submissionDate,
  steps,
  showDetails = false
}) => {
  const getStatusIcon = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'current':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-gray-100 text-gray-600">Pending</Badge>;
    }
  };

  const getStepColor = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'current':
        return 'border-blue-500 bg-blue-50';
      case 'rejected':
        return 'border-red-500 bg-red-50';
      case 'pending':
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getConnectorColor = (currentStatus: StatusStep['status']) => {
    if (currentStatus === 'completed') {
      return 'bg-green-500';
    } else if (currentStatus === 'rejected') {
      return 'bg-red-500';
    } else if (currentStatus === 'current') {
      return 'bg-blue-500';
    }
    return 'bg-gray-300';
  };

  const currentStep = steps.find(step => step.status === 'current');
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Application Status</h2>
          <p className="text-gray-600 text-sm">Track your application progress</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Application #</p>
          <p className="font-medium text-gray-900">{applicationNumber}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600">{completedSteps} of {totalSteps} steps completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Current Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-blue-600">Current Status</p>
            <p className="font-medium text-blue-900">{currentStatus}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <Calendar className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm text-green-600">Submitted On</p>
            <p className="font-medium text-green-900">
              {new Date(submissionDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {currentStep && (
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <User className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-600">Current Stage</p>
              <p className="font-medium text-yellow-900">{currentStep.position}</p>
            </div>
          </div>
        )}
      </div>

      {/* Steps Timeline */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-16 -translate-x-0.5">
                <div 
                  className={`w-full h-full ${getConnectorColor(step.status)}`}
                />
              </div>
            )}
            
            {/* Step Card */}
            <div className={`border-2 rounded-lg p-4 ${getStepColor(step.status)}`}>
              <div className="flex items-start space-x-4">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(step.status)}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.position}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(step.status)}
                    </div>
                  </div>
                  
                  {/* Step Details */}
                  <div className="space-y-2">
                    {step.completedDate && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          Completed on {new Date(step.completedDate).toLocaleDateString()} 
                          at {new Date(step.completedDate).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    
                    {step.officerName && (
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Officer: {step.officerName}</span>
                      </div>
                    )}
                    
                    {step.expectedDuration && step.status === 'current' && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Expected duration: {step.expectedDuration}</span>
                      </div>
                    )}
                    
                    {step.comments && showDetails && (
                      <div className="flex items-start space-x-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="bg-white p-2 rounded border">
                          <span className="text-gray-700">{step.comments}</span>
                        </div>
                      </div>
                    )}
                    
                    {step.rejectionReason && (
                      <div className="flex items-start space-x-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="bg-red-50 border border-red-200 p-2 rounded">
                          <p className="text-red-800 font-medium">Rejection Reason:</p>
                          <p className="text-red-700">{step.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Items for Current Step */}
                  {step.status === 'current' && (
                    <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-1">What's happening now?</h4>
                      <p className="text-sm text-blue-800">
                        Your application is currently being reviewed by the {step.position}. 
                        {step.expectedDuration && ` This process typically takes ${step.expectedDuration}.`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Steps Information */}
      {currentStep && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Next Steps</h3>
          <p className="text-sm text-gray-700">
            Once the {currentStep.position} completes their review, your application will 
            {steps.findIndex(s => s.id === currentStep.id) < steps.length - 1 
              ? ` move to the next stage: ${steps[steps.findIndex(s => s.id === currentStep.id) + 1]?.position}`
              : ' be finalized and your certificate will be ready for download'
            }.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            You will receive an email notification when there's an update to your application status.
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Have questions about your application?{' '}
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Contact Support
          </button>
        </p>
      </div>
    </Card>
  );
};