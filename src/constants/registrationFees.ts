import { PositionType } from '../types/application';

/**
 * Registration fees for different position types
 * All fees are for 3 years registration period
 */
export const REGISTRATION_FEES: Record<number, number> = {
  [PositionType.Architect]: 0,              // No fees for Architect
  [PositionType.StructuralEngineer]: 1500,  // ₹1500 for 3 years
  [PositionType.LicenceEngineer]: 3000,     // ₹3000 for 3 years
  [PositionType.Supervisor1]: 900,          // ₹900 for 3 years
  [PositionType.Supervisor2]: 900           // ₹900 for 3 years
};

/**
 * Get registration fee for a specific position type
 * @param positionType The position type enum value
 * @returns The registration fee amount
 */
export const getRegistrationFee = (positionType: number): number => {
  return REGISTRATION_FEES[positionType] ?? 0;
};

/**
 * Get formatted registration fee description
 * @param positionType The position type enum value
 * @returns Formatted fee description with validity period
 */
export const getRegistrationFeeDescription = (positionType: number): string => {
  const fee = getRegistrationFee(positionType);
  
  if (fee === 0) {
    return 'No registration fee required';
  }
  
  return `₹${fee.toLocaleString()} for 3 years`;
};

/**
 * Registration period in years
 */
export const REGISTRATION_VALIDITY_YEARS = 3;
