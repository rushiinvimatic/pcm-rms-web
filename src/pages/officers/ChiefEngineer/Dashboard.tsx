import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { TaskList } from '../../../components/common/TaskList';
import { OTPModal } from '../../../components/common/OTPModal';
import { StatusProgress } from '../../../components/common/StatusTracker/StatusProgress';
import { useToast } from '../../../hooks/use-toast';
import type { Application, OTPVerificationData } from '../../../types/dashboard';

type TaskStage = 'stage1' | 'stage2';

export const ChiefEngineerDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | any>(null);
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
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API
      const response = await fetch('/api/chief-engineer/applications');
      const data = await response.json();
      setApplications(data.applications || []);
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
          status: 'FORWARDED_TO_EE',
          submittedDate: '2024-01-15T10:00:00Z',
          lastUpdated: '2024-01-18T16:30:00Z',
          assignedOfficer: 'AE Johnson',
          documents: [],
          statusHistory: [],
        },
        // Stage 2 applications (Post-payment)
        {
          id: '2',
          applicationNumber: 'PMC/2024/002',
          applicantName: 'Jane Smith',
          position: 'Structural Engineer',
          positionType: 1,
          status: 'FORWARDED_TO_EE_STAGE2',
          submittedDate: '2024-01-10T09:00:00Z',
          lastUpdated: '2024-01-20T10:15:00Z',
          assignedOfficer: 'Clerk Wilson',
          paymentStatus: 'COMPLETED',
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
        app.status === 'FORWARDED_TO_EE' || 
        app.status === 'SIGNED_BY_EE_STAGE1'
      );
    } else {
      return applications.filter(app => 
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
          const response = await fetch(`/api/applications/${signatureModal.applicationId}/ee-sign`, {
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
            const newStatus = signatureModal.stage === 1 ? 'SIGNED_BY_EE_STAGE1' : 'SIGNED_BY_EE_STAGE2';
            
            setApplications(prev =>
              prev.map(app =>
                app.id === signatureModal.applicationId
                  ? { ...app, status: newStatus }
                  : app
              )
            );
            
            toast({
              title: "Success",
              description: `Digital signature applied successfully${signatureModal.stage === 1 ? '. Application ready for City Engineer review.' : '. Application signed and ready for final City Engineer approval.'}`,
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
    const isStage2 = application?.status === 'FORWARDED_TO_EE_STAGE2';

    setOtpModal({
      isVisible: true,
      purpose: 'approve',
      applicationId,
      callback: async (otp: string) => {
        try {
          const response = await fetch(`/api/applications/${applicationId}/ee-approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              otp, 
              action: 'approve',
              stage: isStage2 ? 2 : 1 
            }),
          });

          if (response.ok) {
            const newStatus = isStage2 ? 'FORWARDED_TO_CE_STAGE2' : 'FORWARDED_TO_CE_STAGE1';
            
            setApplications(prev =>
              prev.map(app =>
                app.id === applicationId
                  ? { ...app, status: newStatus }
                  : app
              )
            );
            
            toast({
              title: "Success",
              description: `Application approved and forwarded to City Engineer ${isStage2 ? '(Final Stage)' : '(Stage 1)'}`,
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

  const handleReject = (applicationId: string) => {
    setOtpModal({
      isVisible: true,
      purpose: 'reject',
      applicationId,
      callback: async (otp: string) => {
        try {
          const reasons = prompt("Please provide rejection reasons:");
          if (!reasons) return;

          const response = await fetch(`/api/applications/${applicationId}/ee-reject`, {
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
      pending: stage1Apps.filter(app => app.status === 'FORWARDED_TO_EE').length,
      signed: stage1Apps.filter(app => app.status === 'SIGNED_BY_EE_STAGE1').length,
    },
    stage2: {
      total: stage2Apps.length,
      pending: stage2Apps.filter(app => app.status === 'FORWARDED_TO_EE_STAGE2').length,
      signed: stage2Apps.filter(app => app.status === 'SIGNED_BY_EE_STAGE2').length,
    },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Executive Engineer Dashboard</h1>
        <p className="text-gray-600">Review applications and apply digital signatures</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('stage1')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stage1'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stage 1 (Pre-Payment) ({stage1Apps.length})
          </button>
          <button
            onClick={() => setActiveTab('stage2')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stage2'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stage 2 (Post-Payment) ({stage2Apps.length})
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {activeTab === 'stage1' ? (
          <>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{stats.stage1.total}</div>
              <div className="text-sm text-gray-600">Total Stage 1</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">{stats.stage1.pending}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.stage1.signed}</div>
              <div className="text-sm text-gray-600">Signed</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{stats.stage2.total}</div>
              <div className="text-sm text-gray-600">Total Stage 2</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">{stats.stage2.pending}</div>
              <div className="text-sm text-gray-600">Pending Final Review</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.stage2.signed}</div>
              <div className="text-sm text-gray-600">Final Signed</div>
            </div>
          </>
        )}
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
              {activeTab === 'stage1' ? (
                <>
                  <option value="FORWARDED_TO_EE">Pending Review</option>
                  <option value="SIGNED_BY_EE_STAGE1">Signed</option>
                </>
              ) : (
                <>
                  <option value="FORWARDED_TO_EE_STAGE2">Pending Final Review</option>
                  <option value="SIGNED_BY_EE_STAGE2">Final Signed</option>
                </>
              )}
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
            <Button onClick={fetchApplications} variant="outline" className="w-full">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {activeTab === 'stage1' ? 'Stage 1 Applications' : 'Stage 2 Applications'} ({filteredApplications.length})
          </h2>
        </div>
        <div className="p-4">
          <TaskList
            applications={filteredApplications}
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onReject={handleReject}
            loading={loading}
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
                  <span className="font-medium text-blue-900">HSM Signature Required</span>
                </div>
                <p className="text-sm text-blue-700">
                  This application requires a digital signature using Hardware Security Module (HSM). 
                  Please confirm to proceed with the signature process.
                </p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Application:</strong> {applications.find(app => app.id === signatureModal.applicationId)?.applicationNumber}</p>
                <p><strong>Stage:</strong> {signatureModal.stage === 1 ? 'Pre-Payment Review' : 'Final Certificate Signing'}</p>
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
                Proceed with HSM Signature
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
            ? 'Please enter your OTP to apply digital signature using HSM.'
            : `Please enter your OTP to ${otpModal.purpose === 'approve' ? 'approve and forward' : 'reject'} this application.`
        }
      />

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Application Details</h2>
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
                  <strong>From Officer:</strong> {selectedApplication.assignedOfficer}
                </div>
                <div>
                  <strong>Last Updated:</strong> {new Date(selectedApplication.lastUpdated).toLocaleDateString()}
                </div>
              </div>

              {selectedApplication.paymentStatus && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Payment Information</h3>
                  <p className="text-green-700">Payment Status: {selectedApplication.paymentStatus}</p>
                </div>
              )}
              
              {/* Previous Reviews */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Previous Reviews</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-gray-600">✓ Junior Engineer: Documents verified and approved</p>
                  <p className="text-gray-600">✓ Assistant Engineer: Application reviewed and forwarded</p>
                  {selectedApplication.paymentStatus === 'COMPLETED' && (
                    <p className="text-gray-600">✓ Clerk: Payment processed and certificate generated</p>
                  )}
                </div>
              </div>
              
              {/* Documents */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Documents & Forms</h3>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">View Application Form</Button>
                  <Button variant="outline" size="sm">View Attachments</Button>
                  <Button variant="outline" size="sm">View Recommendation Form</Button>
                  {selectedApplication.paymentStatus === 'COMPLETED' && (
                    <>
                      <Button variant="outline" size="sm">View Payment Challan</Button>
                      <Button variant="outline" size="sm">View Certificate Draft</Button>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                {selectedApplication.status === 'FORWARDED_TO_EE' && (
                  <>
                    <Button
                      onClick={() => handleDigitalSign(selectedApplication.id, 1)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Apply Digital Signature
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedApplication.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve & Forward to CE
                    </Button>
                  </>
                )}
                
                {selectedApplication.status === 'FORWARDED_TO_EE_STAGE2' && (
                  <>
                    <Button
                      onClick={() => handleDigitalSign(selectedApplication.id, 2)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Apply Final Digital Signature
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedApplication.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Final Approve & Forward to CE
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => handleReject(selectedApplication.id)}
                  variant="destructive"
                >
                  Reject Application
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