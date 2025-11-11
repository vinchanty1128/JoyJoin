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
- **Payment System:** WeChat Pay integration structure in `server/paymentService.ts` with webhook handlers, payment creation, status queries, and refund capabilities. Ready for SDK integration (requires merchant credentials).

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
- **Payment & Subscription System:** Complete payment infrastructure with WeChat Pay integration structure, webhook handlers for automatic subscription activation, coupon validation, discount calculation, refund management, and payment tracking. Payment service located in `server/paymentService.ts` with API routes at `/api/payments/*` and `/api/webhooks/wechat-pay`.
- **Subscription Management:** Automated expiry checker (`server/subscriptionService.ts`) runs hourly to detect expired subscriptions, send expiration warnings (3 days before), automatically update status, and send notifications. Supports subscription renewal, cancellation, and status checking via `/api/subscription/*` endpoints.
- **Intelligent Venue Matching:** Algorithm-based venue selection (`server/venueMatchingService.ts`) that scores venues based on event type compatibility, capacity, location, cuisine preferences, and price range. Returns top 5 matched venues with detailed match reasoning via `/api/venues/match` and `/api/venues/select-best`.
- **Venue Booking System:** Transactional booking system with race condition protection using PostgreSQL `FOR UPDATE` locks. Prevents double-bookings when multiple events attempt to book the same venue simultaneously. Supports availability checking, booking creation, cancellation, and revenue tracking with automatic commission calculation. API endpoints: `/api/venues/check-availability`, `/api/venues/book`, `/api/venues/bookings/:id/cancel`, `/api/admin/venues/:venueId/bookings`.
- **Advanced User Matching System:** 5-dimensional matching algorithm (`server/userMatchingService.ts`) scores user compatibility based on personality chemistry (40%), interest overlap (25%), background diversity (15%), conversation balance (10%), and intent alignment (10%). Features 14 personality archetypes (火花塞, 探索者, 故事家, 挑战者, 连接者, 协调者, 氛围组, 肯定者, 智者, 倾听者, 梦想家, 行动派, 幽默家, 守护者) with a 14x14 chemistry matrix (`server/archetypeChemistry.ts`) defining 196 unique compatibility scores (0.3-0.95 scale). Implements intelligent group formation algorithm that optimizes for both chemistry and diversity, creating balanced groups of 5-10 people. Supports configurable matching weights, test scenarios, and match result tracking via database tables (matchingConfig, matchingResults). API routes: `/api/matching/calculate-pair`, `/api/matching/create-groups`, `/api/matching/config`, `/api/matching/test-scenario`.
- **Admin Matching Lab:** Interactive admin tool (`/admin/matching`) for real-time algorithm tuning and testing. Features adjustable weight sliders for all 5 matching dimensions (totaling 100%), random user selection (10/20 people), one-click test execution, and detailed results visualization showing average chemistry scores, diversity scores, overall match quality, and individual group compositions. Fully tested end-to-end with proper admin authentication using `requireAdmin` middleware. Supports PostgreSQL text[] array storage for user IDs and JSONB for group results.
- **Content Management System:** Unified content management interface (`/admin/content`) for platform announcements, help articles, FAQs, and community guidelines. Features tabbed interface for 4 content types, full CRUD operations, draft/published status workflow, priority-based ordering, category organization, and rich text content storage. Database table: `contents` with fields (id, type, title, content, category, status, priority, published_at, created_by, created_at, updated_at). API endpoints: `/api/admin/contents/*` for admin management, `/api/contents/:type` for public access to published content. Fully tested end-to-end with content creation, editing, publishing, and deletion workflows.
- **Admin Notification Push System:** Comprehensive notification broadcast system (`/admin/notifications`) enabling admins to send targeted or broadcast notifications to users. Features dual-tab interface with "发送通知" (Send) and "发送历史" (History) tabs. Send interface includes notification category selection (discover/activities/messages/system), type selection (admin_announcement/event_reminder/system_alert/activity_invitation), title/content input, and recipient targeting (all users or specific user selection with search). Notifications table extended with `sent_by` (admin ID) and `is_broadcast` (boolean) fields for tracking. History view displays grouped notifications with aggregate statistics (recipient count, read count, sent timestamp). Integrates with Content Management—publishing announcements optionally triggers notifications to all users via checkbox in publish dialog. Storage layer provides `getAdminNotifications` (CTE-based GROUP BY for aggregation), `createBroadcastNotification` (batch insert), and `getNotificationStats`. API endpoints: `GET /api/admin/notifications` (history), `POST /api/admin/notifications/broadcast` (mass send), `POST /api/admin/notifications/send` (single user). Successfully tested end-to-end with 156-user broadcast, history display, and content-triggered notifications.
- **Real-Time Bidirectional Data Sync (WebSocket):** Production-ready WebSocket infrastructure enabling instant bidirectional data synchronization between admin backend and user frontend. Server-side WebSocket manager (`server/wsService.ts`) handles connection lifecycle, room management (by eventId and userId), and message broadcasting. Client-side `useWebSocket` hook (`client/src/hooks/useWebSocket.ts`) provides auto-reconnection, heartbeat monitoring, and event subscription/unsubscription. Event broadcast system (`server/eventBroadcast.ts`) automatically pushes admin actions (status changes, event updates) to affected users via WebSocket, simultaneously creating notification records for offline users. Smart cache invalidation (`client/src/lib/cacheInvalidation.ts`) precisely invalidates TanStack Query caches based on event type, triggering automatic UI updates without manual refresh. Integrated in AdminEventsPage (admin real-time updates), EventsPage (user event list real-time sync), and BlindBoxEventDetailPage (event detail real-time sync). WebSocket server runs at `ws://0.0.0.0:5000/ws`. Event types defined in `shared/wsEvents.ts` include EVENT_STATUS_CHANGED, EVENT_MATCHED, EVENT_COMPLETED, EVENT_CANCELED, USER_JOINED, USER_CONFIRMED, USER_LEFT, ADMIN_ACTION, MATCH_PROGRESS_UPDATE. Key API integration: `PATCH /api/admin/events/:id` triggers `broadcastEventStatusChanged()` and `broadcastAdminAction()` for real-time propagation.
- **Chat Moderation & Logging System:** Privacy-conscious chat monitoring system following industry best practices. User-initiated reporting allows members to flag inappropriate messages (harassment, spam, inappropriate content, hate speech) via long-press/right-click menu in EventChatDetailPage. Admin review interface (`/admin/reports`) displays pending reports with full context (10 messages before/after reported message), enabling informed moderation decisions (dismiss/warning/temporary ban/permanent ban/message deletion). All admin actions are automatically logged to moderationLogs for transparency and audit trails. Comprehensive technical logging system (`chat_logs` table) captures WebSocket events (connections/disconnections/errors), message send failures, and system errors with severity levels (info/warning/error) and JSON metadata for debugging. Admin log query interface (`/admin/chat-logs`) provides filtering by event, user, severity, and date range, plus statistics dashboard showing error/warning/info counts. Database tables: `chat_reports` (id, message_id, event_id, reported_by, reported_user_id, report_type, description, status, reviewed_by, review_notes, action_taken, created_at, reviewed_at) and `chat_logs` (id, event_type, event_id, user_id, severity, message, metadata, created_at) with optimized indexes. API endpoints: `POST /api/chat-reports` (user report submission), `GET/PATCH /api/admin/chat-reports` (admin management), `POST /api/chat-logs` (internal logging), `GET /api/admin/chat-logs` (query with filters), `GET /api/admin/chat-logs/stats` (statistics).
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