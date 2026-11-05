# Solace AI — Backend API Reference & Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api/v1` (or your local IP `http://<IP>:5000/api/v1`)  
**Standard Response Wrapper:**
```json
{
  "success": true,
  "message": "Human-readable status",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2026-11-05T10:00:00.000Z"
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "message": "Human-readable error description",
  "timestamp": "2026-11-05T10:00:00.000Z",
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL_SERVER_ERROR",
    "message": "Specific details",
    "details": []
  }
}
```

---

## 1. System Health & Readiness

### A. Health Check
- **Endpoint:** `GET /api/v1/health`
- **Auth Required:** None
- **Response:**
  ```json
  {
    "success": true,
    "message": "Solace AI API is running",
    "timestamp": "2026-11-05T10:00:00.000Z",
    "environment": "development",
    "uptime": 124.5
  }
  ```

### B. Readiness Check (Database connection check)
- **Endpoint:** `GET /api/v1/health/ready`
- **Auth Required:** None
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Solace AI API and database are fully operational",
    "data": {
      "status": "ready",
      "environment": "development",
      "database": "connected",
      "uptime": 125.1
    }
  }
  ```
- **Response (503 Service Unavailable):** Returned if MongoDB is disconnected.

---

## 2. Authentication & User Profile (`/api/v1/auth`)

### A. Register Account
- **Endpoint:** `POST /api/v1/auth/register`
- **Auth Required:** None
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "wellnessGoals": ["reduce_stress", "better_sleep"]
  }
  ```
- **Response (201 Created):** Returns user profile and token pair (`accessToken`, `refreshToken`).

### B. Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Auth Required:** None
- **Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK):** Returns user profile and token pair.

### C. Refresh Tokens
- **Endpoint:** `POST /api/v1/auth/refresh`
- **Auth Required:** None
- **Body:**
  ```json
  {
    "refreshToken": "<raw_refresh_token_string>"
  }
  ```

### D. Logout (Session Invalidation)
- **Endpoint:** `POST /api/v1/auth/logout`
- **Auth Required:** `Bearer <accessToken>`
- **Body:** `{ "refreshToken": "<raw_refresh_token_string>" }`

### E. Get Current Profile
- **Endpoint:** `GET /api/v1/auth/me`
- **Auth Required:** `Bearer <accessToken>`

### F. Update Profile
- **Endpoint:** `PATCH /api/v1/auth/me`
- **Auth Required:** `Bearer <accessToken>`
- **Body:**
  ```json
  {
    "name": "Jane Solace",
    "avatarUrl": "mascot-sage",
    "wellnessGoals": ["anxiety_relief", "daily_mindfulness"]
  }
  ```

### G. Delete Account
- **Endpoint:** `DELETE /api/v1/auth/me`
- **Auth Required:** `Bearer <accessToken>`

---

## 3. Mood Tracking (`/api/v1/mood`)

### A. Log Mood Check-in
- **Endpoint:** `POST /api/v1/mood`
- **Auth Required:** `Bearer <accessToken>`
- **Body:**
  ```json
  {
    "mood": "calm",
    "moodIntensity": 8,
    "emotions": ["grounded", "peaceful"],
    "note": "Spent 10 minutes breathing in the garden.",
    "tags": ["morning", "nature"]
  }
  ```
- **Response (201 Created):** Returns created `MoodEntry`. Automatically increments streak and updates user progress.

### B. List Mood Entries (Paginated & Filterable)
- **Endpoint:** `GET /api/v1/mood`
- **Auth Required:** `Bearer <accessToken>`
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20, max: 100)
  - `startDate` (ISO 8601 string, optional)
  - `endDate` (ISO 8601 string, optional)
- **Response (200 OK):** Paginated array of user's own mood entries.

### C. Get Single Mood Entry
- **Endpoint:** `GET /api/v1/mood/:id`
- **Auth Required:** `Bearer <accessToken>`
- **Security:** Strict ownership check (HTTP 403 if accessed by another user).

### D. Update Mood Entry
- **Endpoint:** `PATCH /api/v1/mood/:id`
- **Auth Required:** `Bearer <accessToken>`
- **Body:** `{ "moodIntensity": 9, "note": "Updated reflective note" }`

### E. Delete Mood Entry
- **Endpoint:** `DELETE /api/v1/mood/:id`
- **Auth Required:** `Bearer <accessToken>`

### F. Mood Summary & Trend Aggregation
- **Endpoint:** `GET /api/v1/mood/summary`
- **Auth Required:** `Bearer <accessToken>`
- **Response (200 OK):**
  ```json
  {
    "totalEntries": 14,
    "averageIntensity": 7.4,
    "dominantMood": "calm",
    "topEmotions": [
      { "emotion": "peaceful", "count": 8 },
      { "emotion": "grateful", "count": 5 }
    ],
    "recentTrend": [
      { "date": "2026-11-05", "averageIntensity": 8.0, "count": 2 }
    ]
  }
  ```

---

## 4. Private Journaling (`/api/v1/journal`)

*Privacy Guarantee: Journal titles and contents are strictly encrypted/isolated to the owning user and are never written to application logs.*

### A. Create Journal Entry
- **Endpoint:** `POST /api/v1/journal`
- **Auth Required:** `Bearer <accessToken>`
- **Body:**
  ```json
  {
    "title": "Evening Gratitude & Peace",
    "content": "Today I realized I do not have to do everything perfectly...",
    "prompt": "What brought you unexpected warmth today?",
    "moodAssociation": "calm",
    "tags": ["gratitude", "evening"],
    "isFavorite": true
  }
  ```

### B. List Journal Entries (Paginated, Searchable, Filterable)
- **Endpoint:** `GET /api/v1/journal`
- **Auth Required:** `Bearer <accessToken>`
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 20)
  - `search` (string, full-text search against title & content)
  - `isFavorite` (boolean: `true` / `false`)
  - `tag` (string)

### C. Get Single Journal Entry
- **Endpoint:** `GET /api/v1/journal/:id`
- **Auth Required:** `Bearer <accessToken>`
- **Security:** Enforces 403 Forbidden for non-owners.

### D. Update Journal Entry
- **Endpoint:** `PATCH /api/v1/journal/:id`
- **Auth Required:** `Bearer <accessToken>`

### E. Delete Journal Entry
- **Endpoint:** `DELETE /api/v1/journal/:id`
- **Auth Required:** `Bearer <accessToken>`

---

## 5. Wellness Activities & Breathwork (`/api/v1/activities`)

### A. List Activities
- **Endpoint:** `GET /api/v1/activities`
- **Auth Required:** None (public catalog)
- **Query Parameters:**
  - `category` (string, e.g. `breathing`, `meditation`, `grounding`, `journaling`, `movement`)
  - `difficulty` (string: `beginner`, `intermediate`, `advanced`)

### B. Get Activity Details
- **Endpoint:** `GET /api/v1/activities/:id`
- **Auth Required:** None

### C. Complete Activity
- **Endpoint:** `POST /api/v1/activities/:id/complete`
- **Auth Required:** `Bearer <accessToken>`
- **Body:**
  ```json
  {
    "durationCompleted": 240,
    "feedback": "Felt deeply centering and quieted my mind."
  }
  ```
- **Response (201 Created):** Creates completion record and automatically advances user streak and counters in `UserProgress`.

### D. User Activity History
- **Endpoint:** `GET /api/v1/activities/completed/history`
- **Auth Required:** `Bearer <accessToken>`
- **Query Parameters:** `page`, `limit`

---

## 6. Daily Affirmations (`/api/v1/affirmations`)

### A. List Affirmations
- **Endpoint:** `GET /api/v1/affirmations`
- **Auth Required:** None
- **Query Parameters:** `category` (e.g. `calm`, `self-compassion`, `resilience`, `grounding`), `language`

### B. Get Today's Daily Affirmation
- **Endpoint:** `GET /api/v1/affirmations/daily`
- **Auth Required:** None
- **Query Parameters:** `category`, `language`
- **Behavior:** Deterministically hashes the calendar date `YYYY-MM-DD` to present a unified daily affirmation for all users.

---

## 7. User Progress & Streaks (`/api/v1/progress`)

### A. Get User Progress
- **Endpoint:** `GET /api/v1/progress`
- **Auth Required:** `Bearer <accessToken>`
- **Response (200 OK):**
  ```json
  {
    "userId": "6729e1...",
    "currentStreak": 3,
    "longestStreak": 7,
    "totalActivities": 5,
    "totalMoodCheckIns": 8,
    "totalJournalEntries": 4,
    "totalBreathingSessions": 3,
    "earnedAchievements": [
      "first_checkin",
      "first_journal",
      "first_breathing",
      "streak_3_days"
    ],
    "lastActivityDate": "2026-11-05T10:00:00.000Z"
  }
  ```

### B. Get 14-Day Progress History
- **Endpoint:** `GET /api/v1/progress/history`
- **Auth Required:** `Bearer <accessToken>`
- **Response (200 OK):** Returns chronological 14-day array with daily activity counts, mood check-in booleans, journal booleans, and breathing minutes.

