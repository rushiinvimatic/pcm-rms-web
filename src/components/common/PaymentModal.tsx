import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Copy, ExternalLink, CheckCircle, X, CreditCard, Shield, Clock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { paymentService, type PaymentViewResponse } from '../../services/payment.service';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    applicationNumber: string;
    applicationId: string;
    transactionId?: string;
    bdOrderId: string;
    rData?: string;
    txnEntityId?: string;
    paymentGatewayUrl: string;
    message: string;
    applicantName?: string;
    position?: string;
  } | null;
  viewData?: PaymentViewResponse | null;
  onProceedToPayment: () => void;
  onPaymentSuccess?: (applicationId: string, applicantName: string, position: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  viewData,
  onProceedToPayment,
  onPaymentSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaymentRedirect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (viewData?.htmlContent) {
        // Use the HTML form submission from the view API
        paymentService.submitPaymentForm(viewData.htmlContent);
        toast({
          title: "Redirecting to Payment Gateway",
          description: "Please complete your payment in the new window.",
        });
        onClose(); // Close modal after redirect
      } else if (paymentData?.paymentGatewayUrl && paymentData?.bdOrderId && paymentData?.rData) {
        // Create and submit form manually
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentData.paymentGatewayUrl;
        form.style.display = 'none';
        
        // Add hidden fields for BillDesk
        const fields = [
          { name: 'merchantid', value: 'PMCBLDGNV2' },
          { name: 'bdorderid', value: paymentData.bdOrderId },
          { name: 'rdata', value: paymentData.rData }
        ];
        
        fields.forEach(field => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = field.name;
          input.value = field.value;
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
        
        toast({
          title: "Redirecting to Payment Gateway",
          description: "Please complete your payment in the new window.",
        });
        onClose(); // Close modal after redirect
      } else {
        // Fallback to direct URL redirect
        onProceedToPayment();
      }
    } catch (error: any) {
      console.error('Error redirecting to payment:', error);
      setError(error.message || "Unable to redirect to payment gateway");
      toast({
        title: "Redirect Failed",
        description: error.message || "Unable to redirect to payment gateway",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  if (!paymentData) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold">Payment Gateway Ready</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Your payment has been initiated successfully. Review the details below and proceed to payment.
          </p>

        <div className="space-y-4">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">{paymentData.message}</span>
            </div>
          </div>

          {/* Payment Information Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Secure Gateway</p>
                <p className="text-sm text-gray-900 font-semibold">BillDesk</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Process Time</p>
                <p className="text-sm text-gray-900 font-semibold">Instant</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">License Fee</p>
                <p className="text-sm text-gray-900 font-semibold">₹3,000</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Confirmation</p>
                <p className="text-sm text-gray-900 font-semibold">Via Email</p>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900">Application Details</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Application:</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{paymentData.applicationNumber}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentData.applicationNumber, 'Application Number')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {paymentData.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs">{paymentData.transactionId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentData.transactionId!, 'Transaction ID')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {paymentData.txnEntityId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Entity:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs">{paymentData.txnEntityId.substring(0, 8)}...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentData.txnEntityId!, 'Transaction Entity ID')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Form Display */}
          {viewData?.htmlContent ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">Payment Gateway Form</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(viewData.htmlContent, 'Payment Form HTML')}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Raw HTML Preview */}
              <div className="bg-white border rounded p-3 mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Form Content Preview:</h5>
                <div className="text-xs font-mono text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {viewData.htmlContent}
                </div>
              </div>
              
              {/* Rendered Form Preview */}
              <div className="bg-white border rounded p-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Rendered Form:</h5>
                <div 
                  className="text-sm text-gray-600"
                  dangerouslySetInnerHTML={{ __html: viewData.htmlContent }}
                />
              </div>
              
              <div className="mt-3 flex items-center">
                <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-blue-800 text-sm font-medium">Form loaded and ready for submission</span>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Payment Gateway URL</h4>
              <div className="flex items-center space-x-2">
                <code className="bg-white px-2 py-1 rounded text-xs flex-1 border">
                  {paymentData.paymentGatewayUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(paymentData.paymentGatewayUrl, 'Payment Gateway URL')}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-900 font-semibold mb-1">Payment Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What happens next:</h4>
            <ul className="text-gray-700 text-sm space-y-1.5 leading-relaxed">
              {viewData?.htmlContent ? (
                <>
                  <li>• The payment form will be automatically submitted</li>
                  <li>• You'll be redirected to BillDesk secure payment gateway</li>
                  <li>• Complete payment using your preferred method</li>
                  <li>• Receive instant confirmation via email</li>
                  <li>• Application automatically forwarded to Clerk for review</li>
                </>
              ) : (
                <>
                  <li>• You'll be redirected to BillDesk secure payment gateway</li>
                  <li>• Complete payment using your preferred method</li>
                  <li>• Receive instant confirmation via email</li>
                  <li>• Application automatically forwarded to Clerk for review</li>
                </>
              )}
            </ul>
          </div>
        </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 mt-6">
            {/* Primary Payment Button */}
            <Button 
              onClick={handlePaymentRedirect}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 py-4 text-base font-semibold rounded-lg transition-all duration-300 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Payment...
                </>
              ) : viewData?.htmlContent ? (
                <>
                  <CreditCard className="h-5 w-5" />
                  Pay ₹3,000 - Proceed to Secure Payment
                </>
              ) : (
                <>
                  <ExternalLink className="h-5 w-5" />
                  Pay ₹3,000 - Proceed to Secure Payment
                </>
              )}
            </Button>
            
            {/* Secondary Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              
              {/* Mock Payment Success Button for Testing - Remove in Production */}
              {import.meta.env.DEV && onPaymentSuccess && (
                <Button 
                  onClick={() => {
                    onPaymentSuccess(
                      paymentData.applicationId,
                      paymentData.applicantName || 'Test User',
                      paymentData.position || 'Senior Engineer'
                    );
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mock Success (Dev)
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Loading Spinner CSS */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};