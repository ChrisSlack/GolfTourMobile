
import { Component, type ReactNode, type ErrorInfo } from 'react'
import { logger } from '@/utils/logger'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('Unhandled error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      const message =
        !import.meta.env.PROD && this.state.error
          ? this.state.error.message
          : 'Something went wrong.'
      return (
        <div className="p-4 text-center text-red-600 space-y-4">
          <p>{message}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
