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
- **Technical Implementations:** 
  - Implemented progressive disclosure for profile editing with dedicated edit pages for basic info, education, work, personal details, and interests.
  - Unified profile editing is now page-based, replacing previous dialogs.
  - All choice-based questions (radio/select) unified to [Title → Vertical Options List → Bottom Button] pattern across RegistrationPage (6 steps) and all edit pages (EditBasicInfoPage, EditEducationPage, EditWorkPage, EditPersonalPage, EditIntentPage).
  - ProfilePage (/profile) now displays education and work information cards based on visibility settings (educationVisibility, workVisibility).
  - workVisibility field added to EditWorkPage for complete data flow closure.
  - budgetPreference removed from User schema (moved to per-event BlindBoxRequest).
  - Private chat lists feature expandable user profiles for progressive information disclosure.
  - Participant information displays are enhanced with full Chinese localization and archetype icons.

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
- **Development Testing Features:**
  - **Demo Login Code:** In development environment, verification code `666666` is universally accepted. When using this code, a basic user account is created without completing onboarding steps, allowing testers to go through the full registration flow.
  - **Skip Registration Button:** A "跳过注册（测试）" button appears at the bottom of the registration page (only in development). When clicked, it auto-fills all required registration fields with test data and submits the form, redirecting to the interests-topics page.
  - **Intent Field:** Users can select multiple activity intents (text array). Options include: networking (拓展人脉), friends (交朋友), discussion (深度讨论), fun (娱乐放松), romance (浪漫社交), and flexible (灵活开放·都可以).
    - "Flexible" option is mutually exclusive with specific intents - selecting it clears all other selections.
    - Intent is multi-select in registration, profile editing, and event participation.
    - Intent is stored as a text array in both users table (default intent) and eventAttendance table (per-event intent override).

### System Features & Design Decisions
- **AI-Driven Matchmaking:** Uses AI for event and people matching with explainability through connection points and a deep feedback system. Algorithms consider topics, debate comfort, life stage, language, communication style, group role composition, diversity balance (60% similarity / 40% difference), user intent, anti-repetition, and demographic data.
- **Two-Tier Feedback Architecture:** Basic 4-step feedback flow followed by an optional, anonymous deep feedback system (3 modules) to calibrate the matching algorithm and capture evolving user preferences.
- **Event Management:** Detailed event pages with reordered sections, clear navigation for event states ("匹配中", "已匹配", "已完成"), and enhanced attendee cards. Event cards visually distinguish between locked and unlocked states.
- **Personality Assessment System (Gamified):** 
  - **10-Question Test:** Includes single-choice and dual-choice question types with contextual scenario descriptions and emoji.
  - **Performance Optimization:** Removed 3-layer motion.div nesting from option selections, replacing with CSS-based hover/active states (hover-elevate, active-elevate-2) for immediate click response without lag.
  - **Real-time Micro-feedback:** Selected options show border highlights, background color changes, and checkmark indicators with smooth animations.
  - **Mini Radar Chart Preview:** MiniRadarChart component appears in header after first question, grows progressively as user answers more questions.
  - **Mid-Test Suspense Teaser:** After question 5, a suspense card appears with "有意思！我们已经发现了你的一个隐藏特质..." message, auto-dismisses after 2.5 seconds.
  - **Blind Box Reveal Animation:** Upon test completion, full-screen overlay with animated 🎁 gift box rotating 360°, "正在揭晓你的社交角色..." text, and three jumping loading dots for 3 seconds before revealing results.
  - **Enhanced Results Page with Full-Screen Hero:** 
    - **Hero Section:** Full-viewport hero with large (192px) archetype avatar, role name in 5xl font, archetype-specific gradient background, and animated scroll indicator
    - **Avatar System:** Archetype image mapping in `archetypeAvatars.ts` supporting high-res image imports from @assets directory (currently using emoji placeholders)
    - **Scroll-Reveal Content:** Cards animate into view as user scrolls, displaying primary role, secondary role, six-dimension radar chart, strengths, challenges, and ideal friend types
    - **Social Comparison Card:** Shows user's role percentage in community (e.g., "51% of users are also 探索者"), displays top 4 role distribution in grid layout
    - **Chemistry Prediction Card:** Shows matching compatibility with 3 best-matched roles using animated progress bars (e.g., 火花塞 92%, 挑战者 90%, 连接者 86%)
    - **Web Share Integration:** Share results via Web Share API with fallback to clipboard
  - **Scoring Engine:** 14 social role archetypes with PersonalityRadarChart visualization
  - **Backend API:** GET /api/personality-test/stats endpoint provides real-time personality distribution statistics
- **Streamlined Onboarding:** Registration (6 steps: Identity → Personal Background & Education → Work → Intent → Culture & Language → Access & Safety) → Interests/Topics → Personality Test → Profile Setup → Discover.
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

## Recent Changes

### Admin Portal Foundation (Latest - Nov 8, 2025)
- **Database Schema Extended:** Added 9 new tables for Admin Portal:
  - `venues` - Restaurant/bar partner management with tags, cuisines, capacity
  - `eventTemplates` - Recurring time slots and themed events (Girls Night, etc.)
  - `subscriptions` - User memberships (¥98/month or ¥294/3mo)
  - `payments` - Unified payment records with WeChat Pay integration support
  - `coupons` - Discount code system (fixed amount / percentage)
  - `couponUsage` - Coupon redemption tracking
  - `venueBookings` - Venue capacity management and commission tracking
  - `reports` - User report system for moderation
  - `moderationLogs` - Admin action audit trail
  - Added `isAdmin` and `isBanned` fields to `users` table
- **Admin Portal Layout:** Created desktop-first admin interface at `/admin/*` routes:
  - Implemented Shadcn Sidebar with 12 navigation items across 2 groups
  - Completely separated from user-facing app (mobile-first bottom nav)
  - AdminGuard component for permission validation (checks `user.isAdmin`)
  - Responsive sidebar with toggle, custom width (20rem)
- **Admin Dashboard (/admin/dashboard):** Implemented with real-time statistics:
  - 6 key metric cards: Total Users, Subscribers, Monthly Events, Revenue, New Users, Growth
  - Personality type distribution display (top 5 roles)
  - Backend API `/api/admin/stats` with `requireAdmin` middleware
  - Real data from database via TanStack Query
- **Storage Methods Added:** `getAllUsers()`, `getAllBlindBoxEvents()` for admin analytics
- **Routes Registered:** All `/admin/*` routes integrated in App.tsx with permission checks
- Admin portal pages currently show placeholder content ("开发中"), ready for implementation