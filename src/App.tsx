/**
 * App Component
 *
 * Sets up routing for the application.
 *
 * [LEARNING NOTE - can remove later]
 * React Router provides client-side routing (navigation without page reloads).
 * - BrowserRouter: Wraps the app to enable routing
 * - Routes: Container for all Route definitions
 * - Route: Maps a URL path to a component
 * - Navigate: Redirects to a different path
 *
 * ProtectedRoute is our custom component that checks if user is logged in
 * before allowing access to certain pages.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ChatPage } from '@/pages/ChatPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - anyone can access */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes - require authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all - redirect any unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
