# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

This social networking platform connects people through small, curated micro-events (5-10 attendees) using AI-driven matchmaking. It emphasizes psychological safety, inclusivity, and meaningful connections through a warm, approachable design. The core purpose is to help users build local communities by matching them with events and people aligned with their social vibe, interests, and energy levels.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Frameworks:** React 18 with TypeScript, Vite, Wouter for routing.
- **UI/Styling:** Radix UI primitives, shadcn/ui (New York style), Tailwind CSS with custom design tokens. Design emphasizes warmth, accessibility, and a mobile-first approach.
- **State Management:** TanStack Query for server state, React hooks for UI state.
- **Design Principles:** Mobile-first responsive design, dark mode, warm color palette (purple-centric), custom 8-tag vibe taxonomy (Chill, Playful, High-Energy, Curious, Cozy, Adventurous, Social, Creative). Bilingual support (Chinese primary, English secondary).
- **Key UI Patterns:** Bottom navigation, event cards with visual vibe encoding, two-part match scoring ("My Fit" + "Group Spark") with transparent explanations, personality radar charts, and social role cards.

### Backend Architecture
- **Runtime:** Node.js with Express.js, TypeScript.
- **API Design:** RESTful API, Express middleware for JSON and logging.
- **Development vs. Production:** Vite dev server in middleware mode for development; Express serves pre-built static assets in production.

### Data Storage Solutions
- **Current:** In-memory storage (MemStorage) for prototyping, with an abstract storage interface.
- **Planned:** PostgreSQL (Neon serverless) with Drizzle ORM for type-safe operations.
- **Schema (Planned):** Users, Events, Matching Algorithm data, Feedback/Ratings. Shared schema pattern (`shared/schema.ts`) for type safety across client/server.
- **Migrations:** Drizzle Kit.

### Authentication & Authorization
- **Current:** Basic user schema (username/password).
- **Planned:** Session-based authentication with `connect-pg-simple`.
- **Security:** Future plans include real identity verification, community guidelines, and host escalation protocols.

### Notable Architectural Decisions
- **Shared Schema Pattern:** Facilitates type safety and code reuse between client and server.
- **Storage Abstraction:** Allows flexible database integration.
- **Vite Middleware Mode:** Streamlines development with HMR.
- **Component-First Architecture:** Ensures modular and testable UI components.
- **Mobile-First, Bilingual Design:** Caters to target market and use cases.
- **Explainable Matching:** Builds user trust through transparent matching logic.
- **Personality Assessment System:** Implements a 10-question test, scoring engine with 8 social roles, and a PersonalityRadarChart for visualization.

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem:** `react`, `react-dom`, `@tanstack/react-query`.
- **Routing:** `wouter`.
- **Build Tools:** `vite`, `@vitejs/plugin-react`, `esbuild`.

### UI Component Libraries
- **Radix UI:** `@radix-ui/react-*` for accessible primitives.
- **Styling:** `tailwindcss`, `autoprefixer`, `postcss`, `class-variance-authority`, `clsx`, `tailwind-merge`.
- **Icons:** `lucide-react`.

### Database & ORM
- **Database:** `@neondatabase/serverless` (PostgreSQL).
- **ORM:** `drizzle-orm`, `drizzle-kit`.
- **Validation:** `drizzle-zod`, `zod`.

### Development Tools
- **TypeScript:** Full stack.
- **Replit Integration:** `@replit/vite-plugin-*`.
- **Runtime:** `tsx` for Node.js.

### Form Handling
- **React Hook Form:** `@hookform/resolvers`.

### Date/Time Utilities
- `date-fns`.

### Fonts & Typography
- Google Fonts: Inter, Outfit.

### Third-Party Services (Planned)
- **AI/ML Matching Engine:** User embedding generation, constraint-based optimization for groups, explainability module.
- **Payment Processing:** For ticketing and subscriptions.
- **Venue & Location Services:** Geolocation, venue safety verification.
- **Notifications & Communication:** Real-time updates, feedback collection.