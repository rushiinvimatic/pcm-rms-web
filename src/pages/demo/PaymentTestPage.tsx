import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { paymentService } from '../../services/payment.service';

export const PaymentTestPage: React.FC = () => {
  const { toast } = useToast();
  const [testApplicationId, setTestApplicationId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const handleTestPayment = async () => {
    if (!testApplicationId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an application ID to test payment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setLastResponse(null);

      toast({
        title: "Testing Payment",
        description: `Initiating payment for application ID: ${testApplicationId}`,
      });

      const response = await paymentService.initiatePayment(testApplicationId.trim());
      setLastResponse(response);

      if (response.success && (response.paymentGatewayUrl || response.redirectUrl)) {
        const gatewayUrl = response.paymentGatewayUrl || response.redirectUrl;
        
        toast({
          title: "Payment Initiated Successfully",
          description: "Redirecting to payment gateway...",
        });
        
        // In a real scenario, this would redirect to BillDesk
        // For testing, we'll just show the URL
        console.log('Would redirect to:', gatewayUrl);
        console.log('Full response:', response);
        
        // Uncomment the next line for actual redirect
        // window.location.href = gatewayUrl;
      } else {
        toast({
          title: "Payment Initiation Failed",
          description: response.message || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment test error:', error);
      toast({
        title: "Test Error",
        description: "Failed to test payment initiation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateCallback = () => {
    const callbackUrl = `/payment/callback?applicationId=${testApplicationId}&transactionId=TXN123456&status=success&amount=5000`;
    window.location.href = callbackUrl;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Integration Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Payment Initiation */}
        <Card>
          <CardHeader>
            <CardTitle>Test Payment Initiation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="applicationId">Application ID</Label>
              <Input
                id="applicationId"
                value={testApplicationId}
                onChange={(e) => setTestApplicationId(e.target.value)}
                placeholder="Enter application ID to test"
              />
            </div>
            
            <Button 
              onClick={handleTestPayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Test Payment Initiation'
              )}
            </Button>

            {testApplicationId && (
              <Button 
                variant="outline"
                onClick={simulateCallback}
                className="w-full"
              >
                Simulate Success Callback
              </Button>
            )}
          </CardContent>
        </Card>

        {/* API Response */}
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            {lastResponse ? (
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-96">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No response yet. Test payment initiation to see API response.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Codes Reference */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payment Status Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Application Status Codes</h4>
              <ul className="text-sm space-y-1">
                <li><code>11</code> - Payment Pending</li>
                <li><code>12</code> - Payment Completed</li>
                <li><code>17</code> - Rejected</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">BillDesk Status Codes</h4>
              <ul className="text-sm space-y-1">
                <li><code>0300</code> - Success</li>
                <li><code>0399</code> - Failed</li>
                <li><code>NA</code> - Pending/Cancelled</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test URLs */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Test URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Payment Callback URL:</strong> <code>/payment/callback</code></p>
            <p><strong>Sample Success URL:</strong> <code>/payment/callback?applicationId=123&transactionId=TXN123&status=success&amount=5000</code></p>
            <p><strong>Sample Failure URL:</strong> <code>/payment/callback?applicationId=123&transactionId=TXN123&status=failed&amount=5000</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};