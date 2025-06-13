import { describe, it, expect, vi } from 'vitest'
import { Logger, SentryTransport } from '../logger'

describe('Logger', () => {
  it('filters by level', () => {
    const transport = { log: vi.fn() }
    const logger = new Logger({ transport, level: 'warn' })
    logger.log('a')
    logger.warn('b')
    logger.error('c')
    expect(transport.log).toHaveBeenCalledTimes(2)
    expect(transport.log).toHaveBeenCalledWith('warn', 'b', undefined)
    expect(transport.log).toHaveBeenCalledWith('error', 'c', undefined)
  })

  it('batches sentry logs asynchronously', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const transport = new SentryTransport({ dsn: 'x' })
    transport.log('error', 'a')
    transport.log('error', 'b')
    await Promise.resolve()
    expect(spy).toHaveBeenCalledTimes(2)
    spy.mockRestore()
  })
})
