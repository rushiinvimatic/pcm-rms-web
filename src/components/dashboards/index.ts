// Dashboard Pages
export { JuniorEngineerDashboard } from '../../pages/officers/JuniorEngineer/Dashboard';
export { AssistantEngineerDashboard } from '../../pages/officers/AssistantEngineer/Dashboard';
export { ChiefEngineerDashboard } from '../../pages/officers/ChiefEngineer/Dashboard';
export { CityEngineerDashboard } from '../../pages/officers/CityEngineer/Dashboard';
export { ClerkDashboard } from '../../pages/officers/Clerk/Dashboard';

// Common Components
export { Header } from '../common/Header';
export { TaskList } from '../common/TaskList';
export { OTPModal } from '../common/OTPModal';
export { AuditTrail } from '../common/AuditTrail';
export { QuickActions } from '../common/QuickActions';
export { StatusProgress } from '../common/StatusTracker/StatusProgress';
export { DocumentViewer } from '../common/DocumentViewer/DocumentViewer';
export { ApplicationFormViewer } from '../common/ApplicationFormViewer';

// Types
export type {
  Application,
  ApplicationDocument,
  StatusHistoryItem,
  ApplicationStatus,
  PaymentStatus,
  OTPVerificationData,
  AppointmentSchedule,
  SignatureData,
  DashboardFilters,
  JuniorEngineerTask,
  AssistantEngineerTask,
  ChiefEngineerTask,
  CityEngineerTask,
  ClerkTask,
} from '../../types/dashboard';