/**
 * Home Page (Dashboard)
 *
 * Main page after login. Will eventually show conversations, groups, etc.
 * For now, just a simple welcome page to verify authentication works.
 */

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Factsaic</h1>
            <p className="text-muted-foreground">Welcome back, {user?.display_name}!</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>Currently logged in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Display Name:</span> {user?.display_name}
            </div>
            <div>
              <span className="font-medium">Full Name:</span> {user?.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {user?.email}
            </div>
            <div>
              <span className="font-medium">User ID:</span>{' '}
              <code className="text-xs bg-muted px-2 py-1 rounded">{user?.id}</code>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future features */}
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Features in development</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>🗂️ Groups & Conversations</p>
            <p>💬 Chat Interface</p>
            <p>🤖 AI Assistants</p>
            <p>🧠 Memory Management</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
