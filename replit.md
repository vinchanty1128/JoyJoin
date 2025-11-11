# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

JoyJoin (悦聚·Joy) is a social networking platform connecting individuals locally through small, curated micro-events (5-10 attendees). It uses AI for user matching based on interests, personality, and social compatibility, with a focus on psychological safety and inclusivity. Targeted at the Hong Kong/Shenzhen market, the platform aims to foster meaningful local connections and community building. Key features include AI-powered matching for events and people, a comprehensive feedback system for algorithm refinement, streamlined event management, and a robust Admin Portal for platform oversight and analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Frameworks:** React 18 with TypeScript, Vite, Wouter for routing.
- **UI/Styling:** Radix UI primitives, shadcn/ui (New York style), Tailwind CSS; mobile-first, dark mode, purple-centric warm color palette, bilingual support (Chinese/English).
- **State Management:** TanStack Query for server state.
- **Key UI Patterns:** Bottom navigation, event cards, two-part match scoring, personality radar charts, social role cards, progressive disclosure.
- **Design Principles:** Emphasizes warmth, accessibility, and responsive design.

### Backend
- **Runtime:** Node.js with Express.js, TypeScript.
- **API Design:** RESTful API.
- **Payment System:** WeChat Pay integration structure.

### Data Storage
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM.
- **Schema:** Users, Events, Matching Algorithm data, Feedback/Ratings, Admin Portal entities (venues, eventTemplates, subscriptions, payments, coupons, etc.).
- **Migrations:** Drizzle Kit.

### Authentication & Authorization
- **User Authentication:** Phone number + SMS verification.
- **Session Management:** `express-session` with PostgreSQL storage.
- **Admin Authorization:** `isAdmin` flag.

### System Features & Design Decisions
- **AI-Driven Matchmaking:** AI for event and people matching, considering personality, interests, and group dynamics, with explainability and a deep feedback system.
- **Two-Tier Feedback Architecture:** Basic and optional anonymous deep feedback for algorithm refinement.
- **Gamified Personality Assessment:** 10-question test for social role archetypes, visualized with PersonalityRadarChart.
- **Streamlined Onboarding:** Multi-step registration covering identity, interests, personality, and profile.
- **Admin Portal:** Desktop-first design for comprehensive management (users, subscriptions, events, finance, moderation, insights).
- **Payment & Subscription System:** Full payment infrastructure including WeChat Pay integration, webhook handling, subscription management, and auto-expiry checker.
- **Intelligent Venue Matching & Booking:** Algorithm-based venue scoring and transactional booking system with race condition protection.
- **Advanced User Matching System:** 5-dimensional algorithm (personality, interest, background, conversation, intent) with 14 personality archetypes and a 14x14 chemistry matrix for group formation.
- **Admin Matching Lab:** Interactive tool for real-time algorithm tuning and testing.
- **Content Management System:** Unified interface for platform announcements, FAQs, and community guidelines with CRUD operations and workflow.
- **Admin Notification Push System:** Broadcast system for targeted or mass notifications to users.
- **Real-Time Bidirectional Data Sync (WebSocket):** Production-ready WebSocket for instant data synchronization between admin and user interfaces, including event status changes and cache invalidation.
- **Chat Moderation & Logging System:** User-initiated reporting with admin review interface, automated logging of admin actions, and technical chat logging with a query interface.
- **Data Insights Dashboard (运营决策指挥中心):** Comprehensive analytics dashboard with KPIs (User Scale, Business Health, Matching Efficiency), User Segmentation, Activity Quality, User Retention, Revenue Conversion Funnel, and Social Role Distribution.
- **Feedback Management System:** Admin review and analysis system for post-event feedback, with filtering, statistics, and detailed feedback dialogs.
- **Comprehensive Error Handling:** Localized error states with retry functionality and helpful messages.

## External Dependencies

### Core Frameworks
- **React Ecosystem:** `react`, `react-dom`, `@tanstack/react-query`.
- **Routing:** `wouter`.
- **Build Tools:** `vite`.

### UI Component Libraries
- **Radix UI:** `@radix-ui/react-*`.
- **Styling:** `tailwindcss`, `autoprefixer`, `postcss`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` (icons).

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