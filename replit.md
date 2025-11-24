# Local Micro-Events Social Network (JoyJoin)

## Overview

JoyJoin (悦聚·Joy) is a social networking platform designed to connect individuals locally through small, curated micro-events (5-10 attendees). The platform leverages AI for intelligent user matching based on interests, personality, and social compatibility, with a strong emphasis on psychological safety and inclusivity. Primarily targeting the Hong Kong/Shenzhen market, JoyJoin aims to foster meaningful local connections and build community. Key capabilities include AI-powered matching for events and people, a comprehensive feedback system for continuous algorithm refinement, streamlined event management, and a robust Admin Portal for platform oversight and analytics. A core innovation is the 12-Archetype Animal Social Vibe System, which categorizes user social energy and personality for sophisticated group dynamics and chemistry matching.

## Recent Changes

### November 24, 2025 - Archetype Rich Content Enhancement
- **Extended Archetype System:** Added 5 new rich content fields to all 12 animal archetypes:
  - `nickname`: Vivid Chinese nickname (e.g., "摇尾点火官")
  - `tagline`: One-line positioning statement (e.g., "瞬间破冰的气氛点火手")
  - `epicDescription`: Detailed paragraph describing the role's essence
  - `styleQuote`: Unique style quote with quotation formatting
  - `coreContributions`: Key contribution statement (e.g., "破冰启动，创造欢乐氛围")
- **UI Enhancements:**
  - Updated PersonalityTestResultPage Hero section to display nickname and tagline instead of simple description
  - Added new "角色深度解读" (Role Details) card showing epicDescription, styleQuote, and coreContributions
  - Updated SocialRoleCard component to display nickname and tagline for richer information display
- **Design Improvements:** Implemented quote-style formatting for styleQuote with gradient backgrounds and icon, target icon for core contributions, and improved visual hierarchy

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Frameworks:** React 18 with TypeScript, Vite, Wouter for routing.
- **UI/Styling:** Radix UI primitives, shadcn/ui (New York style), Tailwind CSS. The design is mobile-first, supports dark mode, uses a purple-centric warm color palette, and is bilingual (Chinese/English).
- **State Management:** TanStack Query for server state.
- **Key UI Patterns:** Bottom navigation, event cards, two-part match scoring, personality radar charts, social role cards, progressive disclosure.
- **Design Principles:** Emphasizes warmth, accessibility, and responsive design.

### Backend
- **Runtime:** Node.js with Express.js, TypeScript.
- **API Design:** RESTful API.
- **Payment System:** Integrated WeChat Pay structure.

### Data Storage
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM.
- **Schema:** Users, Events, Matching Algorithm data, Feedback/Ratings, and Admin Portal entities (venues, eventTemplates, subscriptions, payments, coupons).
- **Migrations:** Drizzle Kit.

### Authentication & Authorization
- **User Authentication:** Phone number + SMS verification.
- **Session Management:** `express-session` with PostgreSQL storage.
- **Admin Authorization:** `isAdmin` flag for portal access.

### System Features & Design Decisions
- **Two-Stage Event Pool Matching Model:** Admin creates event pools with hard constraints (time, location), and users register with soft preferences. AI matches users within pools using a 5-dimensional algorithm (personality, interest, background, conversation, intent) and a 12-Archetype Animal Social Vibe System for group chemistry. This system includes a real-time dynamic matching service that continuously scans pools with adaptive thresholds and a time decay algorithm to ensure successful matching.
- **AI-Driven Matchmaking:** Utilizes AI for sophisticated event and people matching, considering personality, interests, and group dynamics, with a focus on explainability and a deep feedback system for continuous learning.
- **Two-Tier Feedback Architecture:** Implements both basic and optional anonymous deep feedback mechanisms to refine the matching algorithms.
- **Gamified Personality Assessment:** A 10-question test determines social role archetypes, visualized with a Personality Radar Chart, and requiring all users to retake for the new 12-archetype system.
- **Streamlined Onboarding:** A multi-step registration process covers identity, interests, personality, and profile creation.
- **Admin Portal:** A desktop-first interface for comprehensive management of users, subscriptions, events, finance, moderation, and insights. This includes an Admin Matching Lab for real-time algorithm tuning.
- **Payment & Subscription System:** Full payment infrastructure including WeChat Pay integration, webhook handling, and subscription management.
- **Intelligent Venue Matching & Booking:** Algorithm-based venue scoring and a transactional booking system with race condition protection.
- **Real-Time Bidirectional Data Sync (WebSocket):** Production-ready WebSocket for instant data synchronization, crucial for event status updates and notifications.
- **Data Insights Dashboard:** A comprehensive analytics dashboard provides key performance indicators, user segmentation, activity quality, retention, revenue conversion, and social role distribution.

## External Dependencies

### Core Frameworks
- **React Ecosystem:** `react`, `react-dom`, `@tanstack/react-query`.
- **Routing:** `wouter`.
- **Build Tools:** `vite`.

### UI Component Libraries
- **Radix UI:** `@radix-ui/react-*`.
- **Styling:** `tailwindcss`, `autoprefixer`, `postcss`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.

### Database & ORM
- **Database:** `@neondatabase/serverless` (PostgreSQL).
- **ORM:** `drizzle-orm`, `drizzle-kit`.
- **Validation:** `drizzle-zod`, `zod`.

### Authentication
- `express-session`, `connect-pg-simple`.

### Development Tools
- `typescript`, `tsx`.

### Form Handling
- `@hookform/resolvers`.

### Date/Time Utilities
- `date-fns`.