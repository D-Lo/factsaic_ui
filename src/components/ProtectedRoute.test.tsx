import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import * as apiClient from '@/lib/api-client'

// Mock the API client
vi.mock('@/lib/api-client')

describe('ProtectedRoute', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    display_name: 'Tester',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('shows loading state while checking authentication', () => {
    // Mock auth state to simulate loading
    vi.mocked(apiClient.getToken).mockReturnValue('test-token')
    vi.mocked(apiClient.getStoredUser).mockReturnValue(mockUser)

    // Create a promise that never resolves to keep loading state
    vi.mocked(apiClient.getCurrentUser).mockImplementation(
      () => new Promise(() => {})
    )

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    // Should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', async () => {
    vi.mocked(apiClient.getToken).mockReturnValue(null)
    vi.mocked(apiClient.getStoredUser).mockReturnValue(null)

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    // Wait for auth initialization
    await screen.findByText('Login Page')

    // Should redirect to login page
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders protected content when user is authenticated', async () => {
    vi.mocked(apiClient.getToken).mockReturnValue('valid-token')
    vi.mocked(apiClient.getStoredUser).mockReturnValue(mockUser)
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue(mockUser)

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    // Wait for auth initialization and content to render
    await screen.findByText('Protected Content')

    // Should show protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('redirects to login after token validation fails', async () => {
    vi.mocked(apiClient.getToken).mockReturnValue('invalid-token')
    vi.mocked(apiClient.getStoredUser).mockReturnValue(mockUser)
    vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Unauthorized'))

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    // Should redirect to login after token validation fails
    await screen.findByText('Login Page')

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders multiple levels of nested children', async () => {
    vi.mocked(apiClient.getToken).mockReturnValue('valid-token')
    vi.mocked(apiClient.getStoredUser).mockReturnValue(mockUser)
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue(mockUser)

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>
                    <h1>Dashboard</h1>
                    <div>Nested Content</div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    await screen.findByText('Dashboard')

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Nested Content')).toBeInTheDocument()
  })
})
