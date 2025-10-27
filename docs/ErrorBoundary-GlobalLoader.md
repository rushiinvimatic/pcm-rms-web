# Error Boundary & Global Loader Documentation

This documentation covers the implementation of modern error boundary and global loader components for the PMC Web Application.

## 🚫 Error Boundary

### Overview
The `ErrorBoundary` component provides comprehensive error handling with a user-friendly interface, error reporting, and recovery options.

### Features
- **Graceful Error Handling**: Catches JavaScript errors anywhere in the component tree
- **User-Friendly UI**: Clean, branded error display with PMC logo
- **Error Reporting**: Automatic error logging with unique error IDs
- **Recovery Options**: Retry, go home, and bug reporting functionality
- **Development Mode**: Detailed error information for debugging
- **Higher-Order Component**: `withErrorBoundary` wrapper for individual components

### Usage

#### Basic Usage
```tsx
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Wrap your app or components
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

#### With Custom Error Handler
```tsx
<ErrorBoundary 
  onError={(error, errorInfo) => {
    // Custom error handling logic
    console.log('Custom error handler:', error);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

#### Using HOC Pattern
```tsx
import { withErrorBoundary } from '../components/common/ErrorBoundary';

const SafeComponent = withErrorBoundary(YourComponent, {
  onError: (error, errorInfo) => {
    // Component-specific error handling
  }
});
```

#### Custom Fallback UI
```tsx
<ErrorBoundary 
  fallback={<CustomErrorComponent />}
>
  <YourComponent />
</ErrorBoundary>
```

### Error Reporting
The error boundary automatically generates detailed error reports including:
- Unique error ID for tracking
- Error message and stack trace
- Component stack trace
- Timestamp and user agent
- Current URL
- Ready for integration with error monitoring services (Sentry, LogRocket, etc.)

### Integration Points
- **Router Level**: Integrated at the root `AppLayout` to catch all application errors
- **Email Reporting**: Pre-configured mailto links for bug reports
- **Development Mode**: Enhanced error details when `import.meta.env.DEV` is true

## 🔄 Global Loader

### Overview
The `GlobalLoader` component provides a comprehensive loading system with context-based state management, multiple variants, and skeleton loaders.

### Features
- **Global Loading State**: Centralized loading management via React Context
- **PMC Branding**: Integrated with PMC logo and consistent styling
- **Multiple Variants**: Overlay, inline, and different sizes (sm, md, lg)
- **Loading Context**: `useLoading` hook for easy state management
- **Async Wrappers**: Built-in promise wrapping with loading states
- **Skeleton Components**: Ready-to-use skeleton loaders for different layouts
- **HOC Support**: `withLoading` wrapper for automatic loading states

### Core Components

#### GlobalLoader
```tsx
<GlobalLoader 
  isLoading={true}
  message="Loading your data..."
  overlay={true}
  size="md"
/>
```

#### LoadingProvider
```tsx
<LoadingProvider>
  <YourApp />
</LoadingProvider>
```

### Hooks & Context

#### useLoading Hook
```tsx
import { useLoading } from '../../hooks/useLoading';

const { isLoading, showLoader, hideLoader, withLoader } = useLoading();

// Manual control
showLoader('Processing...');
hideLoader();

// Automatic wrapper
const result = await withLoader(
  apiCall(),
  'Fetching data...'
);
```

#### Specialized Hooks
```tsx
import { useApiLoading, useFormSubmission, useFileUpload } from '../../hooks/useLoading';

// API calls
const { callApi } = useApiLoading();
await callApi(() => fetchData(), 'Loading...');

// Form submissions
const { submitForm } = useFormSubmission();
await submitForm(() => saveData(), 'Saving...');

// File uploads
const { uploadFile } = useFileUpload();
await uploadFile(() => uploadData(), 'Uploading...');
```

### Skeleton Loaders

#### Basic Skeleton
```tsx
<SkeletonLoader 
  count={5}
  height="h-4"
  width="w-full"
  className="space-y-2"
/>
```

#### Card Skeleton
```tsx
<CardSkeleton className="mb-4" />
```

#### Table Skeleton
```tsx
<TableSkeleton 
  rows={5}
  columns={4}
  className="mb-4"
/>
```

### HOC Pattern
```tsx
import { withLoading } from '../components/common/GlobalLoader';

const LoadingComponent = withLoading(YourComponent, 'Loading component...');

// Usage - component receives isLoading and setLoading props
<LoadingComponent {...props} />
```

## 🔧 Implementation Details

### Router Integration
```tsx
// src/routes/router.tsx
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
```

### Real-world Usage Example
```tsx
// In UserDashboard.tsx
import { useApiLoading } from '../../hooks/useLoading';
import { CardSkeleton } from '../../components/common/GlobalLoader';

export const UserDashboard: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { callApi } = useApiLoading();

  const fetchApplications = async () => {
    try {
      await callApi(async () => {
        // API call logic
        const data = await fetchApplicationsAPI();
        setApplications(data);
      }, 'Loading your applications...');
      
      setIsInitialLoading(false);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setIsInitialLoading(false);
    }
  };

  return (
    <div>
      {isInitialLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        // Actual content
        <ApplicationList applications={applications} />
      )}
    </div>
  );
};
```

## 🎨 Styling & Customization

### Error Boundary Styling
- Consistent with PMC branding
- Responsive design with mobile-first approach
- Tailwind CSS for consistent styling
- Development vs production UI differences

### Global Loader Styling
- PMC logo integration
- Animated spinner with bounce effects
- Backdrop blur for overlay mode
- Size variants: small (24px), medium (32px), large (48px)

### Skeleton Loader Styling
- Subtle gray background with pulse animation
- Configurable dimensions and spacing
- Responsive design considerations

## 🚀 Performance Considerations

### Error Boundary
- Minimal performance impact
- Error reporting is async and non-blocking
- Automatic cleanup of timeouts and intervals

### Global Loader
- Context-based state management prevents unnecessary re-renders
- Lazy loading of skeleton components
- Optimized animations using CSS transforms

## 🧪 Testing & Demo

### Demo Page
Access the demo at `/demo` to test:
- Error boundary functionality
- Global loader states
- Skeleton loading components
- API error handling
- Form submission flows

### Test Scenarios
1. Component error throwing
2. API call simulation
3. Form submission simulation
4. Network error handling
5. Skeleton loading states

## 🔗 Integration with Error Monitoring

### Ready for Sentry Integration
```tsx
// In ErrorBoundary component
import * as Sentry from '@sentry/react';

private reportError = (error: Error, errorInfo: ErrorInfo) => {
  Sentry.captureException(error, {
    extra: {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    }
  });
};
```

### Ready for LogRocket
```tsx
import LogRocket from 'logrocket';

private reportError = (error: Error, errorInfo: ErrorInfo) => {
  LogRocket.captureException(error);
};
```

## 📱 Mobile Responsiveness

Both components are fully responsive:
- Touch-friendly button sizes
- Mobile-optimized layouts
- Readable font sizes on small screens
- Proper spacing and padding

## 🌟 Best Practices

### Error Boundary
1. Place at strategic levels (root, route, feature)
2. Provide meaningful fallback UIs
3. Log errors for monitoring
4. Test error scenarios regularly
5. Keep error messages user-friendly

### Global Loader
1. Use appropriate loading messages
2. Avoid nested loading states
3. Provide skeleton loaders for better UX
4. Keep loading times reasonable
5. Handle loading errors gracefully

This implementation provides a robust foundation for error handling and loading states across the PMC web application.