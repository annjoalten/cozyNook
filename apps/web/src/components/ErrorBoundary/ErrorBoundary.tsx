'use client';

import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Message, RetryButton, Title, Wrapper } from './ErrorBoundary.styles';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Wrapper>
          <Title>Algo salió mal</Title>
          <Message>
            {this.state.error?.message ??
              'Se produjo un error inesperado. Puedes intentar recargar.'}
          </Message>
          <RetryButton onClick={this.handleReset}>
            <ArrowCounterClockwise size={15} weight="bold" />
            Reintentar
          </RetryButton>
        </Wrapper>
      );
    }

    return this.props.children;
  }
}
