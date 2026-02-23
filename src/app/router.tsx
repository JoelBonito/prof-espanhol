import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';
import { PageLoader } from '../components/ui/PageLoader';
import { AppLayout } from '../components/layout/AppLayout';

const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DeviceTest = lazy(() => import('../pages/DeviceTest'));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'));
const DiagnosticPage = lazy(() => import('../pages/DiagnosticPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoader />}>
          <HomePage />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/auth/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <Suspense fallback={<PageLoader />}>
        <OnboardingPage />
      </Suspense>
    ),
  },
  {
    path: '/diagnostic',
    element: (
      <Suspense fallback={<PageLoader />}>
        <DiagnosticPage />
      </Suspense>
    ),
  },
  {
    // Sprint 0 validation — standalone, no AppLayout
    path: '/device-test',
    element: (
      <Suspense fallback={<PageLoader />}>
        <DeviceTest />
      </Suspense>
    ),
  },
]);
