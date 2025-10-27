import React, { useState } from 'react';
import { X, PenTool, CheckCircle, AlertCircle, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { certificateService } from '../../services/certificate.service';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  applicantName: string;
  certificateInfo: {
    status: number;
    certificateNumber?: string;
    executiveEngineerSignature?: any;
    cityEngineerSignature?: any;
  };
  userRole: 'EXECUTIVE_ENGINEER' | 'CITY_ENGINEER';
  onSignatureComplete: () => void;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  applicantName,
  certificateInfo,
  userRole,
  onSignatureComplete
}) => {
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isExecutiveEngineer = userRole === 'EXECUTIVE_ENGINEER';
  const isCityEngineer = userRole === 'CITY_ENGINEER';

  // Check if ready for signature
  const isReadyForSignature = () => {
    if (isExecutiveEngineer) {
      return certificateService.isReadyForExecutiveSignature(certificateInfo.status);
    }
    if (isCityEngineer) {
      return certificateService.isReadyForCitySignature(certificateInfo.status);
    }
    return false;
  };

  // Check if already signed
  const isAlreadySigned = () => {
    if (isExecutiveEngineer) {
      return certificateInfo.executiveEngineerSignature?.isValid;
    }
    if (isCityEngineer) {
      return certificateInfo.cityEngineerSignature?.isValid;
    }
    return false;
  };

  const handleDigitalSignature = async () => {
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (isExecutiveEngineer) {
        result = await certificateService.addExecutiveEngineerSignature(applicationId, comments);
      } else if (isCityEngineer) {
        result = await certificateService.addCityEngineerSignature(applicationId, comments);
      }

      if (result?.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onSignatureComplete();
          onClose();
          setShowSuccess(false);
        }, 2000);
      } else {
        alert(result?.message || 'Failed to add digital signature');
      }
    } catch (error) {
      console.error('Error adding digital signature:', error);
      alert('Failed to add digital signature. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setComments('');
      setShowSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <PenTool className="h-6 w-6 mr-2 text-blue-600" />
              Digital Signature Verification
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isExecutiveEngineer ? 'Executive Engineer' : 'City Engineer'} Digital Signature
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Digital signature added successfully!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              The certificate has been digitally signed and forwarded to the next stage.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Application Information */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Application Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><strong>Application ID:</strong> {applicationId}</div>
              <div><strong>Applicant Name:</strong> {applicantName}</div>
              <div><strong>Certificate Number:</strong> {certificateInfo.certificateNumber || 'Pending'}</div>
              <div><strong>Current Status:</strong> 
                <Badge className={`ml-2 ${certificateService.getCertificateStatusColor(certificateInfo.status)}`}>
                  {certificateService.getCertificateStatusLabel(certificateInfo.status)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Signature Status */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Signature Status</h4>
            <div className="space-y-3">
              {/* Executive Engineer Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Executive Engineer</span>
                <div className="flex items-center gap-2">
                  {certificateInfo.executiveEngineerSignature?.isValid ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Signed</span>
                    </>
                  ) : certificateService.isReadyForExecutiveSignature(certificateInfo.status) ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-600">Pending</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                      <span className="text-sm text-gray-500">Not Ready</span>
                    </>
                  )}
                </div>
              </div>

              {/* City Engineer Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">City Engineer</span>
                <div className="flex items-center gap-2">
                  {certificateInfo.cityEngineerSignature?.isValid ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Signed</span>
                    </>
                  ) : certificateService.isReadyForCitySignature(certificateInfo.status) ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-600">Pending</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                      <span className="text-sm text-gray-500">Not Ready</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Digital Signature Action */}
          {!isAlreadySigned() && isReadyForSignature() && (
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold mb-3 text-blue-800">
                Add {isExecutiveEngineer ? 'Executive Engineer' : 'City Engineer'} Digital Signature
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments or remarks for this signature..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleDigitalSignature}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <PenTool className="h-4 w-4" />
                        Add Digital Signature
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Already Signed Message */}
          {isAlreadySigned() && (
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Already Signed
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                You have already added your digital signature to this certificate.
              </p>
            </div>
          )}

          {/* Not Ready Message */}
          {!isAlreadySigned() && !isReadyForSignature() && (
            <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  Not Ready for Signature
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                {isExecutiveEngineer 
                  ? 'The certificate must be generated before Executive Engineer signature can be added.'
                  : 'The certificate must be signed by Executive Engineer before City Engineer signature can be added.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalSignatureModal;