import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/application.service';
import { paymentService } from '../../services/payment.service';
import { useApiLoading } from '../../hooks/useLoading';
import { CardSkeleton } from '../../components/common/GlobalLoader';
import { useToast } from '../../hooks/use-toast';
import {
  getPositionTypeLabel,
  getApplicationStageLabel,
  getApplicationStatusLabel,
  getApplicationStatusColor
} from '../../utils/enumMappings';
import { ApplicationStatus } from '../../types/application';


interface ApiApplication {
  id: string;
  applicationNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  positionType: number;
  submissionDate: string;
  status: number;
  currentStage: number;
}

interface ApiResponse {
  success: boolean;
  data: ApiApplication[];
}

export const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState<Record<string, boolean>>({});


  const [challanInfo, setChallanInfo] = useState<Record<string, any>>({});
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const { callApi } = useApiLoading();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const loadChallanInfo = async (applicationId: string) => {
    try {
      const status = await paymentService.getChallanStatus(applicationId);
      setChallanInfo(prev => ({ ...prev, [applicationId]: status }));
    } catch (error) {
      console.error(`Failed to load challan info for ${applicationId}:`, error);
    }
  };

  const handleDownloadChallan = async (applicationId: string, applicationNumber: string) => {
    try {
      toast({
        title: "Downloading Challan",
        description: `Preparing challan for application ${applicationNumber}...`,
      });

      await paymentService.downloadChallanFile(applicationId, `Challan_${applicationNumber}.pdf`);

      toast({
        title: "Download Complete",
        description: "Challan has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Challan download error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download challan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async (applicationId: string, applicantName: string, position: string, positionType: number) => {
    try {
      toast({
        title: "Payment Successful",
        description: "Processing Stage 2 workflow: Generating challan and certificate...",
      });

      // Trigger Stage 2 workflow: simultaneous challan and certificate generation
      const result = await paymentService.processPaymentCompletionStage2(
        applicationId,
        applicantName,
        position,
        positionType
      );

      if (result.success) {
        toast({
          title: "Stage 2 Processing Complete",
          description: "Challan and certificate have been generated successfully. Officers will now process your certificate signatures.",
        });

        // Load challan info for the user
        if (result.challan) {
          setChallanInfo(prev => ({ ...prev, [applicationId]: result.challan }));
        }

        // Refresh applications to show updated status
        fetchApplications(false);
      } else {
        toast({
          title: "Stage 2 Processing Issues",
          description: `Some issues occurred: ${result.errors.join(', ')}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment success processing error:', error);
      toast({
        title: "Processing Error",
        description: "Payment was successful but post-payment processing encountered issues.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async (applicationId: string, applicationNumber: string) => {
    try {
      setPaymentProcessing(prev => ({ ...prev, [applicationId]: true }));

      toast({
        title: "Initiating Payment",
        description: `Processing payment for application ${applicationNumber}...`,
      });

      // Call the payment initiation API directly
      const response = await paymentService.initiatePayment(applicationId);

      if (response.success && response.data) {
        console.log('Payment initiation successful:', response);

        // Extract payment data from response
        const paymentData = response.data;

        // Validate that we have the required BillDesk payment data
        if (paymentData.paymentGatewayUrl && paymentData.bdOrderId && paymentData.rData) {
          console.log('Creating BillDesk payment form...');
          console.log('Gateway URL:', paymentData.paymentGatewayUrl);
          console.log('BdOrderId:', paymentData.bdOrderId);
          console.log('Authorization Header:', paymentData.authorizationHeader);

          // Create and submit form directly to BillDesk payment gateway
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = paymentData.paymentGatewayUrl;
          form.style.display = 'none';

          // Add required form fields for BillDesk
          const fields: Record<string, string> = {
            merchantid: 'UATPMCNTYA',
            bdorderid: paymentData.bdOrderId,
            rdata: paymentData.rData
          };

          // Add form fields
          Object.keys(fields).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = fields[key];
            form.appendChild(input);
          });

          // Append to body and submit immediately
          document.body.appendChild(form);
          console.log('Submitting form to BillDesk payment gateway:', form.action);
          console.log('Form fields:', fields);

          // Submit the form to redirect to BillDesk
          form.submit();

          // Clean up form after submission
          setTimeout(() => {
            if (document.body.contains(form)) {
              document.body.removeChild(form);
            }
          }, 1000);

          toast({
            title: "Redirecting to Payment Gateway",
            description: "Please complete your payment in the new window.",
          });
        } else {
          console.error('Invalid payment response structure. Missing required fields:', {
            hasPaymentGatewayUrl: !!paymentData?.paymentGatewayUrl,
            hasBdOrderId: !!paymentData?.bdOrderId,
            hasRData: !!paymentData?.rData
          });
          toast({
            title: "Payment Failed",
            description: "Invalid payment response from server. Missing payment gateway data.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Payment Initiation Failed",
          description: response.message || "Failed to initiate payment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to initiate payment. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setPaymentProcessing(prev => ({ ...prev, [applicationId]: false }));
    }
  };



  useEffect(() => {
    fetchApplications();
  }, []);

  // Load challan information for applications with completed payments
  useEffect(() => {
    const loadChallansForCompletedPayments = async () => {
      if (applications && applications.length > 0) {
        const completedPaymentApps = applications.filter(
          app => app.status === ApplicationStatus.PaymentCompleted
        );

        for (const app of completedPaymentApps) {
          if (!challanInfo[app.id]) {
            try {
              await loadChallanInfo(app.id);
            } catch (error) {
              console.error(`Failed to load challan info for application ${app.id}:`, error);
            }
          }
        }
      }
    };

    loadChallansForCompletedPayments();
  }, [applications]);

  const fetchApplications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
        setError(null);
      }

      await callApi(async () => {
        const response: ApiResponse = await applicationService.fetchApplications(undefined, 1, 5); // Get recent 5 applications

        if (response.success) {
          setApplications(response.data);
          setError(null);

          // Calculate stats based on numeric status
          const total = response.data.length;
          const pending = response.data.filter(app =>
            app.status === ApplicationStatus.Submitted ||
            app.status === ApplicationStatus.UnderReview ||
            app.status === ApplicationStatus.PaymentPending
          ).length; // Submitted, Under Review, or Payment Pending
          const approved = response.data.filter(app =>
            app.status === ApplicationStatus.Completed ||
            app.status === ApplicationStatus.PaymentCompleted
          ).length; // Completed or Payment Completed
          const rejected = response.data.filter(app => app.status === ApplicationStatus.Rejected).length; // Rejected

          setStats({ total, pending, approved, rejected });
        } else {
          setError('Failed to load applications');
          setApplications([]);
          setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
        }
      }, isRefresh ? 'Refreshing applications...' : 'Loading your applications...');
      setIsInitialLoading(false);
      if (isRefresh) setIsRefreshing(false);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setError('Error loading applications. Please try again.');
      setApplications([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
      setIsInitialLoading(false);
      if (isRefresh) setIsRefreshing(false);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center mb-3">
              <div className="h-1 w-12 bg-amber-500 mr-3"></div>
              <span className="text-slate-600 text-sm font-semibold tracking-wider uppercase">Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome, {user?.name || (applications[0] ? `${applications[0].firstName} ${applications[0].lastName}` : 'Citizen')}
            </h1>
            <p className="text-slate-600">
              Manage your municipal applications and track their status through our secure government portal
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Applications</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-amber-50 rounded-lg">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">In Review</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Approved</p>
              <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-50 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Rejected</p>
              <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Recent Applications</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchApplications(true)}
              disabled={isInitialLoading || isRefreshing}
            >
              🔄 {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Link to="/user/applications">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </div>
        {isInitialLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-red-600 mb-2">⚠️ Error</div>
              <p className="text-red-800 mb-4">{error}</p>
              <Button onClick={() => fetchApplications(true)} disabled={isRefreshing}>
                {isRefreshing ? 'Retrying...' : 'Try Again'}
              </Button>
            </CardContent>
          </Card>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-lg transition-all hover:border-amber-300 border-slate-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-slate-900">
                        {app.applicationNumber}
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Position: {getPositionTypeLabel(app.positionType)} • Submitted: {formatDate(app.submissionDate)}
                      </CardDescription>
                    </div>
                    <Badge className={getApplicationStatusColor(app.status)}>
                      {getApplicationStatusLabel(app.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Applicant Details</p>
                      <p className="text-sm text-slate-900 mt-1">
                        {`${app.firstName} ${app.middleName} ${app.lastName}`.trim()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ID: {app.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Position & Stage</p>
                      <p className="text-sm text-slate-900 mt-1">
                        {getPositionTypeLabel(app.positionType)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Stage: {getApplicationStageLabel(app.currentStage)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Status & Timing</p>
                      <p className="text-sm text-slate-900 mt-1">
                        {getApplicationStatusLabel(app.status)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Submitted: {formatDate(app.submissionDate)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-sm text-amber-600 font-medium">Current Stage: {getApplicationStageLabel(app.currentStage)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Link to="/user/applications">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        {app.status === ApplicationStatus.PaymentPending && (
                          <Button
                            size="sm"
                            onClick={() => handlePayment(app.id, app.applicationNumber)}
                            disabled={paymentProcessing[app.id]}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {paymentProcessing[app.id] ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                💳 Pay Now
                              </>
                            )}
                          </Button>
                        )}
                        {app.status === 0 && (
                          <Link to="/user/application/new">
                            <Button size="sm">
                              Continue Application
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Challan Information for Completed Payments */}
                    {app.status === ApplicationStatus.PaymentCompleted && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">Payment Completed - Stage 2 Processing</p>
                            <p className="text-xs text-green-600">
                              Challan generated • Certificate sent to officers for signatures
                            </p>
                            {challanInfo[app.id] && (
                              <p className="text-xs text-green-600 mt-1">
                                Generated: {new Date(challanInfo[app.id].generatedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadChallan(app.id, app.applicationNumber)}
                            className="text-green-700 border-green-300 hover:bg-green-100"
                          >
                            📄 Download Challan
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-slate-200">
            <CardContent className="text-center py-12">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-600 mb-6">Get started by submitting your first PMC application</p>
              <Link to="/user/application/new">
                <Button>Start Your First Application</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};