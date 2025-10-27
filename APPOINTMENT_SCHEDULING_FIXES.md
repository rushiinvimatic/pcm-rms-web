# Appointment Scheduling Fixes

## Issues Identified and Fixed

### 1. API Request Structure Issues

#### Problem
```json
{
    "model": [
        "The model field is required."
    ],
    "$.applicationId": [
        "The JSON value could not be converted to System.Guid. Path: $.applicationId | LineNumber: 0 | BytePositionInLine: 43."
    ]
}
```

#### Solutions Implemented

##### A. Added Required `model` Field
```typescript
export interface ScheduleAppointmentRequest {
  model?: string; // Required by API
  applicationId: string;
  comments: string;
  reviewDate: string;
  contactPerson: string;
  place: string;
  roomNumber: string;
}
```

The service now automatically adds the model field:
```typescript
const requestWithModel = {
  model: 'ScheduleAppointmentModel',
  ...request
};
```

##### B. GUID Validation for applicationId
Added validation function to ensure proper GUID format:
```typescript
const isValidGuid = (guid: string): boolean => {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
};
```

Validation in appointment scheduling:
```typescript
const applicationId = selectedApplication.EntityId || selectedApplication.BusinessId;
if (!applicationId || !isValidGuid(applicationId)) {
  throw new Error('Invalid application ID format. Expected GUID.');
}
```

### 2. Application Loading from Proper Endpoint

#### New API Integration
Updated to use the `/api/Application/list` endpoint as requested:

```typescript
getApplicationsList: async (status: number, pageNumber: number = 1, pageSize: number = 10) => {
  const request = {
    status,
    pageNumber,
    pageSize
  };
  
  const response = await api.post('/Application/list', request);
  return response.data;
}
```

#### Dashboard Integration
```typescript
const fetchApplications = async () => {
  // Fetch applications with status 1 (submitted applications)
  const response = await appointmentService.getApplicationsList(1, 1, 50);
  
  if (response && response.applications && Array.isArray(response.applications)) {
    setApplications(response.applications);
  }
};
```

### 3. Appointment Scheduling Workflow Changes

#### Updated Status Flow
**Before**: Application → APPOINTMENT_SCHEDULED (stays in same list)
**After**: Application → ASSISTANT_ENGINEER_PENDING (moves to pending list)

```typescript
if (response.success) {
  // Move application to pending list for next officer
  setApplications(prev =>
    prev.map(app =>
      (app.EntityId === selectedApplication.EntityId || app.BusinessId === selectedApplication.EntityId)
        ? { ...app, Stage: 'ASSISTANT_ENGINEER_PENDING' as ApplicationStage }
        : app
    )
  );
}
```

This ensures that:
- ✅ Scheduled appointments are not considered as pending in the same officer's list
- ✅ Once appointment is scheduled, it transfers to the next officer's pending list
- ✅ Proper workflow progression through the system

## API Endpoints Used

### 1. Load Applications
```bash
curl -X 'POST' \
  'http://localhost:5012/api/Application/list' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "status": 1,
  "pageNumber": 1,
  "pageSize": 10
}'
```

### 2. Schedule Appointment (Fixed)
```bash
curl -X 'POST' \
  'http://localhost:5012/api/Application/schedule-appointment' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "model": "ScheduleAppointmentModel",
  "applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "comments": "Document verification appointment scheduled",
  "reviewDate": "2025-10-13T12:58:25.860Z",
  "contactPerson": "Junior Engineer - Document Verification Team",
  "place": "PMC Office Building",
  "roomNumber": "Room 101"
}'
```

## Files Modified

1. **`src/services/appointment.service.ts`**
   - Added `model` field to request interface
   - Added `getApplicationsList` function
   - Enhanced error logging
   - Automatic model field injection

2. **`src/pages/officers/JuniorEngineer/Dashboard.tsx`**
   - Added GUID validation function
   - Updated `fetchApplications` to use real API
   - Enhanced `handleSaveAppointment` with proper validation
   - Changed status flow to move appointments to pending list

3. **`src/components/test/AppointmentSchedulingTest.tsx`**
   - Added model field to test data
   - Updated sample GUID format

## Testing

### 1. Application Loading
- Dashboard now loads applications using `POST /api/Application/list`
- Status 1 applications are fetched for appointment scheduling
- Proper error handling if no applications found

### 2. Appointment Scheduling
- Model field automatically included
- GUID validation before API call
- Enhanced error messages for debugging
- Proper workflow status updates

### 3. Workflow Verification
- Scheduled appointments move out of current officer's list
- Applications progress to next stage (ASSISTANT_ENGINEER_PENDING)
- No duplicate entries in appointment scheduling list

The appointment scheduling feature is now fully compatible with your API requirements and implements the proper workflow as requested!