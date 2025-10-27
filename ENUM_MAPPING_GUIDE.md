# Enum Mappings and API Integration Guide

This document explains how the **PositionType** and **ApplicationStage** enums are defined and used throughout the PMC Web application to handle the API response structure.

## API Response Structure

Your API returns applications in this format:

```json
{
    "id": "6295bf7b-5684-4d34-b319-76ec4fa12e46",
    "applicationNumber": "PMC_APPLICATION_2025_1",
    "firstName": "Hinata",
    "middleName": "Serban",
    "lastName": "Hyuga",
    "positionType": 0,              // Maps to PositionType enum
    "submissionDate": "2025-10-13T07:07:04.594084Z",
    "status": 1,                    // Maps to status enum
    "currentStage": 0               // Maps to ApplicationStage enum
}
```

## Enum Definitions

### PositionType Enum

```typescript
export const PositionType = {
  Architect: 0,
  StructuralEngineer: 1,
  LicenceEngineer: 2,
  Supervisor1: 3,
  Supervisor2: 4
} as const;
```

**API Value → Display Label:**
- `0` → "Architect"
- `1` → "Structural Engineer"
- `2` → "Licence Engineer"
- `3` → "Supervisor1"
- `4` → "Supervisor2"

### ApplicationStage Enum

```typescript
export const ApplicationStage = {
  JUNIOR_ENGINEER_PENDING: 0,
  DOCUMENT_VERIFICATION_PENDING: 1,
  ASSISTANT_ENGINEER_PENDING: 2,
  EXECUTIVE_ENGINEER_PENDING: 3,
  CITY_ENGINEER_PENDING: 4,
  PAYMENT_PENDING: 5, // call these 3 apis --> update stage + generate challan + generate certificate
  CLERK_PENDING: 6,
  EXECUTIVE_ENGINEER_SIGN_PENDING: 7,
  CITY_ENGINEER_SIGN_PENDING: 8,
  APPROVED: 9,
  REJECTED: 10
} as const;
```

**API Value → Display Label:**
- `0` → "Junior Engineer Pending"
- `1` → "Document Verification Pending"
- `2` → "Assistant Engineer Pending"
- `3` → "Executive Engineer Pending"
- `4` → "City Engineer Pending"
- `5` → "Payment Pending"
- `6` → "Clerk Pending"
- `7` → "Executive Engineer Signature Pending"
- `8` → "City Engineer Signature Pending"
- `9` → "Approved"
- `10` → "Rejected"

## Status Enum (for status field)

```typescript
// Status configurations for different statuses
export const statusConfig: Record<number, { color: string; label: string }> = {
  0: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
  1: { color: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
  2: { color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
  3: { color: 'bg-green-100 text-green-800', label: 'Approved' },
  4: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  5: { color: 'bg-orange-100 text-orange-800', label: 'Requires Revision' }
};
```

## Usage in Components

### Import the utilities:

```typescript
import { 
  getPositionTypeLabel, 
  getApplicationStageLabel, 
  getStatusLabel, 
  getStatusColor,
  getApplicationStageColor,
  getPositionTypeColor
} from '../../utils/enumMappings';
```

### Use in your JSX:

```tsx
const ApplicationDisplay: React.FC<{ application: ApiApplication }> = ({ application }) => {
  return (
    <div>
      <h3>{application.applicationNumber}</h3>
      <p>Applicant: {application.firstName} {application.lastName}</p>
      
      {/* Position Type Display */}
      <Badge className={getPositionTypeColor(application.positionType)}>
        {getPositionTypeLabel(application.positionType)}
      </Badge>
      
      {/* Current Stage Display */}
      <Badge className={getApplicationStageColor(application.currentStage)}>
        {getApplicationStageLabel(application.currentStage)}
      </Badge>
      
      {/* Status Display */}
      <Badge className={getStatusColor(application.status)}>
        {getStatusLabel(application.status)}
      </Badge>
    </div>
  );
};
```

## Files Updated

### Core Type Definitions:
- `src/types/application.ts` - Contains the enum definitions and labels
- `src/types/dashboard.ts` - Contains the API response interface
- `src/utils/enumMappings.ts` - Contains utility functions and color configurations

### Dashboard Components Updated:
- `src/pages/user/UserDashboard.tsx`
- `src/pages/user/MyApplicationsPage.tsx`
- `src/pages/officers/AssistantEngineer/Dashboard.tsx`

### Example Component:
- `src/components/common/ApplicationCard.tsx` - Shows best practices for usage

## Key Points

1. **Consistency**: All components now use the same utility functions for enum mapping
2. **Maintainability**: Changes to labels or colors only need to be made in one place
3. **Type Safety**: TypeScript ensures correct enum usage
4. **API Compatibility**: Direct mapping from numeric API values to display labels
5. **UI Consistency**: Standardized colors and styling across all components

## Testing Your Integration

With your API response:
```json
{
    "positionType": 0,    // Should display "Architect"
    "status": 1,          // Should display "Submitted" 
    "currentStage": 0     // Should display "Junior Engineer Pending"
}
```

Use the utility functions:
- `getPositionTypeLabel(0)` → "Architect"
- `getStatusLabel(1)` → "Submitted"
- `getApplicationStageLabel(0)` → "Junior Engineer Pending"