# Solace AI - System Architecture

Solace AI is an enterprise-grade, privacy-first AI-powered mental wellness companion built as a modern monorepo using npm workspaces.

## Monorepo Layout

```
solace-ai/
│
├── apps/
│   ├── mobile/         # React Native + Expo (SDK 52) Mobile App
│   └── server/         # Node.js + Express + TypeScript + Mongoose Backend
│
├── packages/
│   └── shared/         # Shared TypeScript interfaces, types, constants, and API routes
│
├── docs/               # Architecture and setup documentation
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── package.json
└── README.md
```

## Architectural Layers

### 1. Mobile Client (`apps/mobile`)

- **Framework**: React Native 0.76 with Expo SDK 52.
- **Routing**: File-based routing via `expo-router` v4.
- **Design System & Theme**:
  - Centralized color tokens with light and dark themes (Warm Linen & Cream `#F8F6EF`, Deep Forest Midnight `#131814`, Sage Primary `#829B83`, Soft Pastels: Lavender, Peach, Mint, Butter).
  - Spacing scale (`4, 8, 12, 16, 20, 24, 32, 40, 48, 56`) and radius tokens (`xs: 6, sm: 10, md: 14, lg: 20, xl: 28, pill: 9999`).
  - Soft ambient shadows (`subtle`, `card`, `elevated`, `glowPrimary`).
  - Typography scale (`displayLarge`, `displayMedium`, `h1`, `h2`, `h3`, `bodyLarge`, `bodyMedium`, `bodySmall`, `caption`, `label`, `button`).
  - Theme provider with persistence via `AsyncStorage` and Zustand store (`system`, `light`, `dark`).
  - Reusable UI component library (`AppButton`, `AppText`, `AppCard`, `AppInput`, `AppAvatar`, `AppBadge`, `AppChip`, `AppDivider`, `AppProgressBar`, `AppIcon`, `ScreenContainer`, `SectionHeader`, `BottomSheet`, `LoadingIndicator`, `EmptyState`, `ErrorState`, `Backgrounds`).
- **State Management**:
  - Global client state: Zustand.
  - Server state, query caching & mutation: TanStack Query (React Query v5).
- **Animations**: React Native Reanimated v3 (`FadeInView`, `SlideUpView`, `ScalePressable`, `FloatingView`).
- **Sensory Feedback**: Expo Haptics.
- **Security & Storage**:
  - `expo-secure-store` for sensitive authentication credentials (JWTs, tokens).
  - `@react-native-async-storage/async-storage` for non-sensitive local application state, theme preference, and cached data.
- **Validation & Forms**: React Hook Form with Zod schemas.
- **API Client**: Axios instance configured with environment-driven base URLs and automatic bearer token injection.

### 2. Backend API (`apps/server`)

- **Runtime**: Node.js with TypeScript in strict mode.
- **Framework**: Express.js.
- **Database**: MongoDB with Mongoose ODM.
- **Security**:
  - Helmet for HTTP response security headers.
  - CORS with configurable origin whitelists.
  - `express-rate-limit` for rate limiting requests per IP window.
  - bcrypt password hashing infrastructure.
  - JWT token verification and signing infrastructure.
- **AI Integration**:
  - Dedicated provider in `src/integrations/gemini/` for Google Gemini AI (`@google/genai`).
  - Lazy initialization ensuring zero unnecessary network calls on cold startup.
  - Secret isolation: Gemini API keys and credentials are strictly kept on the server and never sent to mobile clients.
- **Reliability & Lifecycle**:
  - Centralized Zod-validated environment loading.
  - Strict startup sequence: Server only binds to port after MongoDB connects successfully.
  - Graceful shutdown handles `SIGINT`, `SIGTERM`, unhandled promise rejections, and uncaught exceptions with clean database disconnections.

### 3. Shared Contracts (`packages/shared`)

- Serves as the single source of truth across client and server.
- Contains TypeScript type definitions, API response shapes (`ApiResponse<T>`, `HealthCheckResponse`), route constants (`API_ROUTES`), and error codes (`ERROR_CODES`).
