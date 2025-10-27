/**
 * TEMPORARY TESTING CHANGES - TODO: Remove after testing
 * - Added handleUpdateStageForTesting function 
 * - Added "🧪 Update Stage (Test)" button in application cards
 * These changes bypass OTP verification for testing purposes only
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { OTPModal } from '../../../components/common/OTPModal';
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

// Interface for Assistant Structural Engineer applications
interface ASEApplication {
  id: string;
  applicationNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  positionType: number;
  submissionDate: string;
  status: number;
  currentStage: number;
  juniorEngineerApprovedDate?: string;
  appointmentDate?: string;
}

interface OTPVerificationData {
  isVisible: boolean;
  purpose: 'approve' | 'reject';
  applicationId?: string;
  callback?: (otp: string) => Promise<void>;
}

export const AssistantStructuralEngineerDashboard: React.FC = () => {
  const [applications, setApplications] = useState<ASEApplication[]>([]);

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
    structuralEngineerApplications: 0,
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
    const structuralEngineerApplications = applications.filter(app => app.positionType === 1).length; // StructuralEngineer = 1
    
    setStats({
      pendingApproval,
      totalProcessed,
      structuralEngineerApplications,
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
        // Fetch applications that are pending for Assistant Structural Engineer approval
        // Stage 2 = ASSISTANT_ENGINEER_PENDING, filter for Structural Engineers only
        const response = await appointmentService.getApplicationsList(ApplicationStage.ASSISTANT_ENGINEER_PENDING, 1, 50);
        console.log('Assistant Structural Engineer applications response:', response);
        
        let applicationsData: ASEApplication[] = [];
        if (response && Array.isArray(response)) {
          applicationsData = response.filter((app: ASEApplication) => app.positionType === 1); // StructuralEngineer = 1
        } else if (response && response.applications && Array.isArray(response.applications)) {
          applicationsData = response.applications.filter((app: ASEApplication) => app.positionType === 1);
        } else if (response && response.data && Array.isArray(response.data)) {
          applicationsData = response.data.filter((app: ASEApplication) => app.positionType === 1);
        }
        
        setApplications(applicationsData);
        
        if (applicationsData.length > 0) {
          toast({
            title: 'Success',
            description: `Loaded ${applicationsData.length} pending structural engineer applications`,
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
    }, 'Loading structural engineer applications...');
  };

  // Handle approval with OTP verification and digital signature
  const handleApproveApplication = async (applicationId: string) => {
    try {
      const officerId = localStorage.getItem('officerId') || 'ase-officer-id';
      
      // Generate OTP first
      await applicationService.generateOTP(applicationId, officerId);
      
      setOtpModal({
        isVisible: true,
        purpose: 'approve',
        applicationId,
        callback: async (otp: string) => {
          try {
            // Approve application with OTP for Assistant Structural Engineer
            await applicationService.approveByAssistantEngineer(applicationId, otp, officerId, 'Approved by Assistant Structural Engineer');
            
            toast({
              title: 'Success',
              description: 'Structural Engineer application approved and forwarded to Executive Engineer',
            });
            
            // Refresh the applications list
            await fetchPendingApplications();
            
          } catch (error: any) {
            console.error('Approval failed:', error);
            toast({
              title: 'Error',
              description: error.message || 'Failed to approve application',
              variant: 'destructive'
            });
            throw error;
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
  const handleRejectApplication = async (applicationId: string, reason: string = 'Assistant Structural Engineer review failed') => {
    try {
      const officerId = localStorage.getItem('officerId') || 'ase-officer-id';
      await applicationService.rejectApplicationByOfficer(applicationId, officerId, reason);
      
      toast({
        title: 'Success',
        description: 'Structural Engineer application rejected successfully'
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
    // Use Assistant Engineer mapping since structural engineers follow similar flow
    const stageMapping = STAGE_MAPPINGS.ASSISTANT_ENGINEER;
    
    await callApi(async () => {
      await handleGlobalUpdateStageForTesting({
        applicationId,
        currentStage: stageMapping.currentStage,
        nextStage: stageMapping.nextStage,
        nextStageName: stageMapping.nextStageName,
        comments: 'Testing bypass - Assistant Structural Engineer approved, moved to Executive Engineer (with digital signature)',
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFullName = (app: ASEApplication): string => {
    return `${app.firstName} ${app.middleName} ${app.lastName}`.trim();
  };

  // Filter applications based on search and filters
  const filterApplications = (applications: ASEApplication[]) => {
    return applications.filter(app => {
      const matchesSearch = !filters.search || 
        app.applicationNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        getFullName(app).toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesPosition = !filters.position || app.positionType.toString() === filters.position;
      
      return matchesSearch && matchesPosition;
    });
  };

  const filteredApplications = filterApplications(applications);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assistant Structural Engineer Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Review and approve structural engineer applications forwarded from Junior Engineers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApproval}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
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

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Structural Engineers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.structuralEngineerApplications}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageProcessingTime} days</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search applications..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setFilters({ position: '', search: '' })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Applications List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Pending Structural Engineer Applications ({filteredApplications.length})
            </h2>
          </div>

          {filteredApplications.length === 0 ? (
            <Card className="p-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-600">
                No structural engineer applications are currently pending your approval.
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
                        
                        {application.juniorEngineerApprovedDate && (
                          <div className="flex items-center text-sm text-gray-500">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            <div>
                              <span className="font-medium">JE Approved:</span>
                              <br />
                              {formatDate(application.juniorEngineerApprovedDate)}
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
            description="Please enter the OTP to approve this structural engineer application and apply your digital signature."
          />
        )}
      </div>
    </div>
  );
};
