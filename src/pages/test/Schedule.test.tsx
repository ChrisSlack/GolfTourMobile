import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Schedule from '../Schedule'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: vi.fn().mockResolvedValue({ data: [], error: null }) })
    })
  }
}))

describe('Schedule page', () => {
  it('aborts fetch on unmount', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
    const { unmount, findByText } = render(<Schedule />)
    await findByText(/Tour Schedule/)
    unmount()
    expect(abortSpy).toHaveBeenCalled()
  })
})
