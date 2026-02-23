import { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

// Additional providers (AuthProvider, etc.) will be added as their stories are implemented
export function AppProviders({ children }: AppProvidersProps) {
  return <>{children}</>;
}
