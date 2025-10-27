import {
    AlertCircle,
    ArrowLeft,
    Building,
    Calendar,
    CheckCircle,
    CreditCard,
    Download,
    FileText,
    Receipt,
    Shield,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainHeader } from '../../components/common/MainHeader';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { paymentService, type PaymentStatus, type ChallanStatus } from '../../services/payment.service';
import { applicationService } from '../../services/application.service';

interface PaymentDetails {
  applicationId: string;
  applicationNumber: string;
  applicantName: string;
  position: string;
  amount: number;
  description: string;
  dueDate: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

export const PaymentPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();


  const { toast } = useToast();

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [challanStatus, setChallanStatus] = useState<ChallanStatus | null>(null);
  const [generatingChallan, setGeneratingChallan] = useState(false);

  // Payment methods configuration
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'billdesk',
      name: 'BillDesk',
      description: 'Secure payment gateway with multiple payment options',
      icon: '💳',
      available: true,
    },
    {
      id: 'easebuzz',
      name: 'Easebuzz',
      description: 'Fast and secure online payments',
      icon: '⚡',
      available: true,
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Direct bank transfer',
      icon: '🏦',
      available: false, // Disabled for demo
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Pay using UPI apps',
      icon: '📱',
      available: false, // Disabled for demo
    }
  ];

  useEffect(() => {
    if (!applicationId) {
      navigate('/user/dashboard');
      return;
    }

    fetchPaymentDetails();
    checkPaymentStatus();
    checkChallanStatus();
  }, [applicationId]);

  const fetchPaymentDetails = async () => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with actual API
      // const response = await dashboardService.getPaymentDetails(applicationId!);
      
      // Mock data for demonstration
      const mockData: PaymentDetails = {
        applicationId: applicationId!,
        applicationNumber: 'PMC_APPLICATION_2025_87',
        applicantName: 'John Doe',
        position: 'Architect',
        amount: 5000,
        description: 'Application processing and certificate issuance fee',
        dueDate: '2025-03-01'
      };

      setPaymentDetails(mockData);
      
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch payment details. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const status = await paymentService.getPaymentStatus(applicationId!);
      setPaymentStatus(status);
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const checkChallanStatus = async () => {
    try {
      const status = await paymentService.getChallanStatus(applicationId!);
      setChallanStatus(status);
    } catch (error) {
      console.error('Error checking challan status:', error);
    }
  };

  const handleGenerateChallan = async () => {
    if (!paymentDetails) return;

    setGeneratingChallan(true);
    try {
      await paymentService.generateChallanForApplication(
        paymentDetails.applicationId,
        paymentDetails.applicantName,
        paymentDetails.position
      );
      
      toast({
        title: "Success",
        description: "Challan generated successfully",
      });
      
      // Refresh challan status
      await checkChallanStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate challan",
        variant: "destructive",
      });
    } finally {
      setGeneratingChallan(false);
    }
  };

  const handleDownloadChallan = async () => {
    if (!paymentDetails) return;

    try {
      await paymentService.downloadChallanFile(
        paymentDetails.applicationId,
        `challan-${paymentDetails.applicationNumber}.pdf`
      );
      
      toast({
        title: "Success",
        description: "Challan downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download challan",
        variant: "destructive",
      });
    }
  };

  const initiatePayment = async () => {
    if (!paymentDetails || !selectedMethod || !agreementAccepted) return;

    try {
      setIsProcessing(true);

      // Initialize payment through API
      const paymentResponse = await paymentService.initializePayment(paymentDetails.applicationId);

      if (paymentResponse.redirectUrl) {
        // Redirect to actual payment gateway
        window.location.href = paymentResponse.redirectUrl;
      } else {
        // For demo purposes, simulate payment completion
        setTimeout(async () => {
          try {
            await applicationService.processPaymentCompletion(paymentDetails.applicationId, 'DEMO_PAYMENT_ID');
            await applicationService.forwardToClerk(paymentDetails.applicationId);
            
            navigate('/payment/success', {
              state: {
                applicationId: paymentDetails.applicationId,
                applicationNumber: paymentDetails.applicationNumber,
                amount: paymentDetails.amount,
                transactionId: `TXN_${Date.now()}`,
                paymentMethod: selectedMethod.name
              }
            });
          } catch (error) {
            console.error('Error processing payment completion:', error);
            toast({
              variant: "destructive",
              title: "Payment Processing Failed",
              description: "Payment was initiated but processing failed. Please contact support.",
            });
          } finally {
            setIsProcessing(false);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Failed to initiate payment. Please try again.",
      });
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MainHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details Not Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find payment details for this application.
            </p>
            <Button
              onClick={() => navigate('/user/dashboard')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/user/dashboard')}
              className="mb-4 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
              <p className="text-gray-600 mt-2">Secure payment for your application</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Status Display */}
              {paymentStatus && paymentStatus.status === 'COMPLETED' && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4">
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Payment Completed</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    {paymentStatus.message}
                  </p>
                </div>
              )}
              {/* Application Summary */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Details</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Application Number</p>
                      <p className="font-medium text-gray-900">{paymentDetails.applicationNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Applicant Name</p>
                      <p className="font-medium text-gray-900">{paymentDetails.applicantName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Receipt className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Position</p>
                      <p className="font-medium text-gray-900">{paymentDetails.position}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(paymentDetails.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Challan Section */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Challan Details</h2>
                
                {challanStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Challan Generated</p>
                          <p className="text-xs text-green-600">Number: {challanStatus.challanNumber}</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleDownloadChallan}
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">You can pay using the challan at any authorized bank branch:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Print the challan and visit any authorized bank</li>
                        <li>Payment will be confirmed within 24 hours</li>
                        <li>You can also continue with online payment below</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Generate Challan</p>
                          <p className="text-xs text-blue-600">For offline payment at bank</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleGenerateChallan}
                        disabled={generatingChallan}
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        {generatingChallan ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <FileText className="w-4 h-4 mr-2" />
                        )}
                        Generate
                      </Button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Generate a challan for offline payment:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Download and print the challan</li>
                        <li>Visit any authorized bank branch</li>
                        <li>Payment confirmation takes up to 24 hours</li>
                      </ul>
                    </div>
                  </div>
                )}
              </Card>

              {/* Payment Methods */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Payment Method</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedMethod?.id === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : method.available
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                      }`}
                      onClick={() => method.available && setSelectedMethod(method)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                          {!method.available && (
                            <Badge className="mt-1 bg-gray-100 text-gray-600">Coming Soon</Badge>
                          )}
                        </div>
                        {selectedMethod?.id === method.id &&
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Terms and Conditions */}
              <Card className="p-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreement"
                    checked={agreementAccepted}
                    onChange={(e) => setAgreementAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="agreement" className="text-sm text-gray-700 cursor-pointer">
                      I agree to the{' '}
                      <button className="text-blue-600 hover:text-blue-800 underline">
                        Terms and Conditions
                      </button>{' '}
                      and{' '}
                      <button className="text-blue-600 hover:text-blue-800 underline">
                        Privacy Policy
                      </button>
                      . I understand that this payment is non-refundable once the application processing begins.
                    </Label>
                  </div>
                </div>
              </Card>
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application Fee</span>
                    <span className="font-medium">₹{paymentDetails.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gateway Charges</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{paymentDetails.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Secure Payment</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Your payment is protected by industry-standard encryption
                  </p>
                </div>

                <Button
                  onClick={initiatePayment}
                  disabled={!selectedMethod || !agreementAccepted || isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay ₹{paymentDetails.amount.toLocaleString()}
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  By proceeding, you acknowledge that you have read and understood our payment terms.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};