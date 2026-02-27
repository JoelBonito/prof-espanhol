import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';
import { PageLoader } from '../components/ui/PageLoader';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DeviceTest = lazy(() => import('../pages/DeviceTest'));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'));
const DiagnosticPage = lazy(() => import('../pages/DiagnosticPage'));
const LessonsPage = lazy(() => import('../pages/LessonsPage'));
const HomeworkPage = lazy(() => import('../pages/HomeworkPage'));
const SchedulePage = lazy(() => import('../pages/SchedulePage'));
const ProgressPage = lazy(() => import('../pages/ProgressPage'));
const ChatPage = lazy(() => import('../pages/ChatPage'));
const SessionSummaryPage = lazy(() => import('../pages/SessionSummaryPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/lessons',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <LessonsPage />
          </Suspense>
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/homework',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <HomeworkPage />
          </Suspense>
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/schedule',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <SchedulePage />
          </Suspense>
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/progress',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <ProgressPage />
          </Suspense>
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/profile',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/chat',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <ChatPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/session-summary',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <SessionSummaryPage />
        </Suspense>
      </ProtectedRoute>
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
