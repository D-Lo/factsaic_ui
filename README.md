# Factsaic UI

Frontend web application for Factsaic, a mosaic canvas for your personal knowledge graph. Built with React, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives with custom styled components
- **Routing**: React Router DOM v7
- **Testing**: Vitest + React Testing Library
- **Icons**: Lucide React

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or compatible package manager

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment (if needed):
   - The app expects the API to be running at `http://localhost:8000` by default
   - See [api-client.ts](src/lib/api-client.ts) to configure the API base URL

## Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Other Commands

- **Build for production**: `npm run build`
  - Compiles TypeScript and bundles the app to the `dist/` directory
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint`

## Testing

The project uses Vitest for unit and integration testing with React Testing Library.

### Run Tests

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI dashboard
npm run test:ui
```

### Test Setup

- Test configuration: [vite.config.ts](vite.config.ts)
- Global test setup: [src/test/setup.ts](src/test/setup.ts)
- Tests are co-located with their source files using the `.test.ts` or `.test.tsx` extension

### Writing Tests

Example test structure:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Code Layout

```
factsaic_ui/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components (Button, Input, Card, etc.)
│   │   ├── ProtectedRoute.tsx
│   │   └── ThemeToggle.tsx
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── lib/                 # Utility libraries
│   │   ├── api-client.ts    # API client for backend communication
│   │   └── utils.ts         # Helper utilities (e.g., cn for className merging)
│   ├── pages/               # Page-level components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── test/                # Test configuration and helpers
│   │   └── setup.ts         # Global test setup
│   ├── types/               # TypeScript type definitions
│   │   └── api.ts           # API response/request types
│   ├── App.tsx              # Root application component with routing
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── dist/                    # Production build output (generated)
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```

## Key Conventions

### Path Aliases

The `@/` alias is configured to resolve to `src/`:

```typescript
import { Button } from '@/components/ui/button'
import { AuthContext } from '@/contexts/AuthContext'
```

### Component Organization

- **UI Components** ([src/components/ui/](src/components/ui/)): Reusable, styled primitives built on Radix UI
- **Page Components** ([src/pages/](src/pages/)): Route-level components
- **Contexts** ([src/contexts/](src/contexts/)): Global state management
- Tests are co-located with components (e.g., `AuthContext.tsx` and `AuthContext.test.tsx`)

### Styling

- Uses Tailwind CSS for utility-first styling
- Custom component variants with `class-variance-authority`
- `cn()` utility from [src/lib/utils.ts](src/lib/utils.ts) for conditional class merging

### API Communication

- Centralized API client in [src/lib/api-client.ts](src/lib/api-client.ts)
- TypeScript types for API contracts in [src/types/api.ts](src/types/api.ts)
- Authentication handled via AuthContext with JWT tokens

## Project Structure Philosophy

- **Co-located tests**: Test files live next to the code they test
- **Feature-based organization**: Group by feature/domain rather than technical type where possible
- **Type safety**: Strict TypeScript configuration for compile-time safety
- **Component composition**: Build complex UIs from small, reusable components
