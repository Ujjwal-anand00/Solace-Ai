import http from 'http';
import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { seedDatabase } from '../apps/server/src/database/seed';
import { Activity, Mood, Journal } from '../apps/server/src/models';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

const assert = (condition: boolean, name: string, details?: string) => {
  if (condition) {
    console.log(`✅ [PASS] ${name}`);
    results.push({ name, passed: true });
  } else {
    console.error(`❌ [FAIL] ${name} ${details ? '- ' + details : ''}`);
    results.push({ name, passed: false, details });
  }
};

async function runStep05TestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SOLACE AI - STEP 05 BACKEND FOUNDATION TEST SUITE');
  console.log('======================================================\n');

  // Step 1: Initialize MongoDB Connection
  await Database.connect();
  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5098;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  try {
    // 1. Test MongoDB Connection & Readiness Check
    const healthRes = await fetch(`${baseUrl}/health/ready`);
    const healthJson = await healthRes.json();
    assert(
      healthRes.status === 200 && healthJson.data?.database === 'connected',
      'Test 1: MongoDB Connection and Readiness Check (GET /health/ready)',
    );

    // 2. Test Seed Script & Repeated Execution (Idempotency)
    await seedDatabase();
    const countAfterFirst = await Activity.countDocuments();
    await seedDatabase();
    const countAfterSecond = await Activity.countDocuments();
    assert(
      countAfterFirst > 0 && countAfterFirst === countAfterSecond,
      'Test 2: Seed Script Repeated Execution & Zero Duplicate Guarantee',
      `Count 1: ${countAfterFirst}, Count 2: ${countAfterSecond}`,
    );

    // 3. Register Two Distinct Users for Data Isolation Tests
    const userAEmail = `user_a_${Date.now()}@test.com`;
    const userBEmail = `user_b_${Date.now()}@test.com`;

    const regResA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User Alpha',
        email: userAEmail,
        password: 'Password123!',
      }),
    });
    const regJsonA = await regResA.json();
    const tokenA = regJsonA.data.tokens.accessToken;
    const userAId = regJsonA.data.user.id;

    const regResB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User Beta',
        email: userBEmail,
        password: 'Password123!',
      }),
    });
    const regJsonB = await regResB.json();
    const tokenB = regJsonB.data.tokens.accessToken;

    assert(
      Boolean(tokenA && tokenB),
      'User Registration (User Alpha & User Beta)',
    );

    // 4. Test Mood CRUD (Create, Read, Update, Delete)
    const moodCreateRes = await fetch(`${baseUrl}/mood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        mood: 'calm',
        moodIntensity: 8,
        emotions: ['peaceful', 'grounded'],
        note: 'Feeling deeply serene after meditation.',
        tags: ['morning', 'garden'],
      }),
    });
    const moodCreateJson = await moodCreateRes.json();
    const moodId = moodCreateJson.data?.id;

    assert(
      moodCreateRes.status === 201 && moodCreateJson.data?.mood === 'calm',
      'Test 3: Mood Entry Creation (POST /mood)',
    );

    const moodGetRes = await fetch(`${baseUrl}/mood/${moodId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const moodGetJson = await moodGetRes.json();
    assert(
      moodGetRes.status === 200 && moodGetJson.data?.id === moodId,
      'Test 4: Mood Entry Retrieval by ID (GET /mood/:id)',
    );

    const moodUpdateRes = await fetch(`${baseUrl}/mood/${moodId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ moodIntensity: 9 }),
    });
    const moodUpdateJson = await moodUpdateRes.json();
    assert(
      moodUpdateRes.status === 200 && moodUpdateJson.data?.moodIntensity === 9,
      'Test 5: Mood Entry Update (PATCH /mood/:id)',
    );

    const moodSummaryRes = await fetch(`${baseUrl}/mood/summary`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const moodSummaryJson = await moodSummaryRes.json();
    assert(
      moodSummaryRes.status === 200 && moodSummaryJson.data?.totalEntries >= 1,
      'Test 6: Mood Summary & Trend Calculation (GET /mood/summary)',
    );

    // 5. Test Journal CRUD
    const journalCreateRes = await fetch(`${baseUrl}/journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Morning Reflections',
        content: 'The quiet dawn brought a stillness I rarely allow myself.',
        prompt: 'What brings you peace?',
        isFavorite: true,
      }),
    });
    const journalCreateJson = await journalCreateRes.json();
    const journalId = journalCreateJson.data?.id;

    assert(
      journalCreateRes.status === 201 && journalCreateJson.data?.title === 'Morning Reflections',
      'Test 7: Journal Entry Creation (POST /journal)',
    );

    const journalListRes = await fetch(`${baseUrl}/journal?search=stillness`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const journalListJson = await journalListRes.json();
    assert(
      journalListRes.status === 200 && journalListJson.data?.length >= 1,
      'Test 8: Journal Full-Text Search and Listing (GET /journal?search=stillness)',
    );

    // 6. Test User-Specific Data Isolation & Forbidden Access
    const crossAccessMood = await fetch(`${baseUrl}/mood/${moodId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const crossAccessJournal = await fetch(`${baseUrl}/journal/${journalId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });

    assert(
      crossAccessMood.status === 403 && crossAccessJournal.status === 403,
      'Test 9: User-Specific Data Isolation (Cross-user access returns 403 Forbidden)',
    );

    // 7. Test Activities Retrieval and Completion
    const activitiesRes = await fetch(`${baseUrl}/activities?category=breathing`);
    const activitiesJson = await activitiesRes.json();
    const breathingActivity = activitiesJson.data?.[0];

    assert(
      activitiesRes.status === 200 && activitiesJson.data?.length > 0,
      'Test 10: Activities Retrieval by Category (GET /activities?category=breathing)',
    );

    const completeActivityRes = await fetch(
      `${baseUrl}/activities/${breathingActivity.id}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
          durationCompleted: 240,
          feedback: 'Very relaxing box breathing pattern.',
        }),
      },
    );
    const completeActivityJson = await completeActivityRes.json();

    assert(
      completeActivityRes.status === 201 && completeActivityJson.data?.durationCompleted === 240,
      'Test 11: Activity Completion Recording (POST /activities/:id/complete)',
    );

    // 8. Test Affirmations Retrieval & Deterministic Daily Feature
    const affirmationsRes = await fetch(`${baseUrl}/affirmations`);
    const dailyAffirmationRes = await fetch(`${baseUrl}/affirmations/daily`);
    const dailyAffirmationJson = await dailyAffirmationRes.json();

    assert(
      affirmationsRes.status === 200 && Boolean(dailyAffirmationJson.data?.text),
      'Test 12: Affirmations Catalog and Daily Deterministic Feature (GET /affirmations/daily)',
    );

    // 9. Test User Progress & Streak Tracking
    const progressRes = await fetch(`${baseUrl}/progress`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const progressJson = await progressRes.json();
    const progressHistoryRes = await fetch(`${baseUrl}/progress/history`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const progressHistoryJson = await progressHistoryRes.json();

    assert(
      progressRes.status === 200 &&
        progressJson.data?.currentStreak >= 1 &&
        progressJson.data?.totalActivities >= 1 &&
        progressHistoryJson.data?.length === 14,
      'Test 13: User Progress & Streak Metrics (GET /progress & /progress/history)',
      `Streak: ${progressJson.data?.currentStreak}, Activities: ${progressJson.data?.totalActivities}`,
    );

    // 10. Test Pagination Behavior
    const paginatedMoods = await fetch(`${baseUrl}/mood?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const paginatedJson = await paginatedMoods.json();

    assert(
      paginatedMoods.status === 200 &&
        paginatedJson.meta?.page === 1 &&
        paginatedJson.meta?.limit === 1 &&
        paginatedJson.data?.length === 1,
      'Test 14: Pagination Limit, Skip & Metadata (GET /mood?page=1&limit=1)',
    );

    // 11. Test Request Validation (Zod Validation Error 422)
    const invalidMoodRes = await fetch(`${baseUrl}/mood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        mood: '', // Invalid empty string
        moodIntensity: 25, // Invalid > 10
      }),
    });
    const invalidMoodJson = await invalidMoodRes.json();

    assert(
      invalidMoodRes.status === 422 && invalidMoodJson.error?.code === 'VALIDATION_ERROR',
      'Test 15: Input Validation & 422 Error Formatting (POST /mood with invalid payload)',
    );

    // 12. Test Unauthorized Requests
    const unauthRes = await fetch(`${baseUrl}/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Secret', content: 'Hidden' }),
    });

    assert(
      unauthRes.status === 401,
      'Test 16: Unauthorized Request Rejection (401 without Bearer token)',
    );

    // 13. Test Deleting User-Owned Records & 404 on Subsequent Access
    const deleteRes = await fetch(`${baseUrl}/mood/${moodId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const getDeletedRes = await fetch(`${baseUrl}/mood/${moodId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    assert(
      deleteRes.status === 200 && getDeletedRes.status === 404,
      'Test 17: User-Owned Record Deletion and 404 Post-Deletion Check',
    );
  } finally {
    server.close();
    await Database.disconnect();
  }

  // Final Summary
  const passedCount = results.filter((r) => r.passed).length;
  console.log('\n======================================================');
  console.log(`🎯 TEST RESULTS: ${passedCount}/${results.length} PASSED`);
  console.log('======================================================\n');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runStep05TestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
