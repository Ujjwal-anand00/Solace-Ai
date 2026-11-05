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
├── eslint.config.js
├── package.json
└── README.md
```

## Architectural Layers

### 1. Mobile Client (`apps/mobile`)

- **Framework**: React Native 0.76 with Expo SDK 52.
- **Routing**: File-based routing via `expo-router` v4.
- **State Management**:
  - Global client state: Zustand.
  - Server state, query caching & mutation: TanStack Query (React Query v5).
- **Styling**: NativeWind v4 (Tailwind CSS) + custom typed theme token system (`src/theme/`).
- **Animations**: React Native Reanimated v3.
- **Security & Storage**:
  - `expo-secure-store` for sensitive authentication credentials (JWTs, tokens).
  - `@react-native-async-storage/async-storage` for non-sensitive local application state and cached data.
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
  - Dedicated provider in `src/integrations/gemini/` for Google Gemini AI.
  - Lazy initialization ensuring zero unnecessary network calls on cold startup.
  - Secret isolation: Gemini API keys and credentials are strictly kept on the server and never sent to mobile clients.
- **Reliability & Lifecycle**:
  - Centralized Zod-validated environment loading.
  - Strict startup sequence: Server only binds to port after MongoDB connects successfully.
  - Graceful shutdown handles `SIGINT`, `SIGTERM`, unhandled promise rejections, and uncaught exceptions with clean database disconnections.

### 3. Shared Contracts (`packages/shared`)

- Serves as the single source of truth across client and server.
- Contains TypeScript type definitions, API response shapes (`ApiResponse<T>`, `HealthCheckResponse`), route constants (`API_ROUTES`), and error codes (`ERROR_CODES`).
