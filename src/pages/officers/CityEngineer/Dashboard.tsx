import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card } from '../../../components/ui/card';
import { TaskList } from '../../../components/common/TaskList';
import { OTPModal } from '../../../components/common/OTPModal';
import { DocumentViewer } from '../../../components/common/DocumentViewer/DocumentViewer';
import { RefreshCw, FileText, Clock, CheckCircle, Award, Search } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { useLoading } from '../../../hooks/useLoading';
import { appointmentService } from '../../../services/appointment.service';
import { applicationService } from '../../../services/application.service';
import { fileService } from '../../../services/file.service';
import { ApplicationStage, DocumentType } from '../../../types/application';
import type { Application, ApplicationStatus, OTPVerificationData } from '../../../types/dashboard';

type TaskStage = 'stage1' | 'stage2';

export const CityEngineerDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedApplicationDetails, setSelectedApplicationDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TaskStage>('stage1');
  const [otpModal, setOtpModal] = useState<OTPVerificationData>({
    isVisible: false,
    purpose: 'approve',
  });
  const [signatureModal, setSignatureModal] = useState({
    isVisible: false,
    applicationId: '',
    stage: 1 as 1 | 2,
  });
  const [filters, setFilters] = useState({
    status: '',
    position: '',
    search: '',
  });
  const [documentViewer, setDocumentViewer] = useState({
    isOpen: false,
    documentUrl: '',
    documentName: '',
    documentType: 'pdf' as 'pdf' | 'image'
  });
  const { toast } = useToast();
  const { withLoader } = useLoading();

  const callApi = async <T,>(
    apiCall: () => Promise<T>,
    loadingMessage = 'Please wait...'
  ): Promise<T> => {
    return withLoader(apiCall(), loadingMessage);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Fetch applications that are at City Engineer stage (currentStage: 4)
      const response = await applicationService.fetchOfficerApplications(undefined, 1, 50);
      console.log('City Engineer applications response:', response);
      
      let applicationsData: any[] = [];
      
      // Handle different response structures
      if (Array.isArray(response)) {
        applicationsData = response;
      } else if (response && Array.isArray(response.applications)) {
        applicationsData = response.applications;
      } else if (response && Array.isArray(response.data)) {
        applicationsData = response.data;
      }
      
      // Filter applications relevant to City Engineer (Stage 1: currentStage 4, Stage 2: currentStage 8)
      const ceApplications = applicationsData.filter((app: any) =>
        app.currentStage === ApplicationStage.CITY_ENGINEER_PENDING ||
        app.currentStage === ApplicationStage.CITY_ENGINEER_SIGN_PENDING ||
        app.currentStage === 4 || // Fallback to numeric value for Stage 1
        app.currentStage === 8    // Fallback to numeric value for Stage 2
      ).map((app: any) => ({
        id: app.id,
        applicationNumber: app.applicationNumber || 'N/A',
        applicantName: `${app.firstName || ''} ${app.middleName || ''} ${app.lastName || ''}`.trim(),
        position: getPositionLabel(app.positionType),
        positionType: app.positionType,
        status: getStatusFromStage(app.currentStage, app.status) as ApplicationStatus,
        submittedDate: app.submissionDate || new Date().toISOString(),
        lastUpdated: app.lastUpdated || new Date().toISOString(),
        assignedOfficer: 'City Engineer',
        documents: [],
        statusHistory: [],
        paymentStatus: app.paymentStatus,
        certificatePath: app.certificatePath,
        isCertificateGenerated: app.isCertificateGenerated
      }));
      
      setApplications(ceApplications);
      
      if (ceApplications.length > 0) {
        toast({
          title: 'Success',
          description: `Loaded ${ceApplications.length} applications for City Engineer review`,
        });
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      // Mock data for development
      setApplications([
        // Stage 1 applications (Pre-payment)
        {
          id: '1',
          applicationNumber: 'PMC/2024/001',
          applicantName: 'John Doe',
          position: 'Architect',
          positionType: 0,
          status: 'FORWARDED_TO_CE_STAGE1',
          submittedDate: '2024-01-15T10:00:00Z',
          lastUpdated: '2024-01-19T09:30:00Z',
          assignedOfficer: 'EE Anderson',
          documents: [],
          statusHistory: [],
        },
        // Stage 2 applications (Final digital signature) - after Executive Engineer signature
        {
          id: 'a687fa18-1955-4664-b3da-abe676bd61da',
          applicationNumber: 'PMC_APPLICATION_2025_5',
          applicantName: 'Sasake G Uchiha',
          position: 'Architect',
          positionType: 0,
          status: 'FORWARDED_TO_CE_STAGE2' as ApplicationStatus, // Stage 2 status after Executive signature
          submittedDate: '2025-10-15T10:10:10.442248Z',
          lastUpdated: '2025-10-17T14:45:00Z',
          assignedOfficer: 'City Engineer',
          paymentStatus: 'COMPLETED',
          certificatePath: '74703cb2-e72a-4ea3-a225-aeacd6bec3e4_SE_Certificate_PMC_ARCH_1_2025-2028_20251017122240.pdf',
          isCertificateGenerated: true,
          documents: [],
          statusHistory: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStageApplications = (stage: TaskStage) => {
    if (stage === 'stage1') {
      return applications.filter(app => 
        app.status === 'FORWARDED_TO_CE_STAGE1' || 
        app.status === 'APPROVED_BY_CE_STAGE1'
      );
    } else {
      return applications.filter(app => 
        app.status === 'FORWARDED_TO_CE_STAGE2' || 
        app.status === 'SIGNED_BY_CE_STAGE2'
      );
    }
  };

  const handleDigitalSign = (applicationId: string, stage: 1 | 2) => {
    setSignatureModal({
      isVisible: true,
      applicationId,
      stage,
    });
  };

  const handleSignatureConfirm = async () => {
    setOtpModal({
      isVisible: true,
      purpose: 'sign',
      applicationId: signatureModal.applicationId,
      callback: async (otp: string) => {
        try {
          const response = await fetch(`/api/applications/${signatureModal.applicationId}/ce-sign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              otp, 
              action: 'sign', 
              stage: signatureModal.stage,
              useHSM: true 
            }),
          });

          if (response.ok) {
            const newStatus = signatureModal.stage === 2 ? 'CERTIFICATE_ISSUED' : 'SIGNED_BY_CE_STAGE2';
            
            setApplications(prev =>
              prev.map(app =>
                app.id === signatureModal.applicationId
                  ? { ...app, status: newStatus }
                  : app
              )
            );
            
            toast({
              title: "Success",
              description: signatureModal.stage === 2 
                ? "Final signature applied. Certificate has been issued and is available for download."
                : "Digital signature applied successfully. Application ready for final processing.",
            });
            
            setSignatureModal({ isVisible: false, applicationId: '', stage: 1 });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to apply digital signature",
            variant: "destructive",
          });
          throw error;
        }
      },
    });
  };

  const handleApprove = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    const isStage1 = application?.status === 'FORWARDED_TO_CE_STAGE1';

    setOtpModal({
      isVisible: true,
      purpose: 'approve',
      applicationId,
      callback: async (otp: string) => {
        try {
          const response = await fetch(`/api/applications/${applicationId}/ce-approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              otp, 
              action: 'approve',
              stage: isStage1 ? 1 : 2
            }),
          });

          if (response.ok) {
            if (isStage1) {
              // Stage 1: Send payment notification to user
              setApplications(prev =>
                prev.map(app =>
                  app.id === applicationId
                    ? { ...app, status: 'PAYMENT_PENDING' }
                    : app
                )
              );
              
              toast({
                title: "Success",
                description: "Application approved. Payment notification sent to applicant.",
              });
            } else {
              // Stage 2: Mark as approved and ready for final certificate
              setApplications(prev =>
                prev.map(app =>
                  app.id === applicationId
                    ? { ...app, status: 'CERTIFICATE_ISSUED' }
                    : app
                )
              );
              
              toast({
                title: "Success",
                description: "Application finally approved. Certificate is now available.",
              });
            }
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to approve application",
            variant: "destructive",
          });
          throw error;
        }
      },
    });
  };

  // Helper functions
  const getPositionLabel = (positionType: number): string => {
    const positions = {
      0: 'Architect',
      1: 'Structural Engineer', 
      2: 'Licence Engineer',
      3: 'Supervisor1',
      4: 'Supervisor2'
    };
    return positions[positionType as keyof typeof positions] || 'Unknown';
  };

  const getStatusFromStage = (currentStage: number, _status: number): ApplicationStatus => {
    // Map currentStage to appropriate status for City Engineer
    if (currentStage === 4) {
      return 'FORWARDED_TO_CE_STAGE1'; // Stage 1 - Initial approval
    } else if (currentStage === 8) {
      return 'FORWARDED_TO_CE_STAGE2'; // Stage 2 - Digital signature
    }
    return 'SUBMITTED'; // Default fallback
  };

  // Helper function to get document type label
  const getDocumentTypeLabel = (documentType: number): string => {
    const types = {
      0: 'PAN Card',
      1: 'Aadhar Card',
      2: 'COA Certificate',
      3: 'Profile Picture',
      4: 'Electricity Bill',
      5: 'Degree Certificate',
      6: 'Degree Marksheet',
      7: 'Experience Certificate',
      8: 'Additional Document'
    };
    return types[documentType as keyof typeof types] || 'Unknown Document';
  };

  // Handle certificate viewing
  const handleViewCertificate = async (certificatePath: string, applicantName: string) => {
    try {
      console.log('Viewing certificate:', certificatePath);
      
      // Use the file service to download the certificate
      let blob: Blob;
      
      try {
        // Try to download the certificate using the file service
        blob = await fileService.downloadFile(certificatePath);
      } catch (error) {
        console.log('Certificate download failed, trying array buffer method:', error);
        blob = await fileService.downloadFileAsArrayBuffer(certificatePath);
      }
      
      if (!blob || blob.size === 0) {
        throw new Error('Downloaded certificate is empty or invalid');
      }
      
      console.log('Certificate downloaded successfully:', blob.type, blob.size, 'bytes');
      
      const url = URL.createObjectURL(blob);
      
      setDocumentViewer({
        isOpen: true,
        documentUrl: url,
        documentName: certificatePath.split('/').pop() || `PMC_Certificate_${applicantName}.pdf`,
        documentType: 'pdf'
      });
      
      toast({
        title: 'Certificate Loaded',
        description: `Certificate for ${applicantName} loaded successfully`
      });
    } catch (error: any) {
      console.error('Failed to load certificate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load certificate',
        variant: 'destructive'
      });
    }
  };

  // Handle document viewing
  const handleViewDocument = async (filePath: string, fileName: string, isRecommendedForm: boolean = false) => {
    try {
      console.log('Downloading file:', filePath, fileName, 'isRecommendedForm:', isRecommendedForm);
      
      let blob: Blob;
      
      if (isRecommendedForm) {
        try {
          blob = await fileService.downloadRecommendedForm(filePath);
        } catch (error) {
          console.log('Recommended form download failed, trying standard methods:', error);
          try {
            blob = await fileService.downloadFile(filePath);
          } catch (error2) {
            console.log('Standard download failed, trying array buffer method:', error2);
            blob = await fileService.downloadFileAsArrayBuffer(filePath);
          }
        }
      } else {
        try {
          blob = await fileService.downloadFile(filePath);
        } catch (error) {
          console.log('Standard download failed, trying array buffer method:', error);
          blob = await fileService.downloadFileAsArrayBuffer(filePath);
        }
      }
      
      if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty or invalid');
      }
      
      console.log('File downloaded successfully:', blob.type, blob.size, 'bytes');
      
      const url = URL.createObjectURL(blob);
      const documentType = fileName.toLowerCase().endsWith('.pdf') || isRecommendedForm ? 'pdf' : 'image';
      
      setDocumentViewer({
        isOpen: true,
        documentUrl: url,
        documentName: fileName,
        documentType
      });
      
      toast({
        title: 'Success',
        description: 'Document loaded successfully'
      });
    } catch (error: any) {
      console.error('Failed to load document:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load document',
        variant: 'destructive'
      });
    }
  };

  // Fetch detailed application data
  const fetchApplicationDetails = async (applicationId: string) => {
    try {
      setDetailsLoading(true);
      const response = await applicationService.getApplicationById(applicationId);
      console.log('Application details response:', response);
      setSelectedApplicationDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch application details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load application details',
        variant: 'destructive'
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleReject = (applicationId: string) => {
    setOtpModal({
      isVisible: true,
      purpose: 'reject',
      applicationId,
      callback: async (otp: string) => {
        try {
          const reasons = prompt("Please provide rejection reasons:");
          if (!reasons) return;

          const response = await fetch(`/api/applications/${applicationId}/ce-reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp, action: 'reject', reasons }),
          });

          if (response.ok) {
            setApplications(prev =>
              prev.map(app =>
                app.id === applicationId
                  ? { ...app, status: 'REJECTED', rejectionReasons: [reasons] }
                  : app
              )
            );
            
            toast({
              title: "Success",
              description: "Application rejected",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to reject application",
            variant: "destructive",
          });
          throw error;
        }
      },
    });
  };

  const handleViewDetails = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      setSelectedApplication(application);
      fetchApplicationDetails(application.id);
    }
  };

  const filteredApplications = getStageApplications(activeTab).filter((app: any) => {
    if (filters.status && app.status !== filters.status) return false;
    if (filters.position && app.position !== filters.position) return false;
    if (filters.search && !app.applicantName.toLowerCase().includes(filters.search.toLowerCase()) && 
        !app.applicationNumber.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const stage1Apps = getStageApplications('stage1');
  const stage2Apps = getStageApplications('stage2');

  const stats = {
    stage1: {
      total: stage1Apps.length,
      pending: stage1Apps.filter(app => app.status === 'FORWARDED_TO_CE_STAGE1').length,
      approved: stage1Apps.filter(app => app.status === 'APPROVED_BY_CE_STAGE1').length,
    },
    stage2: {
      total: stage2Apps.length,
      pending: stage2Apps.filter(app => app.status === 'FORWARDED_TO_CE_STAGE2').length,
      issued: stage2Apps.filter(app => app.status === 'CERTIFICATE_ISSUED').length,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">City Engineer Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Final review, approval, and digital signature authority</p>
            </div>
            <Button onClick={() => { fetchApplications(); }} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {activeTab === 'stage1' ? (
            <>
              <Card className="bg-white border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Stage 1</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.stage1.total}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Review</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.stage1.pending}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved for Payment</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.stage1.approved}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <>
              <Card className="bg-white border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Stage 2</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.stage2.total}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Final Review</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.stage2.pending}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Certificates Issued</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.stage2.issued}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <Award className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Tabs and Search Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <nav className="-mb-px flex space-x-4">
              <button
                onClick={() => setActiveTab('stage1')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'stage1'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Stage 1 (Pre-Payment)
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === 'stage1' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {stage1Apps.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('stage2')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'stage2'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Stage 2 (Final Approval)
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === 'stage2' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {stage2Apps.length}
                </span>
              </button>
            </nav>
          </div>
          
          {/* Search Bar */}
          <div className="p-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="search"
                placeholder="Search by name or application number..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
        </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {activeTab === 'stage1' ? 'Stage 1' : 'Stage 2'} Applications ({filteredApplications.length})
          </h2>
        </div>
        <div className="p-4">
          <TaskList
            applications={filteredApplications}
            onViewDetails={handleViewDetails}
            onApprove={activeTab === 'stage2' ? (appId) => handleDigitalSign(appId, 2) : handleApprove}
            onReject={handleReject}
            onDigitalSign={activeTab === 'stage2' ? (appId) => handleDigitalSign(appId, 2) : undefined}
            approveButtonLabel={activeTab === 'stage2' ? 'Apply Digital Signature' : 'Approve'}
            loading={loading}
            isStage2={activeTab === 'stage2'}
          />
        </div>
      </div>

      {/* Digital Signature Modal */}
      {signatureModal.isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Digital Signature Required</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-blue-900">Final Authority HSM Signature</span>
                </div>
                <p className="text-sm text-blue-700">
                  As City Engineer, your digital signature using HSM is required to finalize this certificate.
                  {signatureModal.stage === 2 && " This will complete the application process and issue the final certificate."}
                </p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Application:</strong> {applications.find(app => app.id === signatureModal.applicationId)?.applicationNumber}</p>
                <p><strong>Action:</strong> {signatureModal.stage === 2 ? 'Final Certificate Issuance' : 'Pre-Payment Approval'}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setSignatureModal({ isVisible: false, applicationId: '', stage: 1 })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSignatureConfirm} className="flex-1">
                Apply Final HSM Signature
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      <OTPModal
        isOpen={otpModal.isVisible}
        onClose={() => setOtpModal(prev => ({ ...prev, isVisible: false }))}
        onVerify={otpModal.callback || (() => Promise.resolve())}
        title={
          otpModal.purpose === 'sign' 
            ? 'Confirm Digital Signature' 
            : `Confirm ${otpModal.purpose === 'approve' ? 'Approval' : 'Rejection'}`
        }
        description={
          otpModal.purpose === 'sign'
            ? 'Please enter your OTP to apply your digital signature as City Engineer.'
            : otpModal.purpose === 'approve'
              ? activeTab === 'stage1' 
                ? 'Please enter your OTP to approve this application and trigger payment notification.'
                : 'Please enter your OTP to give final approval and issue the certificate.'
              : 'Please enter your OTP to reject this application.'
        }
      />

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <Button
                  onClick={() => {
                    setSelectedApplication(null);
                    setSelectedApplicationDetails(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  ✕ Close
                </Button>
              </div>
              
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <span className="ml-3 text-gray-600">Loading application details...</span>
                </div>
              ) : selectedApplicationDetails ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p><strong>Application Number:</strong> {selectedApplicationDetails.applicationNumber || 'N/A'}</p>
                        <p><strong>Full Name:</strong> {`${selectedApplicationDetails.firstName || ''} ${selectedApplicationDetails.middleName || ''} ${selectedApplicationDetails.lastName || ''}`.trim()}</p>
                        <p><strong>Mother's Name:</strong> {selectedApplicationDetails.motherName || 'N/A'}</p>
                        <p><strong>Email:</strong> {selectedApplicationDetails.emailAddress || 'N/A'}</p>
                        <p><strong>Mobile:</strong> {selectedApplicationDetails.mobileNumber || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <p><strong>Position:</strong> {getPositionLabel(selectedApplicationDetails.positionType)}</p>
                        <p><strong>Gender:</strong> {selectedApplicationDetails.gender === 0 ? 'Male' : selectedApplicationDetails.gender === 1 ? 'Female' : 'Other'}</p>
                        <p><strong>Blood Group:</strong> {selectedApplicationDetails.bloodGroup || 'N/A'}</p>
                        <p><strong>Height:</strong> {selectedApplicationDetails.height ? `${selectedApplicationDetails.height} cm` : 'N/A'}</p>
                        <p><strong>Submitted Date:</strong> {selectedApplicationDetails.submissionDate ? new Date(selectedApplicationDetails.submissionDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Permanent Address</h3>
                      <div className="space-y-1 text-sm">
                        <p>{selectedApplicationDetails.permanentAddress?.addressLine1 || 'N/A'}</p>
                        {selectedApplicationDetails.permanentAddress?.addressLine2 && (
                          <p>{selectedApplicationDetails.permanentAddress.addressLine2}</p>
                        )}
                        {selectedApplicationDetails.permanentAddress?.addressLine3 && (
                          <p>{selectedApplicationDetails.permanentAddress.addressLine3}</p>
                        )}
                        <p>{selectedApplicationDetails.permanentAddress?.city || 'N/A'}, {selectedApplicationDetails.permanentAddress?.state || 'N/A'}</p>
                        <p>{selectedApplicationDetails.permanentAddress?.country || 'N/A'} - {selectedApplicationDetails.permanentAddress?.pinCode || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Current Address</h3>
                      <div className="space-y-1 text-sm">
                        <p>{selectedApplicationDetails.currentAddress?.addressLine1 || 'N/A'}</p>
                        {selectedApplicationDetails.currentAddress?.addressLine2 && (
                          <p>{selectedApplicationDetails.currentAddress.addressLine2}</p>
                        )}
                        {selectedApplicationDetails.currentAddress?.addressLine3 && (
                          <p>{selectedApplicationDetails.currentAddress.addressLine3}</p>
                        )}
                        <p>{selectedApplicationDetails.currentAddress?.city || 'N/A'}, {selectedApplicationDetails.currentAddress?.state || 'N/A'}</p>
                        <p>{selectedApplicationDetails.currentAddress?.country || 'N/A'} - {selectedApplicationDetails.currentAddress?.pinCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Identity Documents */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Identity Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <p className="font-medium text-sm text-gray-800">PAN Card</p>
                        <p className="text-xs text-gray-600 mb-2">{selectedApplicationDetails.panCardNumber || 'N/A'}</p>
                        {selectedApplicationDetails.documents?.find((doc: any) => doc.documentType === DocumentType.PanCard) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => {
                              const panDoc = selectedApplicationDetails.documents.find((doc: any) => doc.documentType === DocumentType.PanCard);
                              if (panDoc) handleViewDocument(panDoc.filePath, panDoc.fileName);
                            }}
                          >
                            View Document
                          </Button>
                        )}
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="font-medium text-sm text-gray-800">Aadhar Card</p>
                        <p className="text-xs text-gray-600 mb-2">{selectedApplicationDetails.aadharCardNumber || 'N/A'}</p>
                        {selectedApplicationDetails.documents?.find((doc: any) => doc.documentType === DocumentType.AadharCard) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => {
                              const aadharDoc = selectedApplicationDetails.documents.find((doc: any) => doc.documentType === DocumentType.AadharCard);
                              if (aadharDoc) handleViewDocument(aadharDoc.filePath, aadharDoc.fileName);
                            }}
                          >
                            View Document
                          </Button>
                        )}
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="font-medium text-sm text-gray-800">COA Certificate</p>
                        <p className="text-xs text-gray-600 mb-2">{selectedApplicationDetails.coaCardNumber || 'N/A'}</p>
                        {selectedApplicationDetails.documents?.find((doc: any) => doc.documentType === DocumentType.CoaCertificate) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => {
                              const coaDoc = selectedApplicationDetails.documents.find((doc: any) => doc.documentType === DocumentType.CoaCertificate);
                              if (coaDoc) handleViewDocument(coaDoc.filePath, coaDoc.fileName);
                            }}
                          >
                            View Document
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Qualifications */}
                  {selectedApplicationDetails.qualifications && selectedApplicationDetails.qualifications.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Qualifications</h3>
                      <div className="space-y-3">
                        {selectedApplicationDetails.qualifications.map((qual: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <p><strong>Degree:</strong> {qual.degreeName || 'N/A'}</p>
                              <p><strong>Specialization:</strong> {qual.specialization || 'N/A'}</p>
                              <p><strong>Institute:</strong> {qual.instituteName || 'N/A'}</p>
                              <p><strong>University:</strong> {qual.universityName || 'N/A'}</p>
                              <p><strong>Passing Year:</strong> {qual.yearOfPassing ? new Date(qual.yearOfPassing).getFullYear() : 'N/A'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {selectedApplicationDetails.experiences && selectedApplicationDetails.experiences.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Experience</h3>
                      <div className="space-y-3">
                        {selectedApplicationDetails.experiences.map((exp: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <p><strong>Company:</strong> {exp.companyName || 'N/A'}</p>
                              <p><strong>Position:</strong> {exp.position || 'N/A'}</p>
                              <p><strong>Experience:</strong> {exp.yearsOfExperience ? `${exp.yearsOfExperience} years` : 'N/A'}</p>
                              <p><strong>Duration:</strong> {exp.fromDate && exp.toDate ? `${new Date(exp.fromDate).toLocaleDateString()} - ${new Date(exp.toDate).toLocaleDateString()}` : 'N/A'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents - Government Portal Design */}
                  {selectedApplicationDetails.documents && selectedApplicationDetails.documents.length > 0 && (
                    <div className="bg-white border border-gray-300 p-4 rounded">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center border-b border-gray-200 pb-2">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Uploaded Documents ({selectedApplicationDetails.documents.length})
                      </h3>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedApplicationDetails.documents.map((doc: any, index: number) => (
                          <div 
                            key={index} 
                            className="bg-gray-50 border border-gray-200 rounded p-3 hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                            onClick={() => handleViewDocument(doc.filePath, doc.fileName)}
                          >
                            <div className="flex flex-col items-center text-center space-y-2">
                              <div className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {doc.documentType === DocumentType.ProfilePicture ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  )}
                                </svg>
                              </div>
                              
                              <div className="min-w-0 w-full">
                                <p className="text-xs font-medium text-gray-800 truncate" title={doc.fileName}>
                                  {doc.fileName.length > 12 ? `${doc.fileName.substring(0, 12)}...` : doc.fileName}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {getDocumentTypeLabel(doc.documentType)}
                                </p>
                              </div>
                              
                              <div className="w-full h-6 border border-gray-300 bg-white hover:bg-gray-50 rounded text-xs flex items-center justify-center font-medium text-gray-700">
                                View
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                        Click on any document to view its contents
                      </div>
                    </div>
                  )}
                  
                  {/* Recommended Form */}
                  {selectedApplicationDetails.recommendedFormPath && (
                    <div className="bg-white border border-gray-300 p-4 rounded">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center border-b border-gray-200 pb-2">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Official Recommendation Form
                      </h3>
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-base text-gray-800">Application Recommendation Form</p>
                            <p className="text-sm text-gray-600 mt-1">Generated application form with official recommendations</p>
                            <div className="flex items-center mt-2 text-xs text-gray-600">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              PDF Document
                            </div>
                          </div>
                          <Button
                            size="lg"
                            className="ml-4 bg-gray-800 hover:bg-gray-900 text-white"
                            onClick={() => handleViewDocument(selectedApplicationDetails.recommendedFormPath, 'Recommended_Form.pdf', true)}
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Form
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Certificate Display for Stage 2 */}
                  {activeTab === 'stage2' && (
                    <div className="bg-white border border-gray-300 p-4 rounded">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center border-b border-gray-200 pb-2">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        PMC Professional Certificate
                      </h3>
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-base text-gray-800">PMC Professional Certificate</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Certificate: {selectedApplication.certificatePath ? selectedApplication.certificatePath.split('/').pop() || 'Generated' : 'Generated'}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Applicant: {selectedApplication.applicantName}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6M8 6v6m0 0v2a2 2 0 002 2h4a2 2 0 002-2v-2m0 0v-4H8v4z" />
                                </svg>
                                Position: {selectedApplication.position}
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Payment: <span className="text-green-600">Completed</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Status: <span className="text-green-600">Awaiting CE Final Signature</span>
                              </div>
                            </div>
                          </div>
                          {selectedApplicationDetails.certificatePath && (
                            <Button
                              size="lg"
                              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleViewCertificate(selectedApplicationDetails.certificatePath!, selectedApplicationDetails.applicantName)}
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Certificate
                            </Button>
                          )}
                          {!selectedApplicationDetails.certificatePath && (
                            <div className="ml-4 px-4 py-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                              Certificate being generated...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Authority Notice */}
                  <div className="bg-white border border-gray-300 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">City Engineer Authority</h3>
                    <p className="text-gray-700 text-sm">
                      As City Engineer, you have the final authority to approve or reject this application.
                      {activeTab === 'stage1' 
                        ? ' Your approval will trigger the payment process for the applicant.'
                        : ' Your digital signature will complete the certificate and finalize the application process.'
                      }
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Application ID: {selectedApplicationDetails.id}
                    </div>
                    <div className="flex gap-3">
                      {selectedApplication.status === 'FORWARDED_TO_CE_STAGE1' && (
                        <Button
                          onClick={() => handleApprove(selectedApplication.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Approve & Trigger Payment
                        </Button>
                      )}
                      
                      {selectedApplication.status === 'FORWARDED_TO_CE_STAGE2' && (
                        <Button
                          onClick={() => handleDigitalSign(selectedApplication.id, 2)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Apply Final Digital Signature
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleReject(selectedApplication.id)}
                        variant="destructive"
                      >
                        Reject Application
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Failed to load application details</p>
                  <Button
                    onClick={() => fetchApplicationDetails(selectedApplication.id)}
                    variant="outline"
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer */}
      {documentViewer.isOpen && (
        <DocumentViewer
          documentUrl={documentViewer.documentUrl}
          documentName={documentViewer.documentName}
          documentType={documentViewer.documentType}
          onClose={() => {
            setDocumentViewer({ isOpen: false, documentUrl: '', documentName: '', documentType: 'pdf' });
            // Clean up the blob URL
            if (documentViewer.documentUrl) {
              URL.revokeObjectURL(documentViewer.documentUrl);
            }
          }}
          onDownload={() => {
            const link = document.createElement('a');
            link.href = documentViewer.documentUrl;
            link.download = documentViewer.documentName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        />
      )}
      </div>
    </div>
  );
};