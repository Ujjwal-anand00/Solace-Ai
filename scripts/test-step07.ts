import http from 'http';
import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { Mood } from '../apps/server/src/modules/mood/mood.model';
import { User } from '../apps/server/src/models/user.model';

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

async function runStep07TestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SOLACE AI - STEP 07 MOOD TRACKING SYSTEM TEST SUITE');
  console.log('======================================================\n');

  await Database.connect();
  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5099;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  try {
    const timestamp = Date.now();
    const testUserEmail = `mood_test_${timestamp}@solace.ai`;
    const userTwoEmail = `user_two_${timestamp}@solace.ai`;

    // 1. Register User 1
    const regRes1 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'Password123!',
        name: 'Wellness Seeker',
        preferredName: 'Seeker',
      }),
    });
    const regJson1 = await regRes1.json();
    const token1 = regJson1.data?.tokens?.accessToken;
    assert(regRes1.status === 201 && !!token1, 'Test 1: User 1 registration & authentication');

    // 2. Register User 2 (for authorization and boundary checks)
    const regRes2 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userTwoEmail,
        password: 'Password123!',
        name: 'Second User',
      }),
    });
    const regJson2 = await regRes2.json();
    const token2 = regJson2.data?.tokens?.accessToken;
    assert(regRes2.status === 201 && !!token2, 'Test 2: User 2 registration for privacy boundary');

    // 3. Create Mood Check-In (POST /api/v1/mood)
    const createRes = await fetch(`${baseUrl}/mood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        mood: 'ecstatic',
        moodIntensity: 8,
        emotions: ['grateful', 'calm', 'hopeful'],
        note: 'Feeling deeply at peace after mindful morning meditation.',
        tags: ['health', 'personal growth'],
      }),
    });
    const createJson = await createRes.json();
    const createdMood = createJson.data;
    assert(
      createRes.status === 201 &&
        createdMood?.mood === 'ecstatic' &&
        createdMood?.moodIntensity === 8 &&
        createdMood?.emotions.includes('grateful'),
      'Test 3: Create complete mood check-in (POST /api/v1/mood)',
      createJson.message,
    );

    // 4. Retrieve single mood check-in (GET /api/v1/mood/:id)
    const getRes = await fetch(`${baseUrl}/mood/${createdMood.id}`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const getJson = await getRes.json();
    assert(
      getRes.status === 200 && getJson.data?.id === createdMood.id,
      'Test 4: Retrieve single check-in by ID (GET /api/v1/mood/:id)',
    );

    // 5. Privacy Boundary: User 2 cannot access User 1's mood entry
    const unauthorizedRes = await fetch(`${baseUrl}/mood/${createdMood.id}`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert(
      unauthorizedRes.status === 403,
      'Test 5: Privacy enforcement (User 2 blocked with 403 Forbidden)',
    );

    // 6. Update Mood Check-In (PATCH /api/v1/mood/:id)
    const updateRes = await fetch(`${baseUrl}/mood/${createdMood.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        moodIntensity: 9,
        note: 'Updated: Felt intense joy and calm balance.',
      }),
    });
    const updateJson = await updateRes.json();
    assert(
      updateRes.status === 200 && updateJson.data?.moodIntensity === 9,
      'Test 6: Update existing check-in (PATCH /api/v1/mood/:id)',
    );

    // 7. List check-ins with mood filter (GET /api/v1/mood?mood=ecstatic)
    const listRes = await fetch(`${baseUrl}/mood?mood=ecstatic`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const listJson = await listRes.json();
    assert(
      listRes.status === 200 &&
        listJson.data?.length >= 1 &&
        listJson.data[0].mood === 'ecstatic',
      'Test 7: Filter check-ins by mood category (GET /api/v1/mood?mood=ecstatic)',
    );

    // 8. Mood Calendar Aggregation (GET /api/v1/mood/calendar)
    const now = new Date();
    const calendarRes = await fetch(
      `${baseUrl}/mood/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
      {
        headers: { Authorization: `Bearer ${token1}` },
      },
    );
    const calendarJson = await calendarRes.json();
    const todayStr = now.toISOString().split('T')[0];
    const todayDayItem = calendarJson.data?.find((d: any) => d.date === todayStr);
    assert(
      calendarRes.status === 200 &&
        calendarJson.data?.length > 27 &&
        todayDayItem?.hasCheckIn === true,
      'Test 8: Monthly calendar aggregation with active date indicators (GET /api/v1/mood/calendar)',
    );

    // 9. Mood Summary Statistics (GET /api/v1/mood/summary)
    const summaryRes = await fetch(`${baseUrl}/mood/summary`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const summaryJson = await summaryRes.json();
    assert(
      summaryRes.status === 200 &&
        summaryJson.data?.totalEntries >= 1 &&
        summaryJson.data?.dominantMood === 'ecstatic' &&
        summaryJson.data?.moodDistribution?.ecstatic >= 1,
      'Test 9: Mood analytics summary & distribution (GET /api/v1/mood/summary)',
    );

    // 10. Supportive Rule-Based Insights (GET /api/v1/mood/insights)
    const insightsRes = await fetch(`${baseUrl}/mood/insights?days=30`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const insightsJson = await insightsRes.json();
    assert(
      insightsRes.status === 200 && insightsJson.data?.insights?.length >= 2,
      'Test 10: Rule-based supportive insights (GET /api/v1/mood/insights)',
    );

    // 11. Delete Mood Check-In (DELETE /api/v1/mood/:id)
    const deleteRes = await fetch(`${baseUrl}/mood/${createdMood.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(deleteRes.status === 200, 'Test 11: Delete check-in (DELETE /api/v1/mood/:id)');

    // 12. Confirm deletion resulted in 404
    const verifyDeleteRes = await fetch(`${baseUrl}/mood/${createdMood.id}`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(
      verifyDeleteRes.status === 404,
      'Test 12: Verify deleted entry returns 404 Not Found',
    );

    // Clean up test documents
    await Mood.deleteMany({ userId: { $in: [regJson1.data?.user?.id, regJson2.data?.user?.id] } });
    await User.deleteMany({ _id: { $in: [regJson1.data?.user?.id, regJson2.data?.user?.id] } });

    console.log('\n======================================================');
    const passedCount = results.filter((r) => r.passed).length;
    console.log(`📊 RESULTS: ${passedCount} of ${results.length} tests passed.`);
    console.log('======================================================\n');

    if (passedCount === results.length) {
      console.log('🎉 ALL STEP 07 MOOD TRACKING TESTS PASSED PERFECTLY!\n');
    } else {
      process.exit(1);
    }
  } finally {
    server.close();
    await Database.disconnect();
  }
}

runStep07TestSuite().catch((err) => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});
