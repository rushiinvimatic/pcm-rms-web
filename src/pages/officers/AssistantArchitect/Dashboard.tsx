import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { OTPModal } from '../../../components/common/OTPModal';
import { ApplicationFormViewer } from '../../../components/common/ApplicationFormViewer';
import { DocumentViewer } from '../../../components/common/DocumentViewer/DocumentViewer';
import { useToast } from '../../../hooks/use-toast';
import { useLoading } from '../../../hooks/useLoading';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building, 
  Search,
  Calendar,
  User
} from 'lucide-react';
import { appointmentService } from '../../../services/appointment.service';
import { applicationService } from '../../../services/application.service';
import { 
  getPositionTypeLabel, 
  getApplicationStatusLabel, 
  getApplicationStatusColor
} from '../../../utils/enumMappings';
import { ApplicationStage } from '../../../types/application';

// Interface for Assistant Architect applications
interface AAApplication {
  id: string;
  applicationNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  positionType: number;
  submissionDate: string;
  status: number;
  currentStage: number;
  juniorArchitectApprovedDate?: string;
  appointmentDate?: string;
}

interface OTPVerificationData {
  isVisible: boolean;
  purpose: 'approve' | 'reject';
  applicationId?: string;
  callback?: (otp: string) => Promise<void>;
}

export const AssistantArchitectDashboard: React.FC = () => {
  const [applications, setApplications] = useState<AAApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<AAApplication | null>(null);
  const [selectedApplicationDetails, setSelectedApplicationDetails] = useState<any>(null);
  const [documentViewer, setDocumentViewer] = useState({
    isOpen: false,
    documentUrl: '',
    documentName: '',
    documentType: 'pdf' as 'pdf' | 'image'
  });
  const [otpModal, setOtpModal] = useState<OTPVerificationData>({
    isVisible: false,
    purpose: 'approve',
  });
  const [filters, setFilters] = useState({
    position: '',
    search: '',
  });
  const [stats, setStats] = useState({
    pendingApproval: 0,
    totalProcessed: 0,
    architectApplications: 0,
    averageProcessingTime: 0
  });

  const { toast } = useToast();
  const { withLoader } = useLoading();

  const callApi = async <T,>(
    apiCall: () => Promise<T>,
    loadingMessage = 'Please wait...'
  ): Promise<T> => {
    return withLoader(apiCall(), loadingMessage);
  };

  // Calculate statistics
  useEffect(() => {
    calculateStats();
  }, [applications]);

  const calculateStats = () => {
    const pendingApproval = applications.length;
    const totalProcessed = applications.length; // This would come from all historical data
    const architectApplications = applications.filter(app => app.positionType === 0).length;
    
    setStats({
      pendingApproval,
      totalProcessed,
      architectApplications,
      averageProcessingTime: 2 // This would be calculated from historical data
    });
  };

  // Fetch applications when component mounts
  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      await callApi(async () => {
        // Fetch applications that are pending for Assistant Architect approval
        // Stage 2 = ASSISTANT_ENGINEER_PENDING
        const response = await appointmentService.getApplicationsList(ApplicationStage.ASSISTANT_ENGINEER_PENDING, 1, 50);
        console.log('Assistant Architect applications response:', response);
        
        let applicationsData: any[] = [];
        
        // Handle different response structures
        if (Array.isArray(response)) {
          applicationsData = response;
        } else if (response && Array.isArray(response.applications)) {
          applicationsData = response.applications;
        } else if (response && Array.isArray(response.data)) {
          applicationsData = response.data;
        }
        
        if (applicationsData.length > 0) {
          // Filter for architecture applications (positionType 0 based on your response)
          const filteredApps = applicationsData.filter(
            (app: any) => app.positionType === 0
          );
          
          const formattedApplications = filteredApps.map((app: any) => ({
            id: app.id,
            applicationNumber: app.applicationNumber || 'N/A',
            firstName: app.firstName || 'N/A',
            middleName: app.middleName || '',
            lastName: app.lastName || 'N/A',
            positionType: app.positionType,
            submissionDate: app.submissionDate || app.applicationDate || 'N/A',
            status: app.status,
            currentStage: app.currentStage,
            juniorArchitectApprovedDate: app.lastUpdated,
            appointmentDate: app.appointmentDate
          }));
          
          setApplications(formattedApplications);
          
          toast({
            title: 'Success',
            description: `Loaded ${formattedApplications.length} architect applications`,
          });
        } else {
          setApplications([]);
        }
      }, 'Loading applications...');
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredApplications = applications.filter((app) => {
    const searchTerm = filters.search.toLowerCase();
    const matchesSearch =
      app.applicationNumber.toLowerCase().includes(searchTerm) ||
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm);

    const matchesPosition = filters.position
      ? app.positionType.toString() === filters.position
      : true;

    return matchesSearch && matchesPosition;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleApproveApplication = async (applicationId: string) => {
    setOtpModal({
      isVisible: true,
      purpose: 'approve',
      applicationId,
      callback: async (otp: string) => {
        try {
          await callApi(async () => {
            const response = await applicationService.approveApplication(applicationId, otp);
            if (response.success) {
              toast({
                title: 'Success',
                description: 'Application approved successfully',
              });
              fetchPendingApplications(); // Refresh the list
            } else {
              throw new Error(response.message || 'Failed to approve application');
            }
          }, 'Approving application...');
        } catch (error) {
          console.error('Error approving application:', error);
          toast({
            title: 'Error',
            description: 'Failed to approve application. Please try again.',
            variant: 'destructive',
          });
        }
      },
    });
  };

  const handleRejectApplication = async (applicationId: string, reason: string = 'Assistant Architect review failed') => {
    setOtpModal({
      isVisible: true,
      purpose: 'reject',
      applicationId,
      callback: async (otp: string) => {
        try {
          await callApi(async () => {
            const response = await applicationService.rejectApplication(applicationId, reason, otp);
            if (response.success) {
              toast({
                title: 'Success',
                description: 'Application rejected successfully',
              });
              fetchPendingApplications(); // Refresh the list
            } else {
              throw new Error(response.message || 'Failed to reject application');
            }
          }, 'Rejecting application...');
        } catch (error) {
          console.error('Error rejecting application:', error);
          toast({
            title: 'Error',
            description: 'Failed to reject application. Please try again.',
            variant: 'destructive',
          });
        }
      },
    });
  };

  const closeOtpModal = () => {
    setOtpModal(prev => ({
      ...prev,
      isVisible: false,
    }));
  };

  // Handle viewing application details
  const handleViewDetails = async (application: AAApplication) => {
    setSelectedApplication(application);
    
    try {
      const details = await applicationService.getApplicationById(application.id);
      setSelectedApplicationDetails(details);
    } catch (error) {
      console.error('Failed to fetch application details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load application details',
        variant: 'destructive'
      });
    }
  };

  // Handle document viewing
  const handleViewDocument = (documentUrl: string, documentName: string) => {
    const fileExtension = documentUrl.split('.').pop()?.toLowerCase();
    const documentType = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '') ? 'image' : 'pdf';
    
    setDocumentViewer({
      isOpen: true,
      documentUrl,
      documentName,
      documentType
    });
  };

  const getStatusDisplay = (status: number) => {
    return (
      <Badge
        variant="outline"
        className={`${getApplicationStatusColor(status)} px-3 py-1 text-xs font-medium`}
      >
        {getApplicationStatusLabel(status)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header section */}
        <div className="flex flex-row md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assistant Architect Dashboard</h1>
            <p className="text-gray-600">
              Manage and review architect applications
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              onClick={() => fetchPendingApplications()}
              variant="outline"
              className="flex items-center"
            >
              <RefreshIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Pending Approval"
            value={stats.pendingApproval}
            icon={<Clock className="h-6 w-6 text-blue-500" />}
            description="Applications awaiting your review"
            className="bg-blue-50 border-blue-200"
          />
          <StatsCard
            title="Total Processed"
            value={stats.totalProcessed}
            icon={<CheckCircle className="h-6 w-6 text-green-500" />}
            description="Applications you have reviewed"
            className="bg-green-50 border-green-200"
          />
          <StatsCard
            title="Average Processing"
            value={`${stats.averageProcessingTime} days`}
            icon={<Calendar className="h-6 w-6 text-purple-500" />}
            description="Average time to process"
            className="bg-purple-50 border-purple-200"
          />
          <StatsCard
            title="Architecture Applications"
            value={stats.architectApplications}
            icon={<Building className="h-6 w-6 text-amber-500" />}
            description="Total architecture applications"
            className="bg-amber-50 border-amber-200"
          />
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              name="search"
              placeholder="Search by application number or name"
              className="pl-10"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Pending Applications</h2>
            <p className="text-sm text-gray-600">Applications approved by Junior Architect awaiting your review</p>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {application.applicationNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {`${application.firstName} ${application.middleName ? application.middleName + ' ' : ''}${application.lastName}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getPositionTypeLabel(application.positionType)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusDisplay(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span>{formatDate(application.submissionDate)}</span>
                          {application.juniorArchitectApprovedDate && (
                            <span className="text-xs text-gray-400 mt-1">
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                Jr. Approved: 
                                {formatDate(application.juniorArchitectApprovedDate)}
                              </div>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                              onClick={() => handleViewDetails(application)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              onClick={() => handleApproveApplication(application.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              onClick={() => handleRejectApplication(application.id)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no applications pending for your review at this time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationFormViewer
          isOpen={!!selectedApplication}
          onClose={() => {
            setSelectedApplication(null);
            setSelectedApplicationDetails(null);
          }}
          application={selectedApplicationDetails}
          onViewDocument={handleViewDocument}
          onDownloadDocument={handleViewDocument}
        />
      )}

      {/* Document Viewer Modal */}
      {documentViewer.isOpen && (
        <DocumentViewer
          onClose={() => setDocumentViewer({ ...documentViewer, isOpen: false })}
          documentUrl={documentViewer.documentUrl}
          documentName={documentViewer.documentName}
          documentType={documentViewer.documentType}
        />
      )}

      {otpModal.isVisible && (
        <OTPModal
            isOpen={otpModal.isVisible}
            onClose={closeOtpModal}
            onVerify={async (otp) => {
                if (otpModal.callback) {
                    await otpModal.callback(otp);
                }
                closeOtpModal();
            } } 
            title="Digital Signature Required" 
            description="Please enter the OTP to complete this action."        />
      )}
    </div>
  );
};

// Helper Components
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  className?: string;
}> = ({ title, value, icon, description, className }) => (
  <Card className={`overflow-hidden ${className}`}>
    <div className="p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
            <dd>
              <div className="text-xl font-semibold text-gray-900">{value}</div>
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </Card>
);

const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

export default AssistantArchitectDashboard;