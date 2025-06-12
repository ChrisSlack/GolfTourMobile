export const logger = {
  log: (...args: unknown[]) => {
    if (import.meta.env.MODE !== 'production') {
      console.log(...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (import.meta.env.MODE !== 'production') {
      console.warn(...args)
    }
  },
  error: (...args: unknown[]) => {
    console.error(...args)
  },
}
