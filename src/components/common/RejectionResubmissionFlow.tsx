import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  XCircle,
  RefreshCw,
  FileText,
  Calendar,
  User,
  MessageSquare,
  CheckCircle,
  Edit,
  Upload
} from 'lucide-react';

interface RejectionReason {
  id: string;
  category: string;
  reason: string;
  officerName: string;
  rejectedDate: string;
  stage: string;
  requiresResubmission: boolean;
  specificFields?: string[];
}

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  submissionDate: string;
  rejectionReasons: RejectionReason[];
  canResubmit: boolean;
  resubmissionDeadline?: string;
}

interface RejectionResubmissionProps {
  application: Application;
  onResubmit: () => void;
  onEditApplication: () => void;
}

export const RejectionResubmissionFlow: React.FC<RejectionResubmissionProps> = ({
  application,
  onResubmit,
  onEditApplication
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState<RejectionReason | null>(null);

  const getReasonCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'documents':
        return 'bg-red-100 text-red-800';
      case 'information':
        return 'bg-yellow-100 text-yellow-800';
      case 'verification':
        return 'bg-orange-100 text-orange-800';
      case 'compliance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'documents':
        return <FileText className="w-4 h-4" />;
      case 'information':
        return <User className="w-4 h-4" />;
      case 'verification':
        return <CheckCircle className="w-4 h-4" />;
      case 'compliance':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const handleResubmit = async () => {
    try {
      setIsResubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Application Resubmitted",
        description: "Your application has been resubmitted successfully and is now under review.",
      });
      
      onResubmit();
      
    } catch (error) {
      console.error('Error resubmitting application:', error);
      toast({
        variant: "destructive",
        title: "Resubmission Failed",
        description: "Failed to resubmit application. Please try again.",
      });
    } finally {
      setIsResubmitting(false);
    }
  };

  const isDeadlinePassed = application.resubmissionDeadline 
    ? new Date() > new Date(application.resubmissionDeadline)
    : false;

  return (
    <div className="space-y-6">
      {/* Application Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Application Rejected</h2>
              <p className="text-gray-600">Application #{application.applicationNumber}</p>
            </div>
          </div>
          <Badge className="bg-red-100 text-red-800">Rejected</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Originally Submitted</p>
              <p className="font-medium">
                {new Date(application.submissionDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Rejection Count</p>
              <p className="font-medium">{application.rejectionReasons.length} issue(s)</p>
            </div>
          </div>
          
          {application.resubmissionDeadline && (
            <div className="flex items-center space-x-2">
              <AlertCircle className={`w-4 h-4 ${isDeadlinePassed ? 'text-red-500' : 'text-yellow-500'}`} />
              <div>
                <p className="text-sm text-gray-600">Resubmission Deadline</p>
                <p className={`font-medium ${isDeadlinePassed ? 'text-red-700' : 'text-yellow-700'}`}>
                  {new Date(application.resubmissionDeadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {isDeadlinePassed && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Resubmission Deadline Passed</h3>
                <p className="text-sm text-red-700 mt-1">
                  The deadline for resubmitting this application has passed. You may need to start a new application.
                  Please contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Rejection Reasons */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reasons</h3>
        <p className="text-gray-600 mb-4">
          Please review the following issues identified during the review process:
        </p>

        <div className="space-y-4">
          {application.rejectionReasons.map((reason, index) => (
            <div
              key={reason.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedReason?.id === reason.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedReason(selectedReason?.id === reason.id ? null : reason)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getReasonIcon(reason.category)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getReasonCategoryColor(reason.category)}>
                        {reason.category}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Stage: {reason.stage}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Issue #{index + 1}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">
                    {reason.reason}
                  </h4>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{reason.officerName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(reason.rejectedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {reason.specificFields && reason.specificFields.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Affected fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {reason.specificFields.map((field) => (
                          <Badge key={field} className="bg-gray-100 text-gray-700 text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Resubmission Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Resubmit</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-blue-600">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Review All Issues</h4>
              <p className="text-sm text-gray-600">
                Carefully review each rejection reason above and understand what needs to be corrected.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-blue-600">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Edit Your Application</h4>
              <p className="text-sm text-gray-600">
                Update the required information, upload new documents, and make necessary corrections.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-blue-600">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Resubmit for Review</h4>
              <p className="text-sm text-gray-600">
                Once all issues are addressed, resubmit your application for review.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onEditApplication}
          disabled={!application.canResubmit || isDeadlinePassed}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Application
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate('/user/support')}
          className="flex-1"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
      </div>

      {/* Additional Information */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Important Notes</h4>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1 list-disc list-inside">
              <li>Address all rejection reasons before resubmitting</li>
              <li>Ensure all required documents are uploaded and valid</li>
              <li>Double-check all information for accuracy</li>
              <li>You will receive an email confirmation after resubmission</li>
              {application.resubmissionDeadline && (
                <li>
                  Resubmit before {new Date(application.resubmissionDeadline).toLocaleDateString()} 
                  to avoid starting a new application
                </li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};