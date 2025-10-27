import React, { useState } from 'react';
import { Award, CreditCard, Download, Eye, PenTool, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { CertificateInfo } from '../../services/certificate.service';
import { certificateService } from '../../services/certificate.service';
import { CertificateStatus } from '../../types/application';
import { ApplicationFormViewer } from '../common/ApplicationFormViewer';
import DigitalSignatureModal from '../common/DigitalSignatureModal';

// Mock application data based on your provided structure
const mockApplication = {
  id: "6295bf7b-5684-4d34-b319-76ec4fa12e46",
  applicationNumber: "PMC_APPLICATION_2025_1",
  applicantId: "applicant-123",
  firstName: "Hinata",
  middleName: "Serban",
  lastName: "Hyuga",
  motherName: "Kushina Hyuga",
  mobileNumber: "+91-9876543210",
  emailAddress: "hinata.hyuga@konoha.com",
  positionType: 0, // Architect
  submissionDate: "2025-10-13T07:07:04.594084Z",
  bloodGroup: "A+",
  height: 165,
  gender: 1, // Female
  permanentAddress: {
    addressLine1: "123 Hyuga Compound",
    addressLine2: "Konoha Village",
    addressLine3: "Fire Country",
    city: "Konoha",
    state: "Fire Country",
    country: "Ninja World",
    pinCode: "100001"
  },
  currentAddress: {
    addressLine1: "123 Hyuga Compound",
    addressLine2: "Konoha Village", 
    addressLine3: "Fire Country",
    city: "Konoha",
    state: "Fire Country",
    country: "Ninja World",
    pinCode: "100001"
  },
  panCardNumber: "ABCDE1234F",
  aadharCardNumber: "1234-5678-9012",
  coaCardNumber: "COA123456",
  status: 11, // Payment Pending
  currentStage: 6,
  recommendedFormPath: "/forms/architect-form.pdf",
  documents: [
    {
      id: "doc-1",
      documentType: 1, // PAN Card
      filePath: "/documents/pan-card.pdf",
      fileName: "PAN Card - Hinata Hyuga.pdf",
      fileId: "file-pan-123"
    },
    {
      id: "doc-2", 
      documentType: 2, // Aadhar Card
      filePath: "/documents/aadhar-card.pdf",
      fileName: "Aadhar Card - Hinata Hyuga.pdf",
      fileId: "file-aadhar-123"
    },
    {
      id: "doc-3",
      documentType: 6, // COA Certificate
      filePath: "/documents/coa-certificate.pdf",
      fileName: "COA Certificate - Hinata Hyuga.pdf",
      fileId: "file-coa-123"
    }
  ]
};

export const CertificateFlowTest: React.FC = () => {
  const [stage, setStage] = useState<'challan' | 'payment' | 'certificate' | 'signature'>('challan');
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
  const [showApplicationViewer, setShowApplicationViewer] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<'EXECUTIVE_ENGINEER' | 'CITY_ENGINEER'>('EXECUTIVE_ENGINEER');
  const [loading, setLoading] = useState(false);

  // Mock data states
  const [challanGenerated, setChallanGenerated] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate Mock Challan
  const handleGenerateChallan = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const challanRequest = {
        challanNumber: `CHN-2025-10-${String(Date.now()).slice(-6)}`,
        name: `${mockApplication.firstName} ${mockApplication.lastName}`,
        position: 'Architect',
        amount: '5000',
        amountInWords: 'Five Thousand Rupees Only',
        date: new Date().toISOString(),
        applicationId: mockApplication.id
      };

      console.log('Generated Challan:', challanRequest);
      setChallanGenerated(true);
      setStage('payment');
    } catch (error) {
      console.error('Error generating challan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Complete Mock Payment
  const handleCompletePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Payment completed for application:', mockApplication.id);
      setPaymentCompleted(true);
      setStage('certificate');
    } catch (error) {
      console.error('Error completing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate Mock Certificate
  const handleGenerateCertificate = async () => {
    setLoading(true);
    try {
      // Generate certificate using service
      const mockCert = await certificateService.generateMockCertificate(mockApplication.id);
      setCertificateInfo(mockCert);
      setCertificateGenerated(true);
      setStage('signature');
      
      console.log('Generated Certificate:', mockCert);
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Digital Signature
  const handleAddSignature = async () => {
    if (!certificateInfo) return;
    
    setLoading(true);
    try {
      if (currentUserRole === 'EXECUTIVE_ENGINEER') {
        const signature = await certificateService.addMockExecutiveSignature(mockApplication.id);
        setCertificateInfo((prev: CertificateInfo | null) => prev ? {
          ...prev,
          status: CertificateStatus.EXECUTIVE_ENGINEER_SIGNED,
          executiveEngineerSignature: signature
        } : null);
        setCurrentUserRole('CITY_ENGINEER');
      } else {
        const signature = await certificateService.addMockCitySignature(mockApplication.id);
        setCertificateInfo((prev: CertificateInfo | null) => prev ? {
          ...prev,
          status: CertificateStatus.COMPLETED,
          cityEngineerSignature: signature
        } : null);
      }
      
      console.log('Added signature');
    } catch (error) {
      console.error('Error adding signature:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (filePath: string, fileName: string, isRecommendedForm?: boolean) => {
    console.log('Viewing document:', { filePath, fileName, isRecommendedForm });
    alert(`Would open document viewer for: ${fileName}`);
  };

  const handleDownloadDocument = (filePath: string, fileName: string, isRecommendedForm?: boolean) => {
    console.log('Downloading document:', { filePath, fileName, isRecommendedForm });
    alert(`Would download: ${fileName}`);
  };

  const handleSignatureComplete = () => {
    // Refresh certificate info
    if (certificateInfo) {
      if (currentUserRole === 'EXECUTIVE_ENGINEER') {
        setCertificateInfo((prev: CertificateInfo | null) => prev ? {
          ...prev,
          status: CertificateStatus.EXECUTIVE_ENGINEER_SIGNED
        } : null);
      } else {
        setCertificateInfo((prev: CertificateInfo | null) => prev ? {
          ...prev,
          status: CertificateStatus.COMPLETED
        } : null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Stage 2 Integration Test - Certificate & Digital Signature Flow
          </h1>
          <p className="text-gray-600">
            Testing challan generation, payment processing, certificate creation, and digital signature workflow
          </p>
          
          {/* Stage Progress */}
          <div className="flex items-center gap-4 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              stage === 'challan' ? 'bg-blue-100 text-blue-800' : challanGenerated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <CreditCard className="h-4 w-4" />
              Challan Generation
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              stage === 'payment' ? 'bg-blue-100 text-blue-800' : paymentCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <CreditCard className="h-4 w-4" />
              Payment Processing
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              stage === 'certificate' ? 'bg-blue-100 text-blue-800' : certificateGenerated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <Award className="h-4 w-4" />
              Certificate Generation
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              stage === 'signature' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <PenTool className="h-4 w-4" />
              Digital Signatures
            </div>
          </div>
        </div>

        {/* Application Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Application Summary</h2>
              <p className="text-gray-600">Application Number: {mockApplication.applicationNumber}</p>
            </div>
            <Button
              onClick={() => setShowApplicationViewer(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Full Application
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Applicant Name</div>
              <div className="font-medium">{mockApplication.firstName} {mockApplication.lastName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Position Type</div>
              <div className="font-medium">Architect</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <Badge className="bg-blue-100 text-blue-800">Payment Pending</Badge>
            </div>
          </div>
        </div>

        {/* Stage-based Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Challan Generation */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Challan Generation
            </h3>
            
            {!challanGenerated ? (
              <div className="space-y-4">
                <p className="text-gray-600">Generate challan for fee payment</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div><strong>Amount:</strong> ₹5,000</div>
                    <div><strong>Position:</strong> Architect</div>
                    <div><strong>Applicant:</strong> {mockApplication.firstName} {mockApplication.lastName}</div>
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateChallan}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate Challan'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Challan Generated Successfully</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div><strong>Challan Number:</strong> CHN-2025-10-{String(Date.now()).slice(-6)}</div>
                    <div><strong>Amount:</strong> ₹5,000</div>
                    <div><strong>Generated:</strong> {formatDate(new Date().toISOString())}</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Challan
                </Button>
              </div>
            )}
          </div>

          {/* Payment Processing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Processing
            </h3>
            
            {!paymentCompleted ? (
              <div className="space-y-4">
                {!challanGenerated ? (
                  <p className="text-gray-500">Generate challan first</p>
                ) : (
                  <>
                    <p className="text-gray-600">Process payment using BillDesk gateway</p>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm space-y-1">
                        <div><strong>Payment Amount:</strong> ₹5,000</div>
                        <div><strong>Gateway:</strong> BillDesk</div>
                        <div><strong>Status:</strong> Ready for Payment</div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleCompletePayment}
                      disabled={loading || !challanGenerated}
                      className="w-full"
                    >
                      {loading ? 'Processing...' : 'Complete Payment'}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Payment Completed Successfully</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div><strong>Transaction ID:</strong> TXN-{String(Date.now()).slice(-8)}</div>
                    <div><strong>Amount Paid:</strong> ₹5,000</div>
                    <div><strong>Payment Date:</strong> {formatDate(new Date().toISOString())}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Certificate Generation */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Certificate Generation
            </h3>
            
            {!certificateGenerated ? (
              <div className="space-y-4">
                {!paymentCompleted ? (
                  <p className="text-gray-500">Complete payment first</p>
                ) : (
                  <>
                    <p className="text-gray-600">Generate SE Certificate after payment verification</p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm space-y-1">
                        <div><strong>Certificate Type:</strong> SE Certificate</div>
                        <div><strong>Applicant:</strong> {mockApplication.firstName} {mockApplication.lastName}</div>
                        <div><strong>Position:</strong> Architect</div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleGenerateCertificate}
                      disabled={loading || !paymentCompleted}
                      className="w-full"
                    >
                      {loading ? 'Generating...' : 'Generate Certificate'}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Certificate Generated Successfully</span>
                </div>
                {certificateInfo && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm space-y-1">
                      <div><strong>Certificate Number:</strong> {certificateInfo.certificateNumber}</div>
                      <div><strong>Issue Date:</strong> {certificateInfo.issueDate ? formatDate(certificateInfo.issueDate) : 'Pending'}</div>
                      <div><strong>Status:</strong> 
                        <Badge className={`ml-2 ${certificateService.getCertificateStatusColor(certificateInfo.status)}`}>
                          {certificateService.getCertificateStatusLabel(certificateInfo.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Digital Signatures */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PenTool className="h-5 w-5 mr-2" />
              Digital Signatures
            </h3>
            
            {!certificateGenerated ? (
              <p className="text-gray-500">Generate certificate first</p>
            ) : (
              <div className="space-y-4">
                {certificateInfo && (
                  <>
                    <div className="space-y-3">
                      {/* Executive Engineer Signature */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">Executive Engineer</span>
                        <div className="flex items-center gap-2">
                          {certificateInfo.executiveEngineerSignature?.isValid ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Signed</span>
                            </>
                          ) : (
                            <>
                              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                              <span className="text-sm text-yellow-600">Pending</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* City Engineer Signature */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">City Engineer</span>
                        <div className="flex items-center gap-2">
                          {certificateInfo.cityEngineerSignature?.isValid ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Signed</span>
                            </>
                          ) : certificateInfo.executiveEngineerSignature?.isValid ? (
                            <>
                              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
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

                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-600 mb-3">
                        Current Role: <strong>{currentUserRole.replace('_', ' ')}</strong>
                      </div>
                      
                      {certificateInfo.status !== CertificateStatus.COMPLETED ? (
                        <div className="space-y-2">
                          <Button 
                            onClick={() => setShowSignatureModal(true)}
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? 'Processing...' : `Add ${currentUserRole.replace('_', ' ')} Signature`}
                          </Button>
                          <Button 
                            onClick={handleAddSignature}
                            disabled={loading}
                            variant="outline"
                            className="w-full"
                          >
                            {loading ? 'Processing...' : 'Quick Add (Mock)'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 justify-center">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">All Signatures Completed</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* API Test Results */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            API Integration Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded">
              <div className="font-medium text-green-800">Challan APIs</div>
              <div className="text-green-600">✓ Generate, Download, Status</div>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="font-medium text-green-800">Payment APIs</div>
              <div className="text-green-600">✓ Initiate, Status, View</div>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="font-medium text-green-800">Certificate APIs</div>
              <div className="text-green-600">✓ Generate, Info, Download</div>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="font-medium text-green-800">Signature APIs</div>
              <div className="text-green-600">✓ Executive, City Engineer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Viewer Modal */}
      <ApplicationFormViewer
        isOpen={showApplicationViewer}
        application={mockApplication}
        onClose={() => setShowApplicationViewer(false)}
        onViewDocument={handleViewDocument}
        onDownloadDocument={handleDownloadDocument}
      />

      {/* Digital Signature Modal */}
      {certificateInfo && (
        <DigitalSignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          applicationId={mockApplication.id}
          applicantName={`${mockApplication.firstName} ${mockApplication.lastName}`}
          certificateInfo={certificateInfo}
          userRole={currentUserRole}
          onSignatureComplete={handleSignatureComplete}
        />
      )}
    </div>
  );
};

export default CertificateFlowTest;