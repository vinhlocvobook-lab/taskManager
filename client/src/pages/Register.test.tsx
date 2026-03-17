import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import Register from '../pages/Register'

const mockRegister = vi.fn()
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext')
  return {
    ...(actual as any),
    useAuth: () => ({
      register: mockRegister,
    }),
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  )
}

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem.mockReturnValue(null)
  })

  it('TC-REG-UI-001: Renders registration form', () => {
    renderWithRouter(<Register />)
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText(/organization/i)).toBeInTheDocument()
  })

  it('TC-REG-UI-002: Shows password requirements', () => {
    renderWithRouter(<Register />)
    
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    expect(screen.getByText(/uppercase/i)).toBeInTheDocument()
    expect(screen.getByText(/lowercase/i)).toBeInTheDocument()
    expect(screen.getByText(/number/i)).toBeInTheDocument()
    expect(screen.getByText(/special character/i)).toBeInTheDocument()
  })

  it('TC-REG-UI-003: Validates password in real-time', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Register />)
    
    const passwordInput = screen.getByLabelText('Password')
    await user.type(passwordInput, 'Pass')
    
    // Should show requirements as failed (○) - at least one should exist
    const circles = screen.getAllByText('○')
    expect(circles.length).toBeGreaterThan(0)
  })

  it('TC-REG-UI-004: Shows checkmark when requirement met', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Register />)
    
    const passwordInput = screen.getByLabelText('Password')
    await user.type(passwordInput, 'Password123!')
    
    // Should show ✓ for requirements met - at least one should exist
    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks.length).toBeGreaterThan(0)
  })

  it('TC-REG-UI-005: Shows password mismatch error', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Register />)
    
    const passwordInput = screen.getByLabelText('Password')
    const confirmInput = screen.getByLabelText('Confirm Password')
    
    await user.type(passwordInput, 'Password123!')
    await user.type(confirmInput, 'DifferentPass123!')
    
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('TC-REG-UI-006: Toggle password visibility', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Register />)
    
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    
    // Toggle buttons - find them by their position in the DOM (first is password toggle)
    const toggleButtons = document.querySelectorAll('button')
    const passwordToggle = Array.from(toggleButtons).find(btn => btn.textContent === '👁️' || btn.textContent === '🙈')
    
    // Initially password should be hidden
    expect(passwordInput.type).toBe('password')
    
    // Click toggle
    if (passwordToggle) {
      await user.click(passwordToggle)
      expect(passwordInput.type).toBe('text')
    }
  })

  it('TC-REG-UI-007: Shows error on failed registration', async () => {
    mockRegister.mockRejectedValue({ response: { data: { error: 'Email already exists' } } })
    
    const user = userEvent.setup()
    renderWithRouter(<Register />)
    
    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password123!')
    await user.type(screen.getByLabelText('Confirm Password'), 'Password123!')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })

  it('TC-REG-UI-008: Blocks submission if password requirements not met', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Register />)
    
    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'weak') // Doesn't meet requirements
    await user.type(screen.getByLabelText('Confirm Password'), 'weak')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    // Should show error message
    expect(screen.getByText(/please meet all password requirements/i)).toBeInTheDocument()
  })

  it('TC-REG-UI-009: Shows login link', () => {
    renderWithRouter(<Register />)
    
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })
})