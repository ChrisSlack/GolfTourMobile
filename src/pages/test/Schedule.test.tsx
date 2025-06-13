import { render } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Schedule from '../Schedule'

const mockRange = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: (_fields: string, _opts: any) => ({
        order: () => ({
          range: mockRange
        })
      })
    })
  }
}))

afterEach(() => {
  mockRange.mockReset()
})

describe('Schedule page', () => {
  it('aborts fetch on unmount', async () => {
    mockRange.mockResolvedValue({ data: [], error: null, count: 0 })
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
    const { unmount, findByText } = render(<Schedule />)
    await findByText(/Tour Schedule/)
    unmount()
    expect(abortSpy).toHaveBeenCalled()
  })

  it('shows pager when more results', async () => {
    mockRange.mockResolvedValue({ data: [{ id: '1', date: '', title: '' }], error: null, count: 55 })
    const { findByText } = render(<Schedule />)
    await findByText(/Page 1 of/)
  })
})
