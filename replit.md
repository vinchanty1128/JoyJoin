# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

This is a social networking platform designed to connect people through small, curated events (5-10 attendees). The application uses AI-driven matchmaking to help users find events and people that align with their social vibe, interests, and energy levels. The platform emphasizes psychological safety, inclusivity, and meaningful connections through a warm, approachable design.

**Core Value Proposition:** Help people build local communities through intimate, well-matched micro-events that feel safe, welcoming, and energizing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type safety and modern React patterns
- Vite for fast development builds and HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing

**UI Component Strategy:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component system (New York style) for consistent design language
- Tailwind CSS for utility-first styling with custom design tokens
- Design system emphasizes warmth and belonging over sterility

**State Management:**
- TanStack Query (React Query) for server state management and caching
- Local component state with React hooks for UI state
- Query client configured with infinite stale time for optimistic UX

**Design Principles:**
- Mobile-first responsive design (primary breakpoint at 768px)
- Dark mode support with theme toggle
- Warm color palette centered on purple (280 45% 55%) for trust and community
- Custom vibe taxonomy with 8 canonical tags (Chill, Playful, High-Energy, Curious, Cozy, Adventurous, Social, Creative)
- Bilingual support (Chinese primary, English secondary) in branding

**Key UI Patterns:**
- Bottom navigation for mobile-first experience
- Event cards with visual vibe encoding through gradients and emoji
- Two-part match scoring system: "My Fit" (personal match) + "Group Spark" (predicted group chemistry)
- Transparent match explanations with human-readable reasoning chips

### Backend Architecture

**Runtime & Server:**
- Node.js with Express.js for HTTP server
- TypeScript throughout for type safety
- ESM (ES Modules) for modern JavaScript module system

**API Design:**
- RESTful API structure with `/api` prefix for all routes
- Express middleware for JSON parsing and request logging
- In-memory storage interface (IStorage) for development, designed for easy swap to database
- Session-based authentication pattern (infrastructure present but not fully implemented)

**Development vs Production:**
- Development: Vite dev server with middleware mode for HMR
- Production: Pre-built static assets served from Express
- Conditional Replit plugins for cartographer and dev banner in development

### Data Storage Solutions

**Current Implementation:**
- In-memory storage (MemStorage class) for prototyping
- Storage interface abstraction allows swapping implementations without changing application logic

**Planned Database Architecture:**
- PostgreSQL as primary database (Neon serverless)
- Drizzle ORM for type-safe database operations
- Schema defined in `shared/schema.ts` for code sharing between client/server

**Database Schema (Planned):**
- Users table with UUID primary keys, username/password authentication
- Event tables (not yet implemented) would store micro-events, attendees, vibes
- Matching algorithm data structures for storing user embeddings and preferences
- Feedback/rating tables for continuous learning loop

**Migration Strategy:**
- Drizzle Kit for schema migrations (`npm run db:push`)
- Migrations output to `/migrations` directory

### Authentication & Authorization

**Current State:**
- Basic user schema defined with username/password fields
- Session storage planned with connect-pg-simple for PostgreSQL-backed sessions
- User CRUD operations scaffolded in storage interface

**Security Considerations:**
- Real identity verification mentioned in requirements (not yet implemented)
- Community guidelines and report/ban pipeline planned
- Host escalation protocols for event safety

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem:** react, react-dom, @tanstack/react-query for frontend framework
- **Routing:** wouter for lightweight client-side routing
- **Build Tools:** vite, @vitejs/plugin-react, esbuild for development and production builds

### UI Component Libraries
- **Radix UI:** Complete suite (@radix-ui/react-*) for accessible primitives including dialog, dropdown, tooltip, accordion, etc.
- **Styling:** tailwindcss, autoprefixer, postcss for utility-first CSS
- **Icons:** lucide-react for consistent icon set
- **Utilities:** class-variance-authority, clsx, tailwind-merge for conditional styling

### Database & ORM
- **Database:** @neondatabase/serverless for serverless PostgreSQL
- **ORM:** drizzle-orm for type-safe queries, drizzle-kit for migrations
- **Validation:** drizzle-zod, zod for schema validation and type inference

### Development Tools
- **TypeScript:** Full TypeScript support across frontend and backend
- **Replit Integration:** @replit/vite-plugin-* for development experience on Replit platform
- **Runtime:** tsx for running TypeScript in Node.js

### Form Handling
- **React Hook Form:** @hookform/resolvers for form validation integration
- **Validation:** zod schemas for runtime validation

### Date/Time Utilities
- **date-fns:** For date formatting and manipulation throughout the application

### Fonts & Typography
- **Google Fonts:** Inter (body text, UI elements), Outfit (headings, display text)

### Third-Party Services (Planned)

**AI/ML Matching Engine:**
- User embedding generation from questionnaire responses
- Constraint-based optimization for group composition
- Explainability module for generating match reasons
- Not yet implemented - would require ML service integration

**Payment Processing:**
- Per-event ticketing and monthly subscriptions mentioned
- No payment provider integrated yet

**Venue & Location Services:**
- Geolocation for proximity matching
- Venue safety verification system (planned)

**Notifications & Communication:**
- Real-time updates for group composition changes
- Post-event feedback collection
- Not yet implemented

### Notable Architectural Decisions

1. **Shared Schema Pattern:** TypeScript types and Zod schemas in `/shared` directory allow code reuse between client and server, reducing duplication and ensuring type safety across the full stack.

2. **Storage Abstraction:** IStorage interface allows developing with in-memory storage while designing for PostgreSQL, making it easy to swap implementations later without refactoring application logic.

3. **Vite Middleware Mode:** In development, Vite runs as Express middleware enabling HMR while maintaining single-server simplicity. In production, Express serves pre-built assets.

4. **Component-First Architecture:** UI components are self-contained with co-located examples, making the design system discoverable and testable.

5. **Mobile-First, Bilingual Design:** Bottom navigation, touch-friendly interactions, and Chinese/English branding reflect the target market and use cases.

6. **Explainable Matching:** Two-part scoring (My Fit + Group Spark) with transparent reasoning addresses trust and helps users understand why they're matched with specific events.