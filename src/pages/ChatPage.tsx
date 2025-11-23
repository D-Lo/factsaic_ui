/**
 * ChatPage - Main chat interface
 *
 * [LEARNING NOTE - can remove later]
 * This page uses the Shadcn Sidebar component to create a professional chat interface.
 * The Sidebar component provides:
 * - Collapsible sidebar (collapses to icons on desktop, full overlay on mobile)
 * - Persistent state (remembers if it was open/closed)
 * - Responsive behavior (overlay on mobile, icon-collapse on desktop)
 * - Keyboard shortcuts (cmd+b/ctrl+b to toggle)
 * - SidebarRail for easy hover-to-expand interaction
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroups } from '@/contexts/GroupsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { MessageSquare, Plus, LogOut, Users, Settings } from 'lucide-react';

/**
 * [LEARNING NOTE - can remove later]
 * AppSidebar - The left sidebar containing groups and conversations
 *
 * This component uses the Shadcn Sidebar building blocks to create a structured sidebar:
 * - collapsible="icon": Collapses to icon-only mode instead of sliding off-screen
 * - variant="inset": Adds padding and styling for a polished look
 * - SidebarHeader: Top section with app branding
 * - SidebarContent: Scrollable middle section with groups/conversations
 * - SidebarFooter: Bottom section with user info and logout
 * - SidebarRail: Hover area at the edge to easily expand/collapse
 */
function AppSidebar() {
  const { user, logout } = useAuth();
  const {
    groups,
    selectedGroup,
    selectGroup,
    conversations,
    selectedConversation,
    selectConversation,
    createNewConversation,
  } = useGroups();

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* Header - App branding */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <MessageSquare className="h-6 w-6" />
          <span className="font-semibold text-lg">Factsaic</span>
        </div>
      </SidebarHeader>

      {/* Content - Groups and Conversations */}
      <SidebarContent>
        {/* Groups Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Groups</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(groups || []).map((group) => (
                <SidebarMenuItem key={group.id}>
                  <SidebarMenuButton
                    onClick={() => selectGroup(group)}
                    isActive={selectedGroup?.id === group.id}
                    tooltip={group.name}
                  >
                    <Users className="h-4 w-4" />
                    <span>{group.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Conversations Section */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel>Conversations</SidebarGroupLabel>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => createNewConversation()}
              disabled={!selectedGroup}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {(conversations || []).map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <SidebarMenuButton
                    onClick={() => selectConversation(conversation)}
                    isActive={selectedConversation?.id === conversation.id}
                    tooltip={conversation.title || 'New Conversation'}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">
                      {conversation.title || 'New Conversation'}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User info and actions */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Logout">
              <LogOut className="h-4 w-4" />
              <span>Logout ({user?.display_name})</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/**
 * [LEARNING NOTE - can remove later]
 * ChatArea - The main chat messages and input area
 *
 * This component displays:
 * - A scrollable list of messages (user messages on right, assistant on left)
 * - A loading indicator when AI is thinking
 * - An input box with send button at the bottom
 */
function ChatArea() {
  const { messages, messagesLoading, selectedConversation, sendNewMessage } = useGroups();
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  /**
   * [LEARNING NOTE - can remove later]
   * Auto-scroll to bottom when new messages arrive
   * useEffect runs this code whenever messages array changes
   */
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConversation) return;

    try {
      await sendNewMessage(input);
      setInput(''); // Clear input after sending
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  /**
   * [LEARNING NOTE - can remove later]
   * Show placeholder when no conversation is selected
   */
  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages area - scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.author_type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.author_type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {message.author_type === 'assistant' && (
                <div className="text-xs text-muted-foreground mb-1">{message.author.name}</div>
              )}
              <div className="whitespace-pre-wrap">{message.content.text}</div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {messagesLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="text-muted-foreground">Thinking...</div>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area - fixed at bottom */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            disabled={messagesLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || messagesLoading}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * [LEARNING NOTE - can remove later]
 * ChatPage - Main page component
 *
 * This wraps everything in SidebarProvider which:
 * - Manages sidebar open/closed state
 * - Persists state in localStorage
 * - Handles responsive behavior
 * - Provides keyboard shortcuts
 */
export function ChatPage() {
  const { groupsLoading, groupsError } = useGroups();

  if (groupsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading groups...</p>
      </div>
    );
  }

  if (groupsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Error: {groupsError}</p>
      </div>
    );
  }

  /**
   * [LEARNING NOTE - can remove later]
   * Layout structure:
   * - SidebarProvider: Manages sidebar state (expanded/collapsed) and keyboard shortcuts
   * - AppSidebar: The collapsible sidebar (sibling of SidebarInset)
   * - SidebarInset: Main content area that renders as <main> and adjusts spacing for sidebar
   *
   * IMPORTANT: Don't wrap another <main> inside SidebarInset - it already renders as <main>
   *
   * Behavior:
   * - Desktop (wide screens): Sidebar and content side-by-side, no overlap
   * - Mobile (narrow screens): Sidebar as overlay sheet
   * - Toggle: Click button or press cmd+b/ctrl+b
   */
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        {/* Header with sidebar toggle */}
        <header className="border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
          <SidebarTrigger className="h-8 w-8" />
          <h1 className="font-semibold text-lg">Chat</h1>
        </header>

        {/* Chat area */}
        <ChatArea />
      </SidebarInset>
    </SidebarProvider>
  );
}
