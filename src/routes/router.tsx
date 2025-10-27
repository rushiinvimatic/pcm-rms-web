import { createBrowserRouter, Outlet } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { OfficerLoginPage } from '../pages/auth/OfficerLoginPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { UserLayout } from '../components/layouts/UserLayout';
import { OfficerLayout } from '../components/layouts/OfficerLayout';
import { AuthProvider } from '../context/AuthContext';
import { JuniorEngineerDashboard } from '../pages/officers/JuniorEngineer/Dashboard';
import { AssistantEngineerDashboard } from '../pages/officers/AssistantEngineer/Dashboard';
import { AssistantArchitectDashboard } from '../pages/officers/AssistantArchitect/Dashboard';
import { ChiefEngineerDashboard } from '../pages/officers/ChiefEngineer/Dashboard';
import { CityEngineerDashboard } from '../pages/officers/CityEngineer/Dashboard';
import { ClerkDashboard } from '../pages/officers/Clerk/Dashboard';
import { ExecutiveEngineerDashboard } from '../pages/officers/ExecutiveEngineer/Dashboard';
import AdminDashboard from '../pages/officers/Admin/Dashboard.tsx';
import JuniorLicenceEngineerDashboard from '../pages/officers/JuniorLicenceEngineer/Dashboard.tsx';
import { AssistantLicenceEngineerDashboard } from '../pages/officers/AssistantLicenceEngineer/Dashboard.tsx';
import JuniorStructuralEngineerDashboard from '../pages/officers/JuniorStructuralEngineer/Dashboard.tsx';
import { AssistantStructuralEngineerDashboard } from '../pages/officers/AssistantStructuralEngineer/Dashboard.tsx';
import JuniorSupervisor1Dashboard from '../pages/officers/JuniorSupervisor1/Dashboard.tsx';
import { AssistantSupervisor1Dashboard } from '../pages/officers/AssistantSupervisor1/Dashboard.tsx';
import JuniorSupervisor2Dashboard from '../pages/officers/JuniorSupervisor2/Dashboard.tsx';
import AssistantSupervisor2Dashboard from '../pages/officers/AssistantSupervisor2/Dashboard.tsx';
import { OfficersFlowTest } from '../pages/officers/OfficersFlowTest';
import { LandingPage } from '../pages/home/LandingPage';
import { UserDashboard } from '../pages/user/UserDashboard';
import { NewApplicationPage } from '../pages/user/NewApplicationPage';
import { MyApplicationsPage } from '../pages/user/MyApplicationsPage';
import { ProfilePage } from '../pages/user/ProfilePage';
import { DocumentsPage } from '../pages/user/DocumentsPage';
import { SupportPage } from '../pages/user/SupportPage';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { LoadingProvider } from '../components/common/GlobalLoader';
import { LoaderErrorBoundaryDemo } from '../pages/demo/LoaderErrorBoundaryDemo';
import { PaymentTestPage } from '../pages/demo/PaymentTestPage';
import { CertificateFlowTest } from '../components/test/CertificateFlowTest';
import { GuestLoginPage } from '../pages/auth/GuestLoginPage';
import { CertificateDownloadPage } from '../pages/guest/CertificateDownloadPage';
import AuthDebugTest from '../components/test/AuthDebugTest';
import { GuestCertificateDownload } from '../pages/guest/CertificateDownload';
import { PaymentPage } from '../pages/payment/PaymentPage';
import { PaymentSuccessPage } from '../pages/payment/PaymentSuccessPage';
import { PaymentCallbackPage } from '../pages/payment/PaymentCallbackPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import ErrorBoundaryTest from '../components/test/ErrorBoundaryTest';
import NotFoundTest from '../pages/test/NotFoundTest';

const AppLayout = () => {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
};

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/demo',
        element: <LoaderErrorBoundaryDemo />,
      },
      {
        path: '/demo/payment',
        element: <PaymentTestPage />,
      },
      {
        path: '/demo/certificate',
        element: <CertificateFlowTest />,
      },
      {
        path: '/demo/error-boundary',
        element: <ErrorBoundaryTest />,
      },
      {
        path: '/demo/404-test',
        element: <NotFoundTest />,
      },

  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'officer-login',
        element: <OfficerLoginPage />,
      },
      {
        path: 'guest-login',
        element: <GuestLoginPage />,
      },
      
      // Add other auth routes (forgot password, reset password) here
    ],
  },
  {
    path: '/guest',
    children: [
      {
        path: 'login',
        element: <GuestLoginPage />,
      },
      {
        path: 'certificates',
        element: <GuestCertificateDownload />,
      },
      {
        path: 'certificate-download',
        element: <CertificateDownloadPage />,
      },
    ],
  },
  {
    path: '/payment',
    children: [
      {
        path: ':applicationId',
        element: (
          <ProtectedRoute allowedRoles={['user']}>
            <PaymentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'success',
        element: (
          <ProtectedRoute allowedRoles={['user']}>
            <PaymentSuccessPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'callback',
        element: (
          <ProtectedRoute allowedRoles={['user']}>
            <PaymentCallbackPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/debug/auth',
    element: <AuthDebugTest />,
  },
  {
    path: '/user',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
{
        path: 'dashboard',
        element: <UserDashboard />,
      },
      {
        path: 'application/new',
        element: <NewApplicationPage />,
      },
      {
        path: 'applications',
        element: <MyApplicationsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'documents',
        element: <DocumentsPage />,
      },
      {
        path: 'support',
        element: <SupportPage />,
      },
    ],
  },
  {
    path: '/officers',
    children: [
      {
        path: 'test',
        element: <OfficersFlowTest />,
      },
      {
        path: 'junior-architect',
        element: (
          <ProtectedRoute allowedRoles={['juniorarchitect']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <JuniorEngineerDashboard />,
          },
        ],
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
        ],
      },
      {
        path: 'junior-licence-engineer',
        element: (
          <ProtectedRoute allowedRoles={['juniorlicenceengineer']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <JuniorLicenceEngineerDashboard />,
          },
        ],
      },
      {
        path: 'assistant-licence-engineer',
        element: (
          <ProtectedRoute allowedRoles={['assistantlicenceengineer']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <AssistantLicenceEngineerDashboard />,
          },
        ],
      },
      {
        path: 'junior-structural-engineer',
        element: (
          <ProtectedRoute allowedRoles={['juniorstructuralengineer']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <JuniorStructuralEngineerDashboard />,
          },
        ],
      },
      {
        path: 'assistant-structural-engineer',
        element: (
          <ProtectedRoute allowedRoles={['assistantstructuralengineer']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <AssistantStructuralEngineerDashboard />,
          },
        ],
      },
      {
        path: 'junior-supervisor1',
        element: (
          <ProtectedRoute allowedRoles={['juniorsupervisor1']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <JuniorSupervisor1Dashboard />,
          },
        ],
      },
      {
        path: 'assistant-supervisor1',
        element: (
          <ProtectedRoute allowedRoles={['assistantsupervisor1']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <AssistantSupervisor1Dashboard />,
          },
        ],
      },
      {
        path: 'junior-supervisor2',
        element: (
          <ProtectedRoute allowedRoles={['juniorsupervisor2']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <JuniorSupervisor2Dashboard />,
          },
        ],
      },
      {
        path: 'assistant-supervisor2',
        element: (
          <ProtectedRoute allowedRoles={['assistantsupervisor2']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <AssistantSupervisor2Dashboard />,
          },
        ],
      },
      {
        path: 'assistant-engineer',
        element: (
          <ProtectedRoute allowedRoles={['assistantarchitect']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <AssistantEngineerDashboard />,
          },
        ],
      },
      {
        path: 'assistant-architect',
        element: (
          <ProtectedRoute allowedRoles={['assistantarchitect']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <AssistantArchitectDashboard />,
          },
        ],
      },
      {
        path: 'chief-engineer',
        element: (
          <ProtectedRoute allowedRoles={['executiveengineer']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <ChiefEngineerDashboard />,
          },
        ],
      },
      {
        path: 'executive-engineer',
        element: (
          <ProtectedRoute allowedRoles={['executiveengineer']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <ExecutiveEngineerDashboard />,
          },
        ],
      },
      {
        path: 'city-engineer',
        element: (
          <ProtectedRoute allowedRoles={['cityengineer']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <CityEngineerDashboard />,
          },
        ],
      },
      {
        path: 'clerk',
        element: (
          <ProtectedRoute allowedRoles={['clerk']}>
            <OfficerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <ClerkDashboard />,
          },
        ],
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
    ],
  },
]);