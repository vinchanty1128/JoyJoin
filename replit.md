# Local Micro-Events Social Network (Vibe/JoyJoin)

## Overview

JoyJoin (悦聚·Joy) is a social networking platform designed to foster meaningful local connections through small, curated micro-events (5-10 attendees). It leverages AI-driven matchmaking to connect individuals based on interests, personality archetypes, and social compatibility, prioritizing psychological safety and inclusivity. The platform targets the Hong Kong/Shenzhen market with a localized Chinese user experience, aiming to build communities and provide a warm, approachable design. Key capabilities include AI-powered event and people matching, a comprehensive feedback system for algorithm calibration, and a streamlined event management process.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### November 3, 2025

**Profile Page Unified Editing - Final Implementation:** Completed comprehensive refactor of ProfilePage with streamlined editing experience. All DEI options removed and Chinese-focused UI implemented. Features:

*Top-Level Changes:*
- **Archetype Icon Avatar**: Replaced user-uploaded photos with archetype icon avatars (colored circular backgrounds)
- **Single Edit Button**: Added unified "编辑资料" button in top-right header, removed individual section edit buttons
- **Real Statistics**: Implemented GET /api/profile/stats endpoint calculating eventsCompleted (from eventAttendance + events) and connectionsMade (from directThreads)
- **Pure Display Cards**: All 5 information cards now display-only with no inline edit buttons

*EditFullProfileDialog Component (New):*
- **Unified Long-Form Dialog**: Single scrollable dialog consolidating all 5 profile sections with Separator dividers
- **Complete Field Coverage**: Supports all 18 profile fields across 5 categories
- **Sections**: 基本信息 (displayName, gender, birthdate, languages) → 教育背景 (education, field, locale, regions) → 工作信息 (industry, role, seniority) → 个人背景 (relationship, children) → 兴趣偏好 (interests, budget)
- **Badge-Based Multi-Select**: Languages, overseas regions, interests, and budget use clickable Badge UI
- **Conditional Display**: Overseas regions field appears only when studyLocale is "Overseas" or "Both"
- **Privacy Indicator**: "提示：此信息仅自己可见" shown in 个人背景 section
- **Data Cleaning**: Removes empty strings and empty arrays before API submission to prevent validation errors
- **Date Format Handling**: Converts birthdate Date to YYYY-MM-DD format for date input compatibility

*API & Schema Updates:*
- **PATCH /api/profile**: Existing endpoint validates with updateFullProfileSchema
- **Removed DEI Field**: Removed "pronouns" from updateFullProfileSchema (now 17 fields, not 18)
- **Field Options Match Registration**: All dropdown/select options identical to RegistrationPage for consistency

*Chinese Localization Consistency:*
- Gender: Woman→女性, Man→男性
- Education: Bachelor's→本科, Master's→硕士, Some college/Associate→大专/副学士, Trade/Vocational→职业培训
- Relationship: Single→单身, In a relationship→恋爱中, Married/Partnered→已婚/已结伴
- Study Locale: Local→本地, Overseas→海外, Both→都有
- Seniority: Intern→实习生, Junior→初级, Mid→中级, Senior→高级, Founder→创始人, Executive→高管
- Children: No kids→无孩子, Expecting→期待中
- Industry: 13 predefined options (大厂, 金融, 科技初创, AI/ML, 跨境电商, 投资, 咨询, 消费品, 艺术/设计, 教育, 医疗, 政府/公共, 其他)

*Files Modified:*
- client/src/components/EditFullProfileDialog.tsx (created)
- client/src/pages/ProfilePage.tsx (refactored)
- server/routes.ts (added GET /api/profile/stats)
- shared/schema.ts (removed pronouns from updateFullProfileSchema)

### November 2, 2025

**Private Chat List Enhancement - Expandable User Profiles:** Implemented progressive information disclosure for private chat list with click-to-expand user details. Features:
- **Default State**: Clean, minimal display - avatar (archetype icon), name, last message, timestamp
- **Click Avatar to Expand**: Smooth AnimatePresence animation reveals complete user profile
- **Expanded Info**: Archetype description + info chips (性别·年龄, 学历, 行业) + languages (🗣 语言能力)
- **Visual Consistency**: Matches SelectConnectionsStep and EventChatDetailPage styling patterns
- **Event Handling**: Avatar click stops propagation, card click navigates to chat
- **Type Safety**: Updated DirectThreadWithUser to use full User type instead of partial fields

**Removed Relationship Status Display:** Cleaned up all interfaces to remove "单身" (Single) status chips for better privacy:
- Removed from EventChatDetailPage participant Dialog
- Removed from SelectConnectionsStep connection cards  
- Removed from userFieldMappings imports across all components
- Focus on professional/social info only: 性别·年龄, 学历, 行业

**Participant Information Display Enhancement - Complete Localization:** Comprehensive upgrade to participant information display across SelectConnectionsStep and EventChatDetailPage with full Chinese localization. Changes include:

*SelectConnectionsStep (Feedback Flow):*
- **Left Avatar**: Colored circle (h-14 w-14) displaying archetype icon (🙌🧭📖⚡🤝🎯🎭🌟) instead of letter initials, using archetype-specific background colors
- **Archetype Display**: Badge showing archetype name in Chinese without icon prefix (e.g., "连接者", "探索者")
- **Information Chips**: Compact rounded chips displaying:
  - Gender + Age: Combined format "女 · 25岁" / "男 · 28岁"
  - Education: Localized levels "本科", "硕士", "博士"
  - Industry: Direct display
  - Relationship Status: Shows "单身" only if single

*EventChatDetailPage Participant Dialog:*
- Added comprehensive participant information display in Dialog popup
- Shows: Name, Archetype (badge + description), Gender + Age, Education, Industry, Relationship Status
- Consistent visual style with SelectConnectionsStep using same Chinese localization

*Shared Infrastructure:*
- **Chinese Localization**: Created userFieldMappings.ts with complete mappings for gender (Woman→女), education (Bachelor's→本科), relationship status (Single→单身), and age formatting
- **Shared Archetype Config**: Extracted archetypeConfig to lib/archetypes.ts for reuse across EventChatDetailPage, DirectChatPage, and SelectConnectionsStep
- **Data Flow**: Updated EventFeedbackFlow to pass complete user data (8 fields: userId, displayName, archetype, gender, age, educationLevel, industry, relationshipStatus)
- **Demo Data Enhancement**: Added educationLevel and relationshipStatus to all demo users (小明: 硕士/单身, 小红: 本科/恋爱中, 阿杰: 博士/单身)
- **Demo Data Fix**: Added all 3 demo users to event1 eventAttendance table so they appear in participant badge bar

*Visual Improvements:*
- Improved information density while maintaining clean, readable layout
- Consistent chip-based display across all participant interfaces
- All text properly localized to Chinese throughout the application

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