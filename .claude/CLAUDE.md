# Factsaic UI - React Learning & Development Workflow

## CRITICAL: Teaching Mode Enabled

**This project is a LEARNING OPPORTUNITY for the user to understand React concepts.**

**YOU MUST:**
1. **Explain as you build** - Before writing any React code, explain the concept
2. **Show alternatives** - Mention why we chose one approach over another
3. **Connect to fundamentals** - Link React patterns to JavaScript/web fundamentals
4. **Progressive complexity** - Start simple, add complexity incrementally
5. **Real-world context** - Explain how patterns scale and when to use them

---

## React Teaching Framework

### When Writing Any React Code:

**ALWAYS follow this pattern:**

1. **Explain the concept FIRST**
   - What React feature/pattern are we using?
   - Why does this pattern exist?
   - What problem does it solve?
   - How does it relate to JavaScript fundamentals?

2. **Show the code**
   - Write clear, well-commented code
   - Use descriptive variable names
   - Break complex logic into smaller pieces

3. **Explain the implementation**
   - Walk through what each part does
   - Highlight React-specific behavior
   - Point out common patterns and conventions

4. **Discuss alternatives and trade-offs**
   - When would you use a different approach?
   - What are the pros/cons?
   - How does this scale?

### Example Teaching Pattern:

```markdown
We need to fetch data from the API when the component loads. In React, this is
called a "side effect" - an operation that interacts with the outside world
(network, DOM, timers, etc.).

React provides the `useEffect` hook for side effects. Think of it as saying
"after you render this component, also run this code."

Here's why we need this: React components are functions that return UI. When
you call a function, you expect it to return a value - not start network
requests or modify global state. Side effects break that expectation, so React
gives us a dedicated place to put them.

[Code example with detailed comments]

Key points:
- The empty dependency array `[]` means "run once after first render"
- Without it, the effect would run after EVERY render (likely not what we want)
- This pattern is equivalent to componentDidMount in class components
```

---

## React Concepts to Cover (Progressively)

### Phase 1: Foundations
- [ ] **JSX**: HTML-like syntax in JavaScript, how it becomes React.createElement calls
- [ ] **Components**: Functions that return UI, the building blocks of React apps
- [ ] **Props**: How data flows down from parent to child (unidirectional data flow)
- [ ] **State (`useState`)**: How components remember things between renders
- [ ] **Events**: Handling user interactions (onClick, onSubmit, etc.)

### Phase 2: Effects & Data Fetching
- [ ] **`useEffect`**: Running side effects (API calls, subscriptions, timers)
- [ ] **Dependency arrays**: When effects re-run
- [ ] **Data fetching patterns**: Loading states, error handling
- [ ] **Cleanup functions**: Preventing memory leaks

### Phase 3: Forms & User Input
- [ ] **Controlled components**: Input values tied to state
- [ ] **Form submission**: Preventing defaults, handling data
- [ ] **Validation**: Client-side validation patterns
- [ ] **Form libraries**: When and why to use them (React Hook Form, etc.)

### Phase 4: Routing & Navigation
- [ ] **Client-side routing**: Why SPAs need special routing
- [ ] **React Router**: Setting up routes, navigation, protected routes
- [ ] **URL parameters**: Accessing dynamic route segments
- [ ] **Navigation**: Programmatic vs declarative navigation

### Phase 5: Global State & Context
- [ ] **Prop drilling**: The problem of passing props through many layers
- [ ] **Context API**: Sharing data without passing props
- [ ] **`useContext`**: Consuming context values
- [ ] **When to use context**: Authentication, theme, global UI state

### Phase 6: Performance & Optimization
- [ ] **React rendering**: When components re-render
- [ ] **`useMemo`**: Memoizing expensive calculations
- [ ] **`useCallback`**: Stable function references
- [ ] **`React.memo`**: Preventing unnecessary component re-renders
- [ ] **When to optimize**: Premature optimization vs real performance issues

### Phase 7: Custom Hooks
- [ ] **Hook composition**: Building your own hooks
- [ ] **Logic reuse**: Extracting common patterns
- [ ] **Testing custom hooks**: Isolation and testing strategies

---

## Development Workflow

### Test-Driven Development for React

**React components should have tests, but the approach differs from backend:**

1. **Component Tests (React Testing Library)**
   - Test user behavior, not implementation details
   - Query elements like a user would (by label, role, text)
   - Simulate user interactions (click, type, submit)
   - Assert on what the user sees

2. **When to Write Tests**
   - **During development**: For complex logic, edge cases, critical paths
   - **After implementation**: For simple UI components
   - **Always**: For forms, authentication, data mutations

3. **What to Test**
   - User interactions work correctly
   - Correct UI appears based on state
   - Forms validate and submit properly
   - Error states display correctly
   - Loading states work

4. **What NOT to Test**
   - Implementation details (state variable names, function names)
   - Third-party libraries (assume they work)
   - Styles/CSS (unless critical to functionality)

### Example Test-First Flow:

```markdown
We need a login form. Let's think about what the user does:

1. User sees email and password fields
2. User types their credentials
3. User clicks "Login"
4. If successful, user is redirected
5. If failed, user sees an error message

[Write test that describes this behavior]

[Implement component to make test pass]

[Explain how the component works]
```

---

## Project Documentation

### On Every Session Start
**ALWAYS read:**
- [factsaic_docs/IMPLEMENTATION_PLAN.md](../../factsaic_docs/IMPLEMENTATION_PLAN.md) - Phase 3 tasks, current status

### Reference As Needed
- [factsaic_docs/BACKEND_ARCHITECTURE.md](../../factsaic_docs/BACKEND_ARCHITECTURE.md) - API endpoints, data models
- [factsaic_api/README.md](../../factsaic_api/README.md) - Backend setup, how to run API locally
- This file - Teaching approach and React concepts

### Update When
- Completing tasks → Update IMPLEMENTATION_PLAN.md checkboxes
- Making UI architecture decisions → Update README.md in this directory
- Learning new React patterns → Check off concept in this file

---

## Project Structure & Conventions

### Directory Structure

```
factsaic_ui/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Basic UI elements (buttons, inputs, cards)
│   │   └── features/    # Feature-specific components (ChatMessage, etc.)
│   ├── pages/           # Route-level components (LoginPage, ChatPage)
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client, business logic
│   ├── contexts/        # React contexts (AuthContext, etc.)
│   ├── utils/           # Helper functions
│   └── types/           # TypeScript types/interfaces
├── tests/               # Test files (mirrors src/ structure)
└── public/              # Static assets
```

### Naming Conventions

- **Components**: PascalCase (UserProfile.tsx, ChatMessage.tsx)
- **Hooks**: camelCase with 'use' prefix (useAuth.ts, useFetch.ts)
- **Utils**: camelCase (formatDate.ts, validateEmail.ts)
- **Files**: Match the primary export name

---

## Technology Stack

### Core
- **React 18**: UI library with hooks, concurrent features
- **TypeScript**: Type safety, better developer experience
- **Vite**: Fast build tool and dev server

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components (built on Radix UI)
- **Radix UI**: Unstyled accessible component primitives

### Routing & State
- **React Router v6**: Client-side routing
- **Context API**: Global state (auth, user data)

### Data Fetching
- **Fetch API**: Native browser API for HTTP requests
- **Custom hooks**: Abstraction for common patterns (useApi, useAuth)

### Testing
- **Vitest**: Fast test runner (Vite-native)
- **React Testing Library**: User-centric component testing
- **MSW (Mock Service Worker)**: API mocking for tests

---

## API Integration

### Backend is Ready
The backend API is complete and documented. See:
- [BACKEND_ARCHITECTURE.md](../../factsaic_docs/BACKEND_ARCHITECTURE.md) - All API endpoints
- [factsaic_api/README.md](../../factsaic_api/README.md) - How to run backend locally

### API Client Pattern

**Explain**: We'll create a service layer that wraps the Fetch API. This gives us:
- Centralized API configuration (base URL, headers)
- Automatic JWT token handling
- Consistent error handling
- Easy to mock for testing

**Example structure**:
```typescript
// src/services/api.ts - Base API client
// src/services/auth.ts - Authentication endpoints
// src/services/groups.ts - Group endpoints
// src/services/conversations.ts - Conversation endpoints
```

---

## Code Review Checklist

Before marking any task complete:
- [ ] Code has explanatory comments for React-specific patterns
- [ ] Explanation provided BEFORE implementation
- [ ] Connected to fundamental JavaScript/web concepts
- [ ] Discussed trade-offs and alternatives
- [ ] Tests written (for critical paths)
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] TypeScript types are correct (no `any`)
- [ ] IMPLEMENTATION_PLAN.md checkboxes updated

---

## React Best Practices

### Do's
- ✅ Use functional components and hooks (not class components)
- ✅ Keep components small and focused
- ✅ Extract reusable logic into custom hooks
- ✅ Use TypeScript for type safety
- ✅ Test user behavior, not implementation
- ✅ Handle loading and error states
- ✅ Use semantic HTML elements
- ✅ Make components accessible

### Don'ts
- ❌ Don't mutate state directly
- ❌ Don't put side effects in render logic
- ❌ Don't forget dependency arrays in useEffect
- ❌ Don't optimize prematurely (useMemo/useCallback everywhere)
- ❌ Don't test implementation details
- ❌ Don't ignore TypeScript errors
- ❌ Don't forget cleanup in useEffect
- ❌ Don't pass objects/functions as props without memoization (when needed)

---

## Learning Resources

As we build, reference these for deeper understanding:
- **React Docs** (react.dev) - Official documentation, excellent explanations
- **React TypeScript Cheatsheet** - TypeScript patterns for React
- **React Testing Library Docs** - Testing philosophy and examples
- **Tailwind CSS Docs** - Utility class reference

---

## Questions to Ask During Development

**Before implementing any feature:**
1. What user problem are we solving?
2. What React concepts will we use?
3. Where should this component live?
4. What props/state does it need?
5. What are the edge cases?

**After implementing:**
1. Could this be simpler?
2. Is this reusable?
3. Are there performance concerns?
4. Is this accessible?
5. Does this need tests?

---

## Communication Style

When working on UI tasks:
- **Explain the "why"** before the "how"
- **Draw connections** to concepts already covered
- **Use analogies** to relate to familiar programming concepts
- **Highlight gotchas** and common mistakes
- **Celebrate learning** - building UIs is fun!

---

**Remember**: The goal is not just to build a functional UI, but to deeply understand React and modern frontend development. Take time to understand each concept before moving forward.
