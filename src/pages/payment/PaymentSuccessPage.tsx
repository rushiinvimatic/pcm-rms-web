import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { MainHeader } from '../../components/common/MainHeader';
import { 
  CheckCircle, 
  Download, 
  Receipt, 
  ArrowLeft,
  Building,
  Calendar,
  CreditCard,
  FileText,
  Hash
} from 'lucide-react';

interface PaymentSuccessData {
  applicationId: string;
  applicationNumber: string;
  amount: number;
  transactionId: string;
  paymentMethod: string;
  paymentDate?: string;
}

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const data = location.state as PaymentSuccessData | null;
    
    if (!data) {
      navigate('/user/dashboard');
      return;
    }

    setPaymentData({
      ...data,
      paymentDate: new Date().toISOString()
    });

    // Show success notification
    toast({
      title: "Payment Successful!",
      description: "Your payment has been processed successfully.",
    });
  }, [location.state]);

  const downloadReceipt = async () => {
    if (!paymentData) return;

    try {
      setIsDownloading(true);
      
      // Mock receipt download - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock receipt
      const receiptContent = `
PUNE MUNICIPAL CORPORATION
Payment Receipt

Application Number: ${paymentData.applicationNumber}
Transaction ID: ${paymentData.transactionId}
Amount Paid: ₹${paymentData.amount.toLocaleString()}
Payment Method: ${paymentData.paymentMethod}
Payment Date: ${new Date(paymentData.paymentDate!).toLocaleDateString()}
Status: PAID

This is a digitally generated receipt.
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
      console.error('Error downloading receipt:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download receipt. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              Your payment has been processed successfully. Your application will now proceed to the next stage.
            </p>
          </div>

          {/* Payment Details Card */}
          <Card className="p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                PAID
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Application Number</p>
                    <p className="font-medium text-gray-900">{paymentData.applicationNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Hash className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-medium text-gray-900 font-mono text-sm">
                      {paymentData.transactionId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium text-gray-900">{paymentData.paymentMethod}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Receipt className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="font-medium text-xl text-green-600">
                      ₹{paymentData.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Payment Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(paymentData.paymentDate!).toLocaleDateString()} at{' '}
                      {new Date(paymentData.paymentDate!).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps Card */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What Happens Next?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Payment Verification</h3>
                  <p className="text-sm text-gray-600">
                    Your payment is being verified and will be confirmed within 5-10 minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Application Processing</h3>
                  <p className="text-sm text-gray-600">
                    Your application will be forwarded to the Clerk for certificate generation.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Digital Signatures</h3>
                  <p className="text-sm text-gray-600">
                    Executive Engineer and City Engineer will apply digital signatures to your certificate.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Certificate Ready</h3>
                  <p className="text-sm text-gray-600">
                    You'll receive an email notification when your certificate is ready for download.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={downloadReceipt}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isDownloading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Downloading...
                </div>
              ) : (
                <div className="flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/user/dashboard')}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Important Notice */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Important Notice</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Please save your transaction ID ({paymentData.transactionId}) for future reference. 
                  You can track your application status from your dashboard. If you don't receive 
                  a confirmation email within 24 hours, please contact our support team.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help or have questions?{' '}
              <Button
                variant="link"
                onClick={() => navigate('/user/support')}
                className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
              >
                Contact Support
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};