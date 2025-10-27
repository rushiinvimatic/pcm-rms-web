import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { OTPModal } from '../../../components/common/OTPModal';
import { StatusProgress } from '../../../components/common/StatusTracker/StatusProgress';
import { useToast } from '../../../hooks/use-toast';
import { useLoading } from '../../../hooks/useLoading';
import { dashboardService } from '../../../services/dashboard.service';
import { applicationService } from '../../../services/application.service';
import type { Application, OTPVerificationData, ApplicationStatus } from '../../../types/dashboard';
import { FileText, CheckCircle, XCircle, Eye, Forward } from 'lucide-react';
import { getPositionTypeLabel } from '../../../utils/enumMappings';

export const AssistantEngineerDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [otpModal, setOtpModal] = useState<OTPVerificationData>({
    isVisible: false,
    purpose: 'approve',
  });
  const [filters, setFilters] = useState({
    status: '',
    position: '',
    search: '',
  });
  const [stats, setStats] = useState({
    pendingReview: 0,
    underReview: 0,
    forwarded: 0,
    total: 0
  });

  const { toast } = useToast();
  const { withLoader } = useLoading();

  const callApi = async <T,>(
    apiCall: () => Promise<T>,
    loadingMessage = 'Please wait...'
  ): Promise<T> => {
    return withLoader(apiCall(), loadingMessage);
  };

  const statusConfig: Record<ApplicationStatus, { color: string; label: string }> = {
    'SUBMITTED': { color: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
    'ASSIGNED_TO_JE': { color: 'bg-blue-100 text-blue-800', label: 'Assigned to JE' },
    'APPOINTMENT_SCHEDULED': { color: 'bg-purple-100 text-purple-800', label: 'Appointment Scheduled' },
    'DOCUMENTS_VERIFIED': { color: 'bg-purple-100 text-purple-800', label: 'Documents Verified' },
    'FORWARDED_TO_AE': { color: 'bg-orange-100 text-orange-800', label: 'Under AE Review' },
    'REVIEWED_BY_AE': { color: 'bg-orange-100 text-orange-800', label: 'Reviewed by AE' },
    'FORWARDED_TO_EE': { color: 'bg-indigo-100 text-indigo-800', label: 'Forwarded to EE' },
    'SIGNED_BY_EE_STAGE1': { color: 'bg-indigo-100 text-indigo-800', label: 'Signed by EE' },
    'FORWARDED_TO_CE_STAGE1': { color: 'bg-indigo-100 text-indigo-800', label: 'Forwarded to CE' },
    'APPROVED_BY_CE_STAGE1': { color: 'bg-green-100 text-green-800', label: 'Approved by CE' },
    'PAYMENT_PENDING': { color: 'bg-yellow-100 text-yellow-800', label: 'Payment Pending' },
    'PAYMENT_COMPLETED': { color: 'bg-green-100 text-green-800', label: 'Payment Completed' },
    'FORWARDED_TO_CLERK': { color: 'bg-blue-100 text-blue-800', label: 'Forwarded to Clerk' },
    'PROCESSED_BY_CLERK': { color: 'bg-blue-100 text-blue-800', label: 'Processed by Clerk' },
    'FORWARDED_TO_EE_STAGE2': { color: 'bg-indigo-100 text-indigo-800', label: 'Forwarded to EE Stage 2' },
    'SIGNED_BY_EE_STAGE2': { color: 'bg-indigo-100 text-indigo-800', label: 'Signed by EE Stage 2' },
    'FORWARDED_TO_CE_STAGE2': { color: 'bg-indigo-100 text-indigo-800', label: 'Forwarded to CE Stage 2' },
    'SIGNED_BY_CE_STAGE2': { color: 'bg-green-100 text-green-800', label: 'Signed by CE Stage 2' },
    'CERTIFICATE_ISSUED': { color: 'bg-green-100 text-green-800', label: 'Certificate Issued' },
    'REJECTED': { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  };



  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    await callApi(async () => {
      try {
        const response = await dashboardService.getAEApplications(1, 50);
        if (response.success) {
          const apps = response.applications || [];
          setApplications(apps);
          
          // Calculate stats
          const pendingReview = apps.filter(app => app.status === 3).length; // Documents Verified
          const underReview = apps.filter(app => app.status === 4).length; // Under AE Review
          const forwarded = apps.filter(app => app.status === 5).length; // Forwarded to EE
          
          setStats({
            pendingReview,
            underReview,
            forwarded,
            total: apps.length
          });
        } else {
          setApplications([]);
          toast({
            title: 'Error',
            description: 'Failed to fetch applications',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        setApplications([]);
        toast({
          title: 'Error',
          description: 'Failed to load applications',
          variant: 'destructive'
        });
      }
    }, 'Loading applications...');
  };

  const handleApprove = (applicationId: string) => {
    setOtpModal({
      isVisible: true,
      purpose: 'approve',
      applicationId,
      callback: async (otp: string) => {
        await approveApplication(applicationId, otp);
      }
    });
  };

  const approveApplication = async (applicationId: string, otp: string) => {
    await callApi(async () => {
      try {
        await applicationService.forwardApplication(applicationId, 'City Engineer', 'Approved by Assistant Engineer');
        
        // Update local state
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId
              ? { ...app, status: 'FORWARDED_TO_EE' as ApplicationStatus }
              : app
          )
        );
        
        toast({
          title: "Success",
          description: "Application approved and forwarded to City Engineer",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to approve application",
          variant: "destructive",
        });
      }
    }, 'Approving application...');
  };

  const handleReject = (applicationId: string) => {
    setOtpModal({
      isVisible: true,
      purpose: 'reject',
      applicationId,
      callback: async (otp: string) => {
        await rejectApplication(applicationId, otp);
      }
    });
  };

  const rejectApplication = async (applicationId: string, otp: string) => {
    await callApi(async () => {
      try {
        await applicationService.rejectApplication(applicationId, ['Technical requirements not met'], 'Rejected by Assistant Engineer');
        
        // Update local state
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId
              ? { ...app, status: 'REJECTED' as ApplicationStatus }
              : app
          )
        );

        toast({
          title: "Success",
          description: "Application rejected",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reject application",
          variant: "destructive",
        });
      }
    }, 'Rejecting application...');
  };



  const handleViewDetails = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      setSelectedApplication(application);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filters.search && !app.applicantName.toLowerCase().includes(filters.search.toLowerCase()) && 
        !app.applicationNumber.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status && app.status.toString() !== filters.status) return false;
    if (filters.position && app.positionType.toString() !== filters.position) return false;
    return true;
  });



  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Assistant Engineer Dashboard</h1>
        <p className="text-gray-600">Review applications from Junior Engineers and forward to Executive Engineer</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingReview}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-purple-600">{stats.underReview}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Forward className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Forwarded to EE</p>
              <p className="text-2xl font-bold text-green-600">{stats.forwarded}</p>
            </div>
          </div>
        </Card>
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
              <option value="3">Documents Verified</option>
              <option value="4">Under AE Review</option>
              <option value="5">Forwarded to EE</option>
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
              <option value="1">Assistant Engineer</option>
              <option value="2">Junior Engineer</option>
              <option value="3">City Engineer</option>
              <option value="4">Chief Engineer</option>
              <option value="5">Clerk</option>
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
          <h2 className="text-lg font-semibold">Applications ({filteredApplications.length})</h2>
        </div>
        <div className="p-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{application.applicantName}</h3>
                      <p className="text-gray-600">{getPositionTypeLabel(application.positionType)}</p>
                      <p className="text-sm text-gray-500">App ID: {application.applicationNumber}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={statusConfig[application.status]?.color || 'bg-gray-100 text-gray-800'}>
                        {statusConfig[application.status]?.label || 'Unknown'}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        Submitted: {new Date(application.submittedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(application.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>

                    {application.status === 'DOCUMENTS_VERIFIED' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(application.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve & Forward
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(application.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={otpModal.isVisible}
        title={otpModal.purpose === 'approve' ? 'Approve Application' : 'Reject Application'}
        description={`Please enter your OTP to ${otpModal.purpose === 'approve' ? 'approve' : 'reject'} this application.`}
        onClose={() => setOtpModal(prev => ({ ...prev, isVisible: false }))}
        onVerify={otpModal.callback || (async () => {})}
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
                  <strong>Position:</strong> {getPositionTypeLabel(selectedApplication.positionType)}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <Badge className={statusConfig[selectedApplication.status]?.color || 'bg-gray-100 text-gray-800'}>
                    {statusConfig[selectedApplication.status]?.label || 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <strong>Assigned JE:</strong> {selectedApplication.assignedOfficer}
                </div>
                <div>
                  <strong>Last Updated:</strong> {new Date(selectedApplication.lastUpdated).toLocaleDateString()}
                </div>
              </div>
              
              {/* JE's Recommendation */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Junior Engineer's Recommendation</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">Junior Engineer has verified all documents and recommends this application for approval.</p>
                  {/* Recommendation form link would go here */}
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      View Recommendation Form
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Documents */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Documents</h3>
                <p className="text-gray-600">Documents viewer would be implemented here</p>
                <div className="mt-2 space-x-2">
                  <Button variant="outline" size="sm">
                    View Application Form
                  </Button>
                  <Button variant="outline" size="sm">
                    View Attachments
                  </Button>
                  <Button variant="outline" size="sm">
                    View Initial Certificate
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  onClick={() => handleApprove(selectedApplication.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve & Forward to EE
                </Button>
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