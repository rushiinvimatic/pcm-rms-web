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
import { handleGlobalUpdateStageForTesting, STAGE_MAPPINGS } from '../../../utils/testingUtils';
import { 
  getPositionTypeLabel, 
  getApplicationStatusLabel, 
  getApplicationStatusColor
} from '../../../utils/enumMappings';
import { ApplicationStage } from '../../../types/application';

// Interface for Assistant Supervisor 1 applications
interface AS1Application {
  id: string;
  applicationNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  positionType: number;
  submissionDate: string;
  status: number;
  currentStage: number;
  assistantEngineerApprovedDate?: string;
  appointmentDate?: string;
}

interface OTPVerificationData {
  isVisible: boolean;
  purpose: 'approve' | 'reject';
  applicationId?: string;
  callback?: (otp: string) => Promise<void>;
}

export const AssistantSupervisor1Dashboard: React.FC = () => {
  const [applications, setApplications] = useState<AS1Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<AS1Application | null>(null);
  const [selectedApplicationDetails, setSelectedApplicationDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
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
    supervisorApplications: 0,
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
    const supervisorApplications = applications.filter(app => app.positionType === 3).length;
    
    setStats({
      pendingApproval,
      totalProcessed,
      supervisorApplications,
      averageProcessingTime: 2 // This would be calculated from historical data
    });
  };

  // Fetch applications when component mounts
  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    await callApi(async () => {
      try {
        // Fetch applications that are pending for Assistant Supervisor 1 approval
        // Stage 3 = ASSISTANT_SUPERVISOR_1_PENDING
        const response = await appointmentService.getApplicationsList(ApplicationStage.ASSISTANT_ENGINEER_PENDING, 1, 50);
        console.log('Assistant Supervisor 1 applications response:', response);
        
        let applicationsData: AS1Application[] = [];
        if (response && Array.isArray(response)) {
          applicationsData = response;
        } else if (response && response.applications && Array.isArray(response.applications)) {
          applicationsData = response.applications;
        } else if (response && response.data && Array.isArray(response.data)) {
          applicationsData = response.data;
        }
        
        setApplications(applicationsData);
        
        if (applicationsData.length > 0) {
          toast({
            title: 'Success',
            description: `Loaded ${applicationsData.length} pending applications`,
          });
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load applications',
          variant: 'destructive'
        });
      }
    }, 'Loading applications...');
  };

  // Handle approval with OTP verification and digital signature
  const handleApproveApplication = async (applicationId: string) => {
    try {
      const officerId = localStorage.getItem('officerId') || 'as1-officer-id';
      
      // Generate OTP first
      await applicationService.generateOTP(applicationId, officerId);
      
      setOtpModal({
        isVisible: true,
        purpose: 'approve',
        applicationId,
        callback: async (otp: string) => {
          try {
            // Apply digital signature with OTP
            await applicationService.applyDigitalSignature(applicationId, otp, officerId);
            
            toast({
              title: 'Success',
              description: 'Application approved and digitally signed successfully'
            });
            
            // Refresh the applications list
            await fetchPendingApplications();
            
          } catch (error: any) {
            console.error('Digital signature failed:', error);
            toast({
              title: 'Error',
              description: error.message || 'Failed to apply digital signature',
              variant: 'destructive'
            });
          }
        }
      });
      
    } catch (error: any) {
      console.error('OTP generation failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate OTP',
        variant: 'destructive'
      });
    }
  };

  // Handle application rejection
  const handleRejectApplication = async (applicationId: string, reason: string = 'Assistant Supervisor 1 review failed') => {
    try {
      const officerId = localStorage.getItem('officerId') || 'as1-officer-id';
      await applicationService.rejectApplicationByOfficer(applicationId, officerId, reason);
      
      toast({
        title: 'Success',
        description: 'Application rejected successfully'
      });
      
      // Refresh the applications list
      await fetchPendingApplications();
      
    } catch (error: any) {
      console.error('Rejection failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject application',
        variant: 'destructive'
      });
    }
  };

  // TEMPORARY TESTING FUNCTION - Update stage bypass with digital signature (TODO: Remove after testing)
  const handleUpdateStageForTesting = async (applicationId: string) => {
    const stageMapping = STAGE_MAPPINGS.SUPERVISOR1;
    
    await callApi(async () => {
      await handleGlobalUpdateStageForTesting({
        applicationId,
        currentStage: stageMapping.currentStage,
        nextStage: stageMapping.nextStage,
        nextStageName: stageMapping.nextStageName,
        comments: 'Testing bypass - Assistant Supervisor 1 approved, moved to Executive Engineer (with digital signature)',
        onSuccess: async () => {
          await fetchPendingApplications();
        },
        showToast: toast
      });
    }, 'Updating stage with digital signature (testing)...');
  };

  // Helper functions
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFullName = (app: AS1Application): string => {
    return `${app.firstName} ${app.middleName} ${app.lastName}`.trim();
  };

  // Filter applications based on search and filters
  const filterApplications = (applications: AS1Application[]) => {
    return applications.filter(app => {
      const matchesSearch = !filters.search || 
        getFullName(app).toLowerCase().includes(filters.search.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesPosition = !filters.position || 
        app.positionType.toString() === filters.position;
      
      return matchesSearch && matchesPosition;
    });
  };

  const filteredApplications = filterApplications(applications);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assistant Supervisor Grade 1 Dashboard</h1>
          <p className="text-gray-600">Review & Approve Applications with Digital Signature</p>
        </div>
        <Button 
          onClick={() => fetchPendingApplications()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApproval}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Processed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProcessed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Supervisor Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.supervisorApplications}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Processing Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageProcessingTime} days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search applications..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <select
            value={filters.position}
            onChange={(e) => setFilters({ ...filters, position: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Positions</option>
            <option value="0">Architect</option>
            <option value="1">Structural Engineer</option>
            <option value="2">Licence Engineer</option>
            <option value="3">Supervisor1</option>
            <option value="4">Supervisor2</option>
          </select>

          <Button
            variant="outline"
            onClick={() => setFilters({ position: '', search: '' })}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Applications Requiring Approval</h2>
          <p className="text-sm text-gray-600">Applications approved by Assistant Licence Engineer awaiting your review</p>
        </div>
        
        {filteredApplications.length === 0 ? (
          <Card className="p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
            <p className="mt-1 text-sm text-gray-500">
              All applications have been processed or none are available for review.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getFullName(application)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Application #{application.applicationNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getPositionTypeLabel(application.positionType)}
                        </Badge>
                        <Badge className={getApplicationStatusColor(application.status)}>
                          {getApplicationStatusLabel(application.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <span className="font-medium">Submitted:</span>
                          <br />
                          {formatDate(application.submissionDate)}
                        </div>
                      </div>
                      
                      {application.assistantEngineerApprovedDate && (
                        <div className="flex items-center text-sm text-gray-500">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          <div>
                            <span className="font-medium">ALE Approved:</span>
                            <br />
                            {formatDate(application.assistantEngineerApprovedDate)}
                          </div>
                        </div>
                      )}
                      
                      {application.appointmentDate && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          <div>
                            <span className="font-medium">Appointment:</span>
                            <br />
                            {formatDate(application.appointmentDate)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 ml-6">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
                      onClick={() => handleApproveApplication(application.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Sign
                    </Button>
                    
                    {/* TEMPORARY TESTING BUTTON - TODO: Remove after testing */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 min-w-[140px]"
                      onClick={() => handleUpdateStageForTesting(application.id)}
                      title="⚠️ TESTING ONLY: Bypass OTP and move to next stage"
                    >
                      🧪 Update Stage (Test)
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      className="min-w-[140px]"
                      onClick={() => handleRejectApplication(application.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {otpModal.isVisible && (
        <OTPModal
          isOpen={otpModal.isVisible}
          onClose={() => setOtpModal({ ...otpModal, isVisible: false })}
          onVerify={async (otp) => {
            if (otpModal.callback) {
              await otpModal.callback(otp);
            }
            setOtpModal({ ...otpModal, isVisible: false });
          }}
          title="Digital Signature Required"
          description="Please enter the OTP to approve this application and apply your digital signature."
        />
      )}
    </div>
  );
};