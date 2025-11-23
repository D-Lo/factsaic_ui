import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/contexts/AuthContext'
import { GroupsProvider } from '@/contexts/GroupsContext'

/**
 * [LEARNING NOTE - can remove later]
 * Providers wrap the app in layers, like nesting dolls.
 * - StrictMode: React's development mode checks
 * - AuthProvider: Makes authentication state available to all components
 * - GroupsProvider: Makes groups/conversations state available (needs auth, so it's inside AuthProvider)
 * - App: Our main app component with routing
 *
 * Any component inside can access both auth and groups contexts.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <GroupsProvider>
        <App />
      </GroupsProvider>
    </AuthProvider>
  </StrictMode>,
)
