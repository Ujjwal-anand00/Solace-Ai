# Solace AI – Premium AI-Powered Mental Wellness Companion

> A private, empathetic, and intelligent mobile sanctuary designed to help individuals feel, heal, and grow through mindful reflection, active support, and continuous emotional empowerment.

---

## 1. Project Overview

**Solace AI** is a state-of-the-art mental wellness companion mobile application. It combines personalized emotional tracking, empathetic conversational AI, guided mindfulness interventions, reflective journaling, and longitudinal progress tracking within a privacy-first mobile architecture.

This repository is structured as an enterprise-grade monorepo containing:

- **`apps/mobile`**: An Expo-powered React Native mobile application built with TypeScript, Expo Router, Zustand, and TanStack Query.
- **`apps/server`**: A Node.js & Express.js REST API with TypeScript, MongoDB (via Mongoose), Helmet, CORS, rate-limiting, and Google Gemini SDK preparation.
- **`packages/shared`**: Shared TypeScript types, API response schemas, route definitions, and error constants.
- **`docs`**: Architectural and setup documentation.

---

## 2. Technology Stack

### Mobile Client (`apps/mobile`)

- **Core**: React Native 0.76, Expo SDK 52
- **Language**: TypeScript (Strict Mode)
- **Navigation**: Expo Router (v4 file-based routing)
- **Client State**: Zustand
- **Server State & Caching**: TanStack Query (React Query v5)
- **Styling**: NativeWind v4 (Tailwind CSS) & typed design tokens
- **Animations**: React Native Reanimated v3
- **Sensory & Feedback**: Expo Haptics
- **Secure Persistence**: Expo SecureStore (encrypted keychain/keystore) & AsyncStorage
- **Forms & Validation**: React Hook Form, Zod
- **Networking**: Axios client with interceptors
- **Icons**: Lucide React Native (via `react-native-svg`)

### Backend Server (`apps/server`)

- **Runtime & Language**: Node.js, TypeScript (Strict Mode)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod schema validation
- **Security**: Helmet security headers, CORS origin controls, Express Rate Limit
- **Authentication**: JWT signing and verification infrastructure, bcrypt password hashing
- **AI Integration**: Official Google Gemini SDK (`@google/genai`) provider with lazy initialization
- **Logging**: Morgan HTTP logger and structured application logger
- **Configuration**: dotenv with strict Zod environment parsing

### Development & Tooling

- **Monorepo Manager**: npm workspaces
- **Linting & Formatting**: ESLint (v9 flat config), Prettier
- **Build & Execution**: `tsx` (fast Node TypeScript execution), TypeScript compiler (`tsc`)

---

## 3. Architecture Overview

```
solace-ai/
├── apps/
│   ├── mobile/         # Client presentation layer (Expo / React Native)
│   └── server/         # API business layer (Express / MongoDB)
├── packages/
│   └── shared/         # Data contracts & shared constants
└── docs/               # System documentation
```

Key architectural principles:

- **Strict Separation of Concerns**: AI keys, database credentials, and backend secrets are never bundled or exposed to the mobile client.
- **Fail-Fast Startup**: The backend only starts serving traffic after successfully connecting to MongoDB.
- **Clean Contracts**: Client and server share unified TypeScript types and routes via `@solace/shared`.
- **Graceful Lifecycle Management**: The backend cleanly handles `SIGINT`, `SIGTERM`, and unhandled rejections, disconnecting database connections before process exit.

---

## 4. Folder Structure

```
solace-ai/
│
├── apps/
│   ├── mobile/
│   │   ├── app/
│   │   │   ├── _layout.tsx           # Minimal root layout (Providers, ErrorBoundary)
│   │   │   └── index.tsx             # Temporary verification screen
│   │   │
│   │   ├── assets/
│   │   │   ├── images/               # Icons, splash screen, adaptive icons
│   │   │   ├── icons/                # Custom vector icon assets
│   │   │   ├── fonts/                # Custom typography font assets
│   │   │   └── animations/           # Lottie / Rive animation assets
│   │   │
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Reusable UI atoms (Button, Card, Input)
│   │   │   │   ├── common/           # Common components (ErrorBoundary)
│   │   │   │   └── layout/           # Screen and header layout containers
│   │   │   │
│   │   │   ├── features/             # Modular feature slices
│   │   │   │   ├── onboarding/       # Onboarding flow
│   │   │   │   ├── auth/             # Authentication & session recovery
│   │   │   │   ├── home/             # Home dashboard
│   │   │   │   ├── companion/        # AI Companion conversations
│   │   │   │   ├── mood/             # Daily mood logging & check-ins
│   │   │   │   ├── wellness/         # Mindfulness & breathing exercises
│   │   │   │   ├── journal/          # Reflective journaling
│   │   │   │   ├── affirmations/     # Daily affirmations
│   │   │   │   ├── progress/         # Emotional analytics & streaks
│   │   │   │   └── profile/          # User preferences & account
│   │   │   │
│   │   │   ├── hooks/                # Custom React hooks (API queries/mutations)
│   │   │   ├── services/             # API client, SecureStore, AsyncStorage
│   │   │   ├── store/                # Zustand global state slices
│   │   │   ├── constants/            # Application constants
│   │   │   ├── theme/                # Colors, typography, spacing tokens
│   │   │   ├── utils/                # Haptics, formatting utilities
│   │   │   ├── types/                # Client-specific type definitions
│   │   │   └── config/               # Client environment configuration
│   │   │
│   │   ├── app.json                  # Expo app configuration
│   │   ├── tsconfig.json             # TypeScript strict configuration
│   │   ├── package.json              # Mobile package dependencies
│   │   ├── babel.config.js           # Babel preset and Reanimated plugin
│   │   ├── metro.config.js           # Metro monorepo & NativeWind config
│   │   ├── tailwind.config.js        # Tailwind CSS styling tokens
│   │   ├── global.css                # Global CSS directives
│   │   └── .env.example              # Mobile environment variables example
│   │
│   └── server/
│       ├── src/
│       │   ├── config/               # Centralized Zod env validation
│       │   ├── controllers/          # Request handlers (Health, etc.)
│       │   ├── services/             # Business logic & Auth (JWT, bcrypt)
│       │   ├── models/               # Mongoose schema definitions
│       │   ├── routes/               # Express API v1 route definitions
│       │   ├── middlewares/          # Error, 404, Rate Limiter middlewares
│       │   ├── validators/           # Zod request validation middleware
│       │   ├── utils/                # ApiResponse, AppError, Logger
│       │   ├── types/                # Express request extensions
│       │   ├── constants/            # Server-specific constants
│       │   ├── integrations/
│       │   │   └── gemini/           # Google Gemini provider & configuration
│       │   ├── database/             # Mongoose connection & lifecycle manager
│       │   ├── app.ts                # Express app factory (Security, CORS, routes)
│       │   └── server.ts             # Server entry point (Strict startup sequence)
│       │
│       ├── package.json              # Server dependencies
│       ├── tsconfig.json             # TypeScript strict configuration
│       └── .env.example              # Server environment variables example
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types/                # Shared API, Auth, User, Mood, Wellness types
│       │   ├── constants/            # Shared routes and error codes
│       │   └── index.ts              # Package entry point
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                             # Architecture and setup documentation
├── .gitignore                        # Git exclusion rules
├── .prettierrc                       # Code formatting rules
├── eslint.config.js                  # ESLint 9 flat configuration
├── package.json                      # Monorepo root configuration & scripts
├── README.md                         # Project documentation
└── .env.example                      # Root environment reference
```

---

## 5. Prerequisites

Before installing the project, ensure you have:

1. **Node.js**: `v20.x` or `v22.x` (LTS recommended; tested on `v22.19.0`).
2. **npm**: `v10.x` or higher (tested on `npm 11.13.0`).
3. **MongoDB**: Local MongoDB community server running on port `27017` or an accessible remote MongoDB Atlas instance.
4. **Expo Go** app installed on your physical mobile device (Android or iOS) OR an Android Studio Emulator / iOS Simulator.

---

## 6. Installation Instructions

Clone the repository and install all dependencies from the root directory:

```bash
git clone <repository-url>
cd solace-ai
npm install
```

This single command installs all dependencies across `apps/mobile`, `apps/server`, and `packages/shared` using npm workspaces.

---

## 7. Environment Variable Setup

### Backend Environment Configuration

Create the `.env` file for the backend server:

```bash
# On Linux / macOS / Git Bash:
cp apps/server/.env.example apps/server/.env

# On Windows PowerShell:
Copy-Item apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/solace_ai
JWT_SECRET=your_32_character_minimum_random_secret_string
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
CLIENT_URL=*
```

### Mobile Environment Configuration

Create the `.env` file for the mobile app:

```bash
# On Linux / macOS / Git Bash:
cp apps/mobile/.env.example apps/mobile/.env

# On Windows PowerShell:
Copy-Item apps/mobile/.env.example apps/mobile/.env
```

Edit `apps/mobile/.env`:

```env
# Physical Android device: use machine LAN IP (e.g. 192.168.1.4)
# Android Emulator: http://10.0.2.2:5000/api/v1
# iOS Simulator / Web: http://localhost:5000/api/v1
EXPO_PUBLIC_API_URL=http://192.168.1.4:5000/api/v1
```

---

## 8. MongoDB Setup

Solace AI requires a running MongoDB database.

### Local MongoDB Service

- **Windows**: Verify that MongoDB is running via PowerShell:
  ```powershell
  Get-Service -Name *mongo*
  ```
  If stopped, start it:
  ```powershell
  Start-Service -Name MongoDB
  ```
- **macOS (Homebrew)**:
  ```bash
  brew services start mongodb/brew/mongodb-community
  ```
- **Linux (systemd)**:
  ```bash
  sudo systemctl start mongod
  ```

---

## 9. Database Seeding

Populate the database with curated wellness activities, affirmations, achievements, and mental health resources using the safe, idempotent seed script:

```bash
npm run seed
```

*Note: The seed script uses unique slug/criteria upserts so it is completely safe to run repeatedly without creating duplicates or affecting user-generated data.*

---

## 10. How to Start the Backend

From the monorepo root, execute:

```bash
npm run server:dev
```

You will see:

```text
[INFO] Starting Solace AI Backend initialization sequence...
[INFO] Connecting to MongoDB (attempt 1/3)...
[INFO] MongoDB connection established successfully.
[INFO]  Solace AI API server running at http://localhost:5000
[INFO]  Health endpoint available at http://localhost:5000/api/v1/health
[INFO]  Readiness check available at http://localhost:5000/api/v1/health/ready
```

---

## 11. API Documentation & Postman Collection

- Complete API Reference: [`docs/api.md`](./docs/api.md)
- Postman Collection: [`docs/solace-ai.postman_collection.json`](./docs/solace-ai.postman_collection.json)

---

## 12. How to Start Expo

From the monorepo root, run:

```bash
npm run mobile
```

To run on a specific platform directly:

- **Android**: `npm run mobile:android`
- **iOS**: `npm run mobile:ios`
- **Web**: `npm run mobile:web`

To run both backend and mobile concurrently:

```bash
npm run dev
```

---

## 11. How to Test API Health

With the backend running, test the health endpoint using `curl` or any browser / API client:

```bash
curl http://localhost:5000/api/v1/health
```

Expected HTTP `200 OK` JSON response:

```json
{
  "success": true,
  "message": "Solace AI API is running",
  "timestamp": "2026-11-05T06:30:00.000Z",
  "environment": "development"
}
```

---

## 12. Android Physical Device Networking Instructions

When testing on a **physical Android device** running the Expo Go app:

1. **Do not use `localhost` or `127.0.0.1`**:
   `localhost` on an Android phone refers to the phone itself, not your development computer.
2. **Ensure Both Devices are on the Same Wi-Fi Network**:
   Your computer and Android phone must be connected to the exact same Wi-Fi network.
3. **Find Your Computer's LAN IP Address**:
   - **Windows**: Run `ipconfig` in PowerShell. Look for `IPv4 Address` under your active Wi-Fi adapter (e.g. `192.168.1.4`).
   - **macOS / Linux**: Run `ip route` or `ifconfig`.
4. **Update `apps/mobile/.env`**:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.4:5000/api/v1
   ```
5. **Windows Defender / Firewall**:
   Ensure inbound connections to port `5000` are permitted through your firewall for local private networks.

---

## 13. Quality Scripts & Verification

| Command                | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Runs backend development server and Expo concurrently  |
| `npm run mobile`       | Starts Expo development server                         |
| `npm run server:dev`   | Starts backend with hot reloading via `tsx`            |
| `npm run typecheck`    | Runs TypeScript type checking across all workspaces    |
| `npm run lint`         | Runs ESLint 9 checks across mobile, server, and shared |
| `npm run format:check` | Verifies code formatting with Prettier                 |
| `npm run clean`        | Cleans `node_modules` and compiled build outputs       |

---

## License

Private & Confidential – Solace AI Hackathon Project.
