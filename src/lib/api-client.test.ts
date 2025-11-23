import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getToken,
  setToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  login,
  register,
  getCurrentUser,
  updateUser,
  getGroups,
  createGroup,
  getConversations,
  createConversation,
  sendMessage,
  ApiClientError,
} from './api-client'
import type { User, RegisterRequest } from '@/types/api'

describe('api-client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Token Management', () => {
    it('stores and retrieves token', () => {
      expect(getToken()).toBeNull()

      setToken('test-token-123')
      expect(getToken()).toBe('test-token-123')
      expect(localStorage.getItem('factsaic_token')).toBe('test-token-123')
    })

    it('clears token', () => {
      setToken('test-token-123')
      expect(getToken()).toBe('test-token-123')

      clearToken()
      expect(getToken()).toBeNull()
      expect(localStorage.getItem('factsaic_token')).toBeNull()
    })
  })

  describe('User Storage Management', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      display_name: 'Tester',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    it('stores and retrieves user', () => {
      expect(getStoredUser()).toBeNull()

      setStoredUser(mockUser)
      const retrieved = getStoredUser()

      expect(retrieved).toEqual(mockUser)
      expect(retrieved?.email).toBe('test@example.com')
    })

    it('clears stored user', () => {
      setStoredUser(mockUser)
      expect(getStoredUser()).toEqual(mockUser)

      clearStoredUser()
      expect(getStoredUser()).toBeNull()
    })

    it('handles invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('factsaic_user', 'invalid-json')
      expect(() => getStoredUser()).toThrow()
    })
  })

  describe('ApiClientError', () => {
    it('creates error with status and detail', () => {
      const error = new ApiClientError(404, 'Not found')

      expect(error.status).toBe(404)
      expect(error.detail).toBe('Not found')
      expect(error.message).toBe('Not found')
      expect(error.name).toBe('ApiClientError')
    })
  })

  describe('login', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
    })

    it('sends OAuth2 form data and returns token', async () => {
      const mockResponse = {
        access_token: 'test-token-123',
        token_type: 'bearer',
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await login('test@example.com', 'password123')

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      )

      // Verify form data contains correct fields
      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = callArgs[1]?.body as URLSearchParams
      expect(body.get('username')).toBe('test@example.com')
      expect(body.get('password')).toBe('password123')
    })

    it('throws ApiClientError on failed login', async () => {
      const errorResponse = {
        detail: 'Invalid credentials',
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      } as Response)

      await expect(login('wrong@example.com', 'wrongpass')).rejects.toThrow(
        ApiClientError
      )

      try {
        await login('wrong@example.com', 'wrongpass')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError)
        expect((error as ApiClientError).status).toBe(401)
        expect((error as ApiClientError).detail).toBe('Invalid credentials')
      }
    })

    it('handles non-JSON error responses', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON')
        },
      } as Response)

      await expect(login('test@example.com', 'password')).rejects.toThrow(
        ApiClientError
      )

      try {
        await login('test@example.com', 'password')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError)
        expect((error as ApiClientError).status).toBe(500)
        expect((error as ApiClientError).detail).toBe('Internal Server Error')
      }
    })
  })

  describe('register', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
    })

    it('registers user and returns user with token', async () => {
      const registerData: RegisterRequest = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        display_name: 'Newbie',
      }

      const mockUser: User = {
        id: '1',
        email: 'new@example.com',
        name: 'New User',
        display_name: 'Newbie',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      const mockToken = {
        access_token: 'new-token-123',
        token_type: 'bearer',
      }

      // Mock register endpoint
      vi.mocked(fetch).mockImplementation(async (url) => {
        if (typeof url === 'string' && url.includes('/api/auth/register')) {
          return {
            ok: true,
            json: async () => mockUser,
          } as Response
        }
        // Mock login endpoint
        if (typeof url === 'string' && url.includes('/api/auth/token')) {
          return {
            ok: true,
            json: async () => mockToken,
          } as Response
        }
        throw new Error('Unexpected URL')
      })

      const result = await register(registerData)

      expect(result.user).toEqual(mockUser)
      expect(result.token).toEqual(mockToken)
      expect(fetch).toHaveBeenCalledTimes(2) // register + login
    })
  })

  describe('getCurrentUser', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
    })

    it('fetches current user with authorization header', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        display_name: 'Tester',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      setToken('test-token')

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      } as Response)

      const result = await getCurrentUser()

      expect(result).toEqual(mockUser)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/users/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('throws ApiClientError on unauthorized', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Unauthorized' }),
      } as Response)

      await expect(getCurrentUser()).rejects.toThrow(ApiClientError)
    })
  })

  describe('updateUser', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
    })

    it('updates user with PATCH request', async () => {
      const updatedUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Updated Name',
        display_name: 'New Display',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      }

      setToken('test-token')

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => updatedUser,
      } as Response)

      const result = await updateUser({
        name: 'Updated Name',
        display_name: 'New Display',
      })

      expect(result).toEqual(updatedUser)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/users/me',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            name: 'Updated Name',
            display_name: 'New Display',
          }),
        })
      )
    })
  })

  describe('Groups API', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
      setToken('test-token')
    })

    it('fetches groups list', async () => {
      const mockGroups = {
        items: [
          {
            id: 'group1',
            name: 'Test Group',
            description: 'A test group',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
          },
        ],
        total: 1,
        limit: 100,
        offset: 0,
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockGroups,
      } as Response)

      const result = await getGroups()

      expect(result).toEqual(mockGroups)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/groups',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('creates a new group', async () => {
      const newGroup = {
        id: 'group1',
        name: 'New Group',
        description: 'A new group',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => newGroup,
      } as Response)

      const result = await createGroup({
        name: 'New Group',
        description: 'A new group',
      })

      expect(result).toEqual(newGroup)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/groups',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'New Group',
            description: 'A new group',
          }),
        })
      )
    })
  })

  describe('Conversations API', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
      setToken('test-token')
    })

    it('fetches conversations for a group', async () => {
      const mockConversations = {
        items: [
          {
            id: 'conv1',
            group_id: 'group1',
            title: 'Test Conversation',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
          },
        ],
        total: 1,
        limit: 100,
        offset: 0,
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockConversations,
      } as Response)

      const result = await getConversations('group1')

      expect(result).toEqual(mockConversations)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/groups/group1/conversations',
        expect.anything()
      )
    })

    it('creates a conversation with optional data', async () => {
      const newConversation = {
        id: 'conv1',
        group_id: 'group1',
        title: 'New Conversation',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => newConversation,
      } as Response)

      const result = await createConversation('group1', {
        title: 'New Conversation',
      })

      expect(result).toEqual(newConversation)
    })
  })

  describe('Messages API', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
      setToken('test-token')
    })

    it('sends a message to a conversation', async () => {
      const mockResponse = {
        user_message: {
          id: 'msg1',
          conversation_id: 'conv1',
          sender_id: 'user1',
          content: 'Hello',
          created_at: '2025-01-01T00:00:00Z',
        },
        assistant_message: null,
      }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await sendMessage('conv1', {
        content: 'Hello',
      })

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/conversations/conv1/messages',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ content: 'Hello' }),
        })
      )
    })
  })

  describe('204 No Content Handling', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
      setToken('test-token')
    })

    it('handles 204 responses without trying to parse JSON', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => {
          throw new Error('Should not try to parse JSON for 204')
        },
      } as Response)

      // This would typically be a DELETE endpoint
      const result = await getCurrentUser() // Using this as example

      expect(result).toEqual({})
    })
  })
})
