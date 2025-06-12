class ConsoleTransport {
  log(level: 'log' | 'warn' | 'error', message: unknown, context?: Record<string, unknown>) {
    // eslint-disable-next-line no-console
    console[level](message, context)
  }
}

class SentryTransport {
  dsn: string
  constructor(opts: { dsn: string }) {
    this.dsn = opts.dsn
  }
  log(level: 'log' | 'warn' | 'error', message: unknown, context?: Record<string, unknown>) {
    // In real implementation this would forward to Sentry
    // eslint-disable-next-line no-console
    console[level](message, context)
  }
}

class Logger {
  constructor(private options: { transport: { log: (level: 'log' | 'warn' | 'error', message: unknown, context?: Record<string, unknown>) => void } }) {}

  log(message: unknown, context?: Record<string, unknown>) {
    this.options.transport.log('log', message, context)
  }

  warn(message: unknown, context?: Record<string, unknown>) {
    this.options.transport.log('warn', message, context)
  }

  error(message: unknown, context?: Record<string, unknown>) {
    this.options.transport.log('error', message, context)
  }
}

const transport = import.meta.env.PROD
  ? new SentryTransport({ dsn: import.meta.env.VITE_SENTRY_DSN })
  : new ConsoleTransport()

export const logger = new Logger({ transport })
