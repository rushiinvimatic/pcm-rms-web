# Appointment Scheduling Implementation

## Overview
This document explains the implementation of appointment scheduling functionality in the PMC Web application, integrating with your provided API endpoint.

## API Integration

### Endpoint
```
POST /api/Application/schedule-appointment
```

### Request Structure
Your cURL command shows the expected request format:
```json
{
  "applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "comments": "string",
  "reviewDate": "2025-10-13T12:58:25.860Z",
  "contactPerson": "string", 
  "place": "string",
  "roomNumber": "string"
}
```

## Implementation Files

### 1. Appointment Service (`src/services/appointment.service.ts`)
- **Created**: New service file for appointment-related API calls
- **Functions**:
  - `scheduleAppointment()` - Schedule a new appointment
  - `getAppointmentDetails()` - Get appointment details
  - `updateAppointment()` - Update existing appointment
  - `cancelAppointment()` - Cancel appointment

### 2. Updated Junior Engineer Dashboard (`src/pages/officers/JuniorEngineer/Dashboard.tsx`)
- **Updated**: Form fields to match API requirements
- **Added**: Real API integration instead of mock calls
- **Enhanced**: Error handling and validation

## Form Fields Mapping

### Original Form → API Fields
- **Date + Time** → `reviewDate` (Combined as ISO string)
- **Place** → `place` (Meeting location)
- **Room Number** → `roomNumber` (Optional)
- **Contact Person** → `contactPerson` (Required)
- **Comments** → `comments` (Instructions/notes)
- **Application ID** → `applicationId` (From selected application)

## Updated UI Components

### Appointment Modal Fields
1. **Appointment Date*** (Required)
2. **Appointment Time*** (Required) 
3. **Meeting Place*** (Required) - e.g., "PMC Office Building"
4. **Room Number** (Optional) - e.g., "Room 101"
5. **Contact Person*** (Required) - Officer name/department
6. **Instructions & Comments** (Optional) - Document requirements, etc.

### Validation Rules
- Date must be today or future
- Time is required
- Place and Contact Person are mandatory
- Comments are optional but recommended

## Code Changes

### Interface Updates
```typescript
// Old interface
interface AppointmentData {
  date: string;
  time: string;
  location: string;
  notes: string;
}

// New interface (matches API)
interface AppointmentData {
  date: string;
  time: string;
  place: string;
  roomNumber: string;
  contactPerson: string;
  comments: string;
}
```

### API Call Implementation
```typescript
const handleSaveAppointment = async () => {
  // Combine date and time into ISO string
  const reviewDateTime = new Date(`${appointmentData.date}T${appointmentData.time}:00`);
  
  const request: ScheduleAppointmentRequest = {
    applicationId: selectedApplication.EntityId,
    comments: appointmentData.comments || 'Appointment scheduled for document verification',
    reviewDate: reviewDateTime.toISOString(),
    contactPerson: appointmentData.contactPerson,
    place: appointmentData.place,
    roomNumber: appointmentData.roomNumber || 'TBD'
  };

  const response = await appointmentService.scheduleAppointment(request);
  // Handle response...
};
```

## Testing

### Test Component
Created `src/components/test/AppointmentSchedulingTest.tsx` for API testing:
- Form to input all required fields
- Live API testing
- Response display
- cURL command equivalent

### Usage Flow
1. Officer selects an application
2. Clicks "Schedule Appointment"
3. Fills required fields:
   - Date and time
   - Meeting place
   - Contact person
   - Optional room number and comments
4. Submits form
5. API call is made to schedule appointment
6. Application status updates to "APPOINTMENT_SCHEDULED"

## Example API Call

### Your cURL Command
```bash
curl -X 'POST' \
  'http://localhost:5012/api/Application/schedule-appointment' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "comments": "Please bring original documents for verification",
  "reviewDate": "2025-10-13T12:58:25.860Z",
  "contactPerson": "Junior Engineer - Document Verification",
  "place": "PMC Office Building",
  "roomNumber": "Room 101"
}'
```

### Frontend Integration
The form now generates the same request structure automatically when officers fill out the appointment scheduling form.

## Error Handling
- Form validation before API call
- API error response handling
- User-friendly error messages
- Automatic retry suggestions

## Benefits
1. **Real API Integration**: No more mock calls
2. **Proper Data Structure**: Matches your API exactly
3. **Enhanced UX**: Better form validation and error handling
4. **Maintainable Code**: Separate service layer for appointment operations
5. **Testing Support**: Test component for API verification

The appointment scheduling feature is now fully integrated with your API and ready for production use!