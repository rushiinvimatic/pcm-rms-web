import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Eye, Download, FileText, CreditCard } from 'lucide-react';
import { applicationService } from '../../services/application.service';
import { paymentService } from '../../services/payment.service';
import { useToast } from '../../hooks/use-toast';
import { 
  getPositionTypeLabel, 
  getApplicationStageLabel,
  getApplicationStatusLabel,
  getApplicationStatusColor
} from '../../utils/enumMappings';
import { ApplicationStatus } from '../../types/application';
import { PaymentModal } from '../../components/common/PaymentModal';

interface Application {
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
  data: Application[];
}

export const MyApplicationsPage: React.FC = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [paymentProcessing, setPaymentProcessing] = useState<Record<string, boolean>>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<any>(null);
  const [paymentViewData, setPaymentViewData] = useState<any>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setError(null);
        const filterStatus = filter === 'all' ? undefined : filter;
        const response: ApiResponse = await applicationService.fetchApplications(filterStatus, 1, 10);
        
        if (response.success) {
          setApplications(response.data);
        } else {
          setError('Failed to fetch applications');
          setApplications([]);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Error loading applications. Please try again.');
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [filter]);

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const handlePayment = async (applicationId: string, applicationNumber: string) => {
    try {
      setPaymentProcessing(prev => ({ ...prev, [applicationId]: true }));
      
      toast({
        title: "Initiating Payment",
        description: `Processing payment for application ${applicationNumber}...`,
      });

      // Use the complete payment flow that handles both initiate and view APIs
      const response = await paymentService.processCompletePaymentFlow(applicationId);
      
      if (response.success && response.paymentData) {
        // Find application details for payment modal
        const application = applications?.find(app => app.id === applicationId);
        const applicantName = application ? 
          `${application.firstName} ${application.middleName} ${application.lastName}`.trim() : 
          'Unknown Applicant';
        const position = application ? getPositionTypeLabel(application.positionType) : 'Unknown Position';
        
        // Show modal with payment details
        setPaymentModalData({
          applicationNumber,
          applicationId,
          transactionId: response.paymentData.transactionId,
          bdOrderId: response.paymentData.bdOrderId,
          txnEntityId: response.paymentData.txnEntityId,
          paymentGatewayUrl: response.paymentData.paymentGatewayUrl || response.paymentData.redirectUrl,
          message: response.paymentData.message,
          applicantName,
          position
        });
        
        // Store the view data for form submission
        setPaymentViewData(response.viewData);
        setShowPaymentModal(true);
        
        toast({
          title: "Payment Ready",
          description: "Payment gateway is ready for processing.",
        });
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

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">⚠️ Error</div>
          <p className="text-red-800 mb-4">{error}</p>
          <button 
            onClick={() => {
              setLoading(true);
              const fetchApplications = async () => {
                try {
                  setError(null);
                  const filterStatus = filter === 'all' ? undefined : filter;
                  const response: ApiResponse = await applicationService.fetchApplications(filterStatus, 1, 10);
                  
                  if (response.success) {
                    setApplications(response.data);
                  } else {
                    setError('Failed to fetch applications');
                    setApplications([]);
                  }
                } catch (error) {
                  console.error('Error fetching applications:', error);
                  setError('Error loading applications. Please try again.');
                  setApplications([]);
                } finally {
                  setLoading(false);
                }
              };
              fetchApplications();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h2>
          <p className="text-gray-600">Track and manage your submitted applications</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            const fetchApplications = async () => {
              try {
                setError(null);
                const filterStatus = filter === 'all' ? undefined : filter;
                const response: ApiResponse = await applicationService.fetchApplications(filterStatus, 1, 10);
                
                if (response.success) {
                  setApplications(response.data);
                } else {
                  setError('Failed to fetch applications');
                  setApplications([]);
                }
              } catch (error) {
                console.error('Error fetching applications:', error);
                setError('Error loading applications. Please try again.');
                setApplications([]);
              } finally {
                setLoading(false);
              }
            };
            fetchApplications();
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'all' as const, label: 'All Applications' },
            { key: 1 as const, label: 'Submitted' },
            { key: 2 as const, label: 'Under Review' },
            { key: 11 as const, label: 'Payment Pending' },
            { key: 3 as const, label: 'Approved' },
            { key: 4 as const, label: 'Rejected' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "You haven't submitted any applications yet." 
              : `No applications with status "${filter}"`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(application => (
            <div key={application.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.applicationNumber}
                      </h3>
                      <Badge className={getApplicationStatusColor(application.status)}>
                        {getApplicationStatusLabel(application.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Applicant Name:</span>
                        <p>{`${application.firstName} ${application.middleName} ${application.lastName}`.trim()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Position Type:</span>
                        <p>{getPositionTypeLabel(application.positionType)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Current Stage:</span>
                        <p>{getApplicationStageLabel(application.currentStage)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Submission Date:</span>
                        <p>{new Date(application.submissionDate).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    {application.status === ApplicationStatus.PaymentPending && (
                      <Button 
                        size="sm" 
                        onClick={() => handlePayment(application.id, application.applicationNumber)}
                        disabled={paymentProcessing[application.id]}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {paymentProcessing[application.id] ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay Now
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentModalData(null);
          setPaymentViewData(null);
          setPaymentProcessing({});
        }}
        paymentData={paymentModalData}
        viewData={paymentViewData}
        onProceedToPayment={() => {
          if (paymentModalData?.paymentGatewayUrl) {
            window.location.href = paymentModalData.paymentGatewayUrl;
          }
        }}
      />
    </div>
  );
};