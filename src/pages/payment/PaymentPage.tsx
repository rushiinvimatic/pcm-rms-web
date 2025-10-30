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
import { getRegistrationFee } from '../../constants/registrationFees';
import { POSITION_LABELS } from '../../types/application';

interface PaymentDetails {
  applicationId: string;
  applicationNumber: string;
  applicantName: string;
  position: string;
  positionType: number;
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
      
      // Fetch actual application data from backend
      const applicationData = await applicationService.getApplicationById(applicationId!);
      
      // Calculate fee based on position type
      const registrationFee = getRegistrationFee(applicationData.positionType);
      const positionLabel = POSITION_LABELS[applicationData.positionType as keyof typeof POSITION_LABELS] || 'Unknown Position';
      
      const paymentData: PaymentDetails = {
        applicationId: applicationId!,
        applicationNumber: applicationData.applicationNumber || 'N/A',
        applicantName: `${applicationData.firstName} ${applicationData.middleName || ''} ${applicationData.lastName}`.trim(),
        position: positionLabel,
        positionType: applicationData.positionType,
        amount: registrationFee,
        description: registrationFee > 0 
          ? `Registration fee for ${positionLabel} (3 years validity)` 
          : 'No registration fee required for Architect position',
        dueDate: applicationData.submittedDate 
          ? new Date(new Date(applicationData.submittedDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      setPaymentDetails(paymentData);
      
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
        paymentDetails.position,
        paymentDetails.positionType
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

    // Check if payment is required
    if (paymentDetails.amount === 0) {
      toast({
        title: "No Payment Required",
        description: "Architect position does not require any registration fee. Your application will proceed automatically.",
      });
      // Optionally redirect back to dashboard or show completion message
      setTimeout(() => navigate('/user/dashboard'), 2000);
      return;
    }

    try {
      setIsProcessing(true);
      console.log('Initiating payment for application:', paymentDetails.applicationId);

      // Initialize payment through BillDesk API
      const paymentResponse = await paymentService.initiatePayment(paymentDetails.applicationId);
      console.log('Payment response received:', paymentResponse);

      // Check if payment initiation was successful
      if (paymentResponse.success) {
        // Extract payment data from response
        const paymentData = paymentResponse.data || paymentResponse;
        
        // Validate that we have the required data for form submission
        if (paymentData && (paymentData.formAction || paymentData.paymentGatewayUrl)) {
          console.log('Payment data validated, creating form...');
          // Create and submit form directly to BillDesk
          createAndSubmitBillDeskForm(paymentResponse);
        } else {
          console.error('Invalid payment response structure:', paymentResponse);
          toast({
            variant: "destructive",
            title: "Payment Failed",
            description: "Invalid payment response from server. Please try again.",
          });
          setIsProcessing(false);
        }
      } else {
        console.error('Payment initiation failed:', paymentResponse);
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: paymentResponse.message || "Failed to initiate payment. Please try again.",
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: `Failed to initiate payment: ${error}`,
      });
      setIsProcessing(false);
    }
  };

  const createAndSubmitBillDeskForm = (paymentData: any) => {
    try {
      console.log('Creating BillDesk form with data:', paymentData);

      // Extract data from nested structure
      const data = paymentData.data || paymentData;
      const formAction = data.formAction || data.paymentGatewayUrl || 'https://uat1.billdesk.com/u2/web/v1_2/embeddedsdk';
      const formFields: Record<string, string> = {
        merchantid: 'UATPMCNTYA',
        bdorderid: data.bdOrderId,
        rdata: data.rData
      };

      console.log('Form action:', formAction);
      console.log('Form fields:', formFields);

      // Validate required fields
      if (!formFields.bdorderid || !formFields.rdata) {
        throw new Error('Missing required payment fields (bdorderid or rdata)');
      }

      // Create form element
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = formAction;
      form.style.display = 'none';

      // Add form fields
      Object.keys(formFields).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formFields[key];
        form.appendChild(input);
        console.log(`Added form field: ${key} = ${formFields[key]}`);
      });

      // Append to body and submit
      document.body.appendChild(form);
      console.log('Form created and submitting to:', form.action);
      console.log('Form HTML:', form.outerHTML);
      
      // Submit the form immediately
      form.submit();

      // Clean up after a delay (form might be needed for a moment)
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
          console.log('Form cleaned up');
        }
      }, 1000);

    } catch (error) {
      console.error('Error creating BillDesk form:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: `Failed to redirect to payment gateway: ${error}`,
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
                      {paymentDetails.amount === 0 
                        ? 'Continue (No Payment Required)' 
                        : `Pay ₹${paymentDetails.amount.toLocaleString()}`}
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