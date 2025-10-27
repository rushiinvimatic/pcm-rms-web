import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { TaskList } from '../../../components/common/TaskList';
import { OTPModal } from '../../../components/common/OTPModal';
import { StatusProgress } from '../../../components/common/StatusTracker/StatusProgress';
import { useToast } from '../../../hooks/use-toast';
import { useLoading } from '../../../hooks/useLoading';
import { appointmentService } from '../../../services/appointment.service';
import { applicationService } from '../../../services/application.service';
import { handleGlobalUpdateStageForTesting, STAGE_MAPPINGS } from '../../../utils/testingUtils';
import { ApplicationStage } from '../../../types/application';
import type { Application, OTPVerificationData } from '../../../types/dashboard';

export const ClerkDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | any>(null);
  const [certificateModal, setCertificateModal] = useState({
    isVisible: false,
    applicationId: '',
    certificateNumber: '',
    paymentAmount: '',
    paymentDate: '',
  });
  const [otpModal, setOtpModal] = useState<OTPVerificationData>({
    isVisible: false,
    purpose: 'approve',
  });
  const [filters, setFilters] = useState({
    status: '',
    position: '',
    search: '',
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
    await callApi(async () => {
      try {
        // Fetch applications that are pending for Clerk processing
        // ApplicationStage.CLERK_PENDING or stage 5
        const response = await appointmentService.getApplicationsList(ApplicationStage.CLERK_PENDING, 1, 50);
        console.log('Clerk applications response:', response);
        
        let applicationsData: any[] = [];
        if (response && Array.isArray(response)) {
          applicationsData = response;
        } else if (response && response.applications && Array.isArray(response.applications)) {
          applicationsData = response.applications;
        } else if (response && response.data && Array.isArray(response.data)) {
          applicationsData = response.data;
        }
        
        // Map applications to the expected format
        const clerkApplications: any = applicationsData.map((app: any) => ({
          id: app.id,
          applicationNumber: app.applicationNumber || 'N/A',
          applicantName: `${app.firstName || ''} ${app.middleName || ''} ${app.lastName || ''}`.trim(),
          position: getPositionLabel(app.positionType),
          positionType: app.positionType,
          status: 'FORWARDED_TO_CLERK', // Clerk specific status
          submittedDate: app.submissionDate || new Date().toISOString(),
          lastUpdated: app.lastUpdated || new Date().toISOString(),
          assignedOfficer: 'Clerk',
          paymentStatus: app.paymentStatus || 'COMPLETED',
          documents: [],
          statusHistory: [],
          certificateNumber: app.certificateNumber
        }));
        
        setApplications(clerkApplications);
        
        if (clerkApplications.length > 0) {
          toast({
            title: 'Success',
            description: `Loaded ${clerkApplications.length} applications for clerk processing`,
          });
        }
      } catch (error: any) {
        console.error('Failed to fetch applications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load applications',
          variant: 'destructive'
        });
      }
    }, 'Loading applications...');
  };

  const fetchApplications = fetchPendingApplications;

  // Helper function to get position label
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

  const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `PMC-CERT-${year}-${timestamp}`;
  };

  const handleProcessApplication = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      setCertificateModal({
        isVisible: true,
        applicationId,
        certificateNumber: generateCertificateNumber(),
        paymentAmount: '5000', // Mock amount
        paymentDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleSaveCertificateDetails = async () => {
    if (!certificateModal.certificateNumber || !certificateModal.paymentAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setOtpModal({
      isVisible: true,
      purpose: 'approve',
      applicationId: certificateModal.applicationId,
      callback: async (otp: string) => {
        try {
          const response = await fetch(`/api/applications/${certificateModal.applicationId}/clerk-process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              otp,
              action: 'process',
              certificateNumber: certificateModal.certificateNumber,
              paymentAmount: certificateModal.paymentAmount,
              paymentDate: certificateModal.paymentDate,
            }),
          });

          if (response.ok) {
            setApplications(prev =>
              prev.map(app =>
                app.id === certificateModal.applicationId
                  ? { 
                      ...app, 
                      status: 'PROCESSED_BY_CLERK',
                      certificateNumber: certificateModal.certificateNumber 
                    }
                  : app
              )
            );
            
            setCertificateModal({
              isVisible: false,
              applicationId: '',
              certificateNumber: '',
              paymentAmount: '',
              paymentDate: '',
            });
            
            toast({
              title: "Success",
              description: "Application processed successfully. Certificate details added and forwarded to Executive Engineer.",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to process application",
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
    }
  };

  // TEMPORARY TESTING FUNCTION - Update stage bypass with digital signature (TODO: Remove after testing)
  const handleUpdateStageForTesting = async (applicationId: string) => {
    const stageMapping = STAGE_MAPPINGS.CLERK;
    
    await callApi(async () => {
      await handleGlobalUpdateStageForTesting({
        applicationId,
        currentStage: stageMapping.currentStage,
        nextStage: stageMapping.nextStage,
        nextStageName: stageMapping.nextStageName,
        comments: 'Testing bypass - Clerk processed application, certificate number generated (with digital signature)',
        onSuccess: async () => {
          await fetchApplications();
        },
        showToast: toast
      });
    }, 'Updating stage with digital signature (testing)...');
  };

  const filteredApplications = applications.filter((app: any) => {
    if (filters.status && app.status !== filters.status) return false;
    if (filters.position && app.position !== filters.position) return false;
    if (filters.search && !app.applicantName.toLowerCase().includes(filters.search.toLowerCase()) && 
        !app.applicationNumber.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'FORWARDED_TO_CLERK').length,
    processed: applications.filter(app => app.status === 'PROCESSED_BY_CLERK').length,
    withPayment: applications.filter(app => app.paymentStatus === 'COMPLETED').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Clerk Dashboard</h1>
        <p className="text-gray-600">Process post-payment applications and generate certificate numbers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending Processing</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
          <div className="text-sm text-gray-600">Processed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-emerald-600">{stats.withPayment}</div>
          <div className="text-sm text-gray-600">Payment Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Name or Application Number"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="FORWARDED_TO_CLERK">Pending Processing</option>
              <option value="PROCESSED_BY_CLERK">Processed</option>
            </select>
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <select
              id="position"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.position}
              onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
            >
              <option value="">All Positions</option>
              <option value="Architect">Architect</option>
              <option value="Structural Engineer">Structural Engineer</option>
              <option value="Licence Engineer">Licence Engineer</option>
              <option value="Supervisor 1">Supervisor 1</option>
              <option value="Supervisor 2">Supervisor 2</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => fetchApplications()} variant="outline" className="w-full">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Post-Payment Applications ({filteredApplications.length})</h2>
        </div>
        <div className="p-4">
          <TaskList
            applications={filteredApplications}
            onViewDetails={handleViewDetails}
            loading={loading}
            showActions={false}
          />
          
          {/* Custom Action Buttons for Clerk */}
          <div className="mt-4 space-y-4">
            {filteredApplications.map((app: any) => (
              <div key={app.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{app.applicantName}</span>
                  <span className="text-gray-500 ml-2">({app.applicationNumber})</span>
                  {app.certificateNumber && (
                    <span className="text-green-600 ml-2 text-sm">Cert: {app.certificateNumber}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(app.id)}
                  >
                    View Details
                  </Button>
                  {app.status === 'FORWARDED_TO_CLERK' && (
                    <Button
                      size="sm"
                      onClick={() => handleProcessApplication(app.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Process Application
                    </Button>
                  )}
                  {app.status === 'PROCESSED_BY_CLERK' && (
                    <span className="text-green-600 text-sm font-medium px-3 py-1 bg-green-50 rounded">
                      Processed ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {/* TEMPORARY TESTING SECTION - TODO: Remove after testing */}
            {filteredApplications.length > 0 && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="text-sm font-semibold text-orange-800 mb-2">🧪 Testing Controls</h3>
                <p className="text-xs text-orange-600 mb-3">⚠️ TESTING ONLY: Use these buttons to bypass OTP verification and move applications to the next stage</p>
                <div className="space-y-2">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between bg-white p-2 rounded border">
                      <div className="text-sm">
                        <span className="font-medium">{application.applicationNumber}</span>
                        <span className="text-gray-500 ml-2">- {application.applicantName}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                        onClick={() => handleUpdateStageForTesting(application.id)}
                        title="⚠️ TESTING ONLY: Bypass OTP and move to next stage"
                      >
                        🧪 Update Stage (Test)
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Processing Modal */}
      {certificateModal.isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Process Application</h2>
            <p className="text-gray-600 mb-4">
              Generate certificate number and add payment details
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input
                  id="certificateNumber"
                  value={certificateModal.certificateNumber}
                  onChange={(e) => setCertificateModal(prev => ({ 
                    ...prev, 
                    certificateNumber: e.target.value 
                  }))}
                  placeholder="PMC-CERT-2024-XXXXXX"
                />
              </div>
              
              <div>
                <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={certificateModal.paymentAmount}
                  onChange={(e) => setCertificateModal(prev => ({ 
                    ...prev, 
                    paymentAmount: e.target.value 
                  }))}
                  placeholder="5000"
                />
              </div>
              
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={certificateModal.paymentDate}
                  onChange={(e) => setCertificateModal(prev => ({ 
                    ...prev, 
                    paymentDate: e.target.value 
                  }))}
                />
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> After processing, this application will be forwarded to Executive Engineer for final signature.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setCertificateModal(prev => ({ ...prev, isVisible: false }))}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCertificateDetails} className="flex-1">
                Process & Forward
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
        title="Confirm Processing"
        description="Please enter your OTP to process this application and forward to Executive Engineer."
      />

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Application Details - Clerk Review</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <StatusProgress currentStatus={selectedApplication.status} className="mb-6" />
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Application Number:</strong> {selectedApplication.applicationNumber}
                </div>
                <div>
                  <strong>Applicant Name:</strong> {selectedApplication.applicantName}
                </div>
                <div>
                  <strong>Position:</strong> {selectedApplication.position}
                </div>
                <div>
                  <strong>Status:</strong> {selectedApplication.status.replace(/_/g, ' ')}
                </div>
                <div>
                  <strong>Payment Status:</strong> {selectedApplication.paymentStatus}
                </div>
                <div>
                  <strong>Last Updated:</strong> {new Date(selectedApplication.lastUpdated).toLocaleDateString()}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Payment Verification</h3>
                <div className="space-y-1 text-green-700">
                  <p>✓ Payment has been completed successfully</p>
                  <p>✓ Payment challan has been generated</p>
                  <p>✓ Application is ready for certificate processing</p>
                </div>
              </div>
              
              {/* Previous Approvals */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Previous Approvals</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-gray-600">✓ Junior Engineer: Documents verified and approved</p>
                  <p className="text-gray-600">✓ Assistant Engineer: Application reviewed and forwarded</p>
                  <p className="text-gray-600">✓ Executive Engineer: Initial signature applied</p>
                  <p className="text-gray-600">✓ City Engineer: Approved for payment</p>
                  <p className="text-gray-600">✓ User: Payment completed successfully</p>
                </div>
              </div>
              
              {/* Documents */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Available Documents</h3>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">View Application Form</Button>
                  <Button variant="outline" size="sm">View All Attachments</Button>
                  <Button variant="outline" size="sm">View Payment Challan</Button>
                  <Button variant="outline" size="sm">View EE Signatures</Button>
                </div>
              </div>

              {/* Clerk Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Clerk Instructions</h3>
                <div className="text-blue-700 text-sm space-y-1">
                  <p>• Verify payment challan and amount</p>
                  <p>• Generate unique certificate number</p>
                  <p>• Add payment details to certificate</p>
                  <p>• Forward to Executive Engineer for final signature</p>
                </div>
              </div>

              {/* Certificate Information */}
              {selectedApplication.certificateNumber && (
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-900 mb-2">Certificate Details</h3>
                  <p className="text-emerald-700">Certificate Number: {selectedApplication.certificateNumber}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                {selectedApplication.status === 'FORWARDED_TO_CLERK' && (
                  <Button
                    onClick={() => handleProcessApplication(selectedApplication.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Process Application
                  </Button>
                )}
                
                <Button variant="outline" size="sm">
                  Download Payment Challan
                </Button>
                
                <Button
                  onClick={() => setSelectedApplication(null)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};