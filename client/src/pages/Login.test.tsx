import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import Login from '../pages/Login'

const mockLogin = vi.fn()
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext')
  return {
    ...(actual as any),
    useAuth: () => ({
      login: mockLogin,
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

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem.mockReturnValue(null)
  })

  it('TC-LOGIN-UI-001: Renders login form', () => {
    renderWithRouter(<Login />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('TC-LOGIN-UI-002: Shows register link', () => {
    renderWithRouter(<Login />)
    
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })

  it('TC-LOGIN-UI-003: Updates email input', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')
    
    expect(emailInput).toHaveValue('test@example.com')
  })

  it('TC-LOGIN-UI-004: Updates password input', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Login />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(passwordInput, 'password123')
    
    expect(passwordInput).toHaveValue('password123')
  })

  it('TC-LOGIN-UI-005: Shows password toggle button', () => {
    renderWithRouter(<Login />)
    
    expect(screen.getByRole('button', { name: /👁️|🙈/ })).toBeInTheDocument()
  })

  it('TC-LOGIN-UI-006: Toggle password visibility', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Login />)
    
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    const toggleButton = screen.getByRole('button', { name: /👁️|🙈/ })
    
    // Initially password should be hidden
    expect(passwordInput.type).toBe('password')
    
    // Click toggle
    await user.click(toggleButton)
    
    // Now should be visible
    expect(passwordInput.type).toBe('text')
  })

  it('TC-LOGIN-UI-007: Shows error on failed login', async () => {
    mockLogin.mockRejectedValue({ response: { data: { error: 'Invalid credentials' } } })
    
    const user = userEvent.setup()
    renderWithRouter(<Login />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('TC-LOGIN-UI-008: Shows loading state during submission', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    const user = userEvent.setup()
    renderWithRouter(<Login />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument()
  })
})