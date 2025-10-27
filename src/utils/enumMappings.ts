import { PositionType, ApplicationStage, ApplicationStatus, POSITION_LABELS, APPLICATION_STAGE_LABELS, APPLICATION_STATUS_LABELS, CertificateStatus, ChallanStatus, PaymentStatus } from '../types/application';

// Position Type Configurations
export const positionTypeConfig: Record<number, string> = {
  [PositionType.Architect]: POSITION_LABELS[PositionType.Architect],
  [PositionType.StructuralEngineer]: POSITION_LABELS[PositionType.StructuralEngineer],
  [PositionType.LicenceEngineer]: POSITION_LABELS[PositionType.LicenceEngineer],
  [PositionType.Supervisor1]: POSITION_LABELS[PositionType.Supervisor1],
  [PositionType.Supervisor2]: POSITION_LABELS[PositionType.Supervisor2]
};

// Application Status Configurations
export const applicationStatusConfig: Record<number, string> = {
  [ApplicationStatus.Draft]: APPLICATION_STATUS_LABELS[ApplicationStatus.Draft],
  [ApplicationStatus.Submitted]: APPLICATION_STATUS_LABELS[ApplicationStatus.Submitted],
  [ApplicationStatus.UnderReview]: APPLICATION_STATUS_LABELS[ApplicationStatus.UnderReview],
  [ApplicationStatus.DocumentVerificationPending]: APPLICATION_STATUS_LABELS[ApplicationStatus.DocumentVerificationPending],
  [ApplicationStatus.DocumentVerified]: APPLICATION_STATUS_LABELS[ApplicationStatus.DocumentVerified],
  [ApplicationStatus.AppointmentScheduled]: APPLICATION_STATUS_LABELS[ApplicationStatus.AppointmentScheduled],
  [ApplicationStatus.AppointmentCompleted]: APPLICATION_STATUS_LABELS[ApplicationStatus.AppointmentCompleted],
  [ApplicationStatus.JuniorEngineerApproved]: APPLICATION_STATUS_LABELS[ApplicationStatus.JuniorEngineerApproved],
  [ApplicationStatus.AssistantEngineerApproved]: APPLICATION_STATUS_LABELS[ApplicationStatus.AssistantEngineerApproved],
  [ApplicationStatus.ExecutiveEngineerApproved]: APPLICATION_STATUS_LABELS[ApplicationStatus.ExecutiveEngineerApproved],
  [ApplicationStatus.CityEngineerApproved]: APPLICATION_STATUS_LABELS[ApplicationStatus.CityEngineerApproved],
  [ApplicationStatus.PaymentPending]: APPLICATION_STATUS_LABELS[ApplicationStatus.PaymentPending],
  [ApplicationStatus.PaymentCompleted]: APPLICATION_STATUS_LABELS[ApplicationStatus.PaymentCompleted],
  [ApplicationStatus.ClerkApproved]: APPLICATION_STATUS_LABELS[ApplicationStatus.ClerkApproved],
  [ApplicationStatus.DigitallySignedByExecutive]: APPLICATION_STATUS_LABELS[ApplicationStatus.DigitallySignedByExecutive],
  [ApplicationStatus.DigitallySignedByCity]: APPLICATION_STATUS_LABELS[ApplicationStatus.DigitallySignedByCity],
  [ApplicationStatus.Completed]: APPLICATION_STATUS_LABELS[ApplicationStatus.Completed],
  [ApplicationStatus.Rejected]: APPLICATION_STATUS_LABELS[ApplicationStatus.Rejected]
};

// Application Stage Configurations
export const applicationStageConfig: Record<number, string> = {
  [ApplicationStage.JUNIOR_ENGINEER_PENDING]: APPLICATION_STAGE_LABELS[ApplicationStage.JUNIOR_ENGINEER_PENDING],
  [ApplicationStage.DOCUMENT_VERIFICATION_PENDING]: APPLICATION_STAGE_LABELS[ApplicationStage.DOCUMENT_VERIFICATION_PENDING],
  [ApplicationStage.ASSISTANT_ENGINEER_PENDING]: APPLICATION_STAGE_LABELS[ApplicationStage.ASSISTANT_ENGINEER_PENDING],
  [ApplicationStage.EXECUTIVE_ENGINEER_PENDING]: APPLICATION_STAGE_LABELS[ApplicationStage.EXECUTIVE_ENGINEER_PENDING],
  [ApplicationStage.CITY_ENGINEER_PENDING]: APPLICATION_STAGE_LABELS[ApplicationStage.CITY_ENGINEER_PENDING],
  [ApplicationStage.PAYMENT_PENDING]: APPLICATION_STAGE_LABELS[ApplicationStage.PAYMENT_PENDING],
  [ApplicationStage.CLERK_PENDING]: APPLICATION_STAGE_LABELS[ApplicationStage.CLERK_PENDING],
  [ApplicationStage.EXECUTIVE_ENGINEER_SIGN_PENDING]: APPLICATION_STAGE_LABELS[ApplicationStage.EXECUTIVE_ENGINEER_SIGN_PENDING],
  [ApplicationStage.CITY_ENGINEER_SIGN_PENDING]: APPLICATION_STAGE_LABELS[ApplicationStage.CITY_ENGINEER_SIGN_PENDING],
  [ApplicationStage.APPROVED]: APPLICATION_STAGE_LABELS[ApplicationStage.APPROVED],
  [ApplicationStage.REJECTED]: APPLICATION_STAGE_LABELS[ApplicationStage.REJECTED]
};

// Application Stage Colors for UI
export const applicationStageColorConfig: Record<number, { color: string; label: string }> = {
  [ApplicationStage.JUNIOR_ENGINEER_PENDING]: { color: 'bg-yellow-100 text-yellow-800', label: APPLICATION_STAGE_LABELS[ApplicationStage.JUNIOR_ENGINEER_PENDING] },
  [ApplicationStage.DOCUMENT_VERIFICATION_PENDING]: { color: 'bg-blue-100 text-blue-800', label: APPLICATION_STAGE_LABELS[ApplicationStage.DOCUMENT_VERIFICATION_PENDING] },
  [ApplicationStage.ASSISTANT_ENGINEER_PENDING]: { color: 'bg-indigo-100 text-indigo-800', label: APPLICATION_STAGE_LABELS[ApplicationStage.ASSISTANT_ENGINEER_PENDING] },
  [ApplicationStage.EXECUTIVE_ENGINEER_PENDING]: { color: 'bg-purple-100 text-purple-800', label: APPLICATION_STAGE_LABELS[ApplicationStage.EXECUTIVE_ENGINEER_PENDING] },
  [ApplicationStage.CITY_ENGINEER_PENDING]: { color: 'bg-pink-100 text-pink-800', label: APPLICATION_STAGE_LABELS[ApplicationStage.CITY_ENGINEER_PENDING] },
  [ApplicationStage.PAYMENT_PENDING]: { color: 'bg-orange-100 text-orange-800', label: APPLICATION_STAGE_LABELS[ApplicationStage.PAYMENT_PENDING] },
  [ApplicationStage.CLERK_PENDING]: { color: 'bg-cyan-100 text-cyan-800', label: APPLICATION_STAGE_LABELS[ApplicationStage.CLERK_PENDING] },
  [ApplicationStage.EXECUTIVE_ENGINEER_SIGN_PENDING]: { color: 'bg-violet-100 text-violet-800', label: APPLICATION_STAGE_LABELS[ApplicationStage.EXECUTIVE_ENGINEER_SIGN_PENDING] },
  [ApplicationStage.CITY_ENGINEER_SIGN_PENDING]: { color: 'bg-rose-100 text-rose-800', label: APPLICATION_STAGE_LABELS[ApplicationStage.CITY_ENGINEER_SIGN_PENDING] },
  [ApplicationStage.APPROVED]: { color: 'bg-green-100 text-green-800', label: APPLICATION_STAGE_LABELS[ApplicationStage.APPROVED] },
  [ApplicationStage.REJECTED]: { color: 'bg-red-100 text-red-800', label: APPLICATION_STAGE_LABELS[ApplicationStage.REJECTED] }
};

// Application Status Colors for UI
export const applicationStatusColorConfig: Record<number, { color: string; label: string }> = {
  [ApplicationStatus.Draft]: { color: 'bg-gray-100 text-gray-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.Draft] },
  [ApplicationStatus.Submitted]: { color: 'bg-blue-100 text-blue-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.Submitted] },
  [ApplicationStatus.UnderReview]: { color: 'bg-yellow-100 text-yellow-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.UnderReview] },
  [ApplicationStatus.DocumentVerificationPending]: { color: 'bg-orange-100 text-orange-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.DocumentVerificationPending] },
  [ApplicationStatus.DocumentVerified]: { color: 'bg-cyan-100 text-cyan-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.DocumentVerified] },
  [ApplicationStatus.AppointmentScheduled]: { color: 'bg-indigo-100 text-indigo-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.AppointmentScheduled] },
  [ApplicationStatus.AppointmentCompleted]: { color: 'bg-purple-100 text-purple-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.AppointmentCompleted] },
  [ApplicationStatus.JuniorEngineerApproved]: { color: 'bg-emerald-100 text-emerald-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.JuniorEngineerApproved] },
  [ApplicationStatus.AssistantEngineerApproved]: { color: 'bg-teal-100 text-teal-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.AssistantEngineerApproved] },
  [ApplicationStatus.ExecutiveEngineerApproved]: { color: 'bg-sky-100 text-sky-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.ExecutiveEngineerApproved] },
  [ApplicationStatus.CityEngineerApproved]: { color: 'bg-violet-100 text-violet-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.CityEngineerApproved] },
  [ApplicationStatus.PaymentPending]: { color: 'bg-amber-100 text-amber-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.PaymentPending] },
  [ApplicationStatus.PaymentCompleted]: { color: 'bg-lime-100 text-lime-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.PaymentCompleted] },
  [ApplicationStatus.ClerkApproved]: { color: 'bg-green-100 text-green-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.ClerkApproved] },
  [ApplicationStatus.DigitallySignedByExecutive]: { color: 'bg-pink-100 text-pink-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.DigitallySignedByExecutive] },
  [ApplicationStatus.DigitallySignedByCity]: { color: 'bg-rose-100 text-rose-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.DigitallySignedByCity] },
  [ApplicationStatus.Completed]: { color: 'bg-green-100 text-green-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.Completed] },
  [ApplicationStatus.Rejected]: { color: 'bg-red-100 text-red-800', label: APPLICATION_STATUS_LABELS[ApplicationStatus.Rejected] }
};

// Position Type Colors for UI  
export const positionTypeColorConfig: Record<number, { color: string; label: string; icon: string }> = {
  [PositionType.Architect]: { color: 'bg-blue-100 text-blue-800', label: POSITION_LABELS[PositionType.Architect], icon: '🏗️' },
  [PositionType.StructuralEngineer]: { color: 'bg-green-100 text-green-800', label: POSITION_LABELS[PositionType.StructuralEngineer], icon: '🏢' },
  [PositionType.LicenceEngineer]: { color: 'bg-purple-100 text-purple-800', label: POSITION_LABELS[PositionType.LicenceEngineer], icon: '📋' },
  [PositionType.Supervisor1]: { color: 'bg-orange-100 text-orange-800', label: POSITION_LABELS[PositionType.Supervisor1], icon: '👷' },
  [PositionType.Supervisor2]: { color: 'bg-amber-100 text-amber-800', label: POSITION_LABELS[PositionType.Supervisor2], icon: '👷‍♀️' }
};

// Status configurations for different statuses
export const statusConfig: Record<number, { color: string; label: string }> = {
  0: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
  1: { color: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
  2: { color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
  3: { color: 'bg-green-100 text-green-800', label: 'Approved' },
  4: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  5: { color: 'bg-orange-100 text-orange-800', label: 'Requires Revision' }
};

// Utility functions
export const getPositionTypeLabel = (positionType: number): string => {
  return positionTypeConfig[positionType] || 'Unknown Position';
};

export const getApplicationStageLabel = (stage: number): string => {
  return applicationStageConfig[stage] || `Stage ${stage}`;
};

export const getApplicationStatusLabel = (status: number): string => {
  return applicationStatusConfig[status] || 'Unknown Status';
};

export const getStatusLabel = (status: number): string => {
  return statusConfig[status]?.label || 'Unknown Status';
};

export const getStatusColor = (status: number): string => {
  return statusConfig[status]?.color || 'bg-gray-100 text-gray-800';
};

export const getApplicationStageColor = (stage: number): string => {
  return applicationStageColorConfig[stage]?.color || 'bg-gray-100 text-gray-800';
};

export const getApplicationStatusColor = (status: number): string => {
  return applicationStatusColorConfig[status]?.color || 'bg-gray-100 text-gray-800';
};

export const getPositionTypeColor = (positionType: number): string => {
  return positionTypeColorConfig[positionType]?.color || 'bg-gray-100 text-gray-800';
};

// Document Type Labels
export const documentTypeLabels: Record<number, string> = {
  0: 'Address Proof',
  1: 'PAN Card',
  2: 'Aadhar Card',
  3: 'Degree Certificate',
  4: 'Degree Marksheet',
  5: 'Experience Certificate',
  6: 'COA Certificate',
  7: 'Profile Picture',
  8: 'Electricity Bill',
  9: 'Additional Document'
};

export const getDocumentTypeLabel = (documentType: number): string => {
  return documentTypeLabels[documentType] || 'Unknown Document';
};

// Certificate Status Configurations
export const certificateStatusConfig: Record<number, string> = {
  [CertificateStatus.PENDING_GENERATION]: 'Pending Generation',
  [CertificateStatus.GENERATED]: 'Generated',
  [CertificateStatus.EXECUTIVE_ENGINEER_SIGNED]: 'Executive Engineer Signed',
  [CertificateStatus.CITY_ENGINEER_SIGNED]: 'City Engineer Signed',
  [CertificateStatus.COMPLETED]: 'Completed',
  [CertificateStatus.EXPIRED]: 'Expired',
  [CertificateStatus.CANCELLED]: 'Cancelled'
};

export const certificateStatusColorConfig: Record<number, { color: string; label: string }> = {
  [CertificateStatus.PENDING_GENERATION]: { color: 'bg-gray-100 text-gray-800', label: 'Pending Generation' },
  [CertificateStatus.GENERATED]: { color: 'bg-blue-100 text-blue-800', label: 'Generated' },
  [CertificateStatus.EXECUTIVE_ENGINEER_SIGNED]: { color: 'bg-yellow-100 text-yellow-800', label: 'Executive Engineer Signed' },
  [CertificateStatus.CITY_ENGINEER_SIGNED]: { color: 'bg-purple-100 text-purple-800', label: 'City Engineer Signed' },
  [CertificateStatus.COMPLETED]: { color: 'bg-green-100 text-green-800', label: 'Completed' },
  [CertificateStatus.EXPIRED]: { color: 'bg-red-100 text-red-800', label: 'Expired' },
  [CertificateStatus.CANCELLED]: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
};

// Challan Status Configurations
export const challanStatusConfig: Record<number, string> = {
  [ChallanStatus.PENDING]: 'Pending',
  [ChallanStatus.GENERATED]: 'Generated',
  [ChallanStatus.PAID]: 'Paid',
  [ChallanStatus.EXPIRED]: 'Expired',
  [ChallanStatus.CANCELLED]: 'Cancelled'
};

export const challanStatusColorConfig: Record<number, { color: string; label: string }> = {
  [ChallanStatus.PENDING]: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
  [ChallanStatus.GENERATED]: { color: 'bg-blue-100 text-blue-800', label: 'Generated' },
  [ChallanStatus.PAID]: { color: 'bg-green-100 text-green-800', label: 'Paid' },
  [ChallanStatus.EXPIRED]: { color: 'bg-red-100 text-red-800', label: 'Expired' },
  [ChallanStatus.CANCELLED]: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
};

// Payment Status Configurations
export const paymentStatusConfig: Record<number, string> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.IN_PROGRESS]: 'In Progress',
  [PaymentStatus.COMPLETED]: 'Completed',
  [PaymentStatus.FAILED]: 'Failed',
  [PaymentStatus.CANCELLED]: 'Cancelled',
  [PaymentStatus.REFUNDED]: 'Refunded'
};

export const paymentStatusColorConfig: Record<number, { color: string; label: string }> = {
  [PaymentStatus.PENDING]: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
  [PaymentStatus.IN_PROGRESS]: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
  [PaymentStatus.COMPLETED]: { color: 'bg-green-100 text-green-800', label: 'Completed' },
  [PaymentStatus.FAILED]: { color: 'bg-red-100 text-red-800', label: 'Failed' },
  [PaymentStatus.CANCELLED]: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  [PaymentStatus.REFUNDED]: { color: 'bg-orange-100 text-orange-800', label: 'Refunded' }
};

// Certificate Status Utility Functions
export const getCertificateStatusLabel = (status: number): string => {
  return certificateStatusConfig[status] || 'Unknown Status';
};

export const getCertificateStatusColor = (status: number): string => {
  return certificateStatusColorConfig[status]?.color || 'bg-gray-100 text-gray-800';
};

// Challan Status Utility Functions
export const getChallanStatusLabel = (status: number): string => {
  return challanStatusConfig[status] || 'Unknown Status';
};

export const getChallanStatusColor = (status: number): string => {
  return challanStatusColorConfig[status]?.color || 'bg-gray-100 text-gray-800';
};

// Payment Status Utility Functions
export const getPaymentStatusLabel = (status: number): string => {
  return paymentStatusConfig[status] || 'Unknown Status';
};

export const getPaymentStatusColor = (status: number): string => {
  return paymentStatusColorConfig[status]?.color || 'bg-gray-100 text-gray-800';
};

// Exported utility object for external usage
export const enumMappings = {
  getPositionTypeText: (positionType: number): string => {
    const mapping: Record<number, string> = {
      0: 'Architect',
      1: 'Structural Engineer',
      2: 'Licence Engineer',
      3: 'Supervisor 1',
      4: 'Supervisor 2'
    };
    return mapping[positionType] || 'Unknown Position';
  },
  
  getStatusText: (status: number): string => {
    const mapping: Record<number, string> = {
      0: 'Draft',
      1: 'Submitted',
      2: 'In Review',
      3: 'Approved',
      4: 'Rejected',
      5: 'Completed'
    };
    return mapping[status] || 'Unknown Status';
  },
  
  getStageText: (stage: number): string => {
    const mapping: Record<number, string> = {
      0: 'Junior Engineer Pending',
      1: 'Document Verification Pending',
      2: 'Assistant Engineer Pending',
      3: 'Executive Engineer Pending',
      4: 'City Engineer Pending',
      5: 'Payment Pending',
      6: 'Clerk Pending',
      7: 'Executive Engineer Sign Pending',
      8: 'City Engineer Sign Pending',
      9: 'Approved',
      10: 'Rejected'
    };
    return mapping[stage] || 'Unknown Stage';
  }
};