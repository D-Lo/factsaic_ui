import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'
import * as apiClient from '@/lib/api-client'

// Mock the API client
vi.mock('@/lib/api-client')

// Test component that uses the auth context
function TestComponent() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && <div data-testid="user-email">{user.email}</div>}
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    display_name: 'Tester',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  const mockToken = {
    access_token: 'test-token-123',
    token_type: 'bearer',
    expires_in: 3600,
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Default mock implementations
    vi.mocked(apiClient.getToken).mockReturnValue(null)
    vi.mocked(apiClient.getStoredUser).mockReturnValue(null)
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('starts with unauthenticated state when no token exists', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
  })

  it('restores user session when valid token exists', async () => {
    vi.mocked(apiClient.getToken).mockReturnValue('existing-token')
    vi.mocked(apiClient.getStoredUser).mockReturnValue(mockUser)
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue(mockUser)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
    })

    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
    expect(apiClient.getCurrentUser).toHaveBeenCalledTimes(1)
  })

  it('clears invalid token on initialization', async () => {
    vi.mocked(apiClient.getToken).mockReturnValue('invalid-token')
    vi.mocked(apiClient.getStoredUser).mockReturnValue(mockUser)
    vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Invalid token'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
    expect(apiClient.clearToken).toHaveBeenCalledTimes(1)
    expect(apiClient.clearStoredUser).toHaveBeenCalledTimes(1)
  })

  it('handles login flow successfully', async () => {
    vi.mocked(apiClient.login).mockResolvedValue(mockToken)
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue(mockUser)

    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const loginButton = screen.getByRole('button', { name: /login/i })
    await user.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
    })

    expect(apiClient.login).toHaveBeenCalledWith('test@example.com', 'password')
    expect(apiClient.setToken).toHaveBeenCalledWith('test-token-123')
    expect(apiClient.setStoredUser).toHaveBeenCalledWith(mockUser)
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
  })

  it('handles logout flow', async () => {
    vi.mocked(apiClient.getToken).mockReturnValue('existing-token')
    vi.mocked(apiClient.getStoredUser).mockReturnValue(mockUser)
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue(mockUser)

    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
    })

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
    expect(apiClient.clearToken).toHaveBeenCalledTimes(1)
    expect(apiClient.clearStoredUser).toHaveBeenCalledTimes(1)
  })

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleError.mockRestore()
  })
})
