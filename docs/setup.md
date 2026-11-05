# Solace AI - Development Setup Guide

## Prerequisites

- **Node.js**: v20+ or v22+ (LTS recommended, tested on Node v22.19.0)
- **npm**: v10+ (tested on npm 11.13.0)
- **MongoDB**: Local MongoDB instance (default port 27017) or MongoDB Atlas connection URI
- **Expo Go** or an Android/iOS development emulator

## Installation

From the monorepo root:

```bash
npm install
```

## Environment Configuration

### 1. Server Environment (`apps/server/.env`)

Copy the example file:

```bash
cp apps/server/.env.example apps/server/.env
```

Configure parameters:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/solace_ai
JWT_SECRET=your_32_character_minimum_random_secret_string
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
CLIENT_URL=*
```

### 2. Mobile Environment (`apps/mobile/.env`)

Copy the example file:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Configure parameters:

```env
# For Android Emulator:
# EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api/v1

# For iOS Simulator / Web:
# EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1

# For Physical Android / iOS Device (replace with your computer's LAN IP):
EXPO_PUBLIC_API_URL=http://192.168.1.4:5000/api/v1
```

## Running the Project

### Simultaneous Full-Stack Development

```bash
npm run dev
```

### Backend Only

```bash
npm run server:dev
```

### Mobile Only

```bash
npm run mobile
```

### Verifying Backend Health

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "Solace AI API is running",
  "timestamp": "...",
  "environment": "development"
}
```
