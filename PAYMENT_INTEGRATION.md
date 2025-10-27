# Payment Integration with BillDesk Gateway

This document outlines the complete payment integration implementation for the PMC (Pimpri-Chinchwad Municipal Corporation) application system.

## Overview

The payment integration allows users to pay fees for their applications using the BillDesk payment gateway. When an application reaches the "Payment Pending" status (status code 11), users can initiate payment through the system.

## Implementation Details

### 1. Payment Flow

1. **Payment Initiation**: User clicks "Pay Now" button on applications with `PaymentPending` status
2. **API Call**: System calls `/api/Payment/initiate` with `entityId` (applicationId)
3. **Gateway Redirect**: User is redirected to BillDesk payment gateway
4. **Payment Processing**: User completes payment on BillDesk
5. **Callback**: BillDesk redirects back to `/payment/callback` with payment status
6. **Verification**: System verifies payment status with backend
7. **Completion**: Payment status is updated and user is notified

### 2. API Integration

#### Payment Initiation API
```bash
curl -X 'POST' \
  'http://localhost:5012/api/Payment/initiate' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "entityId": "string"
}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "transactionId": "272310576067",
  "txnEntityId": "8ec47dbe-b69f-4a75-9fce-257438e5a9ed",
  "bdOrderId": "BD20251017080317",
  "rData": "RDATA638962849978099932",
  "paymentGatewayUrl": "https://pay.billdesk.com/web/v1_2/embeddedsdk"
}
```

### 3. File Changes Made

#### Frontend Components Updated:
1. **`UserDashboard.tsx`** - Added payment button for Payment Pending applications
2. **`MyApplicationsPage.tsx`** - Added payment functionality and status filtering
3. **`PaymentCallbackPage.tsx`** - New component to handle BillDesk callbacks

#### Services Enhanced:
1. **`payment.service.ts`** - Enhanced `initiatePayment` method with better error handling

#### Routes Added:
1. **`/payment/callback`** - Handles BillDesk payment callbacks
2. **`/demo/payment`** - Test page for payment integration

#### Types Added:
1. **`payment.ts`** - Payment-related TypeScript interfaces

### 4. Usage Instructions

#### For Users:
1. Navigate to Dashboard or My Applications
2. Find applications with "Payment Pending" status
3. Click the "Pay Now" button
4. Complete payment on BillDesk gateway
5. You will be redirected back with payment status

#### For Developers:
1. **Test Payment**: Visit `/demo/payment` to test payment initiation
2. **Mock Callbacks**: Use the simulate callback feature for testing
3. **Status Codes**: Reference the payment status codes in the test page

### 5. Payment Status Codes

#### Application Status:
- `11` - Payment Pending
- `12` - Payment Completed
- `17` - Rejected

#### BillDesk Status Codes:
- `0300` - Payment Successful
- `0399` - Payment Failed
- `NA` - Pending/Cancelled

### 6. Security Considerations

1. **HTTPS Required**: All payment URLs must use HTTPS in production
2. **Token Validation**: Payment callbacks should validate transaction tokens
3. **Amount Verification**: Always verify payment amount matches expected fee
4. **Timeout Handling**: Implement timeout for pending payments

### 7. Error Handling

The system handles various error scenarios:
- Network connectivity issues
- Invalid application IDs
- Payment gateway timeouts
- Failed transactions
- Callback processing errors

### 8. Testing

#### Test Scenarios:
1. **Successful Payment**: Complete payment flow with success callback
2. **Failed Payment**: Handle failed payment scenarios
3. **Network Errors**: Test with network connectivity issues
4. **Invalid Data**: Test with invalid application IDs

#### Test Page Features:
- Payment initiation testing
- Response inspection
- Callback simulation
- Status code reference

### 9. Configuration

#### Environment Variables:
```env
VITE_API_URL=http://localhost:5012/api
VITE_PAYMENT_CALLBACK_URL=http://localhost:3000/payment/callback
```

#### BillDesk Configuration:
- Merchant ID: Configure in backend
- Return URLs: Point to `/payment/callback`
- Encryption Keys: Secure backend configuration

### 10. Troubleshooting

#### Common Issues:
1. **Payment Button Not Showing**: Check if application status is exactly `11`
2. **Redirect Failed**: Verify `redirectUrl` is returned from API
3. **Callback Not Working**: Check route configuration and URL parameters
4. **Status Not Updating**: Verify backend payment completion processing

#### Debug Steps:
1. Check browser console for errors
2. Verify API responses in Network tab
3. Test with `/demo/payment` page
4. Check backend logs for payment processing

### 11. Production Deployment

#### Pre-deployment Checklist:
- [ ] HTTPS configured for all payment URLs
- [ ] BillDesk merchant configuration verified
- [ ] Return URLs updated for production domain
- [ ] Error monitoring configured
- [ ] Payment reconciliation system ready

#### Monitoring:
- Track payment success/failure rates
- Monitor API response times
- Alert on callback processing failures
- Log all payment transactions

## Support

For any issues with the payment integration:
1. Check the test page at `/demo/payment`
2. Review browser console logs
3. Verify API responses
4. Contact development team with specific error details

## Future Enhancements

1. **Multiple Payment Methods**: Support for UPI, Net Banking, Cards
2. **Payment History**: Detailed payment transaction history
3. **Refund Processing**: Handle payment refunds
4. **Automated Reconciliation**: Match payments with bank statements
5. **Payment Reminders**: Notify users of pending payments