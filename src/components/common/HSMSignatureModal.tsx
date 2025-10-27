import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { OTPModal } from './OTPModal';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Key,
  Lock,
  Fingerprint,
  X,
  Download,
  Eye
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'certificate' | 'recommended_form' | 'other';
  status: 'pending' | 'signed' | 'failed';
  signedBy?: string;
  signedDate?: string;
  signatureHash?: string;
  downloadUrl?: string;
}

interface SignatureRequest {
  documentId: string;
  documentName: string;
  applicantName: string;
  applicationNumber: string;
  stage: 'executive_stage1' | 'city_stage1' | 'executive_stage2' | 'city_stage2';
  officerRole: string;
}

interface HSMSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  signatureRequest: SignatureRequest | null;
  documents: Document[];
  onSignDocument: (documentId: string, pin: string, otp: string) => Promise<void>;
  isLoading?: boolean;
}

export const HSMSignatureModal: React.FC<HSMSignatureModalProps> = ({
  isOpen,
  onClose,
  signatureRequest,
  documents,
  onSignDocument,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'verify' | 'pin' | 'otp' | 'signing'>('verify');
  const [pin, setPin] = useState('');
  const [otpModal, setOtpModal] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState<'idle' | 'signing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (isOpen) {
      setStep('verify');
      setPin('');
      setSignatureStatus('idle');
    }
  }, [isOpen]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin || pin.length < 4) {
      toast({
        variant: "destructive",
        title: "Invalid PIN",
        description: "Please enter a valid 4-digit PIN.",
      });
      return;
    }

    // Simulate PIN verification
    setStep('otp');
    setOtpModal(true);
  };

  const handleOTPVerify = async (otp: string) => {
    if (!signatureRequest) return;

    try {
      setStep('signing');
      setSignatureStatus('signing');
      setOtpModal(false);

      await onSignDocument(signatureRequest.documentId, pin, otp);
      
      setSignatureStatus('success');
      
      toast({
        title: "Document Signed Successfully",
        description: "The document has been digitally signed using HSM.",
      });

      // Auto-close after successful signing
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error signing document:', error);
      setSignatureStatus('failed');
      
      toast({
        variant: "destructive",
        title: "Signature Failed",
        description: "Failed to sign document. Please try again.",
      });
    }
  };

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'certificate':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'recommended_form':
        return <FileText className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'signed':
        return <Badge className="bg-green-100 text-green-800">Signed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600">Unknown</Badge>;
    }
  };

  const getStageTitle = (stage: SignatureRequest['stage']) => {
    switch (stage) {
      case 'executive_stage1':
        return 'Executive Engineer - Stage 1 Signature';
      case 'city_stage1':
        return 'City Engineer - Stage 1 Signature';
      case 'executive_stage2':
        return 'Executive Engineer - Stage 2 Signature';
      case 'city_stage2':
        return 'City Engineer - Final Signature';
      default:
        return 'Digital Signature';
    }
  };

  if (!isOpen || !signatureRequest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">HSM Digital Signature</h2>
                <p className="text-gray-600 text-sm">
                  {getStageTitle(signatureRequest.stage)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={signatureStatus === 'signing'}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Application Details */}
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Application Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-600">Application:</span>
                <span className="ml-2 text-blue-900 font-medium">
                  {signatureRequest.applicationNumber}
                </span>
              </div>
              <div>
                <span className="text-blue-600">Applicant:</span>
                <span className="ml-2 text-blue-900 font-medium">
                  {signatureRequest.applicantName}
                </span>
              </div>
              <div>
                <span className="text-blue-600">Document:</span>
                <span className="ml-2 text-blue-900 font-medium">
                  {signatureRequest.documentName}
                </span>
              </div>
              <div>
                <span className="text-blue-600">Your Role:</span>
                <span className="ml-2 text-blue-900 font-medium">
                  {signatureRequest.officerRole}
                </span>
              </div>
            </div>
          </Card>

          {/* Documents to be Signed */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Documents</h3>
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getDocumentIcon(document.type)}
                    <div>
                      <p className="font-medium text-gray-900">{document.name}</p>
                      <p className="text-sm text-gray-600">
                        Type: {document.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(document.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {document.downloadUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Process Steps */}
          <div className="mb-6">
            {step === 'verify' && (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Before You Sign</h4>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• Verify all application details are correct</li>
                        <li>• Ensure all required documents are attached</li>
                        <li>• Confirm you have authority to sign this document</li>
                        <li>• This signature will be legally binding and traceable</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={signatureStatus === 'signing'}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setStep('pin')}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={signatureStatus === 'signing'}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Proceed to Sign
                  </Button>
                </div>
              </div>
            )}

            {step === 'pin' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <Lock className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Enter HSM PIN</h3>
                  <p className="text-sm text-gray-600">
                    Enter your Hardware Security Module PIN to proceed
                  </p>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="hsm-pin">HSM PIN</Label>
                    <Input
                      id="hsm-pin"
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter 4-digit PIN"
                      maxLength={4}
                      className="text-center text-lg tracking-widest"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('verify')}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !pin || pin.length < 4}
                      className="flex-1"
                    >
                      Verify PIN
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {step === 'signing' && (
              <div className="text-center space-y-4">
                {signatureStatus === 'signing' && (
                  <>
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <div>
                      <h3 className="font-medium text-gray-900">Signing Document...</h3>
                      <p className="text-sm text-gray-600">
                        Please wait while we apply your digital signature
                      </p>
                    </div>
                  </>
                )}

                {signatureStatus === 'success' && (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                    <div>
                      <h3 className="font-medium text-green-900">Signature Applied Successfully</h3>
                      <p className="text-sm text-green-700">
                        The document has been digitally signed and is cryptographically secure
                      </p>
                    </div>
                  </>
                )}

                {signatureStatus === 'failed' && (
                  <>
                    <X className="w-16 h-16 text-red-600 mx-auto" />
                    <div>
                      <h3 className="font-medium text-red-900">Signature Failed</h3>
                      <p className="text-sm text-red-700">
                        There was an error signing the document. Please try again.
                      </p>
                    </div>
                    <Button
                      onClick={() => setStep('verify')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Try Again
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Security Information */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Fingerprint className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Security Features</h4>
                <ul className="text-sm text-green-700 mt-1 space-y-1">
                  <li>• Hardware Security Module (HSM) based signatures</li>
                  <li>• Tamper-proof cryptographic operations</li>
                  <li>• Audit trail with timestamp and officer identification</li>
                  <li>• Compliant with Digital Signature Certificate standards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* OTP Modal */}
      {otpModal && (
        <OTPModal
          isOpen={otpModal}
          onClose={() => {
            setOtpModal(false);
            setStep('pin');
          }}
          onVerify={handleOTPVerify}
          title="Verify OTP for Digital Signature"
          description="Enter the OTP sent to your registered mobile number to complete the signature process."
          loading={signatureStatus === 'signing'}
        />
      )}
    </div>
  );
};