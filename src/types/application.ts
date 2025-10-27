export interface Address {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

export interface Qualification {
  fileId: string;
  instituteName: string;
  universityName: string;
  specialization: number; // SpecializationType enum
  degreeName: string;
  passingMonth: number; // 1-12
  yearOfPassing: string; // ISO date string
}

export interface Experience {
  fileId: string;
  companyName: string;
  position: string;
  yearsOfExperience: number;
  fromDate: string; // ISO date string
  toDate: string; // ISO date string
}

export interface ApplicationDocument {
  documentType: number; // DocumentType enum
  filePath: string;
  fileName: string;
  fileId: string;
}

// API request structure
export interface ApplicationFormData {
  model?: string; // Required by API
  firstName: string;
  middleName: string;
  lastName: string;
  motherName: string;
  mobileNumber: string;
  emailAddress: string;
  positionType: number; // Position enum
  bloodGroup: string;
  height: number;
  gender: number; // Gender enum
  dateOfBirth: string; // ISO date string
  permanentAddress: Address;
  currentAddress: Address;
  panCardNumber: string;
  aadharCardNumber: string;
  coaCardNumber: string;
  qualifications: Qualification[];
  experiences: Experience[];
  documents: ApplicationDocument[];
}

// Form input data structure (for internal use)
export interface ApplicationFormInput {
  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  motherName: string;
  mobileNumber: string;
  emailAddress: string;
  positionType: string; // Will be converted to number
  bloodGroup: string;
  height: string; // Will be converted to number
  gender: string; // Will be converted to number
  dateOfBirth: string;
  
  // Address Information
  permanentAddress: Address;
  currentAddress: Address;
  sameAsPermanent: boolean;
  
  // Document Information
  panCardNumber: string;
  aadharCardNumber: string;
  coaCardNumber: string;
  
  // File uploads
  panCardFile: File | null;
  panCardFileId?: string;
  panCardFileName?: string;
  aadharCardFile: File | null;
  aadharCardFileId?: string;
  aadharCardFileName?: string;
  coaCertificateFile: File | null;
  coaCertificateFileId?: string;
  coaCertificateFileName?: string;
  profilePictureFile: File | null;
  profilePictureFileId?: string;
  profilePictureFileName?: string;
  electricityBillFile: File | null;
  electricityBillFileId?: string;
  electricityBillFileName?: string;
  
  // Dynamic sections
  qualifications: QualificationInput[];
  experiences: ExperienceInput[];
  additionalDocuments: AdditionalDocumentInput[];
}

export interface QualificationInput {
  id: string; // For form management
  instituteName: string;
  universityName: string;
  specialization: string; // Will be converted to number
  degreeName: string;
  passingMonth: string; // Will be converted to number
  yearOfPassing: string;
  certificateFile: File | null;
  certificateFileId?: string;
  certificateFileName?: string;
  marksheetFile: File | null;
  marksheetFileId?: string;
  marksheetFileName?: string;
}

export interface ExperienceInput {
  id: string; // For form management
  companyName: string;
  position: string;
  yearsOfExperience: string; // Will be converted to number
  fromDate: string;
  toDate: string;
  certificateFile: File | null;
  certificateFileId?: string;
  certificateFileName?: string;
}

export interface AdditionalDocumentInput {
  id: string; // For form management
  documentType: string; // Will be converted to number
  file: File | null;
  fileId?: string;
  fileName?: string;
}

// Constants to match API enums
export const DocumentType = {
  AddressProof: 0,
  PanCard: 1,
  AadharCard: 2,
  DegreeCertificate: 3,
  DegreeMarksheet: 4,
  ExperienceCertificate: 5,
  CoaCertificate: 6,
  ProfilePicture: 7,
  ElectricityBill: 8,
  AdditionalDocument: 9
} as const;

export const GenderType = {
  Male: 0,
  Female: 1,
  Other: 2
} as const;

export const PositionType = {
  Architect: 0,
  StructuralEngineer: 1,
  LicenceEngineer: 2,
  Supervisor1: 3,
  Supervisor2: 4
} as const;

export const ApplicationStatus = {
  Draft: 0,
  Submitted: 1,
  UnderReview: 2,
  DocumentVerificationPending: 3,
  DocumentVerified: 4,
  AppointmentScheduled: 5,
  AppointmentCompleted: 6,
  JuniorEngineerApproved: 7,
  AssistantEngineerApproved: 8,
  ExecutiveEngineerApproved: 9,
  CityEngineerApproved: 10,
  PaymentPending: 11,
  PaymentCompleted: 12,
  ClerkApproved: 13,
  DigitallySignedByExecutive: 14,
  DigitallySignedByCity: 15,
  Completed: 16,
  Rejected: 17
} as const;

export const ApplicationStage = {
  JUNIOR_ENGINEER_PENDING: 0,
  DOCUMENT_VERIFICATION_PENDING: 1,
  ASSISTANT_ENGINEER_PENDING: 2,
  EXECUTIVE_ENGINEER_PENDING: 3,
  CITY_ENGINEER_PENDING: 4,
  PAYMENT_PENDING: 5,
  CLERK_PENDING: 6,
  EXECUTIVE_ENGINEER_SIGN_PENDING: 7,
  CITY_ENGINEER_SIGN_PENDING: 8,
  APPROVED: 9,
  REJECTED: 10
} as const;

export const SpecializationType = {
  Architecture: 0,
  CivilEngineering: 1,
  StructuralEngineering: 2,
  Construction: 3,
  Other: 4
} as const;

export type DocumentTypeValue = typeof DocumentType[keyof typeof DocumentType];
export type GenderTypeValue = typeof GenderType[keyof typeof GenderType];
export type PositionTypeValue = typeof PositionType[keyof typeof PositionType];
export type ApplicationStatusValue = typeof ApplicationStatus[keyof typeof ApplicationStatus];
export type ApplicationStageValue = typeof ApplicationStage[keyof typeof ApplicationStage];
export type SpecializationTypeValue = typeof SpecializationType[keyof typeof SpecializationType];

// Utility types and constants
export const POSITION_LABELS = {
  [PositionType.Architect]: 'Architect',
  [PositionType.StructuralEngineer]: 'Structural Engineer',
  [PositionType.LicenceEngineer]: 'Licence Engineer',
  [PositionType.Supervisor1]: 'Supervisor1',
  [PositionType.Supervisor2]: 'Supervisor2'
};

export const APPLICATION_STATUS_LABELS = {
  [ApplicationStatus.Draft]: 'Draft',
  [ApplicationStatus.Submitted]: 'Submitted',
  [ApplicationStatus.UnderReview]: 'Under Review',
  [ApplicationStatus.DocumentVerificationPending]: 'Document Verification Pending',
  [ApplicationStatus.DocumentVerified]: 'Document Verified',
  [ApplicationStatus.AppointmentScheduled]: 'Appointment Scheduled',
  [ApplicationStatus.AppointmentCompleted]: 'Appointment Completed',
  [ApplicationStatus.JuniorEngineerApproved]: 'Junior Engineer Approved',
  [ApplicationStatus.AssistantEngineerApproved]: 'Assistant Engineer Approved',
  [ApplicationStatus.ExecutiveEngineerApproved]: 'Executive Engineer Approved',
  [ApplicationStatus.CityEngineerApproved]: 'City Engineer Approved',
  [ApplicationStatus.PaymentPending]: 'Payment Pending',
  [ApplicationStatus.PaymentCompleted]: 'Payment Completed',
  [ApplicationStatus.ClerkApproved]: 'Clerk Approved',
  [ApplicationStatus.DigitallySignedByExecutive]: 'Digitally Signed by Executive',
  [ApplicationStatus.DigitallySignedByCity]: 'Digitally Signed by City',
  [ApplicationStatus.Completed]: 'Completed',
  [ApplicationStatus.Rejected]: 'Rejected'
};

export const APPLICATION_STAGE_LABELS = {
  [ApplicationStage.JUNIOR_ENGINEER_PENDING]: 'Junior Engineer Pending',
  [ApplicationStage.DOCUMENT_VERIFICATION_PENDING]: 'Document Verification Pending',
  [ApplicationStage.ASSISTANT_ENGINEER_PENDING]: 'Assistant Engineer Pending',
  [ApplicationStage.EXECUTIVE_ENGINEER_PENDING]: 'Executive Engineer Pending',
  [ApplicationStage.CITY_ENGINEER_PENDING]: 'City Engineer Pending',
  [ApplicationStage.PAYMENT_PENDING]: 'Payment Pending',
  [ApplicationStage.CLERK_PENDING]: 'Clerk Pending',
  [ApplicationStage.EXECUTIVE_ENGINEER_SIGN_PENDING]: 'Executive Engineer Signature Pending',
  [ApplicationStage.CITY_ENGINEER_SIGN_PENDING]: 'City Engineer Signature Pending',
  [ApplicationStage.APPROVED]: 'Approved',
  [ApplicationStage.REJECTED]: 'Rejected'
};

export const GENDER_LABELS = {
  [GenderType.Male]: 'Male',
  [GenderType.Female]: 'Female',
  [GenderType.Other]: 'Other'
};

export const SPECIALIZATION_LABELS = {
  [SpecializationType.Architecture]: 'Architecture',
  [SpecializationType.CivilEngineering]: 'Civil Engineering',
  [SpecializationType.StructuralEngineering]: 'Structural Engineering',
  [SpecializationType.Construction]: 'Construction',
  [SpecializationType.Other]: 'Other'
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Certificate-related interfaces
export interface CertificateInfo {
  applicationId: string;
  certificateNumber?: string;
  applicantName: string;
  positionType: string;
  issueDate?: string;
  expiryDate?: string;
  status: number; // CertificateStatus
  executiveEngineerSignature?: SignatureInfo;
  cityEngineerSignature?: SignatureInfo;
  qrCode?: string;
  certificateUrl?: string;
}

export interface SignatureInfo {
  signedBy: string;
  signedDate: string;
  signatureType: 'EXECUTIVE_ENGINEER' | 'CITY_ENGINEER';
  digitalSignatureHash?: string;
  isValid: boolean;
}

export const CertificateStatus = {
  PENDING_GENERATION: 0,
  GENERATED: 1,
  EXECUTIVE_ENGINEER_SIGNED: 2,
  CITY_ENGINEER_SIGNED: 3,
  COMPLETED: 4,
  EXPIRED: 5,
  CANCELLED: 6
} as const;

export interface ChallanInfo {
  applicationId: string;
  challanNumber?: string;
  applicantName: string;
  position: string;
  amount: number;
  amountInWords: string;
  generatedDate?: string;
  status: number; // ChallanStatus
  paymentStatus?: number; // PaymentStatus
}

export const ChallanStatus = {
  PENDING: 0,
  GENERATED: 1,
  PAID: 2,
  EXPIRED: 3,
  CANCELLED: 4
} as const;

export const PaymentStatus = {
  PENDING: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  FAILED: 3,
  CANCELLED: 4,
  REFUNDED: 5
} as const;