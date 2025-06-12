function forwardToRemote(...args: unknown[]) {
  // Placeholder for remote logging integration (e.g. Sentry)
  // eslint-disable-next-line no-console
  console.debug('Forwarding log to remote:', ...args)
}

export const logger = {
  log: (...args: unknown[]) => {
    if (!import.meta.env.PROD) {
      console.log(...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (!import.meta.env.PROD) {
      console.warn(...args)
    }
  },
  error: (...args: unknown[]) => {
    if (import.meta.env.PROD) {
      forwardToRemote(...args)
    }
    console.error(...args)
  },
}
