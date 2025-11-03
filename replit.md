# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

JoyJoin (悦聚·Joy) is a social networking platform that facilitates local connections through small, curated micro-events (5-10 attendees). It uses AI to match individuals based on interests, personality, and social compatibility, with a focus on psychological safety and inclusivity. The platform is localized for the Hong Kong/Shenzhen market, offering a warm, approachable design and aiming to build communities. Key features include AI-powered matching for events and people, a comprehensive feedback system for algorithm refinement, and streamlined event management. The project aims to foster meaningful connections and build strong local communities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Frameworks:** React 18 with TypeScript, Vite, Wouter for routing.
- **UI/Styling:** Radix UI primitives, shadcn/ui (New York style), Tailwind CSS with custom design tokens. Emphasizes warmth, accessibility, and mobile-first design.
- **State Management:** TanStack Query for server state, React hooks for UI state.
- **Design Principles:** Mobile-first responsive design, dark mode, purple-centric warm color palette. Bilingual support (Chinese primary, English secondary).
- **Key UI Patterns:** Bottom navigation, event cards, two-part match scoring, personality radar charts, social role cards, and clear information categorization on attendee cards.
- **Technical Implementations:** Implemented progressive disclosure for profile editing with dedicated edit pages for basic info, education, work, personal details, and interests. Unified profile editing is now page-based, replacing previous dialogs. Private chat lists feature expandable user profiles for progressive information disclosure. Participant information displays are enhanced with full Chinese localization and archetype icons.

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
- **Current (Chinese Localized):** Phone number + SMS verification with auto-account creation. WeChat OAuth integration is a placeholder. Session management uses `express-session` with PostgreSQL storage (`connect-pg-simple`).

### System Features & Design Decisions
- **AI-Driven Matchmaking:** Uses AI for event and people matching with explainability through connection points and a deep feedback system. Algorithms consider topics, debate comfort, life stage, language, communication style, group role composition, diversity balance (60% similarity / 40% difference), user intent, anti-repetition, and demographic data.
- **Two-Tier Feedback Architecture:** Basic 4-step feedback flow followed by an optional, anonymous deep feedback system (3 modules) to calibrate the matching algorithm and capture evolving user preferences.
- **Event Management:** Detailed event pages with reordered sections, clear navigation for event states ("匹配中", "已匹配", "已完成"), and enhanced attendee cards. Event cards visually distinguish between locked and unlocked states.
- **Personality Assessment System:** 10-question test, scoring engine with 14 social role archetypes, and a PersonalityRadarChart for visualization.
- **Streamlined Onboarding:** Registration → Interests/Topics → Personality Test → Profile Setup → Discover.
- **Shared Schema Pattern:** Ensures type safety and code reuse across client and server.
- **Component-First Architecture:** Promotes modular and testable UI components.
- **Mobile-First, Bilingual Design:** Caters to the target market and user experience.
- **Explainable Matching:** Builds user trust through transparent matching logic and visual cues.
- **Chat Interface:** Tabbed interface for "群聊" (Group Chats) and "私聊" (Direct Messages). Event chat pages include a horizontal participant badge bar with clickable badges for details. Feedback functionality consolidated out of the chat window.

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem:** `react`, `react-dom`, `@tanstack/react-query`.
- **Routing:** `wouter`.
- **Build Tools:** `vite`.

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