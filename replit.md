# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

JoyJoin (悦聚·Joy) is a social networking platform designed to foster meaningful local connections through small, curated micro-events (5-10 attendees). It leverages AI-driven matchmaking to connect individuals based on interests, personality archetypes, and social compatibility, prioritizing psychological safety and inclusivity. The platform targets the Hong Kong/Shenzhen market with a localized Chinese user experience, aiming to build communities and provide a warm, approachable design. Key capabilities include AI-powered event and people matching, a comprehensive feedback system for algorithm calibration, and a streamlined event management process.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### November 2, 2025

**SelectConnectionsStep Enhancement - Rich Participant Information Display:** Upgraded the participant selection interface to display comprehensive user information with localized Chinese text. Changes include:
- **Left Avatar**: Colored circle displaying archetype icon (🙌🧭📖⚡🤝🎯🎭🌟) instead of letter initials, using archetype-specific background colors
- **Archetype Display**: Badge showing archetype name in Chinese without icon prefix (e.g., "连接者", "探索者")
- **Information Chips**: Compact rounded chips displaying:
  - Gender + Age: Combined format "女 · 25岁" / "男 · 28岁"
  - Education: Localized levels "本科", "硕士", "博士"
  - Industry: Direct display
  - Relationship Status: Shows "单身" only if single
- **Chinese Localization**: Created userFieldMappings.ts with complete mappings for gender (Woman→女), education (Bachelor's→本科), relationship status (Single→单身), and age formatting
- **Shared Archetype Config**: Extracted archetypeConfig to lib/archetypes.ts for reuse across components
- **Data Flow**: Updated EventFeedbackFlow to pass complete user data (8 fields) instead of just 3 fields
- **Backend Verification**: Confirmed matchedAttendees includes all required fields in demo data
- Improved visual hierarchy and information density while maintaining clean, readable layout

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
- **AI-Driven Matchmaking:** Uses AI for event and people matching, with an emphasis on explainability through connection points and a deep feedback system. This includes advanced algorithms considering topics, debate comfort, life stage, language, communication style, group role composition, diversity balance (60% similarity / 40% difference), user intent, and anti-repetition scoring. Demographic data (gender, family status, overseas regions, hometown) is also integrated for richer connection points.
- **Two-Tier Feedback Architecture:** Implements a basic 4-step feedback flow followed by an optional, anonymous deep feedback system (3 modules) to calibrate the matching algorithm, evaluate conversation dynamics, and capture evolving user preferences.
- **Event Management:** Features detailed event pages with reordered sections for improved UX, clear navigation for event states ("匹配中", "已匹配", "已完成"), and enhanced attendee cards. Event cards visually distinguish between locked (muted, countdown) and unlocked (primary purple, "聊天已开放") states.
- **Personality Assessment System:** Includes a 10-question test, scoring engine with 14 social role archetypes (8 core + 2 demo-specific + 4 legacy), and a PersonalityRadarChart for visualization. Voice quiz flow has been disabled; all users complete the standard written personality test.
- **Streamlined Onboarding:** Registration → Interests/Topics → Personality Test (10 questions) → Profile Setup → Discover.
- **Shared Schema Pattern:** Ensures type safety and code reuse across client and server.
- **Vite Middleware Mode:** Streamlines development with Hot Module Replacement (HMR).
- **Component-First Architecture:** Promotes modular and testable UI components.
- **Mobile-First, Bilingual Design:** Caters to the target market and user experience.
- **Explainable Matching:** Builds user trust through transparent matching logic and visual cues.
- **Chat Interface:** Features a tabbed interface for "群聊" (Group Chats) and "私聊" (Direct Messages). Event chat pages include a horizontal participant badge bar displaying archetype icons, with clickable badges to view participant details. Feedback functionality has been consolidated out of the chat window into a unified `EventFeedbackFlow`.

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