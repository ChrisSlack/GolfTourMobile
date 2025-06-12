import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from '../UI/LoadingSpinner'

describe('LoadingSpinner component', () => {
  it('renders a spinner', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeTruthy()
  })
})
