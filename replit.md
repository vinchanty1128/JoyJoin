# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

This social networking platform connects people through small, curated micro-events (5-10 attendees) using AI-driven matchmaking. It emphasizes psychological safety, inclusivity, and meaningful connections through a warm, approachable design. The core purpose is to help users build local communities by matching them with events and people aligned with their social vibe, interests, and energy levels.

## Recent Changes

### October 30, 2025 - Chinese-Localized Authentication System

#### Complete Removal of Western Social Logins
- **Replaced Replit Auth:** Removed Google, GitHub, X, Apple social login integrations
- **New System:** Implemented WeChat binding + phone SMS verification for Chinese market
- **Rationale:** Western social logins inappropriate for Hong Kong/Shenzhen target market

#### Phone Verification Authentication
- **Primary Method:** Phone number + SMS verification code login
- **Implementation:**
  - Created `phoneAuth.ts` with verification code generation and validation
  - 6-digit codes with 5-minute expiry
  - In-memory code storage (production should use Redis)
  - Development mode logs codes to console: `📱 Verification code for ${phoneNumber}: ${code}`
- **User Creation:** Auto-creates user account on first login with phone number
  - Temporary email: `${phoneNumber}@temp.joyjoin.com`
  - Display name: "用户" + last 4 digits of phone

#### WeChat OAuth Integration (Placeholder)
- **WeChat Login Button:** Green button with WeChat icon on login page
- **Status:** Placeholder implementation (requires WeChat developer account in production)
- **Future:** Will integrate official WeChat OAuth 2.0 flow

#### Session Management Migration
- **Old System:** Passport.js with Replit Auth (OIDC)
- **New System:** express-session with PostgreSQL storage (connect-pg-simple)
- **Session Configuration:**
  - Store: PostgreSQL "sessions" table (auto-created)
  - Cookie: httpOnly, secure=false (dev), sameSite='lax'
  - TTL: 7 days
  - Session data: `{userId: string}`
- **Middleware:** `isPhoneAuthenticated` checks `req.session.userId`

#### Database Schema Changes
- **New Column:** Added `phone_number` VARCHAR to `users` table
- **Constraints:** Unique constraint on phone_number
- **Migration:** Manual SQL execution via psql (drizzle-kit had interactive prompt issues)

#### Updated API Routes
- **New Routes:**
  - `POST /api/auth/send-code` - Send verification code to phone
  - `POST /api/auth/phone-login` - Login with phone + code
  - `POST /api/auth/logout` - Destroy session
- **Updated Routes:** All protected routes now use `isPhoneAuthenticated` middleware
- **User Context:** Changed from `req.user.claims.sub` to `req.session.userId` throughout backend

#### New Login Page
- **Created:** `client/src/pages/LoginPage.tsx`
- **Branding:** JoyJoin (悦聚·Joy) with Sparkles icon and purple gradient
- **Two Login Options:**
  1. WeChat login (green button, placeholder)
  2. Phone + verification code (primary method)
- **UX Features:**
  - 60-second countdown after sending code
  - Real-time phone number validation (11 digits)
  - Toast notifications for success/error states
  - Automatic redirect after successful login
- **Styling:** Gradient background, centered card layout, terms of service links

#### Testing & Validation
- End-to-end testing passed:
  - Login page renders correctly with all UI elements
  - Send code functionality works (generates and stores codes)
  - Login flow validates codes properly
  - Session creation successful
  - Authentication middleware protects routes
- Verified error handling for invalid/expired codes

### October 29, 2025 - Deep Feedback System (Two-Tier Feedback Architecture)

#### Complete Two-Tier Feedback Flow
- **Architecture:** Implemented optional deep feedback as an extension of basic 4-step feedback
- **Flow:** Basic Feedback (4 steps) → Completion Page → Optional Deep Feedback Entry → Deep Feedback (3 modules) → Deep Completion
- **Design Philosophy:** Positions deep feedback as user co-creation opportunity, not transactional reward
- **Privacy-First:** All deep feedback anonymously processed, emphasizes community value over personal benefits

#### Deep Feedback Modules (3 Modules, ~3 Minutes)
1. **Match Point Validation (契合点有效性验证):**
   - Evaluates effectiveness of AI-suggested connection points in real conversations
   - For each matched characteristic (overseas experience, tech industry, reading, etc.): "深入聊到了", "简单提及", or "没聊到"
   - Optional text input for other connection points that facilitated conversation
   - **Purpose:** Calibrate matching algorithm based on real-world conversation outcomes

2. **Conversation Dynamics (交流动态评估):**
   - Conversation balance slider (0-100): tracks who dominated the conversation
   - Comfort level slider (0-100): with emoji indicators (😞 😐 🙂 😊 😄)
   - Optional notes about conversation evolution and atmosphere
   - **Purpose:** Understand group dynamics and comfort patterns

3. **Matching Preferences (匹配偏好洞察):**
   - Multi-select preference cards: diversity, deep topics, casual chat, similar life stage, shared hobbies, networking
   - Optional custom preference text input
   - Includes "你的反馈如何被使用" explanation (4-step value loop)
   - **Purpose:** Capture evolving user preferences for future matching improvements

#### UX Design Elements
- **Low-Pressure Participation:** Completely optional, all questions skippable, no impact on rewards if not participated
- **Progress Tracking:** Visual progress bar + "进度 X/3" indicator throughout flow
- **Privacy Notice:** "🔒 你的反馈安全承诺：所有评价严格匿名处理" displayed prominently
- **Value Communication:** "💫 每个反馈都在创造价值" with concrete examples of how feedback improves the platform
- **Community Building:** Emphasis on "共同创造更好的社交体验" rather than personal rewards

#### Deep Feedback Entry Point
- **Location:** FeedbackCompletion page (after basic 4-step feedback)
- **Messaging:** "参与深度反馈，共建更好体验" with subtitle "可选 · 约3分钟 · 匿名处理"
- **Benefits Display:** Shows 3 ways feedback helps (algorithm calibration, experience optimization, community co-creation)
- **No Pressure:** Clear that it's optional, users can return to events list at any time

#### Deep Completion Page
- **Success Animation:** Pulsing heart icon with gradient background
- **Impact Stats:** "3 模块完成", "8+ 有效洞察", "5 维度优化"
- **Value Loop:** Explains how feedback is processed and used (3 checkmarks)
- **Community Impact:** Shows contribution to community improvement with Users icon
- **Simple Exit:** "返回活动列表" button with no additional CTAs

#### Database Schema Extensions
- Extended `eventFeedback` table with deep feedback fields:
  - `hasDeepFeedback` (boolean, default false)
  - `matchPointValidation` (jsonb) - validation results for each match point
  - `additionalMatchPoints` (text) - user-discovered connection points
  - `conversationBalance` (integer 0-100) - who dominated conversation
  - `conversationComfort` (integer 0-100) - comfort level
  - `conversationNotes` (text) - optional conversation observations
  - `futurePreferences` (text array) - selected matching preferences
  - `futurePreferencesOther` (text) - custom preference input
  - `deepFeedbackCompletedAt` (timestamp)

#### Backend API
- **New Route:** `POST /api/events/:eventId/feedback/deep`
- **Validation:** Requires existing basic feedback before accepting deep feedback
- **Data Persistence:** Updates existing feedback record with deep feedback fields
- **Response:** Returns complete feedback object with both basic and deep data

#### Testing & Validation
- End-to-end testing passed: Complete flow from basic feedback through all three deep feedback modules
- Data persistence verified: All deep feedback fields correctly saved to database
- UX validation: Progress tracking, skip options, privacy messaging, and value communication working as designed

### October 28, 2025 - Events Page Navigation & Layout Improvements

#### Event Detail Page Layout Reorder
- **Improved Information Flow:** Reordered sections on event detail page for better UX
- **New Section Order:**
  1. 顶部摘要 (Event summary with countdown)
  2. 地点信息 (Venue info with navigation)
  3. **预算与菜式** (Budget & cuisine - moved to after venue for dining context)
  4. 活动预览 (Attendee cards and match explanation)
  5. **破冰工具** (Icebreaker tools - moved to after attendee preview for better flow)
  6. 规则与到场指南 (Rules and arrival guide)
  7. 帮助与支持 (Help and support)
- **Rationale:** Users now see dining context (venue → budget → cuisine) together, then attendees followed immediately by icebreaker tools

#### Connection Points Count Fix (Critical Bug Fix)
- **Problem**: Card front displayed "与你有X个共同点" where X only counted interest overlaps, but card back showed multi-dimensional connection points (interests + education + industry + age + relationship status + overseas experience + seniority)
- **Solution**: Changed to use `sparkPredictions.length` for accurate count
- **Text Improvement**: Changed "共同点" to "契合点" for consistency with card back's "我们之间的契合点"
- **Impact**: Card front number now matches the actual count of connection badges on card back

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