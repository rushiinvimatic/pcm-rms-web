import {
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Search,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ApplicationFormViewer } from '../../../components/common/ApplicationFormViewer';
import { DocumentViewer } from '../../../components/common/DocumentViewer/DocumentViewer';
import { OTPModal } from '../../../components/common/OTPModal';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../hooks/use-toast';
import { useLoading } from '../../../hooks/useLoading';
import { applicationService } from '../../../services/application.service';
import { appointmentService, type ScheduleAppointmentRequest } from '../../../services/appointment.service';
import { fileService } from '../../../services/file.service';
import { ApplicationStage } from '../../../types/application';
import {
  getApplicationStatusColor,
  getApplicationStatusLabel,
  getPositionTypeLabel
} from '../../../utils/enumMappings';

// Updated interfaces based on actual API response structure
interface PMCApplication {
  id: string;
  applicationNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  positionType: number; // 0=Architect, 1=StructuralEngineer, etc.
  submissionDate: string;
  status: number; // ApplicationStatus enum values
  currentStage: number; // ApplicationStage enum values
}

interface ApplicationDetails {
  id: string;
  applicationNumber: string;
  applicantId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  motherName: string;
  mobileNumber: string;
  emailAddress: string;
  positionType: number;
  submissionDate: string;
  bloodGroup: string;
  height: number;
  gender: number;
  permanentAddress: {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  currentAddress: {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  panCardNumber: string;
  aadharCardNumber: string;
  coaCardNumber: string;
  status: number;
  currentStage: number;
  recommendedFormPath: string;
  documents: {
    id: string;
    documentType: number;
    filePath: string;
    fileName: string;
    fileId: string;
  }[];
}

interface DocumentViewerState {
  isOpen: boolean;
  documentUrl: string;
  documentName: string;
  documentType: 'pdf' | 'image';
}

interface AppointmentData {
  date: string;
  time: string;
  place: string;
  roomNumber: string;
  contactPerson: string;
  comments: string;
}

interface OTPVerificationData {
  isVisible: boolean;
  purpose: 'approve' | 'reject' | 'schedule';
  applicationId?: string;
  callback?: (otp: string) => Promise<void>;
}

// Helper function to validate GUID format
const isValidGuid = (guid: string): boolean => {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
};

export const JuniorStructuralEngineerDashboard: React.FC = () => {
  // Applications state for both lists
  const [pendingApplications, setPendingApplications] = useState<PMCApplication[]>([]);
  const [scheduledApplications, setScheduledApplications] = useState<PMCApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<PMCApplication | null>(null);
  
  // Modal states
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    date: '',
    time: '',
    place: '',
    roomNumber: '',
    contactPerson: '',
    comments: ''
  });
  const [otpModal, setOtpModal] = useState<OTPVerificationData>({
    isVisible: false,
    purpose: 'approve',
  });
  
  // Application details modal states
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [selectedApplicationDetails, setSelectedApplicationDetails] = useState<ApplicationDetails | null>(null);
  const [documentViewer, setDocumentViewer] = useState<DocumentViewerState>({
    isOpen: false,
    documentUrl: '',
    documentName: '',
    documentType: 'pdf'
  });

  // Filter and tab states
  const [filters, setFilters] = useState({
    stage: '',
    position: '',
    search: '',
  });
  const [activeTab, setActiveTab] = useState<'pending' | 'verification' | 'reports'>('pending');
  
  // Statistics
  const [stats, setStats] = useState({
    pendingReview: 0,
    scheduledVerification: 0,
    totalProcessed: 0,
    architectApplications: 0
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
  }, [pendingApplications, scheduledApplications]);

  const calculateStats = () => {
    const pendingReview = pendingApplications.length;
    const scheduledVerification = scheduledApplications.length;
    const totalProcessed = pendingReview + scheduledVerification;
    const architectApplications = pendingApplications.length;

    setStats({
      pendingReview,
      scheduledVerification,
      totalProcessed,
      architectApplications
    });
  };

  // Fetch applications when component mounts
  useEffect(() => {
    fetchPendingApplications();
    fetchScheduledApplications();
  }, []);

  const fetchPendingApplications = async () => {
    await callApi(async () => {
      try {
        const response = await appointmentService.getApplicationsList(ApplicationStage.JUNIOR_ENGINEER_PENDING, 1, 50);
        console.log('Pending applications response:', response);
        
        let applicationsData: PMCApplication[] = [];
        if (response && Array.isArray(response)) {
          applicationsData = response;
        } else if (response && response.applications && Array.isArray(response.applications)) {
          applicationsData = response.applications;
        } else if (response && response.data && Array.isArray(response.data)) {
          applicationsData = response.data;
        }
        
        const filteredApplications = applicationsData.filter(app => app.currentStage === 0);
        setPendingApplications(filteredApplications);
        
        if (filteredApplications.length > 0) {
          toast({
            title: 'Success',
            description: `Loaded ${filteredApplications.length} pending applications`,
          });
        }
      } catch (error) {
        console.error('Failed to fetch pending applications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load pending applications',
          variant: 'destructive'
        });
      }
    }, 'Loading pending applications...');
  };

  const fetchScheduledApplications = async () => {
    await callApi(async () => {
      try {
        const response = await appointmentService.getApplicationsList(ApplicationStage.DOCUMENT_VERIFICATION_PENDING, 1, 50);
        console.log('Scheduled applications response:', response);
        
        let applicationsData: PMCApplication[] = [];
        if (response && Array.isArray(response)) {
          applicationsData = response;
        } else if (response && response.applications && Array.isArray(response.applications)) {
          applicationsData = response.applications;
        } else if (response && response.data && Array.isArray(response.data)) {
          applicationsData = response.data;
        }
        
        const filteredApplications = applicationsData.filter(app => app.currentStage === 1);
        setScheduledApplications(filteredApplications);
        
        if (filteredApplications.length > 0) {
          toast({
            title: 'Success',
            description: `Loaded ${filteredApplications.length} scheduled applications`,
          });
        }
      } catch (error) {
        console.error('Failed to fetch scheduled applications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load scheduled applications',
          variant: 'destructive'
        });
      }
    }, 'Loading scheduled applications...');
  };

  const handleViewApplication = async (applicationId: string) => {
    await callApi(async () => {
      try {
        const response = await applicationService.getApplicationById(applicationId);
        console.log('Application details response:', response);
        
        if (response.success && response.data) {
          setSelectedApplicationDetails(response.data);
          setShowApplicationDetails(true);
        } else {
          throw new Error('Failed to fetch application details');
        }
      } catch (error: any) {
        console.error('Failed to fetch application details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load application details',
          variant: 'destructive'
        });
      }
    }, 'Loading application details...');
  };

  // Handle viewing documents
  const handleViewDocument = async (filePath: string, fileName: string, isRecommendedForm: boolean = false) => {
    await callApi(async () => {
      try {
        console.log('Downloading file:', filePath, fileName, 'isRecommendedForm:', isRecommendedForm);
        
        let blob: Blob;
        
        if (isRecommendedForm) {
          // Use special handling for recommended forms
          try {
            blob = await fileService.downloadRecommendedForm(filePath);
          } catch (error) {
            console.log('Recommended form download failed, trying standard methods:', error);
            // Fallback to standard methods
            try {
              blob = await fileService.downloadFile(filePath);
            } catch (error2) {
              console.log('Standard download failed, trying array buffer method:', error2);
              blob = await fileService.downloadFileAsArrayBuffer(filePath);
            }
          }
        } else {
          // Standard document handling
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
    }, 'Loading document...');
  };

  // Handle downloading documents
  const handleDownloadDocument = async (filePath: string, fileName: string, isRecommendedForm: boolean = false) => {
    await callApi(async () => {
      try {
        console.log('Downloading file:', filePath, fileName, 'isRecommendedForm:', isRecommendedForm);
        
        let blob: Blob;
        
        if (isRecommendedForm) {
          // Use special handling for recommended forms
          try {
            blob = await fileService.downloadRecommendedForm(filePath);
          } catch (error) {
            console.log('Recommended form download failed, trying standard methods:', error);
            // Fallback to standard methods
            try {
              blob = await fileService.downloadFile(filePath);
            } catch (error2) {
              console.log('Standard download failed, trying array buffer method:', error2);
              blob = await fileService.downloadFileAsArrayBuffer(filePath);
            }
          }
        } else {
          // Standard document handling
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
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Success',
          description: 'Document downloaded successfully'
        });
      } catch (error: any) {
        console.error('Failed to download document:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to download document',
          variant: 'destructive'
        });
      }
    }, 'Downloading document...');
  };

  const handleScheduleAppointment = (applicationId: string) => {
    const application = pendingApplications.find(app => app.id === applicationId);
    if (application) {
      setSelectedApplication(application);
      setShowAppointmentModal(true);
    }
  };

  const handleSaveAppointment = async () => {
    if (!selectedApplication || !appointmentData.date || !appointmentData.time || !appointmentData.place || !appointmentData.contactPerson) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Date, Time, Place, Contact Person)",
        variant: "destructive",
      });
      return;
    }

    await callApi(async () => {
      try {
        const reviewDateTime = new Date(`${appointmentData.date}T${appointmentData.time}:00`);
        const applicationId = selectedApplication.id;
        
        if (!applicationId || !isValidGuid(applicationId)) {
          throw new Error('Invalid application ID format. Expected GUID.');
        }
        
        const request: ScheduleAppointmentRequest = {
          model: 'ScheduleAppointmentModel',
          applicationId: applicationId,
          comments: appointmentData.comments,
          reviewDate: reviewDateTime.toISOString(),
          contactPerson: appointmentData.contactPerson,
          place: appointmentData.place,
          roomNumber: appointmentData.roomNumber
        };
        
        console.log('Scheduling appointment:', request);
        const response = await appointmentService.scheduleAppointment(request);
        
        if (response.success) {
          toast({
            title: "Success",
            description: "Appointment scheduled successfully",
          });
          
          await fetchPendingApplications();
          await fetchScheduledApplications();
          
          setShowAppointmentModal(false);
          setAppointmentData({
            date: '',
            time: '',
            place: '',
            roomNumber: '',
            contactPerson: '',
            comments: ''
          });
          setSelectedApplication(null);
        } else {
          throw new Error(response.message || 'Failed to schedule appointment');
        }
      } catch (error: any) {
        console.error('Appointment scheduling failed:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to schedule appointment",
          variant: "destructive",
        });
      }
    }, 'Scheduling appointment...');
  };

  const handleApproveDocuments = async (applicationId: string) => {
    try {
      const officerId = localStorage.getItem('officerId') || 'current-user-id';
      await applicationService.generateOTP(applicationId, officerId);
      
      setOtpModal({
        isVisible: true,
        purpose: 'approve',
        applicationId,
        callback: async (otp: string) => {
          try {
            console.log('OTP verified:', otp);
            
            toast({
              title: 'Success',
              description: 'Documents verified successfully. Application ready for next stage.'
            });
            
            await fetchPendingApplications();
            await fetchScheduledApplications();
            
          } catch (error: any) {
            console.error('Verification failed:', error);
            toast({
              title: 'Error',
              description: error.message || 'Failed to verify documents',
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

  const handleRejectApplication = async (applicationId: string, reason: string = 'Document verification failed') => {
    try {
      const officerId = localStorage.getItem('officerId') || 'current-user-id';
      await applicationService.rejectApplicationByOfficer(applicationId, officerId, reason);
      
      toast({
        title: 'Success',
        description: 'Application rejected successfully'
      });
      
      await fetchPendingApplications();
      await fetchScheduledApplications();
      
    } catch (error: any) {
      console.error('Rejection failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject application',
        variant: 'destructive'
      });
    }
  };

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

  const getFullName = (app: PMCApplication): string => {
    return `${app.firstName} ${app.middleName} ${app.lastName}`.trim();
  };

  const filterApplications = (applications: PMCApplication[]) => {
    return applications.filter(app => {
      const matchesSearch = !filters.search || 
        getFullName(app).toLowerCase().includes(filters.search.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesPosition = !filters.position || 
        app.positionType.toString() === filters.position;
      
      const matchesStage = !filters.stage || 
        app.currentStage.toString() === filters.stage;
      
      return matchesSearch && matchesPosition && matchesStage;
    });
  };

  const filteredPendingApplications = filterApplications(pendingApplications);
  const filteredScheduledApplications = filterApplications(scheduledApplications);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Junior Structural Engineer Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Review Applications & Verify Documents</p>
          </div>
          <Button
            onClick={() => { fetchPendingApplications(); fetchScheduledApplications(); }}
            variant="outline"
            className="flex items-center"
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-yellow-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingReview}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-blue-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Document Verification</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.scheduledVerification}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-green-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Processed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProcessed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-purple-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.architectApplications}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs and Search Bar */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'pending'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Pending Applications
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'pending' ? 'bg-blue-500' : 'bg-gray-200 text-gray-700'
                }`}>
                  {filteredPendingApplications.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('verification')}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'verification'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Document Verification
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'verification' ? 'bg-blue-500' : 'bg-gray-200 text-gray-700'
                }`}>
                  {filteredScheduledApplications.length}
                </span>
              </button>
            </nav>
            
            {/* Search Field */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Search applications..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6 hidden">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Applications ({filteredPendingApplications.length})
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'verification'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Document Verification ({filteredScheduledApplications.length})
            </button>
          </nav>
        </div>

        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Pending Applications</h2>
              <p className="text-sm text-gray-600">Review and schedule appointments for document verification</p>
            </div>
            
            {filteredPendingApplications.length === 0 ? (
              <Card className="p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No applications found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  All applications have been processed or none are available for review.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredPendingApplications.map((application) => (
                  <Card key={application.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {getFullName(application)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Application #{application.applicationNumber}
                            </p>
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
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Submitted: {formatDate(application.submissionDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewApplication(application.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleScheduleAppointment(application.id)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule Appointment
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectApplication(application.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Document Verification</h2>
              <p className="text-sm text-gray-600">Verify documents and approve applications</p>
            </div>
            
            {filteredScheduledApplications.length === 0 ? (
              <Card className="p-6 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No applications for verification</h3>
                <p className="mt-2 text-sm text-gray-500">
                  No applications are currently scheduled for document verification.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredScheduledApplications.map((application) => (
                  <Card key={application.id} className="p-4">
                    <div className="flex flex-row md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.applicationNumber}
                          </h3>
                          <span className="ml-2">
                            <Badge className={getApplicationStatusColor(application.status)}>
                              {getApplicationStatusLabel(application.status)}
                            </Badge>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Applicant:</span>{' '}
                            <span className="font-medium">
                              {getFullName(application)}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Position:</span>{' '}
                            <span className="font-medium">
                              {getPositionTypeLabel(application.positionType)}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Submission Date:</span>{' '}
                            <span>{formatDate(application.submissionDate)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-col gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 md:w-full"
                          onClick={() => handleViewApplication(application.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="flex-1 md:w-full bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          onClick={() => handleApproveDocuments(application.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="flex-1 md:w-full bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          onClick={() => handleRejectApplication(application.id, 'Document verification failed')}
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
        )}

        {showAppointmentModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Schedule Appointment</h3>
              <p className="text-sm text-gray-600 mb-4">
                Schedule document verification appointment for {getFullName(selectedApplication)}
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={appointmentData.date}
                    onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={appointmentData.time}
                    onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="place">Place *</Label>
                  <Input
                    id="place"
                    placeholder="e.g., PMC Main Office"
                    value={appointmentData.place}
                    onChange={(e) => setAppointmentData({ ...appointmentData, place: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    placeholder="e.g., Room 101"
                    value={appointmentData.roomNumber}
                    onChange={(e) => setAppointmentData({ ...appointmentData, roomNumber: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    placeholder="Officer name"
                    value={appointmentData.contactPerson}
                    onChange={(e) => setAppointmentData({ ...appointmentData, contactPerson: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="comments">Comments</Label>
                  <Input
                    id="comments"
                    placeholder="Additional instructions..."
                    value={appointmentData.comments}
                    onChange={(e) => setAppointmentData({ ...appointmentData, comments: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAppointmentModal(false);
                    setSelectedApplication(null);
                    setAppointmentData({
                      date: '',
                      time: '',
                      place: '',
                      roomNumber: '',
                      contactPerson: '',
                      comments: ''
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveAppointment}>
                  Schedule Appointment
                </Button>
              </div>
            </div>
          </div>
        )}

        {otpModal.isVisible && (
          <OTPModal
            isOpen={otpModal.isVisible}
            onClose={() => setOtpModal({ ...otpModal, isVisible: false })}
            onVerify={async (otp) => {
              if (otpModal.callback) {
                await otpModal.callback(otp);
              }
              
              toast({
                title: 'Success',
                description: otpModal.purpose === 'approve' 
                  ? 'Documents verified and digitally signed successfully'
                  : 'Action completed successfully'
              });
              
              await fetchPendingApplications();
              await fetchScheduledApplications();
              
              setOtpModal({ ...otpModal, isVisible: false });
            }}
            title={`${otpModal.purpose === 'approve' ? 'Approve' : 'Reject'} Application`}
            description={`Please enter the OTP to ${otpModal.purpose} this application.`}
          />
        )}

        {/* Application Details Modal using ApplicationFormViewer */}
        <ApplicationFormViewer
          isOpen={showApplicationDetails}
          application={selectedApplicationDetails}
          onClose={() => {
            setShowApplicationDetails(false);
            setSelectedApplicationDetails(null);
          }}
          onViewDocument={handleViewDocument}
          onDownloadDocument={handleDownloadDocument}
        />

        {/* Document Viewer */}
        {documentViewer.isOpen && (
          <DocumentViewer
            documentUrl={documentViewer.documentUrl}
            documentName={documentViewer.documentName}
            documentType={documentViewer.documentType}
            onClose={() => {
              URL.revokeObjectURL(documentViewer.documentUrl);
              setDocumentViewer({
                isOpen: false,
                documentUrl: '',
                documentName: '',
                documentType: 'pdf'
              });
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

export default JuniorStructuralEngineerDashboard;