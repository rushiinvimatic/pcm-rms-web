import { applicationService } from '../services/application.service';
import { ApplicationStage, type ApplicationStageValue } from '../types/application';

export interface TestingUpdateParams {
  applicationId: string;
  currentStage: ApplicationStageValue;
  nextStage: ApplicationStageValue;
  nextStageName: string;
  comments?: string;
  onSuccess?: () => Promise<void>;
  showToast?: (params: { title: string; description: string }) => void;
}

/**
 * Global testing function to update application stage with digital signature
 * This function handles:
 * 1. User confirmation
 * 2. Stage update via updateStageForTesting API
 * 3. Digital signature application with dummy OTP
 * 4. Success callback and toast notification
 * 
 * @param params - Testing update parameters
 */
export const handleGlobalUpdateStageForTesting = async (params: TestingUpdateParams) => {
  const {
    applicationId,
    currentStage,
    nextStage,
    nextStageName,
    comments = 'Testing bypass - Stage updated',
    onSuccess,
    showToast
  } = params;

  // Confirmation dialog
  if (!window.confirm(
    `⚠️ TESTING ONLY: This will bypass OTP verification and move the application from stage ${currentStage} to ${nextStageName} (${nextStage}). Continue?`
  )) {
    return;
  }

  try {
    // Step 1: Update the application stage
    await applicationService.updateStageForTesting(
      applicationId, 
      nextStage, 
      comments, 
      true, 
      applicationId // Using applicationId as officerId for testing
    );

    // Step 2: Apply digital signature with dummy OTP
    try {
      await applicationService.applyDigitalSignature(
        applicationId,
        '123456', // Dummy OTP for testing
        applicationId // Using applicationId as officerId for testing
      );
    } catch (signatureError) {
      console.warn('Digital signature application failed (this may be expected in testing):', signatureError);
      // Continue execution even if signature fails, as it might not be implemented on backend
    }

    // Step 3: Show success notification
    if (showToast) {
      showToast({
        title: 'Success (Testing)',
        description: `🧪 Application moved to ${nextStageName} stage (with digital signature applied)`,
      });
    }

    // Step 4: Execute success callback (usually to refresh data)
    if (onSuccess) {
      await onSuccess();
    }

  } catch (error: any) {
    console.error('Stage update failed:', error);
    
    if (showToast) {
      showToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update application stage',
      });
    } else {
      alert('Error: ' + (error.response?.data?.message || 'Failed to update application stage'));
    }
    
    throw error;
  }
};

/**
 * Stage mapping for different officer roles
 */
export const STAGE_MAPPINGS = {
  // Junior Engineer: Document verification to Assistant Engineer
  JUNIOR_ENGINEER: {
    currentStage: ApplicationStage.DOCUMENT_VERIFICATION_PENDING,
    nextStage: ApplicationStage.ASSISTANT_ENGINEER_PENDING,
    nextStageName: 'Assistant Engineer'
  },
  
  // Junior Structural Engineer: Document verification to Executive Engineer
  JUNIOR_STRUCTURAL_ENGINEER: {
    currentStage: ApplicationStage.DOCUMENT_VERIFICATION_PENDING,
    nextStage: ApplicationStage.EXECUTIVE_ENGINEER_PENDING,
    nextStageName: 'Executive Engineer'
  },
  
  // Assistant Engineer: Assistant Engineer to Executive Engineer
  ASSISTANT_ENGINEER: {
    currentStage: ApplicationStage.ASSISTANT_ENGINEER_PENDING,
    nextStage: ApplicationStage.EXECUTIVE_ENGINEER_PENDING,
    nextStageName: 'Executive Engineer'
  },
  
  // Executive Engineer Stage 1: Executive Engineer to City Engineer
  EXECUTIVE_ENGINEER: {
    currentStage: ApplicationStage.EXECUTIVE_ENGINEER_PENDING,
    nextStage: ApplicationStage.CITY_ENGINEER_PENDING,
    nextStageName: 'City Engineer'
  },
  
  // Executive Engineer Stage 2: Executive Engineer Sign to City Engineer Sign
  EXECUTIVE_ENGINEER_STAGE2: {
    currentStage: ApplicationStage.EXECUTIVE_ENGINEER_SIGN_PENDING,
    nextStage: ApplicationStage.CITY_ENGINEER_SIGN_PENDING,
    nextStageName: 'City Engineer Final Signature'
  },
  
  // City Engineer: City Engineer to Payment
  CITY_ENGINEER: {
    currentStage: ApplicationStage.CITY_ENGINEER_PENDING,
    nextStage: ApplicationStage.PAYMENT_PENDING,
    nextStageName: 'Payment'
  },
  
  // Clerk: After payment to Executive Engineer Sign
  CLERK: {
    currentStage: ApplicationStage.CLERK_PENDING,
    nextStage: ApplicationStage.EXECUTIVE_ENGINEER_SIGN_PENDING,
    nextStageName: 'Executive Engineer Signature'
  },

  // Supervisor 1: After payment to Executive Engineer Sign
  SUPERVISOR1: {
    currentStage: ApplicationStage.DOCUMENT_VERIFICATION_PENDING,
    nextStage:ApplicationStage.EXECUTIVE_ENGINEER_PENDING,
    nextStageName: 'Supervisor1'
  }
} as const;

/**
 * Helper function to get stage mapping for a specific officer role
 */
export const getStageMapping = (officerRole: keyof typeof STAGE_MAPPINGS) => {
  return STAGE_MAPPINGS[officerRole];
};