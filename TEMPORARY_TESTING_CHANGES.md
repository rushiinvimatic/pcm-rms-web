# TEMPORARY TESTING CHANGES - BYPASS OTP VERIFICATION

**⚠️ IMPORTANT: These changes are for testing purposes only and must be removed after testing is complete.**

## Purpose
These changes implement a bypass mechanism for OTP verification to test the complete application flow without dependency on external OTP systems.

## API Endpoint Used
```bash
curl -X 'POST' \
  'http://localhost:5012/api/Application/update-stage' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "applicationId": "<applicationId>",
  "newStage": <stageNumber>,
  "comments": "<comments>",
  "isApproved": true
}'
```

## Files Modified

### 1. **src/services/application.service.ts**
- **Added Function**: `updateStageForTesting`
- **Purpose**: Calls the `/api/Application/update-stage` endpoint
- **Location**: Lines ~585-598 (at end of service object)
- **Added Function**: `approveByAssistantEngineer`
- **Purpose**: Calls the `/api/Application/approve-assistant-engineer` endpoint
- **Location**: After `approveByJuniorEngineer` function

### 2. **src/pages/officers/JuniorEngineer/Dashboard.tsx**
- **Added Comment Block**: Lines 1-9 (file header)
- **Added Function**: `handleUpdateStageForTesting` (after `handleRejectApplication`)
- **Added Button**: "🧪 Update Stage (Test)" in document verification cards
- **Stage Flow**: DOCUMENT_VERIFICATION_PENDING (1) → ASSISTANT_ENGINEER_PENDING (2)

### 3. **src/pages/officers/AssistantEngineer/Dashboard.tsx**
- **Added Comment Block**: Lines 1-9 (file header)
- **Added Function**: `handleUpdateStageForTesting` (after `handleRejectApplication`)
- **Added Button**: "🧪 Update Stage (Test)" in application cards
- **Stage Flow**: ASSISTANT_ENGINEER_PENDING (2) → EXECUTIVE_ENGINEER_PENDING (3)

### 4. **src/pages/officers/JuniorStructuralEngineer/Dashboard.tsx**
- **Added Comment Block**: Lines 1-9 (file header)
- **Added Function**: `handleUpdateStageForTesting` (after `handleRejectApplication`)
- **Added Button**: "🧪 Update Stage (Test)" in document verification cards
- **Stage Flow**: DOCUMENT_VERIFICATION_PENDING (1) → ASSISTANT_ENGINEER_PENDING (2)

### 5. **src/pages/officers/AssistantStructuralEngineer/Dashboard.tsx**
- **Complete Rebuild**: Recreated entire dashboard following AssistantEngineer pattern
- **Added Comment Block**: Lines 1-9 (file header)
- **Added Function**: `handleUpdateStageForTesting` (after `handleRejectApplication`)
- **Added Button**: "🧪 Update Stage (Test)" in application cards
- **Position Filter**: Only shows Structural Engineer applications (positionType === 1)
- **Stage Flow**: ASSISTANT_ENGINEER_PENDING (2) → EXECUTIVE_ENGINEER_PENDING (3)

## Button Characteristics
- **Visual Style**: Orange background (`bg-orange-50 text-orange-700 border-orange-200`)
- **Icon**: 🧪 (test tube emoji)
- **Tooltip**: "⚠️ TESTING ONLY: Bypass OTP and move to next stage"
- **Confirmation Dialog**: Shows warning before execution

## Testing Stages Implemented

### Junior Level (Document Verification)
- **JuniorEngineer**: Stage 1 → Stage 2 (Assistant Engineer)
- **JuniorStructuralEngineer**: Stage 1 → Stage 2 (Assistant Engineer)

### Assistant Level (Review & Approval)
- **AssistantEngineer**: Stage 2 → Stage 3 (Executive Engineer)
- **AssistantStructuralEngineer**: Stage 2 → Stage 3 (Executive Engineer) - Structural Engineer applications only

## Still To Be Implemented
- **ExecutiveEngineer**: Stage 3 → Stage 4 (City Engineer)
- **CityEngineer**: Stage 4 → Final approval stages

## How to Remove These Changes

### 1. Remove API Function
Delete the `updateStageForTesting` function from `application.service.ts`

### 2. Remove Dashboard Functions
Search for and delete:
- Comment blocks at file tops
- `handleUpdateStageForTesting` functions
- Testing buttons in JSX (marked with "TEMPORARY TESTING BUTTON" comments)

### 3. Search Patterns for Cleanup
```bash
# Search for all temporary changes
grep -r "TEMPORARY TESTING" src/
grep -r "TODO: Remove after testing" src/
grep -r "🧪" src/
grep -r "updateStageForTesting" src/
```

## Security Considerations
- These changes bypass security measures (OTP verification)
- **DO NOT** deploy these changes to production
- Remove immediately after testing is complete
- Ensure no traces remain in production code

## Testing Flow
1. Submit application
2. Use regular approval flow OR use testing button
3. Testing button moves application to next stage instantly
4. Continue testing through the pipeline

---
**Created**: October 15, 2025  
**Status**: Active - Remove after testing complete  
**Author**: Testing Implementation for PMC Web Application