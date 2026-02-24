import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-neutral-50 flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="font-display text-2xl text-neutral-900 font-semibold">
              Ocorreu um erro inesperado
            </h1>
            <p className="font-body text-neutral-600">
              Recarregue a página para continuar.
            </p>
            <div className="flex justify-center">
              <Button type="button" onClick={this.handleReload}>
                Recarregar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
