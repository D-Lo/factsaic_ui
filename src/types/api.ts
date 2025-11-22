/**
 * API types matching the backend Pydantic schemas
 */

// ============================================================================
// Auth & Users
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  display_name: string;
}

/**
 * OAuth2 token response (matches backend OAuth2TokenResponse)
 */
export interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserUpdateRequest {
  display_name?: string;
  name?: string;
}

// ============================================================================
// Groups
// ============================================================================

export interface Group {
  id: string;
  name: string;
  is_personal: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupCreateRequest {
  name: string;
}

export interface GroupsListResponse {
  groups: Group[];
}

export interface Member {
  user: User;
  role: 'owner' | 'member';
  joined_at: string;
}

export interface AddMemberRequest {
  user_email: string;
}

// ============================================================================
// Conversations
// ============================================================================

export interface Conversation {
  id: string;
  group_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationCreateRequest {
  title?: string;
}

export interface ConversationsListResponse {
  conversations: Conversation[];
}

// ============================================================================
// Messages
// ============================================================================

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  author_user_id: string | null;
  author_display_name: string | null;
  model_config_id: string | null;
  created_at: string;
}

export interface MessagesListResponse {
  messages: Message[];
  total: number;
}

export interface SendMessageRequest {
  content: string;
}

export interface SendMessageResponse {
  user_message: Message;
  assistant_message: Message;
}

// ============================================================================
// Assistants
// ============================================================================

export interface Assistant {
  id: string;
  group_id: string;
  name: string;
  system_prompt: string | null;
  provider: string;
  model: string;
  temperature: number;
  max_tokens: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssistantCreateRequest {
  name: string;
  system_prompt?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface AssistantsListResponse {
  assistants: Assistant[];
}

// ============================================================================
// API Errors
// ============================================================================

export interface ApiError {
  detail: string;
}
