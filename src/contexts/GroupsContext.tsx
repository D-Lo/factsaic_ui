/**
 * GroupsContext - Manages groups, conversations, and messages state
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
  updateConversation,
  deleteConversation as deleteConversationApi,
} from '@/lib/api-client';
import { useAuth } from './AuthContext';

type ConversationWithDraft = Conversation & { isDraft?: boolean };

interface GroupsContextType {
  groups: Group[];
  selectedGroup: Group | null;
  groupsLoading: boolean;
  groupsError: string | null;
  selectGroup: (group: Group) => void;
  createNewGroup: (data: GroupCreateRequest) => Promise<Group>;
  refreshGroups: () => Promise<void>;

  conversations: ConversationWithDraft[];
  selectedConversation: ConversationWithDraft | null;
  conversationsLoading: boolean;
  conversationsError: string | null;
  selectConversation: (conversation: ConversationWithDraft) => void;
  createNewConversation: (data?: ConversationCreateRequest) => Promise<ConversationWithDraft>;
  refreshConversations: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;

  messages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;
  sendNewMessage: (content: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  // Groups state
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  // Conversations state
  const [conversations, setConversations] = useState<ConversationWithDraft[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDraft | null>(null);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(null);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const refreshGroups = useCallback(async () => {
    if (!isAuthenticated) return;

    setGroupsLoading(true);
    setGroupsError(null);

    try {
      const response = await getGroups();
      setGroups(response.groups);

      // Auto-select first non-personal group, or first group if only personal exists
      if (response.groups.length > 0 && !selectedGroup) {
        const firstSharedGroup = response.groups.find((g) => !g.is_personal);
        setSelectedGroup(firstSharedGroup || response.groups[0]);
      }
    } catch (err) {
      setGroupsError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setGroupsLoading(false);
    }
  }, [isAuthenticated, selectedGroup]);

  const refreshConversations = useCallback(async () => {
    if (!selectedGroup) {
      setConversations([]);
      return;
    }

    setConversationsLoading(true);
    setConversationsError(null);

    try {
      const response = await getConversations(selectedGroup.id);
      setConversations(response.conversations);
      if (!selectedConversation && response.conversations.length > 0) {
        setSelectedConversation(response.conversations[0]);
      }
    } catch (err) {
      setConversationsError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  }, [selectedGroup, selectedConversation]);

  const refreshMessages = useCallback(async () => {
    if (!selectedConversation || selectedConversation.isDraft) {
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

  // Load data on mount and when dependencies change
  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  const selectGroup = useCallback((group: Group) => {
    setSelectedGroup(group);
    setSelectedConversation(null);
  }, []);

  const createNewGroup = useCallback(
    async (data: GroupCreateRequest): Promise<Group> => {
      const newGroup = await createGroup(data);
      await refreshGroups();
      setSelectedGroup(newGroup);
      return newGroup;
    },
    [refreshGroups]
  );

  const selectConversation = useCallback((conversation: ConversationWithDraft) => {
    setSelectedConversation(conversation);
  }, []);

  const createNewConversation = useCallback(
    async (data: ConversationCreateRequest = {}): Promise<ConversationWithDraft> => {
      if (!selectedGroup) {
        throw new Error('No group selected');
      }

      const now = new Date().toISOString();
      const draftConversation: ConversationWithDraft = {
        id: `draft-${Date.now()}`,
        group_id: selectedGroup.id,
        title: data.title ?? null,
        created_at: now,
        updated_at: now,
        isDraft: true,
      };

      // Clear messages for the new draft conversation
      setMessages([]);

      // Insert draft at the top of the list
      setConversations((prev) => [
        draftConversation,
        ...prev.filter((conv) => !conv.isDraft),
      ]);
      setSelectedConversation(draftConversation);

      return draftConversation;
    },
    [selectedGroup]
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      const conversation = conversations.find((c) => c.id === conversationId);

      // Remove immediately from UI
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));

      // If deleting the selected conversation, clear selection and messages
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }

      // If it's a draft, nothing to delete on the server
      if (conversation?.isDraft) {
        return;
      }

      try {
        await deleteConversationApi(conversationId);
      } catch (err) {
        setConversationsError(err instanceof Error ? err.message : 'Failed to delete conversation');
        // Optionally refresh to resync if delete fails
        await refreshConversations();
      }
    },
    [conversations, selectedConversation, refreshConversations]
  );

  const sendNewMessage = useCallback(
    async (content: string) => {
      if (!selectedConversation) {
        throw new Error('No conversation selected');
      }

      const isFirstMessage = messages.length === 0;
      const request: SendMessageRequest = { content };

      // If this is a draft conversation, create it on the server first
      let targetConversation = selectedConversation;
      if (selectedConversation.isDraft) {
        if (!selectedGroup) {
          throw new Error('No group selected');
        }
        const createdConversation = await createConversation(selectedGroup.id, {
          title: selectedConversation.title ?? undefined,
        });
        targetConversation = { ...createdConversation, isDraft: false };

        // Replace draft with persisted conversation
        setConversations((prev) => [
          targetConversation,
          ...prev.filter((conv) => conv.id !== selectedConversation.id),
        ]);
        setSelectedConversation(targetConversation);
      }

      // Create optimistic user message and show immediately
      const tempUserId = 'temp-user';
      const optimisticUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: targetConversation.id,
        sequence_number: messages.length + 1,
        author_type: 'user',
        author_id: tempUserId,
        author: {
          id: tempUserId,
          type: 'user',
          name: 'You',
        },
        reply_to_message_id: null,
        content: {
          type: 'text',
          text: content,
        },
        created_at: new Date().toISOString(),
      };

      // Add user message immediately
      setMessages((prev) => [...prev, optimisticUserMessage]);

      // Show "thinking..." indicator
      setMessagesLoading(true);
      setMessagesError(null);

      try {
        const response = await sendMessage(targetConversation.id, request);

        // Replace optimistic message with real messages from server
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticUserMessage.id),
          response.user_message,
          response.assistant_message,
        ]);

        // Auto-generate title from first message if conversation has no title
        if (isFirstMessage && !targetConversation.title) {
          const generatedTitle = content.length > 50
            ? content.substring(0, 47) + '...'
            : content;

          try {
            const updatedConversation = await updateConversation(targetConversation.id, {
              title: generatedTitle,
            });

            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === updatedConversation.id ? updatedConversation : conv
              )
            );
            setSelectedConversation(updatedConversation);
          } catch (updateErr) {
            console.error('Failed to update conversation title:', updateErr);
          }
        }
      } catch (err) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id));
        setMessagesError(err instanceof Error ? err.message : 'Failed to send message');
        throw err;
      } finally {
        setMessagesLoading(false);
      }
    },
    [selectedConversation, selectedGroup, messages.length]
  );

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
    deleteConversation,

    messages,
    messagesLoading,
    messagesError,
    sendNewMessage,
    refreshMessages,
  };

  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
}

/**
 * Hook to access groups, conversations, and messages context
 */
export function useGroups() {
  const context = useContext(GroupsContext);

  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }

  return context;
}
