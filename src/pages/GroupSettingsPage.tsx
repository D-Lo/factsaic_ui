/**
 * GroupSettingsPage - Manage group members and settings
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useGroups } from '@/contexts/GroupsContext';
import {
  getGroupMembers,
  removeGroupMember,
  updateGroupMemberRole,
  addGroupMember,
} from '@/lib/api-client';
import type { Member } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, Crown, UserMinus, Shield } from 'lucide-react';

export function GroupSettingsPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups } = useGroups();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add member state
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  // Remove member dialog state
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  const group = groups.find((g) => g.id === groupId);
  const currentUserMember = members.find((m) => m.user.id === user?.id);
  const isOwner = currentUserMember?.role === 'owner';

  useEffect(() => {
    if (!groupId) return;

    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getGroupMembers(groupId);
        setMembers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [groupId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !newMemberEmail.trim()) return;

    setAddingMember(true);
    setError(null);

    try {
      // Note: The backend expects user_id, but in a real app you'd have a user lookup endpoint
      // For now, this will show the validation error from the backend
      const newMember = await addGroupMember(groupId, {
        user_email: newMemberEmail,
      });
      setMembers([...members, newMember]);
      setNewMemberEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (!groupId) return;

    try {
      await removeGroupMember(groupId, member.user.id);
      setMembers(members.filter((m) => m.user.id !== member.user.id));
      setMemberToRemove(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      setMemberToRemove(null);
    }
  };

  const handleToggleRole = async (member: Member) => {
    if (!groupId) return;

    const newRole = member.role === 'owner' ? 'member' : 'owner';

    try {
      const updatedMember = await updateGroupMemberRole(groupId, member.user.id, newRole);
      setMembers(members.map((m) => (m.user.id === member.user.id ? updatedMember : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading group settings...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Group not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">Manage group members and settings</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Add Member */}
        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Add Member</CardTitle>
              <CardDescription>Invite someone to join this group</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  disabled={addingMember}
                />
                <Button type="submit" disabled={addingMember || !newMemberEmail.trim()}>
                  {addingMember ? 'Adding...' : 'Add Member'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Members ({members.length})</CardTitle>
            <CardDescription>People who have access to this group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.user.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{member.user.display_name}</p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                    {member.role === 'owner' && (
                      <Crown className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>

                  {isOwner && member.user.id !== user?.id && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRole(member)}
                        title={member.role === 'owner' ? 'Demote to member' : 'Promote to owner'}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {member.role === 'owner' ? 'Demote' : 'Promote'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setMemberToRemove(member)}
                        title="Remove member"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {member.user.id === user?.id && (
                    <span className="text-sm text-muted-foreground">You</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Remove Member Confirmation Dialog */}
        <AlertDialog
          open={!!memberToRemove}
          onOpenChange={(open) => {
            if (!open) setMemberToRemove(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove member?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove{' '}
                <span className="font-medium">{memberToRemove?.user.display_name}</span> from this
                group? They will lose access to all conversations and data in this group.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setMemberToRemove(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (memberToRemove) {
                    handleRemoveMember(memberToRemove);
                  }
                }}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
