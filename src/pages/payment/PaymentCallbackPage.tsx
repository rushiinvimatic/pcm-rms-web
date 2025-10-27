import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { paymentService } from '../../services/payment.service';
import { 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowLeft,
  Receipt
} from 'lucide-react';

interface PaymentCallbackData {
  applicationId: string;
  transactionId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  message: string;
  applicationNumber?: string;
}

export const PaymentCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentCallbackData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    processPaymentCallback();
  }, []);

  const processPaymentCallback = async () => {
    try {
      // Extract parameters from URL
      const applicationId = searchParams.get('applicationId');
      const transactionId = searchParams.get('transactionId') || searchParams.get('txnId');
      const status = searchParams.get('status');
      const amount = searchParams.get('amount');
      
      if (!applicationId) {
        setError('Invalid payment callback - missing application ID');
        setIsProcessing(false);
        return;
      }

      // Verify payment status with backend
      const paymentStatus = await paymentService.getPaymentStatus(applicationId);
      
      const callbackData: PaymentCallbackData = {
        applicationId,
        transactionId: transactionId || 'N/A',
        amount: amount ? parseFloat(amount) : 0,
        status: determinePaymentStatus(status, paymentStatus),
        message: paymentStatus.message || 'Payment processed',
        applicationNumber: `APP-${applicationId.substring(0, 8).toUpperCase()}`
      };

      setPaymentData(callbackData);

      if (callbackData.status === 'success') {
        // Process payment completion on backend
        await paymentService.processPaymentCompletion(applicationId, transactionId || '');
        
        toast({
          title: "Payment Successful!",
          description: `Payment for application ${callbackData.applicationNumber} has been processed successfully.`,
        });
      } else if (callbackData.status === 'failed') {
        toast({
          title: "Payment Failed",
          description: callbackData.message || "Payment could not be processed. Please try again.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Payment callback processing error:', error);
      setError('Failed to process payment callback. Please contact support.');
      toast({
        title: "Processing Error",
        description: "Unable to verify payment status. Please contact support if amount was debited.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const determinePaymentStatus = (urlStatus: string | null, backendStatus: any): 'success' | 'failed' | 'pending' => {
    // Check backend status first
    if (backendStatus?.status === 'PAID' || backendStatus?.status === 'SUCCESS') {
      return 'success';
    }
    
    if (backendStatus?.status === 'FAILED' || backendStatus?.status === 'CANCELLED') {
      return 'failed';
    }

    // Fallback to URL parameter
    if (urlStatus) {
      const status = urlStatus.toLowerCase();
      if (status === 'success' || status === 'paid' || status === '0300') {
        return 'success';
      } else if (status === 'failed' || status === 'fail' || status === 'cancelled') {
        return 'failed';
      }
    }
    
    return 'pending';
  };

  const handleDownloadReceipt = async () => {
    if (!paymentData || paymentData.status !== 'success') return;
    
    try {
      // Generate and download receipt
      const receiptContent = `
PIMPRI-CHINCHWAD MUNICIPAL CORPORATION
Payment Receipt

Application Number: ${paymentData.applicationNumber}
Application ID: ${paymentData.applicationId}
Transaction ID: ${paymentData.transactionId}
Amount Paid: ₹${paymentData.amount?.toLocaleString() || 'N/A'}
Payment Date: ${new Date().toLocaleDateString('en-IN')}
Payment Time: ${new Date().toLocaleTimeString('en-IN')}
Status: SUCCESSFUL

Thank you for your payment!

This is a system-generated receipt.
For any queries, please contact PMC support.
      `;

      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${paymentData.applicationNumber}_Payment_Receipt.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Receipt Downloaded",
        description: "Payment receipt has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Receipt download error:', error);
      toast({
        title: "Download Failed", 
        description: "Unable to download receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Error</h2>
            <p className="text-gray-600 mb-6">{error || 'Unable to process payment callback'}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/user/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          {paymentData.status === 'success' ? (
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          )}
          <CardTitle className="text-2xl">
            {paymentData.status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Application Number:</span>
              <span className="font-medium">{paymentData.applicationNumber}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-medium">{paymentData.transactionId}</span>
            </div>
            
            {paymentData.amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₹{paymentData.amount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">{new Date().toLocaleString('en-IN')}</span>
            </div>
          </div>

          {paymentData.message && (
            <div className={`p-3 rounded-lg ${
              paymentData.status === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {paymentData.message}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            {paymentData.status === 'success' && (
              <Button onClick={handleDownloadReceipt} className="bg-green-600 hover:bg-green-700">
                <Receipt className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            )}
            
            <Button 
              variant={paymentData.status === 'success' ? 'outline' : 'default'} 
              onClick={() => navigate('/user/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {paymentData.status === 'failed' && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/user/applications')}
                className="text-blue-600 hover:text-blue-700"
              >
                Try Payment Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};