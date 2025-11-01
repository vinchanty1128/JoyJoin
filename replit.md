# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

This social networking platform, JoyJoin (悦聚·Joy), aims to connect individuals through small, curated micro-events (5-10 attendees) using AI-driven matchmaking. It focuses on fostering psychological safety, inclusivity, and meaningful local connections. The platform's core purpose is to help users build communities by matching them with events and people based on their interests, personality archetypes, and social compatibility, all presented through a warm and approachable design. The platform targets the Hong Kong/Shenzhen market, emphasizing Chinese-localized authentication and user experience.

## Recent Changes (November 1, 2025)

**Vibe Tags System Removal:** Simplified the codebase by completely removing the decorative vibe tags system (Chill, Playful, High-Energy, etc.) which was not used in the matching algorithm. Changes include:
- Removed `vibes` field from users and events tables in the database schema
- Removed `vibeGradient` field from events table
- Deleted vibe UI components: VibeChip.tsx, VibePill.tsx, VibeProfileCard.tsx
- Deleted vibe configuration library: client/src/lib/vibes.ts
- Updated ParticipantAvatars to use generic User icons instead of vibe-based colors
- Simplified ProfileSetupPage to only collect displayName (removed vibe selection)
- Updated all event cards and pages to remove vibe tag displays
- Updated design_guidelines.md to reflect simplified design

**Note:** The matching algorithm continues to use interests, personality archetypes (14 social roles), and industries for AI-driven event and people matching.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Frameworks:** React 18 with TypeScript, Vite, Wouter for routing.
- **UI/Styling:** Radix UI primitives, shadcn/ui (New York style), Tailwind CSS with custom design tokens. Emphasizes warmth, accessibility, and mobile-first design.
- **State Management:** TanStack Query for server state, React hooks for UI state.
- **Design Principles:** Mobile-first responsive design, dark mode, purple-centric warm color palette. Bilingual support (Chinese primary, English secondary).
- **Key UI Patterns:** Bottom navigation, event cards, two-part match scoring ("My Fit" + "Group Spark") with transparent explanations, personality radar charts, social role cards, and clear information categorization on attendee cards.

### Backend Architecture
- **Runtime:** Node.js with Express.js, TypeScript.
- **API Design:** RESTful API, Express middleware for JSON and logging.
- **Development vs. Production:** Vite dev server in middleware mode for development; Express serves pre-built static assets in production.

### Data Storage Solutions
- **Current:** In-memory storage (MemStorage) for prototyping.
- **Planned:** PostgreSQL (Neon serverless) with Drizzle ORM for type-safe operations.
- **Schema:** Users, Events, Matching Algorithm data, Feedback/Ratings. Utilizes a shared schema pattern (`shared/schema.ts`) for client/server type safety.
- **Migrations:** Drizzle Kit.

### Authentication & Authorization
- **Current (Chinese Localized):** Phone number + SMS verification with auto-account creation. WeChat OAuth integration is a placeholder for future implementation. Session management uses `express-session` with PostgreSQL storage (`connect-pg-simple`).
- **Security:** Future plans include real identity verification, community guidelines, and host escalation protocols.

### System Features & Design Decisions
- **AI-Driven Matchmaking:** Uses AI for event and people matching, with an emphasis on explainability through connection points and a deep feedback system.
- **Two-Tier Feedback Architecture:** Implements a basic 4-step feedback flow followed by an optional, anonymous deep feedback system (3 modules) to calibrate the matching algorithm, evaluate conversation dynamics, and capture evolving user preferences.
- **Event Management:** Features detailed event pages with reordered sections for improved UX, clear navigation for event states ("匹配中", "已匹配", "已完成"), and enhanced attendee cards.
- **Personality Assessment System:** Includes a 10-question test, scoring engine with 14 social role archetypes (8 core + 2 demo-specific + 4 legacy), and a PersonalityRadarChart for visualization. Voice quiz flow has been disabled; all users complete the standard written personality test.
- **Streamlined Onboarding:** Registration → Interests/Topics → Personality Test (10 questions) → Profile Setup → Discover. Voice quiz option has been removed from the user journey.
- **Shared Schema Pattern:** Ensures type safety and code reuse across client and server.
- **Vite Middleware Mode:** Streamlines development with Hot Module Replacement (HMR).
- **Component-First Architecture:** Promotes modular and testable UI components.
- **Mobile-First, Bilingual Design:** Caters to the target market and user experience.
- **Explainable Matching:** Builds user trust through transparent matching logic and visual cues.

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

### Authentication Libraries
- `express-session`, `connect-pg-simple`.

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