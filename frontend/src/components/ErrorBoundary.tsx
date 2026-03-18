import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 32px;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.danger};
  margin-bottom: 12px;
`;

const ErrorMessage = styled.p`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.textSecondary};
  margin-bottom: 16px;
`;

const RetryButton = styled.button`
  background: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border: none;
  border-radius: ${theme.radii.md};
  padding: 8px 20px;
  font-size: ${theme.fontSizes.base};
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.9;
  }
`;

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorWrapper>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            {this.state.error?.message || 'An unexpected error occurred'}
          </ErrorMessage>
          <RetryButton onClick={this.handleRetry}>Try Again</RetryButton>
        </ErrorWrapper>
      );
    }
    return this.props.children;
  }
}
