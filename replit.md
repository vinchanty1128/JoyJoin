# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

This social networking platform connects people through small, curated micro-events (5-10 attendees) using AI-driven matchmaking. It emphasizes psychological safety, inclusivity, and meaningful connections through a warm, approachable design. The core purpose is to help users build local communities by matching them with events and people aligned with their social vibe, interests, and energy levels.

## Recent Changes

### October 28, 2025 - Events Page Navigation & Attendee Card Enhancements

#### Events Page Segmented Control
- **New Navigation UI:** Added large segmented control (tabs) at the top of Events page for easy state filtering
- **Three Clear Categories:**
  - "匹配中" (Matching) - Shows pending_match events
  - "已匹配" (Matched) - Shows successfully matched events  
  - "已完成" (Completed) - Shows completed events
- **Visual Design:**
  - Full-width tabs with equal column grid (grid-cols-3)
  - Large height (h-12) for easy mobile tapping
  - Active tab features white background with shadow
  - Event counts displayed in parentheses on each tab
- **Empty States:** Each tab shows unique empty state with appropriate icon and helpful message
- **Text Improvements:** Changed "已邀请X位（Y位已加入）" to clearer format:
  - With joined users: "已邀请X人 · Y人已加入" (joined count in primary color)
  - No joined users: "已邀请X人 · 尚未加入" (in muted color)

#### Attendee Card UX Enhancement
- **Information Categorization:** Separated "个人兴趣" (Personal Interests) and "我们之间的契合点" (Connection Points) into distinct sections on card back
- **Visual Differentiation:** 
  - Personal interest badges use neutral/lighter colors (`bg-accent/30`)
  - Connection prediction badges use primary color styling (`bg-primary/10 text-primary border-primary/30`)
  - Each section has a clear label for improved scanability
- **Content Quality:** All interest tags now display in Chinese (e.g., "电影娱乐", "旅行探索") using `normalizeInterestName()` function
- **Card Dimensions:** Increased card height from 280px to 320px for better content visibility
- **Layout Optimization:** Moved spark predictions from front to back for better visual balance

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
- **Information Categorization in Attendee Cards:** Clearly separates "personal interests" from "connection predictions" with distinct visual styles and section labels for better UX clarity.

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