import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { OTPModal } from '../../../components/common/OTPModal';

import { useToast } from '../../../hooks/use-toast';
import { useLoading } from '../../../hooks/useLoading';
import { appointmentService } from '../../../services/appointment.service';
import { applicationService } from '../../../services/application.service';
import { fileService } from '../../../services/file.service';
import { handleGlobalUpdateStageForTesting, STAGE_MAPPINGS } from '../../../utils/testingUtils';
import { ApplicationStage, DocumentType } from '../../../types/application';
import { DocumentViewer } from '../../../components/common/DocumentViewer/DocumentViewer';
import type { Application, ApplicationStatus, OTPVerificationData } from '../../../types/dashboard';

type TaskStage = 'stage1' | 'stage2';

export const ExecutiveEngineerDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[] | any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | any>(null);
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

  const fetchPendingApplications = async () => {
    setLoading(true);
    try {
      // Fetch applications that are at Executive Engineer stage (both Stage 1: 3 and Stage 2: 7)
      const response = await appointmentService.getApplicationsList(ApplicationStage.EXECUTIVE_ENGINEER_PENDING, 1, 100);
      
      console.log('Executive Engineer applications response:', response);
      
      let applicationsData: any[] = [];
      
      // Handle response format
      if (response && Array.isArray(response)) {
        applicationsData = response;
      } else if (response && response.applications && Array.isArray(response.applications)) {
        applicationsData = response.applications;
      } else if (response && response.data && Array.isArray(response.data)) {
        applicationsData = response.data;
      }
      
      // Map applications to the expected format
      const eeApplications = applicationsData.map((app: any) => ({
        id: app.id,
        applicationNumber: app.applicationNumber || 'N/A',
        applicantName: `${app.firstName || ''} ${app.middleName || ''} ${app.lastName || ''}`.trim(),
        position: getPositionLabel(app.positionType),
        positionType: app.positionType,
        status: getStatusFromStage(app.currentStage, app.status) as ApplicationStatus,
        submittedDate: app.submissionDate || new Date().toISOString(),
        lastUpdated: app.lastUpdated || new Date().toISOString(),
        assignedOfficer: 'Executive Engineer',
        documents: app.documents || [],
        statusHistory: [],
        paymentStatus: app.isPaymentComplete ? 'completed' : 'pending',
        certificatePath: app.certificatePath, // Certificate path from API response
        isCertificateGenerated: app.isCertificateGenerated, // Certificate generation status
        recommendedFormPath: app.recommendedFormPath, // Recommended form path
        currentStage: app.currentStage // Current stage for better filtering
      }));
        
      setApplications(eeApplications);
      
      if (eeApplications.length > 0) {
        toast({
          title: 'Success',
          description: `Loaded ${eeApplications.length} applications for Executive Engineer review`,
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = fetchPendingApplications;

  const getStageApplications = (stage: TaskStage) => {
    if (stage === 'stage1') {
      // Stage 1: Applications at currentStage 3 (EXECUTIVE_ENGINEER_PENDING)
      return applications.filter(app => 
        (app as any).currentStage === 3 ||
        app.status === 'FORWARDED_TO_EE' || 
        app.status === 'SIGNED_BY_EE_STAGE1'
      );
    } else {
      // Stage 2: Applications at currentStage 7 (EXECUTIVE_ENGINEER_SIGN_PENDING) - these have certificates generated
      return applications.filter(app => 
        (app as any).currentStage === 7 ||
        app.status === 'FORWARDED_TO_EE_STAGE2' || 
        app.status === 'SIGNED_BY_EE_STAGE2'
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
          await applicationService.applyDigitalSignature(signatureModal.applicationId, otp);

          const newStatus = signatureModal.stage === 1 
            ? 'FORWARDED_TO_CE_STAGE1' 
            : 'FORWARDED_TO_CE_STAGE2';
          
          setApplications(prev =>
            prev.map(app =>
              app.id === signatureModal.applicationId
                ? { ...app, status: newStatus }
                : app
            )
          );
          
          toast({
            title: "Success",
            description: signatureModal.stage === 1 
              ? "Digital signature applied. Application forwarded to City Engineer for Stage 1 approval."
              : "Final digital signature applied. Application forwarded to City Engineer for final signature.",
          });
          
          setSignatureModal({ isVisible: false, applicationId: '', stage: 1 });
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
    const isStage1 = application?.status === 'FORWARDED_TO_EE';

    setOtpModal({
      isVisible: true,
      purpose: 'approve',
      applicationId,
      callback: async (otp: string) => {
        try {
          console.log('Verifying OTP:', otp);
          await applicationService.approveApplication(applicationId);

          if (isStage1) {
            // Stage 1: Forward to City Engineer Stage 1
            setApplications(prev =>
              prev.map(app =>
                app.id === applicationId
                  ? { ...app, status: 'FORWARDED_TO_CE_STAGE1' }
                  : app
              )
            );
            
            toast({
              title: "Success",
              description: "Application approved and forwarded to City Engineer for Stage 1 approval.",
            });
          } else {
            // Stage 2: Forward to City Engineer Stage 2
            setApplications(prev =>
              prev.map(app =>
                app.id === applicationId
                  ? { ...app, status: 'FORWARDED_TO_CE_STAGE2' }
                  : app
              )
            );
            
            toast({
              title: "Success",
              description: "Application approved and forwarded to City Engineer for final signature.",
            });
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
    // Map currentStage to appropriate status for Executive Engineer
    if (currentStage === 3) {
      return 'FORWARDED_TO_EE'; // Stage 1 - Initial approval
    } else if (currentStage === 7) {
      return 'FORWARDED_TO_EE_STAGE2'; // Stage 2 - Digital signature
    }
    return 'SUBMITTED'; // Default fallback
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

  // Handle view details click
  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    fetchApplicationDetails(application.id);
  };

  // TEMPORARY TESTING FUNCTION - Update stage bypass with digital signature (TODO: Remove after testing)
  const handleUpdateStageForTesting = async (applicationId: string) => {
    // Find the application to determine which stage mapping to use
    const application = applications.find(app => app.id === applicationId);
    const currentStage = (application as any)?.currentStage;
    
    // Use different stage mappings based on current stage
    const stageMapping = STAGE_MAPPINGS.EXECUTIVE_ENGINEER_STAGE2       // Stage 1: from 3 to 4
    
    const comments = currentStage === 7
      ? 'Testing bypass - Executive Engineer final signature applied, moved to City Engineer final signature'
      : 'Testing bypass - Executive Engineer approved, moved to City Engineer (with digital signature)';
    
    await callApi(async () => {
      await handleGlobalUpdateStageForTesting({
        applicationId,
        currentStage: stageMapping.currentStage,
        nextStage: stageMapping.nextStage,
        nextStageName: stageMapping.nextStageName,
        comments,
        onSuccess: async () => {
          await fetchApplications();
        },
        showToast: toast
      });
    }, 'Updating stage with digital signature (testing)...');
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
        description: 'Failed to load certificate',
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

  const handleReject = (applicationId: string) => {
    setOtpModal({
      isVisible: true,
      purpose: 'reject',
      applicationId,
      callback: async (otp: string) => {
        try {
          console.log('Verifying OTP:', otp);
          await applicationService.rejectApplication(applicationId, "Rejected by Executive Engineer");

          setApplications(prev =>
            prev.map(app =>
              app.id === applicationId
                ? { ...app, status: 'REJECTED' }
                : app
            )
          );
          
          toast({
            title: "Success",
            description: "Application has been rejected.",
          });
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

  const filteredApplications = getStageApplications(activeTab).filter(app => {
    const matchesSearch = !filters.search || 
      app.applicationNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || app.status === filters.status;
    const matchesPosition = !filters.position || app.position === filters.position;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getActionButtons = (application: Application | any) => {
    const buttons = [];
    const currentStage = (application as any).currentStage;
    
    if (activeTab === 'stage1' && currentStage === 3) {
      // Stage 1: Applications at currentStage 3 need approval and signature
      buttons.push(
        <Button
          key="approve"
          onClick={() => handleApprove(application.id)}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          Approve
        </Button>
      );
      buttons.push(
        <Button
          key="sign"
          onClick={() => handleDigitalSign(application.id, 1)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          Digital Sign
        </Button>
      );
      buttons.push(
        <Button
          key="reject"
          onClick={() => handleReject(application.id)}
          variant="destructive"
          size="sm"
        >
          Reject
        </Button>
      );
      // TEMPORARY TESTING BUTTON - TODO: Remove after testing
      buttons.push(
        <Button
          key="test"
          onClick={() => handleUpdateStageForTesting(application.id)}
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
          size="sm"
          title="⚠️ TESTING ONLY: Bypass OTP and move to next stage"
        >
          🧪 Update Stage (Test)
        </Button>
      );
    } else if (activeTab === 'stage2' && currentStage === 7) {
      // Stage 2: Applications at currentStage 7 have certificates ready for final signature
      buttons.push(
        <Button
          key="digital-signature"
          onClick={() => handleDigitalSign(application.id, 2)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
          disabled={!(application as any).isCertificateGenerated}
        >
          Apply Digital Signature
        </Button>
      );
      // Show certificate view button if certificate exists
      if (application.certificatePath) {
        buttons.push(
          <Button
            key="view-certificate"
            onClick={() => handleViewCertificate(application.certificatePath!, application?.applicantName)}
            className="bg-gray-600 hover:bg-gray-700 text-white"
            size="sm"
          >
            View Certificate
          </Button>
        );
      }
      // TEMPORARY TESTING BUTTON - TODO: Remove after testing
      buttons.push(
        <Button
          key="test"
          onClick={() => handleUpdateStageForTesting(application.id)}
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
          size="sm"
          title="⚠️ TESTING ONLY: Bypass OTP and move to next stage"
        >
          🧪 Update Stage (Test)
        </Button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Executive Engineer Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage application approvals and digital signatures
          </p>
        </div>

        {/* Stage Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('stage1')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stage1'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stage 1 - Initial Approval
              <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                {getStageApplications('stage1').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('stage2')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stage2'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stage 2 - Final Signature
              <span className="ml-2 bg-green-100 text-green-600 py-0.5 px-2 rounded-full text-xs">
                {getStageApplications('stage2').length}
              </span>
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Application number or name..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                {activeTab === 'stage1' ? (
                  <>
                    <option value="FORWARDED_TO_EE">Pending Review</option>
                    <option value="SIGNED_BY_EE_STAGE1">Signed</option>
                  </>
                ) : (
                  <>
                    <option value="FORWARDED_TO_EE_STAGE2">Pending Final Signature</option>
                    <option value="SIGNED_BY_EE_STAGE2">Final Signature Applied</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <select
                id="position"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.position}
                onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
              >
                <option value="">All Positions</option>
                <option value="Architect">Architect</option>
                <option value="Structural Engineer">Structural Engineer</option>
                <option value="Civil Engineer">Civil Engineer</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setFilters({ status: '', position: '', search: '' })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                {activeTab === 'stage1' ? 'No applications pending Stage 1 approval' : 'No certificates ready for Executive Engineer signature'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.applicationNumber}
                          </h3>
                          <p className="text-sm text-gray-600">{application.applicantName}</p>
                          <p className="text-sm text-gray-500">{application.position}</p>
                          {activeTab === 'stage2' && application.certificatePath && (
                            <div className="mt-1">
                              <p className="text-xs text-blue-600">
                                Certificate: {application.certificatePath.split('/').pop() || 'Generated'}
                              </p>
                              <p className="text-xs text-green-600">
                                Status: {(application as any).isCertificateGenerated ? 'Ready for Signature' : 'Generating...'}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (application as any).currentStage === 3 ? 'bg-yellow-100 text-yellow-800' :
                            (application as any).currentStage === 7 ? 'bg-blue-100 text-blue-800' :
                            application.status === 'FORWARDED_TO_EE' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'FORWARDED_TO_EE_STAGE2' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {(application as any).currentStage === 3 ? 'Pending Review' :
                             (application as any).currentStage === 7 ? 'Ready for Signature' :
                             activeTab === 'stage2' && application.status === 'FORWARDED_TO_EE_STAGE2' ? 'Ready for Signature' : 
                             application.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleViewDetails(application)}
                        variant="outline"
                        size="sm"
                      >
                        View Details
                      </Button>
                      {getActionButtons(application)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

                  {/* Certificate Display for Stage 2 */}
                  {selectedApplicationDetails.certificatePath && selectedApplicationDetails.isCertificateGenerated && (
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
                            <p className="text-sm text-gray-600 mt-1">Certificate: {selectedApplicationDetails.certificatePath.split('/').pop() || 'Generated'}</p>
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
                                Payment: <span className="text-green-600">{selectedApplicationDetails.isPaymentComplete ? 'Completed' : 'Pending'}</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Status: <span className="text-blue-600">
                                  {selectedApplicationDetails.currentStage === 7 ? 'Awaiting EE Signature' : 
                                   selectedApplicationDetails.currentStage === 3 ? 'Pending EE Approval' : 'Processing'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="lg"
                            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleViewCertificate(selectedApplicationDetails.certificatePath!, selectedApplication.applicantName)}
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Certificate
                          </Button>
                        </div>
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
                      </h3>                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                                    {doc.fileName.length > 18 ? `${doc.fileName.substring(0, 25)}...` : doc.fileName}
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


                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        Application ID: {selectedApplicationDetails.id}
                      </div>
                      <div className="flex gap-3">
                        {getActionButtons(selectedApplication)}
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

        {/* OTP Modal */}
        <OTPModal
          isOpen={otpModal.isVisible}
          onClose={() => setOtpModal({ isVisible: false, purpose: 'approve' })}
          onVerify={otpModal.callback || (() => Promise.resolve())}
          title={
            otpModal.purpose === 'sign' ? 'Digital Signature Verification' :
            otpModal.purpose === 'approve' ? 'Approval Verification' :
            'Rejection Verification'
          }
          description="Please enter the OTP sent to your registered mobile number to proceed."
        />

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

        {/* Signature Confirmation Modal */}
        {signatureModal.isVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Digital Signature Required</h2>
                <Button
                  onClick={() => setSignatureModal({ isVisible: false, applicationId: '', stage: 1 })}
                  variant="outline"
                  size="sm"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  This action requires your digital signature using HSM token.
                  {signatureModal.stage === 1 
                    ? ' You are about to sign the recommendation for this application.'
                    : ' You are about to apply the final signature on the certificate.'}
                </p>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Application:</strong> {signatureModal.applicationId}<br/>
                    <strong>Document Type:</strong> {signatureModal.stage === 1 ? 'Recommendation' : 'Certificate'}<br/>
                    <strong>Stage:</strong> {signatureModal.stage}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSignatureModal({ isVisible: false, applicationId: '', stage: 1 })}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSignatureConfirm}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Proceed with Signature
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};