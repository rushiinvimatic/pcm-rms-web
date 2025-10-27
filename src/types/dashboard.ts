export interface Application {
  id: string;
  applicationNumber: string;
  applicantName: string;
  position: string;
  positionType: number;
  status: ApplicationStatus;
  submittedDate: string;
  lastUpdated: string;
  assignedOfficer?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  documents: ApplicationDocument[];
  statusHistory: StatusHistoryItem[];
  paymentStatus?: PaymentStatus;
  certificatePath?: string;
  rejectionReasons?: string[];
  isCertificateGenerated?: boolean;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedDate: string;
  verified?: boolean;
}

export interface StatusHistoryItem {
  status: ApplicationStatus;
  timestamp: string;
  officer: string;
  comments?: string;
  action: string;
}

export type ApplicationStatus = 
  | 'SUBMITTED'
  | 'ASSIGNED_TO_JE'
  | 'APPOINTMENT_SCHEDULED'
  | 'DOCUMENTS_VERIFIED'
  | 'FORWARDED_TO_AE'
  | 'REVIEWED_BY_AE'
  | 'FORWARDED_TO_ALE'
  | 'FORWARDED_TO_ASE'
  | 'FORWARDED_TO_AS1'
  | 'FORWARDED_TO_AS2'
  | 'FORWARDED_TO_EE'
  | 'APPROVED_BY_EE_STAGE1'
  | 'SIGNED_BY_EE_STAGE1'
  | 'FORWARDED_TO_CE_STAGE1'
  | 'APPROVED_BY_CE_STAGE1'
  | 'SIGNED_BY_CE_STAGE1'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'FORWARDED_TO_CLERK'
  | 'PROCESSED_BY_CLERK'
  | 'FORWARDED_TO_EE_STAGE2'
  | 'SIGNED_BY_EE_STAGE2'
  | 'FORWARDED_TO_CE_STAGE2'
  | 'SIGNED_BY_CE_STAGE2'
  | 'CERTIFICATE_ISSUED'
  | 'REJECTED';

// API Response interfaces to match the actual API structure
export interface ApiApplication {
  id: string;
  applicationNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  positionType: number; // Maps to PositionType enum (0=Architect, 1=StructuralEngineer, etc.)
  submissionDate: string;
  status: number; // Maps to status enum (0=Draft, 1=Submitted, etc.)
  currentStage: number; // Maps to ApplicationStage enum (0=JUNIOR_ENGINEER_PENDING, etc.)
}

// Helper types for enum mapping
export type ApplicationStageEnum = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type PositionTypeEnum = 0 | 1 | 2 | 3 | 4;
export type StatusEnum = 0 | 1 | 2 | 3 | 4 | 5;

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface OTPVerificationData {
  isVisible: boolean;
  purpose: 'approve' | 'reject' | 'forward' | 'sign';
  applicationId?: string;
  callback?: (otp: string) => Promise<void>;
}

export interface AppointmentSchedule {
  date: string;
  time: string;
  location?: string;
  notes?: string;
}

export interface SignatureData {
  applicationId: string;
  documentType: 'RECOMMENDATION' | 'CERTIFICATE';
  stage: 1 | 2;
  hsmRequired: boolean;
}

// Dashboard filter types
export interface DashboardFilters {
  status?: ApplicationStatus[];
  position?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

// Task types for different officers
export interface JuniorEngineerTask {
  applicationId: string;
  positionType: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  daysWaiting: number;
  documentsVerified: boolean;
  appointmentScheduled: boolean;
}

export interface AssistantEngineerTask {
  applicationId: string;
  fromJuniorEngineer: string;
  recommendationFormUrl?: string;
  certificateUrl?: string;
  daysWaiting: number;
}

export interface ChiefEngineerTask {
  applicationId: string;
  stage: 1 | 2;
  requiresSignature: boolean;
  signatureCompleted: boolean;
  fromOfficer: string;
  daysWaiting: number;
}

export interface CityEngineerTask {
  applicationId: string;
  stage: 1 | 2;
  requiresSignature: boolean;
  signatureCompleted: boolean;
  fromOfficer: string;
  daysWaiting: number;
  paymentRequired?: boolean;
}

export interface ClerkTask {
  applicationId: string;
  paymentChallanUrl?: string;
  certificatePath?: string;
  daysWaiting: number;
}