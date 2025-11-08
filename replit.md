# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

JoyJoin (悦聚·Joy) is a social networking platform designed to connect individuals locally through small, curated micro-events (5-10 attendees). It leverages AI to match users based on interests, personality, and social compatibility, prioritizing psychological safety and inclusivity. Targeted at the Hong Kong/Shenzhen market, the platform aims to foster meaningful connections and build strong local communities with a warm, approachable design. Key capabilities include AI-powered matching for both events and people, a comprehensive feedback system for continuous algorithm refinement, and streamlined event management. The project also includes a robust Admin Portal for managing users, subscriptions, events, and analyzing platform data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Frameworks:** React 18 with TypeScript, Vite, Wouter for routing.
- **UI/Styling:** Radix UI primitives, shadcn/ui (New York style), Tailwind CSS with custom design tokens. Emphasizes warmth, accessibility, and mobile-first design.
- **State Management:** TanStack Query for server state, React hooks for UI state.
- **Design Principles:** Mobile-first responsive design, dark mode, purple-centric warm color palette, bilingual support (Chinese primary, English secondary).
- **Key UI Patterns:** Bottom navigation, event cards, two-part match scoring, personality radar charts, social role cards, progressive disclosure for information.
- **Technical Implementations:** Unified page-based profile editing, consistent UI patterns for choice-based questions, enhanced participant information displays, and localized features.

### Backend Architecture
- **Runtime:** Node.js with Express.js, TypeScript.
- **API Design:** RESTful API with Express middleware.
- **Development vs. Production:** Vite dev server in middleware mode for development; Express serves pre-built static assets in production.

### Data Storage Solutions
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM.
- **Schema:** Users, Events, Matching Algorithm data, Feedback/Ratings, and new tables for Admin Portal (venues, eventTemplates, subscriptions, payments, coupons, couponUsage, venueBookings, reports, moderationLogs). Utilizes a shared schema pattern for client/server type safety.
- **Migrations:** Drizzle Kit.

### Authentication & Authorization
- **User Authentication:** Phone number + SMS verification with auto-account creation (Chinese localized). WeChat OAuth integration is a placeholder.
- **Session Management:** `express-session` with PostgreSQL storage (`connect-pg-simple`).
- **Admin Authorization:** `isAdmin` flag in the users table for Admin Portal access.

### System Features & Design Decisions
- **AI-Driven Matchmaking:** Utilizes AI for event and people matching, considering various factors like topics, personality, communication style, group dynamics, and user intent. Features explainability through connection points and a deep feedback system.
- **Two-Tier Feedback Architecture:** Basic and optional anonymous deep feedback to refine the matching algorithm.
- **Event Management:** Detailed event pages with clear states and enhanced attendee cards.
- **Gamified Personality Assessment:** A 10-question test leading to a social role archetype reveal with a PersonalityRadarChart visualization and chemistry predictions. Includes performance optimizations and rich animations.
- **Streamlined Onboarding:** Multi-step registration process covering identity, background, intent, culture, safety, interests, personality test, and profile setup.
- **Shared Schema Pattern:** Ensures type safety and code reuse.
- **Component-First Architecture:** Promotes modular and testable UI.
- **Explainable Matching:** Transparent matching logic to build user trust.
- **Chat Interface:** Tabbed interface for group and direct messages, with event-specific participant displays.
- **Admin Portal:** Desktop-first design providing comprehensive management for users, subscriptions, coupons, venues, event templates, events, finance, moderation, and insights. Includes real-time statistics and analytics.
- **Comprehensive Error Handling:** All admin portal pages include proper error states with retry functionality, preventing infinite loading spinners. AdminGuard displays helpful messages for authentication and authorization failures. Error messages are localized in Chinese with clear action buttons.

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem:** `react`, `react-dom`, `@tanstack/react-query`.
- **Routing:** `wouter`.
- **Build Tools:** `vite`.

### UI Component Libraries
- **Radix UI:** `@radix-ui/react-*`.
- **Styling:** `tailwindcss`, `autoprefixer`, `postcss`, `class-variance-authority`, `clsx`, `tailwind-merge`.
- **Icons:** `lucide-react`.

### Database & ORM
- **Database:** `@neondatabase/serverless` (PostgreSQL).
- **ORM:** `drizzle-orm`, `drizzle-kit`.
- **Validation:** `drizzle-zod`, `zod`.

### Authentication Libraries
- `express-session`, `connect-pg-simple`.

### Development Tools
- **TypeScript**.
- **Replit Integration:** `@replit/vite-plugin-*`.
- **Runtime:** `tsx` for Node.js.

### Form Handling
- **React Hook Form:** `@hookform/resolvers`.

### Date/Time Utilities
- `date-fns`.

### Fonts & Typography
- Google Fonts: Inter, Outfit.