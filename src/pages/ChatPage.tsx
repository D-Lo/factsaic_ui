/**
 * ChatPage - Main chat interface with collapsible sidebar for groups and conversations.
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroups } from '@/contexts/GroupsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { MessageSquare, Plus, LogOut, Users, Settings, Trash, ChevronDown, ChevronRight } from 'lucide-react';
import { MessageMarkdown } from '@/components/MessageMarkdown';
import { useNavigate } from 'react-router';

/**
 * AppSidebar - Navigation sidebar with groups and conversations
 */
function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    groups,
    selectedGroup,
    selectGroup,
    conversations,
    selectedConversation,
    selectConversation,
    createNewConversation,
    deleteConversation,
    createNewGroup,
  } = useGroups();
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());
  const [creatingGroup, setCreatingGroup] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState('');

  const pendingConversation = conversations.find((c) => c.id === pendingDeleteId) || null;

  // Auto-expand the selected group
  React.useEffect(() => {
    if (selectedGroup) {
      setExpandedGroups((prev) => new Set(prev).add(selectedGroup.id));
    }
  }, [selectedGroup]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      await createNewGroup({ name: newGroupName });
      setNewGroupName('');
      setCreatingGroup(false);
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <MessageSquare className="h-6 w-6 shrink-0" />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">Factsaic</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel>Groups</SidebarGroupLabel>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 group-data-[collapsible=icon]:hidden"
              onClick={() => setCreatingGroup(true)}
              title="Create new group"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            {creatingGroup && (
              <form onSubmit={handleCreateGroup} className="px-2 py-2 space-y-2">
                <Input
                  type="text"
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  autoFocus
                  className="h-8"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={!newGroupName.trim()}>
                    Create
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCreatingGroup(false);
                      setNewGroupName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
            <SidebarMenu>
              {(groups || []).map((group) => {
                const isExpanded = expandedGroups.has(group.id);
                const groupConversations = group.id === selectedGroup?.id ? conversations : [];

                return (
                  <div key={group.id}>
                    <SidebarMenuItem>
                      <div className="flex items-center w-full">
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-sidebar-accent"
                          onClick={(e) => {
                            e.stopPropagation();
                            // If expanding and group is not selected, select it first to load conversations
                            if (!isExpanded && group.id !== selectedGroup?.id) {
                              selectGroup(group);
                            }
                            toggleGroup(group.id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <SidebarMenuButton
                          onClick={() => selectGroup(group)}
                          isActive={selectedGroup?.id === group.id}
                          tooltip={group.name}
                          className="flex-1"
                        >
                          <Users className="h-4 w-4" />
                          <span>{group.name}</span>
                        </SidebarMenuButton>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-sidebar-accent opacity-0 group-hover/menu-item:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/groups/${group.id}/settings`);
                          }}
                          title="Group settings"
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </SidebarMenuItem>

                    {/* Conversations under this group */}
                    {isExpanded && groupConversations.length > 0 && (
                      <div className="ml-6 space-y-1">
                        {groupConversations.map((conversation) => (
                          <SidebarMenuItem key={conversation.id}>
                            <SidebarMenuButton
                              onClick={() => selectConversation(conversation)}
                              isActive={selectedConversation?.id === conversation.id}
                              tooltip={conversation.title || 'New Conversation'}
                              className="text-sm"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span className="truncate">
                                {conversation.title || 'New Conversation'}
                              </span>
                            </SidebarMenuButton>
                            <button
                              type="button"
                              className="absolute right-1 top-1.5 flex h-6 w-6 items-center justify-center rounded text-sidebar-foreground/70 opacity-0 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-hover/menu-item:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingDeleteId(conversation.id);
                              }}
                              aria-label="Delete conversation"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </SidebarMenuItem>
                        ))}
                      </div>
                    )}

                    {/* New conversation button for expanded group */}
                    {isExpanded && group.id === selectedGroup?.id && (
                      <div className="ml-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-full justify-start text-sm"
                          onClick={() => createNewConversation()}
                        >
                          <Plus className="h-3.5 w-3.5 mr-2" />
                          New Conversation
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Logout">
              <LogOut className="h-4 w-4" />
              <span>Logout ({user?.display_name})</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />

      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete&nbsp;
              <span className="font-medium">
                {pendingConversation?.title || 'this conversation'}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingDeleteId) {
                  await deleteConversation(pendingDeleteId);
                }
                setPendingDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}

/**
 * ChatArea - Message display and input component
 */
function ChatArea() {
  const { user } = useAuth();
  const { messages, messagesLoading, selectedConversation, sendNewMessage } = useGroups();
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConversation) return;

    try {
      await sendNewMessage(input);
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

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
    <div className="flex-1 flex flex-col h-full overflow-hidden">
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
              <div className="text-xs mb-1 opacity-70">
                {message.author_type === 'user' ? user?.display_name : message.author.name}
              </div>
              <MessageMarkdown content={message.content.text} />
            </div>
          </div>
        ))}

        {messagesLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="text-muted-foreground">Thinking...</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

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
 * ChatPage - Main chat page with sidebar navigation
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <header className="sticky top-0 z-20 border-b border-border bg-background px-4 py-3 flex items-center gap-3 shrink-0">
          <SidebarTrigger className="h-8 w-8" />
          <h1 className="font-semibold text-lg">Chat</h1>
        </header>
        <ChatArea />
      </SidebarInset>
    </SidebarProvider>
  );
}
