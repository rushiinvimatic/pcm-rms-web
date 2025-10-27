# PMCRMS Officer Dashboards

This implementation provides comprehensive role-specific dashboards for the PMCRMS system, following the workflow requirements.

## Dashboard Overview

### 1. Junior Engineer Dashboard
- **Location**: `/src/pages/officers/JuniorEngineer/Dashboard.tsx`
- **Features**:
  - Incoming applications filtered by position type
  - Document review interface
  - Appointment scheduling with calendar
  - OTP verification for actions (Approve/Reject)
  - Document viewer integration
  - Real-time status updates

### 2. Assistant Engineer Dashboard
- **Location**: `/src/pages/officers/AssistantEngineer/Dashboard.tsx`
- **Features**:
  - Applications from Junior Engineers
  - Review interface with all documents
  - OTP verification for approval actions
  - Forward to Chief Engineer functionality

### 3. Chief Engineer Dashboard (Two Tasks)
- **Location**: `/src/pages/officers/ChiefEngineer/Dashboard.tsx`
- **Features**:
  - **Stage 1 (Pre-payment)**: Review forms, add digital signature, forward to City Engineer
  - **Stage 2 (Post-payment)**: Verify certificate, add final digital signature
  - HSM digital signature integration
  - OTP verification for all actions

### 4. City Engineer Dashboard (Two Tasks)
- **Location**: `/src/pages/officers/CityEngineer/Dashboard.tsx`
- **Features**:
  - **Stage 1 (Pre-payment)**: Final review, approve, trigger payment notification
  - **Stage 2 (Final)**: Final review, add signature, issue certificate
  - HSM digital signature authority
  - OTP verification for final approvals

### 5. Clerk Dashboard
- **Location**: `/src/pages/officers/Clerk/Dashboard.tsx`
- **Features**:
  - Post-payment applications only
  - Review attachments and payment challan
  - Generate unique certificate numbers
  - Add payment details to certificate
  - Forward to Chief Engineer (Stage 2)

## Common Features

### Shared Components
- **Header**: `/src/components/common/Header.tsx` - User menu, notifications, branding
- **TaskList**: `/src/components/common/TaskList.tsx` - Reusable application list component
- **OTPModal**: `/src/components/common/OTPModal.tsx` - OTP verification for all actions
- **StatusProgress**: `/src/components/common/StatusTracker/StatusProgress.tsx` - Visual progress tracker
- **DocumentViewer**: `/src/components/common/DocumentViewer/DocumentViewer.tsx` - PDF/image viewer with zoom
- **AuditTrail**: `/src/components/common/AuditTrail.tsx` - Action history with timestamps

### Core Functionality
- **Real-time status updates** across all dashboards
- **OTP verification** for all approval/rejection actions
- **Document management** with viewer and download capabilities
- **Responsive design** that works on desktop and mobile
- **Activity logs** for audit trail visibility
- **Role-based access control** with protected routes

## Workflow Implementation

The system implements the complete PMCRMS workflow:

```
User Login (OTP) → Application Submission → 
Junior Engineer (Schedule + Approve) → 
Assistant Engineer (Review + Approve) → 
Chief Engineer Stage 1 (Sign + Approve) → 
City Engineer Stage 1 (Approve + Trigger Payment) → 
User Payment (Easebuzz) → 
Clerk (Process + Generate Cert Number) → 
Chief Engineer Stage 2 (Final Sign) → 
City Engineer Stage 2 (Final Sign + Issue) → 
Certificate Available for Download
```

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Routing**: React Router v6 with protected routes
- **State Management**: Context API for authentication
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React icons
- **Date Handling**: date-fns for formatting

## Key Features Implemented

### Security & Authentication
- JWT token-based authentication
- OTP verification for critical actions
- Role-based route protection
- Session timeout handling
- Inactivity auto-logout

### User Experience
- Mobile-first responsive design
- Loading states and error handling
- Toast notifications for user feedback
- Intuitive navigation and filtering
- Real-time data updates
- Document zoom and download

### Performance
- Lazy loading of dashboard components
- Efficient state management
- Optimized re-rendering
- Proper cleanup of event listeners

## Usage

### Running the Application
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

### Authentication Flow
1. Officers log in with email/password at `/auth/login`
2. Users log in with email/OTP at the same page
3. Successful authentication redirects to role-specific dashboard
4. Protected routes ensure proper access control

### Dashboard Navigation
- Each role has specific routes: `/officers/{role}/dashboard`
- Header provides user menu and logout functionality
- Real-time updates keep dashboards current
- Filters and search help manage large datasets

## Future Enhancements

- Real-time notifications via WebSocket
- Advanced document annotation
- Bulk processing capabilities
- Analytics and reporting dashboard
- Mobile app development
- Integration with external payment gateways
- Advanced HSM signature workflows