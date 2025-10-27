import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { OTPModal } from '../../../components/common/OTPModal';
import { useToast } from '../../../hooks/use-toast';
import { useLoading } from '../../../hooks/useLoading';
import { 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building, 
  Search
} from 'lucide-react';
import { appointmentService, type ScheduleAppointmentRequest } from '../../../services/appointment.service';
import { applicationService } from '../../../services/application.service';
import { 
  getPositionTypeLabel, 
  getApplicationStatusLabel, 
  getApplicationStatusColor
} from '../../../utils/enumMappings';
import { ApplicationStage } from '../../../types/application';

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

export const JuniorEngineerDashboard: React.FC = () => {
  const [applications, setApplications] = useState<PMCApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<PMCApplication | null>(null);
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
  const [filters, setFilters] = useState({
    stage: '',
    position: '',
    search: '',
  });
  const [activeTab, setActiveTab] = useState<'pending' | 'scheduled' | 'reports'>('pending');
  const [stats, setStats] = useState({
    pending: 0,
    scheduled: 0,
    architectPending: 0,
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




  useEffect(() => {
    calculateStats();
  }, [applications]);

  // Fetch applications when component mounts
  useEffect(() => {
    fetchApplications();
  }, []);

  const calculateStats = () => {
    const pending = applications.filter(app => 
      app.currentStage === 0 || app.currentStage === 1 || app.currentStage === 2
    ).length;
    
    const scheduled = applications.filter(app => 
      app.currentStage === 5 || app.currentStage === 7
    ).length;
    
    const architectPending = applications.filter(app => 
      app.currentStage === 3
    ).length;
    
    setStats({
      pending,
      scheduled,
      architectPending,
      total: applications.length
    });
  };

  const fetchApplications = async () => {
    await callApi(async () => {
      try {
        // Fetch applications from the API using the correct endpoint structure
        console.log('Fetching applications from API...');
        const response = await appointmentService.getApplicationsList(1, 1, 10);
        console.log('Applications API response:', response);
        
        // Handle different possible response structures
        let applicationsData: PMCApplication[] = [];
        
        if (response && Array.isArray(response)) {
          // Direct array response
          applicationsData = response;
        } else if (response && response.applications && Array.isArray(response.applications)) {
          // Nested applications array
          applicationsData = response.applications;
        } else if (response && response.data && Array.isArray(response.data)) {
          // Data property array
          applicationsData = response.data;
        }
        
        if (applicationsData.length > 0) {
          setApplications(applicationsData);
          toast({
            title: 'Success',
            description: `Loaded ${applicationsData.length} applications successfully`,
          });
        } else {
          setApplications([]);
          toast({
            title: 'Info',
            description: 'No applications found with status 1',
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

  const handleScheduleAppointment = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
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
        // Combine date and time into ISO string for reviewDate
        const reviewDateTime = new Date(`${appointmentData.date}T${appointmentData.time}:00`);
        
        // Validate GUID format for applicationId
        const applicationId = selectedApplication.id;
        if (!applicationId || !isValidGuid(applicationId)) {
          throw new Error('Invalid application ID format. Expected GUID.');
        }
        
        const request: ScheduleAppointmentRequest = {
          model: 'ScheduleAppointmentModel',
          applicationId: applicationId,
          comments: appointmentData.comments || 'Document verification appointment scheduled',
          reviewDate: reviewDateTime.toISOString(),
          contactPerson: appointmentData.contactPerson,
          place: appointmentData.place,
          roomNumber: appointmentData.roomNumber || 'TBD'
        };

        console.log('Scheduling appointment with API:', request);
        const response = await appointmentService.scheduleAppointment(request);
        
        if (response.success) {
          // Update application stage to APPOINTMENT_SCHEDULED
          setApplications(prev =>
            prev.map(app =>
              app.id === selectedApplication.id
                ? { ...app, currentStage: 5 } // 5 = APPOINTMENT_SCHEDULED
                : app
            )
          );

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
          
          toast({
            title: "Success",
            description: `Appointment scheduled for ${selectedApplication.firstName} ${selectedApplication.lastName} on ${appointmentData.date} at ${appointmentData.time}`,
          });
        } else {
          throw new Error(response.message || 'Failed to schedule appointment');
        }
      } catch (error: any) {
        console.error('Appointment scheduling error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to schedule appointment",
          variant: "destructive",
        });
      }
    }, 'Scheduling appointment...');
  };

  const handleVerifyDocuments = (applicationId: string) => {
    setOtpModal({
      isVisible: true,
      purpose: 'approve',
      applicationId,
      callback: async (otp: string) => {
        await verifyDocuments(applicationId, otp);
      }
    });
  };

  const verifyDocuments = async (applicationId: string, otp: string) => {
    await callApi(async () => {
      try {
        const application = applications.find(app => app.id === applicationId);
        if (!application) return;

        // Use OTP for verification (sent to API)
        console.log('Verifying documents with OTP:', otp, 'for application:', applicationId);
        
        // Mock API call to verify documents
        const verificationData = {
          id: applicationId,
          OTP: otp,
          Status: 'DOCUMENTS_VERIFIED',
          VerifiedBy: 'Junior Engineer',
          VerificationDate: new Date().toISOString()
        };
        console.log('Verification data:', verificationData);

        // Update application stage
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId
              ? { ...app, currentStage: 7 }
              : app
          )
        );

        setOtpModal({ isVisible: false, purpose: 'approve' });

        toast({
          title: "Success",
          description: `Documents verified for ${application.firstName} ${application.lastName}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to verify documents",
          variant: "destructive",
        });
      }
    }, 'Verifying documents...');
  };

  const handleRejectApplication = (applicationId: string) => {
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
        const application = applications.find(app => app.id === applicationId);
        if (!application) return;

        // Use OTP for verification (sent to API)
        console.log('Rejecting application with OTP:', otp, 'for application:', applicationId);
        
        // Mock API call to reject application
        const rejectionData = {
          id: applicationId,
          OTP: otp,
          Status: 'REJECTED',
          RejectedBy: 'Junior Engineer',
          RejectionReason: 'Incomplete documents',
          RejectionDate: new Date().toISOString()
        };
        console.log('Rejection data:', rejectionData);

        // Update application stage
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId
              ? { ...app, currentStage: 9 }
              : app
          )
        );

        setOtpModal({ isVisible: false, purpose: 'approve' });

        toast({
          title: "Success",
          description: `Application rejected for ${application.firstName} ${application.lastName}`,
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

  const filteredApplications = applications.filter(app => {
    if (filters.search && 
        !(`${app.firstName} ${app.lastName}`
          .toLowerCase().includes(filters.search.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(filters.search.toLowerCase()))) {
      return false;
    }
    if (filters.stage && app.currentStage !== parseInt(filters.stage)) {
      return false;
    }
    if (filters.position && app.positionType !== parseInt(filters.position)) {
      return false;
    }
    return true;
  });

  const getApplicationsByTab = () => {
    switch (activeTab) {
      case 'pending':
        return filteredApplications.filter(app => 
          app.currentStage === 0 || // JUNIOR_ENGINEER_PENDING
          app.currentStage === 1 || // DOCUMENT_VERIFICATION_PENDING - needs scheduling
          app.currentStage === 2    // Submitted applications needing review
        );
      case 'scheduled':
        return filteredApplications.filter(app => 
          app.currentStage === 5 || // APPOINTMENT_SCHEDULED
          app.currentStage === 7    // DOCUMENTS_VERIFIED
        );
      case 'reports':
        return filteredApplications;
      default:
        return filteredApplications;
    }
  };

  const formatDate = (dateString: string) => {
    // Handle different date formats from API
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionButtons = (application: PMCApplication) => {
    const actions = [];
    
    // Map currentStage numbers to appropriate actions
    switch (application.currentStage) {
      case 0: // JUNIOR_ENGINEER_PENDING
      case 1: // DOCUMENT_VERIFICATION_PENDING (needs scheduling)
      case 2: // ASSISTANT_ENGINEER_PENDING (submitted, needs initial review)
        actions.push(
          <Button
            key="schedule"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleScheduleAppointment(application.id)}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Schedule Appointment
          </Button>
        );
        break;
        
      case 5: // APPOINTMENT_SCHEDULED
        actions.push(
          <Button
            key="verify"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleVerifyDocuments(application.id)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Verify Documents
          </Button>,
          <Button
            key="reject"
            size="sm"
            variant="destructive"
            onClick={() => handleRejectApplication(application.id)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        );
        break;
        
      case 3: // JUNIOR_ENGINEER_ARCHITECT_PENDING
        actions.push(
          <Button
            key="review"
            size="sm"
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-1" />
            Under Review
          </Button>
        );
        break;
        
      case 7: // DOCUMENTS_VERIFIED
        actions.push(
          <Button
            key="completed"
            size="sm"
            variant="outline"
            className="bg-green-100 text-green-800"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Verified
          </Button>
        );
        break;
    }
    
    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Junior Engineer Dashboard</h1>
          <p className="text-gray-600">PMC Applications Management System - Schedule Appointments & Verify Documents</p>
          {applications.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <Calendar className="inline h-4 w-4 mr-1" />
                Click "Schedule Appointment" on any application to set up document verification meetings
              </p>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchApplications} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Refresh Applications
          </Button>
          {/* Test button for appointment scheduling */}
          {applications.length > 0 && (
            <Button 
              onClick={() => {
                setSelectedApplication(applications[0]);
                setShowAppointmentModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Test Schedule
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => setActiveTab('pending')}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab('scheduled')}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Architect Review</p>
              <p className="text-2xl font-bold text-orange-600">{stats.architectPending}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-600">{stats.total}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'pending' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Applications
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'scheduled' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled & Verified
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'reports' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('reports')}
        >
          All Reports
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name or ID..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="stage">Stage</Label>
            <select
              id="stage"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={filters.stage}
              onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
            >
              <option value="">All Stages</option>
              <option value="JUNIOR_ENGINEER_PENDING">JE Pending</option>
              <option value="JUNIOR_ENGINEER_ARCHITECT_PENDING">JE Architect Pending</option>
              <option value="APPOINTMENT_SCHEDULED">Appointment Scheduled</option>
              <option value="DOCUMENTS_VERIFIED">Documents Verified</option>
            </select>
          </div>
          <div>
            <Label htmlFor="position">Position Type</Label>
            <select
              id="position"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={filters.position}
              onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
            >
              <option value="">All Positions</option>
              <option value="Architect">Architect</option>
              <option value="Structural Engineer">Structural Engineer</option>
              <option value="Licence Engineer">Licence Engineer</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={() => setFilters({ stage: '', position: '', search: '' })}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Applications List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            {activeTab === 'pending' && 'Pending Applications'}
            {activeTab === 'scheduled' && 'Scheduled & Verified Applications'}  
            {activeTab === 'reports' && 'All Application Reports'}
          </h2>
          <div className="text-sm text-gray-500">
            {getApplicationsByTab().length} applications
          </div>
        </div>
        
        {getApplicationsByTab().length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500">
              {activeTab === 'pending' && 'No pending applications at the moment.'}
              {activeTab === 'scheduled' && 'No scheduled or verified applications.'}
              {activeTab === 'reports' && 'No application reports available.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {getApplicationsByTab().map((application) => (
              <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-gray-500" />
                        <h3 className="font-semibold text-lg text-gray-900">
                          {application.firstName} {application.middleName} {application.lastName}
                        </h3>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {getPositionTypeLabel(application.positionType)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Application Number:</span> {application.applicationNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Application ID:</span> {application.id}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <Badge className={getApplicationStatusColor(application.status)}>
                          {getApplicationStatusLabel(application.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {getApplicationStageLabel(application.currentStage)}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Submitted:</span><br />
                      {formatDate(application.submissionDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {getActionButtons(application)}
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    Stage: {application.currentStage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Appointment Scheduling Modal */}
      {showAppointmentModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Schedule Document Verification Appointment</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAppointmentModal(false);
                  setSelectedApplication(null);
                }}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Applicant Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {selectedApplication.firstName} {selectedApplication.middleName} {selectedApplication.lastName}</p>
                <p><span className="font-medium">Position:</span> {getPositionTypeLabel(selectedApplication.positionType)}</p>
                <p><span className="font-medium">Application Number:</span> {selectedApplication.applicationNumber}</p>
                <p><span className="font-medium">Application ID:</span> {selectedApplication.id}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointment-date">Appointment Date *</Label>
                  <Input
                    id="appointment-date"
                    type="date"
                    value={appointmentData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="appointment-time">Appointment Time *</Label>
                  <Input
                    id="appointment-time"
                    type="time"
                    value={appointmentData.time}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, time: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointment-place">Meeting Place *</Label>
                  <Input
                    id="appointment-place"
                    placeholder="PMC Office Building"
                    value={appointmentData.place}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, place: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="appointment-room">Room Number</Label>
                  <Input
                    id="appointment-room"
                    placeholder="Room 101"
                    value={appointmentData.roomNumber}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, roomNumber: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="contact-person">Contact Person *</Label>
                <Input
                  id="contact-person"
                  placeholder="Officer Name / Department"
                  value={appointmentData.contactPerson}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="appointment-comments">Instructions & Comments</Label>
                <textarea
                  id="appointment-comments"
                  className="w-full p-3 border border-gray-300 rounded-md mt-1 focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Please bring original documents for verification including:&#10;- Identity proof (Aadhar/PAN)&#10;- Educational certificates&#10;- Experience certificates&#10;- Any other relevant documents"
                  value={appointmentData.comments}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, comments: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAppointmentModal(false);
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
              <Button onClick={handleSaveAppointment} className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </div>
        </div>
      )}

      <OTPModal
        isOpen={otpModal.isVisible}
        title={otpModal.purpose === 'approve' ? 'Verify Documents' : 'Reject Application'}
        description={`Please enter your OTP to ${otpModal.purpose === 'approve' ? 'verify documents' : 'reject this application'}.`}
        onClose={() => setOtpModal({ isVisible: false, purpose: 'approve' })}
        onVerify={otpModal.callback || (async () => {})}
      />

      {/* Application Details Modal */}
      {selectedApplication && !showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold">Application Details</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApplication(null)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
            
            {/* Application Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedApplication.firstName} {selectedApplication.lastName}
                  </h4>
                  <p className="text-blue-600 font-medium">{getPositionTypeLabel(selectedApplication.positionType)}</p>
                </div>
                <Badge className={statusConfig[selectedApplication.currentStage]?.color || 'bg-gray-100 text-gray-800'}>
                  {getApplicationStageLabel(selectedApplication.currentStage)}
                </Badge>
              </div>
            </div>
            
            {/* Application Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Application Number</p>
                    <p className="text-gray-900 font-mono">{selectedApplication.applicationNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Application ID</p>
                    <p className="text-gray-900 font-mono text-sm">{selectedApplication.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-gray-900">{getApplicationStatusLabel(selectedApplication.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Position Type</p>
                    <p className="text-gray-900">{getPositionTypeLabel(selectedApplication.positionType)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-900 border-b pb-2">Status & Timeline</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Stage</p>
                    <p className="text-gray-900">{getApplicationStageLabel(selectedApplication.currentStage)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submission Date</p>
                    <p className="text-gray-900">{formatDate(selectedApplication.submissionDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Position Applied</p>
                    <p className="text-gray-900">{getPositionTypeLabel(selectedApplication.positionType)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Stage</p>
                    <p className="text-gray-900">
                      {getApplicationStageLabel(selectedApplication.currentStage)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Last updated: {formatDate(selectedApplication.submissionDate)}
              </div>
              <div className="flex space-x-3">
                {getActionButtons(selectedApplication)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      <OTPModal
        isOpen={otpModal.isVisible}
        title={
          otpModal.purpose === 'approve' ? 'Verify Documents' : 
          otpModal.purpose === 'reject' ? 'Reject Application' : 
          'Schedule Appointment'
        }
        description={`Please enter your OTP to ${
          otpModal.purpose === 'approve' ? 'verify documents and forward the application' : 
          otpModal.purpose === 'reject' ? 'reject this application' :
          'schedule the appointment'
        }.`}
        onClose={() => setOtpModal({ isVisible: false, purpose: 'approve' })}
        onVerify={otpModal.callback || (async () => {})}
      />
    </div>
  );
};