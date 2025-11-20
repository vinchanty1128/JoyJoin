# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

JoyJoin (悦聚·Joy) is a social networking platform connecting individuals locally through small, curated micro-events (5-10 attendees). It uses AI for user matching based on interests, personality, and social compatibility, with a focus on psychological safety and inclusivity. Targeted at the Hong Kong/Shenzhen market, the platform aims to foster meaningful local connections and community building. Key features include AI-powered matching for events and people, a comprehensive feedback system for algorithm refinement, streamlined event management, and a robust Admin Portal for platform oversight and analytics.

### Recent Changes (Nov 20, 2025)
- **Matching Algorithm Fix - Removed Diversity Double-Counting**: Fixed critical algorithm flaw where diversity was calculated twice
  - **Old Logic (Flawed)**: `calculatePairScore()` included diversity at 10% → `overallScore = avgPairScore × 0.7 + groupDiversity × 0.3` (diversity added again at 30%)
  - **New Logic (Corrected)**: 
    - **Pair Compatibility Score** (配对兼容性): chemistry 37.5% + interest 31.25% + preference 25% + language 18.75% = 100%
    - **Overall Score** (综合分数): `avgPairScore × 0.7 + groupDiversity × 0.3` (diversity only at group level)
  - **Conceptual Clarity**: Pair compatibility measures similarity (共同兴趣、语言), group diversity measures richness (背景多样性)
  - **Variable Renaming**: `avgChemistry` → `avgPairScore`, `calculateGroupChemistry()` → `calculateGroupPairScore()` for accuracy
  - **Impact**: Algorithm now properly balances finding compatible pairs (70%) with ensuring diverse groups (30%)
- **Real-time Dynamic Matching System Complete**: Fully automated continuous matching with adaptive thresholds
  - **Database Infrastructure**: `matchingThresholds` table for configurable parameters, `poolMatchingLogs` table for decision tracking
  - **Three-Tier Threshold System**: High compatibility (≥85) instant match, medium (70-84) wait for better options, low (55-69) wait until deadline, <55 reject
  - **Time Decay Algorithm**: Thresholds gradually lower as event deadline approaches to ensure successful matching
  - **Matching Triggers**: Instant scan on registration + hourly scheduled scans + 30-min scans in final 24 hours
  - **Backend Service**: `poolRealtimeMatchingService.ts` with intelligent scanning, threshold evaluation, and logging
  - **Admin UI**: `/admin/matching-config` for threshold tuning, `/admin/matching-logs` for decision history visualization
  - **API Integration**: Registration endpoint triggers instant matching check, admin can manually trigger scans
  - **Production Ready**: All parameters database-driven, no code changes needed for tuning based on real user feedback
- **Invitation System Complete**: Full viral growth mechanism implemented
  - Auto-issue ¥50 INVITE_REWARD coupon to inviters when invited users match together
  - Frontend displays invitation badges: "已邀请 [name]" (purple) for inviters, "[name] 邀请的" (blue) for invitees
  - Database: `user_coupons` tracks coupon assignments, `invitation_uses` tracks invitation rewards
- **Event Pool Discovery Fixed**: `/api/event-pools` now correctly displays admin-created blind box events
  - Status unified to `active` (replaces previous `published` and `recruiting`)
  - Database schema synchronized with all required columns (description, eventType, educationLevelRestrictions, etc.)
  - DiscoverPage successfully fetches and displays event pools created in Admin Portal
- **Event Pool User Flow**: Completed user-facing integration of two-stage matching model
  - DiscoverPage fetches real event pools from database via `/api/event-pools`
  - EventPoolRegistrationPage allows users to register with soft preferences (budget, languages, social goals, cuisine, dietary restrictions, taste intensity)
  - BlindBoxEventCard updated to navigate to registration page when clicked
  - EventsPage integrated to display pool registrations alongside traditional events, with status-based filtering (pending/matched/completed)
  - New component: PoolRegistrationCard for displaying pool registration status and match scores
- **WebSocket Real-time Notifications**: Implemented POOL_MATCHED event for instant user notifications
  - poolMatchingService.saveMatchResults() broadcasts POOL_MATCHED event to all matched users via wsService.broadcastToUser()
  - Frontend EventsPage subscribes to POOL_MATCHED events, displays toast notification with pool/group details, invalidates cache, and auto-switches to "已匹配" tab
  - Added PoolMatchedData interface to wsEvents.ts with poolId, poolTitle, groupId, groupNumber, matchScore, memberCount
  - Complete bidirectional WebSocket sync: Admin completes matching → Backend broadcasts → Users receive instant notification

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
- **Two-Stage Event Pool Matching Model (两阶段匹配模型):** 
  - Stage 1: Admin creates event pools with hard constraints (time, location, gender/industry/seniority restrictions)
  - Stage 2: Users register with soft preferences (budget, cuisine, social goals), AI matches within pool using 5-dimensional algorithm
  - Pool-based matching service (`poolMatchingService.ts`) combines permanent user profiles with temporary event preferences
  - Real-time dynamic matching service (`poolRealtimeMatchingService.ts`) continuously scans pools with adaptive thresholds
  - Database tables: `eventPools` (admin-created pools), `eventPoolRegistrations` (user signups + preferences), `eventPoolGroups` (matched groups), `matchingThresholds` (configurable parameters), `poolMatchingLogs` (decision tracking)
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