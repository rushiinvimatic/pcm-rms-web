import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { OTPModal } from '../../../components/common/OTPModal';
import { useToast } from '../../../hooks/use-toast';
import { useLoading } from '../../../hooks/useLoading';
import { applicationService } from '../../../services/application.service';
import type { Application, OTPVerificationData } from '../../../types/dashboard';

const AssistantSupervisor2Dashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpModal, setOtpModal] = useState<OTPVerificationData>({
    isVisible: false,
    purpose: 'approve',
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
      const response = await applicationService.fetchOfficerApplications();
      const relevantApplications = response.applications?.filter((app: any) => 
        app.positionType === 4 && app.status === 'FORWARDED_TO_AS2'
      ) || [];
      setApplications(relevantApplications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (applicationId: string) => {
    setOtpModal({
      isVisible: true,
      purpose: 'approve',
      applicationId,
      callback: async (otp: string) => {
        try {
          console.log('Verifying OTP:', otp);
          await applicationService.forwardApplication(applicationId, 'ExecutiveEngineer');
          setApplications(prev => prev.map(app => 
            app.id === applicationId ? { ...app, status: 'FORWARDED_TO_EE' } : app
          ));
          toast({ title: "Success", description: "Application forwarded to Executive Engineer" });
        } catch (error) {
          toast({ title: "Error", description: "Failed to forward application", variant: "destructive" });
          throw error;
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assistant Supervisor Grade 2 Dashboard</h1>
          <p className="mt-2 text-gray-600">Review and approve Grade 2 supervisor applications</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No supervisor applications pending review</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{application.applicationNumber}</h3>
                      <p className="text-sm text-gray-600">{application.applicantName}</p>
                      <p className="text-sm text-gray-500">{application.position}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button onClick={() => handleApprove(application.id)} className="bg-green-600 hover:bg-green-700 text-white" size="sm">Approve</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <OTPModal
          isOpen={otpModal.isVisible}
          onClose={() => setOtpModal({ isVisible: false, purpose: 'approve' })}
          onVerify={otpModal.callback || (() => Promise.resolve())}
          title="Approve Application"
          description="Please enter the OTP sent to your registered mobile number to approve this application."
        />
      </div>
    </div>
  );
};

export { AssistantSupervisor2Dashboard };
export default AssistantSupervisor2Dashboard;