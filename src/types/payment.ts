// Payment-related type definitions

export interface PaymentInitiateRequest {
  entityId: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  txnEntityId?: string;
  bdOrderId?: string;
  rData?: string;
  paymentGatewayUrl?: string;
  redirectUrl?: string; // fallback for compatibility
  error?: any;
}

export interface PaymentCallbackParams {
  applicationId: string;
  transactionId?: string;
  txnId?: string;
  status?: string;
  amount?: string;
  paymentMethod?: string;
  msg?: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  status: 'PAID' | 'FAILED' | 'PENDING' | 'CANCELLED';
  transactionId: string;
  amount: number;
  paymentDate?: string;
  message: string;
}

export interface PaymentProcessingState {
  [applicationId: string]: boolean;
}

// BillDesk specific response types
export interface BillDeskCallbackParams {
  msg: string; // Encrypted response from BillDesk
  status: string; // Payment status code
  txnid: string; // Transaction ID
  amount: string; // Payment amount
  orderid: string; // Application/Order ID
}