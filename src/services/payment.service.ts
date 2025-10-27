import axios from 'axios';

const API_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5012/api');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Accept': '*/*',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-access-token'] = token;
  }
  return config;
});

export interface ChallanGenerateRequest {
  challanNumber: string;
  name: string;
  position: string;
  amount: string;
  amountInWords: string;
  date: string;
  applicationId: string;
}

export interface PaymentInitiateRequest {
  entityId: string;
}

export interface PaymentInitializeRequest {
  applicationId: string;
}

export interface ChallanStatus {
  applicationId: string;
  status: string;
  challanNumber?: string;
  amount?: string;
  generatedDate?: string;
  paidDate?: string;
}

export interface PaymentStatus {
  applicationId: string;
  message: string;
  status?: string;
  paymentId?: string;
  amount?: string;
  paidDate?: string;
}

export interface PaymentViewResponse {
  htmlContent: string;
  merchantId?: string;
  bdOrderId?: string;
  rData?: string;
  paymentGatewayUrl?: string;
}

export const paymentService = {
  /**
   * Generate challan for payment
   */
  generateChallan: async (challanRequest: ChallanGenerateRequest): Promise<any> => {
    try {
      const response = await api.post('/Challan/generate', challanRequest);
      return response.data;
    } catch (error) {
      console.error('Error generating challan:', error);
      throw error;
    }
  },

  /**
   * Download challan PDF
   */
  downloadChallan: async (applicationId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/Challan/download/${applicationId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading challan:', error);
      throw error;
    }
  },

  /**
   * Check challan status
   */
  getChallanStatus: async (applicationId: string): Promise<ChallanStatus> => {
    try {
      const response = await api.get(`/Challan/status/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking challan status:', error);
      throw error;
    }
  },

  /**
   * Generate challan via plugin
   */
  generateChallanViaPlugin: async (applicationId: string): Promise<any> => {
    try {
      const response = await api.post(`/Challan/generate-via-plugin/${applicationId}`, {});
      return response.data;
    } catch (error) {
      console.error('Error generating challan via plugin:', error);
      throw error;
    }
  },

  /**
   * Initiate payment process
   */
  initiatePayment: async (entityId: string): Promise<any> => {
    try {
      const response = await api.post('/Payment/initiate', { entityId });
      
      // Actual response structure from BillDesk gateway
      // {
      //   "success": true,
      //   "message": "Payment initiated successfully",
      //   "transactionId": "272310576067",
      //   "txnEntityId": "8ec47dbe-b69f-4a75-9fce-257438e5a9ed",
      //   "bdOrderId": "BD20251017080317",
      //   "rData": "RDATA638962849978099932",
      //   "paymentGatewayUrl": "https://pay.billdesk.com/web/v1_2/embeddedsdk"
      // }
      
      return {
        success: response.data?.success || false,
        redirectUrl: response.data?.paymentGatewayUrl || response.data?.redirectUrl,
        transactionId: response.data?.transactionId,
        txnEntityId: response.data?.txnEntityId,
        bdOrderId: response.data?.bdOrderId,
        rData: response.data?.rData,
        paymentGatewayUrl: response.data?.paymentGatewayUrl,
        message: response.data?.message || 'Payment initiated',
        ...response.data
      };
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      
      // Return structured error response
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Payment initiation failed',
        error: error?.response?.data || error
      };
    }
  },

  /**
   * Initialize payment for application
   */
  initializePayment: async (applicationId: string): Promise<any> => {
    try {
      const response = await api.post('/Payment/initialize', { applicationId });
      return response.data;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  },

  /**
   * View payment gateway form (returns HTML content for payment redirection)
   */
  getPaymentView: async (txnEntityId: string): Promise<PaymentViewResponse> => {
    try {
      console.log('Fetching payment view for txnEntityId:', txnEntityId);
      
      const response = await api.get(`/Payment/view/${txnEntityId}`, {
        headers: {
          'Accept': '*/*',
          'Content-Type': 'text/html'
        },
        responseType: 'text'
      });
      
      // The response contains HTML with form data
      const htmlContent = response.data;
      console.log('Received HTML content:', htmlContent);
      
      // Ensure we have HTML content
      if (!htmlContent || typeof htmlContent !== 'string') {
        throw new Error('Invalid HTML content received from payment view API');
      }
      
      // Extract form data from HTML if needed (optional)
      let merchantId, bdOrderId, rData, paymentGatewayUrl;
      
      // Extract merchantid
      const merchantMatch = htmlContent.match(/name="merchantid"\s+value="([^"]+)"/);
      merchantId = merchantMatch ? merchantMatch[1] : undefined;
      
      // Extract bdorderid  
      const bdOrderMatch = htmlContent.match(/name="bdorderid"\s+value="([^"]+)"/);
      bdOrderId = bdOrderMatch ? bdOrderMatch[1] : undefined;
      
      // Extract rdata
      const rDataMatch = htmlContent.match(/name="rdata"\s+value="([^"]+)"/);
      rData = rDataMatch ? rDataMatch[1] : undefined;
      
      // Extract action URL
      const actionMatch = htmlContent.match(/action="([^"]+)"/);
      paymentGatewayUrl = actionMatch ? actionMatch[1] : undefined;
      
      console.log('Extracted payment data:', { merchantId, bdOrderId, rData, paymentGatewayUrl });
      
      return {
        htmlContent,
        merchantId,
        bdOrderId,
        rData,
        paymentGatewayUrl
      };
    } catch (error) {
      console.error('Error fetching payment view:', error);
      throw error;
    }
  },

  /**
   * View payment details (legacy method - kept for backward compatibility)
   */
  getPaymentDetails: async (applicationId: string): Promise<any> => {
    try {
      const response = await api.get(`/Payment/view/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  },

  /**
   * Check payment status
   */
  getPaymentStatus: async (applicationId: string): Promise<PaymentStatus> => {
    try {
      const response = await api.get(`/Payment/status/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  },

  /**
   * Download challan file for specific application
   */
  downloadChallanForApplication: async (applicationId: string): Promise<Blob> => {
    try {
      console.log('Downloading challan for application:', applicationId);
      const response = await api.get(`/Challan/download/${applicationId}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error downloading challan:', error);
      throw error;
    }
  },

  /**
   * Generate challan with auto-calculated details
   */
  generateChallanForApplication: async (applicationId: string, applicantName: string, position: string): Promise<any> => {
    try {
      // Generate challan number with timestamp
      const now = new Date();
      const challanNumber = `CHN-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;
      
      // Calculate amount based on position
      const amount = paymentService.calculateFee(position);
      const amountInWords = paymentService.convertAmountToWords(amount);

      const challanRequest: ChallanGenerateRequest = {
        challanNumber,
        name: applicantName,
        position,
        amount: amount.toString(),
        amountInWords,
        date: now.toISOString(),
        applicationId
      };

      return await paymentService.generateChallan(challanRequest);
    } catch (error) {
      console.error('Error generating challan for application:', error);
      throw error;
    }
  },

  /**
   * Calculate fee based on position
   */
  calculateFee: (position: string): number => {
    const feeStructure: { [key: string]: number } = {
      'Architect': 5000,
      'Structural Engineer': 4500,
      'Civil Engineer': 4000,
      'Electrical Engineer': 4000,
      'Mechanical Engineer': 4000,
      'default': 5000
    };

    return feeStructure[position] || feeStructure.default;
  },

  /**
   * Convert amount to words (simplified version)
   */
  convertAmountToWords: (amount: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertHundreds = (num: number): string => {
      let result = '';
      
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      
      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
      } else if (num >= 10) {
        result += teens[num - 10] + ' ';
        num = 0;
      }
      
      if (num > 0) {
        result += ones[num] + ' ';
      }
      
      return result;
    };

    if (amount === 0) return 'Zero Rupees Only';

    let result = '';
    
    if (amount >= 10000000) {
      result += convertHundreds(Math.floor(amount / 10000000)) + 'Crore ';
      amount %= 10000000;
    }
    
    if (amount >= 100000) {
      result += convertHundreds(Math.floor(amount / 100000)) + 'Lakh ';
      amount %= 100000;
    }
    
    if (amount >= 1000) {
      result += convertHundreds(Math.floor(amount / 1000)) + 'Thousand ';
      amount %= 1000;
    }
    
    if (amount > 0) {
      result += convertHundreds(amount);
    }
    
    return result.trim() + ' Rupees Only';
  },

  /**
   * Download challan as file
   */
  downloadChallanFile: async (applicationId: string, filename?: string): Promise<void> => {
    try {
      const blob = await paymentService.downloadChallan(applicationId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `challan-${applicationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading challan file:', error);
      throw error;
    }
  },

  /**
   * Process payment completion (called after successful payment)
   */
  processPaymentCompletion: async (applicationId: string, paymentId: string): Promise<any> => {
    try {
      // Update application status to payment completed
      const response = await api.post('/Application/payment-completed', {
        applicationId,
        paymentId,
        completedDate: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error processing payment completion:', error);
      throw error;
    }
  },

  /**
   * Get payment history for application
   */
  getPaymentHistory: async (applicationId: string): Promise<any[]> => {
    try {
      const response = await api.get(`/Payment/history/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  },

  /**
   * Create and submit payment form from HTML content
   */
  submitPaymentForm: (htmlContent: string): void => {
    try {
      console.log('Submitting payment form with HTML content:', htmlContent);
      
      // Remove scripts from the HTML content to avoid auto-execution
      const cleanedContent = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      // Create a temporary container
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanedContent;
      
      // Find the form element
      const form = tempDiv.querySelector('form');
      if (!form) {
        throw new Error('No form found in payment HTML content');
      }
      
      console.log('Found form with action:', form.getAttribute('action'));
      
      // Create a new form element and copy attributes
      const newForm = document.createElement('form');
      newForm.setAttribute('action', form.getAttribute('action') || '');
      newForm.setAttribute('method', form.getAttribute('method') || 'post');
      newForm.setAttribute('id', form.getAttribute('id') || 'payment-form');
      newForm.style.display = 'none';
      
      // Copy all input elements
      const inputs = form.querySelectorAll('input');
      console.log('Found inputs:', inputs.length);
      
      inputs.forEach(input => {
        const newInput = document.createElement('input');
        newInput.setAttribute('type', input.getAttribute('type') || 'hidden');
        newInput.setAttribute('name', input.getAttribute('name') || '');
        newInput.setAttribute('value', input.getAttribute('value') || '');
        
        if (input.getAttribute('id')) {
          newInput.setAttribute('id', input.getAttribute('id')!);
        }
        
        console.log(`Adding input: ${input.getAttribute('name')} = ${input.getAttribute('value')}`);
        newForm.appendChild(newInput);
      });
      
      // Append to body and submit
      document.body.appendChild(newForm);
      console.log('Form appended to body, submitting...');
      newForm.submit();
      
      // Clean up after a delay
      setTimeout(() => {
        if (document.body.contains(newForm)) {
          document.body.removeChild(newForm);
          console.log('Form cleaned up');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting payment form:', error);
      throw error;
    }
  },

  /**
   * Process complete payment flow: initiate -> view -> redirect
   */
  
  processCompletePaymentFlow: async (entityId: string): Promise<{
    success: boolean;
    message: string;
    paymentData?: any;
    viewData?: PaymentViewResponse;
  }> => {
    try {
      // Step 1: Initiate payment
      console.log('Step 1: Initiating payment for entity:', entityId);
      const initiateResponse = await paymentService.initiatePayment(entityId);
      
      if (!initiateResponse.success) {
        return {
          success: false,
          message: initiateResponse.message || 'Payment initiation failed'
        };
      }
      
      // Step 2: Get payment view with form data
      console.log('Step 2: Getting payment view for transaction:', initiateResponse.txnEntityId);
      const viewResponse = await paymentService.getPaymentView(entityId);
      
      return {
        success: true,
        message: 'Payment flow prepared successfully',
        paymentData: initiateResponse,
        viewData: viewResponse
      };
      
    } catch (error: any) {
      console.error('Error in complete payment flow:', error);
      return {
        success: false,
        message: error?.message || 'Payment flow failed'
      };
    }
  },

  /**
   * Process payment completion and trigger challan & certificate generation
   * This is called after successful payment to trigger Stage 2 workflow
   */
  processPaymentCompletionStage2: async (applicationId: string, applicantName: string, position: string): Promise<{
    challan: any;
    certificate: any;
    success: boolean;
    errors: string[];
  }> => {
    const errors: string[] = [];
    let challanResult = null;
    let certificateResult = null;

    try {
      console.log('Processing Stage 2 after payment completion for:', applicationId);

      // Import certificate service dynamically to avoid circular imports
      const { certificateService } = await import('./certificate.service');

      // Run challan and certificate generation simultaneously
      const [challanResponse, certificateResponse] = await Promise.allSettled([
        // Generate challan for user
        paymentService.generateChallanForApplication(applicationId, applicantName, position),
        
        // Generate certificate for officers
        certificateService.generateSECertificate({
          applicationId,
          isPayment: true,
          transactionDate: new Date().toISOString(),
          challanNumber: `CHN-${Date.now().toString().slice(-6)}`,
          amount: paymentService.calculateFee(position)
        })
      ]);

      // Process challan result
      if (challanResponse.status === 'fulfilled') {
        challanResult = challanResponse.value;
        console.log('Challan generated successfully:', challanResult);
      } else {
        errors.push(`Challan generation failed: ${challanResponse.reason}`);
        console.error('Challan generation failed:', challanResponse.reason);
      }

      // Process certificate result
      if (certificateResponse.status === 'fulfilled') {
        certificateResult = certificateResponse.value;
        console.log('Certificate generated successfully:', certificateResult);
      } else {
        errors.push(`Certificate generation failed: ${certificateResponse.reason}`);
        console.error('Certificate generation failed:', certificateResponse.reason);
      }

      const success = challanResponse.status === 'fulfilled' && certificateResponse.status === 'fulfilled';

      return {
        challan: challanResult,
        certificate: certificateResult,
        success,
        errors
      };

    } catch (error: any) {
      console.error('Error in Stage 2 processing:', error);
      errors.push(`Stage 2 processing failed: ${error.message}`);
      
      return {
        challan: challanResult,
        certificate: certificateResult,
        success: false,
        errors
      };
    }
  }
};