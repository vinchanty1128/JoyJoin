# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

This social networking platform, JoyJoin (悦聚·Joy), aims to connect individuals through small, curated micro-events (5-10 attendees) using AI-driven matchmaking. It focuses on fostering psychological safety, inclusivity, and meaningful local connections. The platform's core purpose is to help users build communities by matching them with events and people based on their interests, personality archetypes, and social compatibility, all presented through a warm and approachable design. The platform targets the Hong Kong/Shenzhen market, emphasizing Chinese-localized authentication and user experience.

## Recent Changes

### November 2, 2025

**ChatsPage Visual Hierarchy Optimization - Event Card States:** Implemented distinctive visual states for locked/unlocked event cards to guide user attention effectively. Changes include:
- **Locked state cards** (>24h before event): Purple header (#8A2BE2) with lock icon and prominent countdown ("聊天 X天X小时后 开放"), light purple background (#F8F5FF) with purple border, all event info grayed out (#8E8E93), participants hidden with "开放后可见参与者" message
- **Unlocked state cards** (≤24h before or past event): Green header (#4CAF50) with message icon and "聊天已开放" text, normal white background, normal colored event information, participant avatars visible
- **Design rationale**: Visual hierarchy optimization - locked cards draw attention to "when chat opens", unlocked cards encourage immediate chat action
- E2E tested and verified with Playwright

**User Level System Removal:** Removed the entire user level badge system (UserEnergyBadge component) from the application. Changes include:
- Deleted UserEnergyBadge.tsx component (displayed level badges like "达人 Lv.3", "新人 Lv.1", etc.)
- Removed UserEnergyBadge import and usage from DiscoverPage.tsx
- Simplified Discover page header to show only HeroWelcome component
- No database schema changes needed (level data was only used for display)

**Feedback Consolidation - Removed Duplicate Feedback from Chat Window:** Streamlined the user experience by removing all feedback functionality from the chat window (EventChatDetailPage) and consolidating it into the unified EventFeedbackFlow. Changes include:
- Removed "反馈" (Feedback) tab from EventChatDetailPage - chat window now only shows "聊天" (Chat) and "参与者" (Participants) tabs
- Removed all feedback-related state, mutations, and handlers from chat window
- Simplified chat interface to focus purely on communication
- Updated ConnectionRadar.tsx wording: "有特别想保持联系的人吗？" → "请选择希望继续保持联系的人" (clearer call-to-action)
- Unified feedback experience: all post-event feedback (ratings, connections, deep feedback) now accessed through EventFeedbackFlow
- Maintained privacy protection messaging in SelectConnectionsStep: "只有双方互选才会解锁1对1私聊" (mutual selection unlocks private chat)

**ChatsPage UI Enhancement - Tabbed Interface:** Improved the chat list organization by implementing a Telegram-style Segmented Control for switching between group chats and direct messages. Changes include:
- Added Tabs component with two tabs: "群聊" (Group Chats) and "私聊" (Direct Messages)
- Each tab displays a count badge showing the number of chats in that category
- Tabs are sticky-positioned below the MobileHeader for easy access while scrolling
- Implemented tab-specific empty states for better UX when a category is empty
- Default tab is "群聊" (Group Chats)
- Preserved all existing functionality: chat locking/unlocking, countdown timers, participant avatars, message previews
- Improved visual organization and navigation between different types of conversations

### November 1, 2025

**Comprehensive Matching Algorithm Overhaul - COMPLETED (13 New Enhancement Types):** Massive upgrade to AI-driven matchmaking using previously collected but unused data. Zero new friction for users, maximum matching intelligence. All features now fully implemented:

*Core Matching Enhancements (uses existing data):*
- ✅ Topics matching: Shared topicsHappy interests (2+ overlap = rare, 3+ = epic) - more specific than general interests
- ✅ Topics anti-matching: Prevents disasters where one person's happy topic is another's avoid topic
- ✅ Debate comfort alignment: Scores closeness on 1-7 scale (≤1 diff = rare, ≤2 = common) for conversation style compatibility
- ✅ Life stage detection: Auto-detects transitions from existing data (expecting parent = epic, new parent/career transition = rare)
- ✅ Enhanced language matching: Finds 2+ shared languages beyond Chinese/English (rare)
- ✅ Communication style matching: Derived from archetype + debate comfort (storyteller, listener, energizer, questioner, facilitator)

*Group Intelligence Features:*
- ✅ Group role composition: Balances storytellers, listeners, energizers, questioners, connectors for optimal conversation dynamics
- ✅ Diversity balance scoring: Calculates optimal 60% similarity / 40% difference across age, industry, education, relationship status

*Database Infrastructure:*
- ✅ Added `matchHistory` table for tracking who's matched before (anti-repetition scoring)
- ✅ Added `intent` field to eventAttendance for event-specific motivations (networking, friends, discussion, fun, romance)
- ✅ Added `connectionPointTypes` field to matchHistory for feedback correlation tracking
- ✅ Pushed all schema changes with `npm run db:push`

*Component & Algorithm Updates:*
- ✅ Updated `AttendeeData` interface: added topicsHappy, topicsAvoid, debateComfort, intent
- ✅ Updated `SparkPredictionContext` interface: added all new matching fields + archetype + userIntent + userMatchedBefore
- ✅ Updated MeetYourTable.tsx, AttendeePreviewCard.tsx to pass new fields
- ✅ Added intent selection UI to JoinBlindBoxSheet (6 options: flexible/都可以, networking, friends, discussion, fun, romance)
- ✅ Intent selection is optional with toggle behavior and clear button
- ✅ Implemented smart intent-based matching logic:
  - Both "flexible" → common level ("都保持开放心态")
  - Same specific intent → rare/epic level (strong alignment)
  - "flexible" + specific → neutral (no bonus, flexible people adapt well)
  - Different specific intents → neutral (avoids forced mismatches)
- ✅ Implemented anti-repetition scoring (50% penalty for repeat matches in calculateWeightedMatchScore)
- ✅ Created extractConnectionPointTypes() for tracking which connection types led to matches
- ✅ Created calculateWeightedMatchScore() with feedback-based weight adjustment infrastructure
- ✅ Fixed TypeScript errors (added 'personality' and 'balance' to GroupInsight type)

*Ready for Production:*
All 13 enhancement types are now functional and ready to improve matching quality. The system can:
- Match based on shared topics and prevent topic conflicts
- Align people with similar conversation styles
- Detect and match life stage transitions
- Find multilingual connections
- Match communication styles for better group dynamics
- Balance group composition for optimal conversations
- Create diverse yet compatible groups (60/40 rule)
- Align participants with same event goals (intent matching)
- Prioritize fresh connections over repeat matches
- Track connection point effectiveness for future optimization

*Future Enhancements (when feedback data accumulates):*
- Feedback loop correlation: Automatically adjust connection point weights based on post-event ratings
- Backend implementation: Create matchHistory records when events are matched
- Analytics dashboard: Show which connection types lead to highest satisfaction scores

**Enhanced Matching Algorithm with Demographics:** Improved the AI-driven matching algorithm to utilize previously unused demographic fields, providing richer connection points and better matches. Changes include:
- Changed `hometownAffinityOptin` default from `false` to `true` in schema (老乡 connections are culturally valued in Chinese culture)
- Added gender-based connection points (same gender = common rarity)
- Added family status matching (same parenting stage = rare, both expecting = epic)
- Added specific overseas regions matching (same region like 'North America' or 'Europe' = rare)
- Added hometown matching: same country = rare, same city/region = epic (老乡! connection)

**Vibe Tags System Removal:** Simplified the codebase by completely removing the decorative vibe tags system (Chill, Playful, High-Energy, etc.) which was not used in the matching algorithm. Changes include:
- Removed `vibes` field from users and events tables in the database schema
- Removed `vibeGradient` field from events table
- Deleted vibe UI components: VibeChip.tsx, VibePill.tsx, VibeProfileCard.tsx
- Deleted vibe configuration library: client/src/lib/vibes.ts
- Updated ParticipantAvatars to use generic User icons instead of vibe-based colors
- Simplified ProfileSetupPage to only collect displayName (removed vibe selection)
- Updated all event cards and pages to remove vibe tag displays
- Updated design_guidelines.md to reflect simplified design

**Note:** The matching algorithm now uses interests, personality archetypes (14 social roles), industries, AND demographic data (gender, family status, overseas regions, hometown) for comprehensive AI-driven matching.

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