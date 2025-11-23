/**
 * API Client for Factsaic Backend
 *
 * Provides utilities for making authenticated requests to the backend API.
 */

import type {
  OAuth2TokenResponse,
  RegisterRequest,
  User,
  UserUpdateRequest,
  Group,
  GroupCreateRequest,
  GroupsListResponse,
  Member,
  AddMemberRequest,
  Conversation,
  ConversationCreateRequest,
  ConversationsListResponse,
  MessagesListResponse,
  SendMessageRequest,
  SendMessageResponse,
  Assistant,
  AssistantCreateRequest,
  AssistantsListResponse,
  ApiError,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiClientError';
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Get the stored JWT token
 */
export function getToken(): string | null {
  return localStorage.getItem('factsaic_token');
}

/**
 * Store JWT token
 */
export function setToken(token: string): void {
  localStorage.setItem('factsaic_token', token);
}

/**
 * Remove JWT token
 */
export function clearToken(): void {
  localStorage.removeItem('factsaic_token');
}

/**
 * Get the stored user
 */
export function getStoredUser(): User | null {
  const userJson = localStorage.getItem('factsaic_user');
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Store user data
 */
export function setStoredUser(user: User): void {
  localStorage.setItem('factsaic_user', JSON.stringify(user));
}

/**
 * Remove stored user
 */
export function clearStoredUser(): void {
  localStorage.removeItem('factsaic_user');
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorData: ApiError = await response.json();
      errorDetail = errorData.detail;
    } catch {
      // If we can't parse JSON, use the status text
      errorDetail = response.statusText || errorDetail;
    }
    throw new ApiClientError(response.status, errorDetail);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================================================
// Auth & Users API
// ============================================================================

/**
 * Register a new user and automatically log them in
 *
 * This combines two API calls:
 * 1. POST /api/auth/register - Creates the user
 * 2. POST /api/auth/token - Gets auth token
 * 3. GET /api/users/me - Gets full user data
 */
export async function register(data: RegisterRequest): Promise<{ user: User; token: OAuth2TokenResponse }> {
  // Step 1: Register the user
  const user = await apiRequest<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // Step 2: Automatically log them in to get token
  const tokenResponse = await login(data.email, data.password);

  return { user, token: tokenResponse };
}

/**
 * Login with OAuth2 password flow
 *
 * Returns the OAuth2 token response. After calling this, you should:
 * 1. Store the token using setToken()
 * 2. Call getCurrentUser() to get user data
 * 3. Store user using setStoredUser()
 */
export async function login(email: string, password: string): Promise<OAuth2TokenResponse> {
  // OAuth2 password flow expects form data
  const formData = new URLSearchParams();
  formData.append('username', email); // OAuth2 spec uses 'username' field
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = 'Login failed';
    try {
      const errorData: ApiError = await response.json();
      errorDetail = errorData.detail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new ApiClientError(response.status, errorDetail);
  }

  return response.json();
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/api/users/me');
}

/**
 * Update current user
 */
export async function updateUser(data: UserUpdateRequest): Promise<User> {
  return apiRequest<User>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Groups API
// ============================================================================

/**
 * Get all groups for current user
 */
export async function getGroups(): Promise<GroupsListResponse> {
  return apiRequest<GroupsListResponse>('/api/groups');
}

/**
 * Create a new group
 */
export async function createGroup(data: GroupCreateRequest): Promise<Group> {
  return apiRequest<Group>('/api/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get group members
 */
export async function getGroupMembers(groupId: string): Promise<Member[]> {
  return apiRequest<Member[]>(`/api/groups/${groupId}/members`);
}

/**
 * Add member to group
 */
export async function addGroupMember(
  groupId: string,
  data: AddMemberRequest
): Promise<Member> {
  return apiRequest<Member>(`/api/groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Conversations API
// ============================================================================

/**
 * Get all conversations for a group
 */
export async function getConversations(
  groupId: string
): Promise<ConversationsListResponse> {
  return apiRequest<ConversationsListResponse>(
    `/api/groups/${groupId}/conversations`
  );
}

/**
 * Create a new conversation
 */
export async function createConversation(
  groupId: string,
  data: ConversationCreateRequest = {}
): Promise<Conversation> {
  return apiRequest<Conversation>(`/api/groups/${groupId}/conversations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get conversation details
 */
export async function getConversation(conversationId: string): Promise<Conversation> {
  return apiRequest<Conversation>(`/api/conversations/${conversationId}`);
}

// ============================================================================
// Messages API
// ============================================================================

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  params?: { limit?: number; offset?: number }
): Promise<MessagesListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());

  const query = queryParams.toString();
  const endpoint = `/api/conversations/${conversationId}/messages${
    query ? `?${query}` : ''
  }`;

  return apiRequest<MessagesListResponse>(endpoint);
}

/**
 * Send a message to a conversation
 */
export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest
): Promise<SendMessageResponse> {
  return apiRequest<SendMessageResponse>(
    `/api/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

// ============================================================================
// Assistants API
// ============================================================================

/**
 * Get all assistants for a group
 */
export async function getAssistants(groupId: string): Promise<AssistantsListResponse> {
  return apiRequest<AssistantsListResponse>(`/api/groups/${groupId}/assistants`);
}

/**
 * Create a new assistant
 */
export async function createAssistant(
  groupId: string,
  data: AssistantCreateRequest
): Promise<Assistant> {
  return apiRequest<Assistant>(`/api/groups/${groupId}/assistants`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
