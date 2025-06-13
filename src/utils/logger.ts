type LogLevel = 'log' | 'warn' | 'error'

export class ConsoleTransport {
  log(level: LogLevel, message: unknown, context?: Record<string, unknown>) {
    // eslint-disable-next-line no-console
    console[level](message, context)
  }
}

export class SentryTransport {
  dsn: string
  private queue: Array<{ level: LogLevel; message: unknown; context?: Record<string, unknown> }> = []
  private flushing = false

  constructor(opts: { dsn: string }) {
    this.dsn = opts.dsn
  }

  private flush() {
    const batch = this.queue.splice(0)
    // eslint-disable-next-line no-console
    batch.forEach(entry => console[entry.level](entry.message, entry.context))
    this.flushing = false
  }

  log(level: LogLevel, message: unknown, context?: Record<string, unknown>) {
    this.queue.push({ level, message, context })
    if (!this.flushing) {
      this.flushing = true
      // eslint-disable-next-line no-undef
      queueMicrotask(() => this.flush())
    }
  }
}

const LEVELS: Record<LogLevel, number> = { log: 0, warn: 1, error: 2 }

export class Logger {
  constructor(private options: { transport: { log: (level: LogLevel, message: unknown, context?: Record<string, unknown>) => void }; level: LogLevel }) {}

  private shouldLog(level: LogLevel) {
    return LEVELS[level] >= LEVELS[this.options.level]
  }

  private sanitize(context?: Record<string, unknown>) {
    if (!import.meta.env.PROD || !context) return context
    const clean = { ...context }
    Object.keys(clean).forEach(key => {
      if (/email|password/i.test(key)) delete (clean as Record<string, unknown>)[key]
    })
    return clean
  }

  log(message: unknown, context?: Record<string, unknown>) {
    if (this.shouldLog('log'))
      this.options.transport.log('log', message, this.sanitize(context))
  }

  warn(message: unknown, context?: Record<string, unknown>) {
    if (this.shouldLog('warn'))
      this.options.transport.log('warn', message, this.sanitize(context))
  }

  error(message: unknown, context?: Record<string, unknown>) {
    if (this.shouldLog('error'))
      this.options.transport.log('error', message, this.sanitize(context))
  }
}

const transport = import.meta.env.PROD
  ? new SentryTransport({ dsn: import.meta.env.VITE_SENTRY_DSN })
  : new ConsoleTransport()

const level = (import.meta.env.LOG_LEVEL || 'log') as LogLevel

export const logger = new Logger({ transport, level })
