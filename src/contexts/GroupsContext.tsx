/**
 * GroupsContext
 *
 * Manages groups, conversations, and messages state for the application.
 * Provides methods to fetch groups, select groups, create/list conversations, etc.
 *
 * [LEARNING NOTE - can remove later]
 * React Context is a way to share state across multiple components without
 * having to pass props down through every level (called "prop drilling").
 * This is useful for global state like authentication, theme, or in our case,
 * the currently selected group and conversation.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Group,
  Conversation,
  Message,
  GroupCreateRequest,
  ConversationCreateRequest,
  SendMessageRequest,
} from '@/types/api';
import {
  getGroups,
  createGroup,
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
} from '@/lib/api-client';
import { useAuth } from './AuthContext';

/**
 * [LEARNING NOTE - can remove later]
 * This interface defines what data and functions will be available to components
 * that use this context. It's like a contract that says "if you use useGroups(),
 * you'll have access to all these properties and methods."
 */
interface GroupsContextType {
  // Groups
  groups: Group[];                                  // Array of all groups user belongs to
  selectedGroup: Group | null;                      // Currently selected group (null if none)
  groupsLoading: boolean;                           // True while fetching groups from API
  groupsError: string | null;                       // Error message if fetch failed
  selectGroup: (group: Group) => void;              // Function to change selected group
  createNewGroup: (data: GroupCreateRequest) => Promise<Group>;  // Create new group
  refreshGroups: () => Promise<void>;               // Re-fetch groups from API

  // Conversations
  conversations: Conversation[];                    // All conversations in selected group
  selectedConversation: Conversation | null;        // Currently selected conversation
  conversationsLoading: boolean;                    // Loading state for conversations
  conversationsError: string | null;                // Error state for conversations
  selectConversation: (conversation: Conversation) => void;  // Select a conversation
  createNewConversation: (data?: ConversationCreateRequest) => Promise<Conversation>;
  refreshConversations: () => Promise<void>;

  // Messages
  messages: Message[];                              // All messages in selected conversation
  messagesLoading: boolean;                         // Loading state for messages
  messagesError: string | null;                     // Error state for messages
  sendNewMessage: (content: string) => Promise<void>;  // Send a new message
  refreshMessages: () => Promise<void>;             // Re-fetch messages
}

/**
 * [LEARNING NOTE - can remove later]
 * createContext() creates the context with an undefined default value.
 * We use undefined here because we'll always wrap our app in the Provider,
 * so components should never access the context without it being defined.
 */
const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

/**
 * [LEARNING NOTE - can remove later]
 * The Provider component wraps parts of your app that need access to this context.
 * It manages all the state and provides it to child components.
 *
 * Props:
 * - children: The React components that will have access to this context
 */
export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  // ============================================================================
  // Groups State
  // ============================================================================

  /**
   * [LEARNING NOTE - can remove later]
   * useState() is a React Hook that lets you add state to functional components.
   * It returns [currentValue, setterFunction].
   *
   * Example: const [count, setCount] = useState(0);
   * - count is the current value (starts at 0)
   * - setCount is a function to update it: setCount(5) or setCount(prev => prev + 1)
   *
   * When you call the setter, React re-renders the component with the new value.
   */
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  // ============================================================================
  // Conversations State
  // ============================================================================

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(null);

  // ============================================================================
  // Messages State
  // ============================================================================

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // ============================================================================
  // Data Fetching Functions
  // ============================================================================

  /**
   * [LEARNING NOTE - can remove later]
   * useCallback() is a React Hook that memoizes a function - it returns the same
   * function instance unless its dependencies change. This prevents unnecessary
   * re-renders when passing functions as props.
   *
   * Syntax: useCallback(() => { ... }, [dependencies])
   * - The function will be recreated only when dependencies change
   * - This is important for useEffect dependencies to avoid infinite loops
   */
  const refreshGroups = useCallback(async () => {
    // Don't fetch if user is not logged in
    if (!isAuthenticated) return;

    // Set loading state before fetching
    setGroupsLoading(true);
    setGroupsError(null);

    try {
      // Call our API client to fetch groups
      const response = await getGroups();
      setGroups(response.groups);

      // Auto-select first non-personal group, or first group if only personal exists
      // This gives the user a good default selection when they first load the app
      if (response.groups.length > 0 && !selectedGroup) {
        const firstSharedGroup = response.groups.find((g) => !g.is_personal);
        setSelectedGroup(firstSharedGroup || response.groups[0]);
      }
    } catch (err) {
      // If the fetch fails, store the error message
      setGroupsError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      // Always set loading to false, whether we succeeded or failed
      setGroupsLoading(false);
    }
  }, [isAuthenticated, selectedGroup]);  // Re-create this function if these change

  const refreshConversations = useCallback(async () => {
    // If no group is selected, clear conversations and return early
    if (!selectedGroup) {
      setConversations([]);
      return;
    }

    setConversationsLoading(true);
    setConversationsError(null);

    try {
      const response = await getConversations(selectedGroup.id);
      setConversations(response.conversations);

      // Auto-select first conversation if none selected
      if (response.conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(response.conversations[0]);
      }
    } catch (err) {
      setConversationsError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  }, [selectedGroup, selectedConversation]);

  const refreshMessages = useCallback(async () => {
    // If no conversation is selected, clear messages
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    setMessagesError(null);

    try {
      const response = await getMessages(selectedConversation.id);
      setMessages(response.messages);
    } catch (err) {
      setMessagesError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  }, [selectedConversation]);

  // ============================================================================
  // Effects - Run code when dependencies change
  // ============================================================================

  /**
   * [LEARNING NOTE - can remove later]
   * useEffect() is a React Hook for side effects - code that needs to run
   * in response to component lifecycle or state changes.
   *
   * Syntax: useEffect(() => { ... }, [dependencies])
   * - Runs after every render if no dependencies
   * - Runs only when dependencies change if dependencies provided
   * - Runs once on mount if dependencies = []
   *
   * Common uses: data fetching, subscriptions, manually changing the DOM
   */

  // Load groups when component mounts or when refreshGroups function changes
  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  // Load conversations when the selected group changes
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Load messages when the selected conversation changes
  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  // ============================================================================
  // Action Functions - These modify state in response to user actions
  // ============================================================================

  /**
   * Select a different group
   * When switching groups, we clear the conversation selection since
   * conversations belong to a specific group
   */
  const selectGroup = useCallback((group: Group) => {
    setSelectedGroup(group);
    setSelectedConversation(null); // Clear conversation selection when switching groups
  }, []);

  /**
   * Create a new group and automatically select it
   */
  const createNewGroup = useCallback(
    async (data: GroupCreateRequest): Promise<Group> => {
      const newGroup = await createGroup(data);
      await refreshGroups();  // Refresh the list to include the new group
      setSelectedGroup(newGroup);  // Select the newly created group
      return newGroup;
    },
    [refreshGroups]
  );

  /**
   * Select a different conversation
   */
  const selectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
  }, []);

  /**
   * Create a new conversation in the currently selected group
   */
  const createNewConversation = useCallback(
    async (data: ConversationCreateRequest = {}): Promise<Conversation> => {
      if (!selectedGroup) {
        throw new Error('No group selected');
      }

      const newConversation = await createConversation(selectedGroup.id, data);
      await refreshConversations();  // Refresh to include new conversation
      setSelectedConversation(newConversation);  // Select the new conversation
      return newConversation;
    },
    [selectedGroup, refreshConversations]
  );

  /**
   * Send a message and add the response to the message list
   *
   * [LEARNING NOTE - can remove later]
   * The API returns both the user's message and the AI's response.
   * We add both to our local state immediately so the UI updates right away.
   */
  const sendNewMessage = useCallback(
    async (content: string) => {
      if (!selectedConversation) {
        throw new Error('No conversation selected');
      }

      setMessagesLoading(true);
      setMessagesError(null);

      try {
        const request: SendMessageRequest = { content };
        const response = await sendMessage(selectedConversation.id, request);

        /**
         * [LEARNING NOTE - can remove later]
         * When updating state based on previous state, use the function form:
         * setState(prev => newValue)
         *
         * This ensures we're working with the most up-to-date value, which is
         * important when updates happen rapidly (like in our chat).
         *
         * The spread operator [...prev, ...new] creates a new array with
         * all the old items plus the new ones.
         */
        setMessages((prev) => [...prev, response.user_message, response.assistant_message]);
      } catch (err) {
        setMessagesError(err instanceof Error ? err.message : 'Failed to send message');
        throw err;  // Re-throw so the calling component can handle it
      } finally {
        setMessagesLoading(false);
      }
    },
    [selectedConversation]
  );

  // ============================================================================
  // Context Value - Bundle everything up to provide to children
  // ============================================================================

  /**
   * [LEARNING NOTE - can remove later]
   * This value object contains all the state and functions we want to expose.
   * Any component that calls useGroups() will receive this object.
   */
  const value: GroupsContextType = {
    groups,
    selectedGroup,
    groupsLoading,
    groupsError,
    selectGroup,
    createNewGroup,
    refreshGroups,

    conversations,
    selectedConversation,
    conversationsLoading,
    conversationsError,
    selectConversation,
    createNewConversation,
    refreshConversations,

    messages,
    messagesLoading,
    messagesError,
    sendNewMessage,
    refreshMessages,
  };

  /**
   * [LEARNING NOTE - can remove later]
   * Context.Provider is what makes the value available to child components.
   * Any component inside <GroupsProvider> can access this context via useGroups().
   */
  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
}

/**
 * [LEARNING NOTE - can remove later]
 * Custom hook to use the GroupsContext
 *
 * This is a common pattern - instead of having components use useContext() directly,
 * we provide a custom hook that:
 * 1. Handles the useContext call
 * 2. Throws a helpful error if used outside the Provider
 * 3. Gives us TypeScript autocomplete
 *
 * Usage in a component:
 * const { groups, selectGroup, sendNewMessage } = useGroups();
 */
export function useGroups() {
  const context = useContext(GroupsContext);

  // If context is undefined, it means useGroups() was called outside of <GroupsProvider>
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }

  return context;
}
