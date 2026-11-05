import http from 'http';
import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { User } from '../apps/server/src/models/user.model';
import { Activity } from '../apps/server/src/modules/activities/activity.model';
import { ActivityCompletionModel } from '../apps/server/src/modules/activities/activityCompletion.model';
import { ProgressModel } from '../apps/server/src/modules/progress/progress.model';

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

async function runStep09TestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SOLACE AI - STEP 09 WELLNESS ACTIVITIES TEST SUITE');
  console.log('======================================================\n');

  await Database.connect();
  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5097;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  try {
    const timestamp = Date.now();
    const testUserEmail = `activity_test_${timestamp}@solace.ai`;

    // 1. Register test user
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'Password123!',
        name: 'Mindful Yogi',
        preferredName: 'Yogi',
      }),
    });
    const regJson = await regRes.json();
    const token = regJson.data?.tokens?.accessToken;
    const userId = regJson.data?.user?.id;
    assert(regRes.status === 201 && !!token, 'Test 1: User registration & auth token');

    // 2. List all activities
    const allActivitiesRes = await fetch(`${baseUrl}/activities`);
    const allActivitiesJson = await allActivitiesRes.json();
    const allActivities = allActivitiesJson.data || [];
    assert(
      allActivitiesRes.status === 200 && allActivities.length >= 12,
      'Test 2: Retrieve all active activities from MongoDB',
      `Count: ${allActivities.length}`,
    );

    // 3. Filter by category: Breathing
    const breathingRes = await fetch(`${baseUrl}/activities?category=breathing`);
    const breathingJson = await breathingRes.json();
    const breathingActs = breathingJson.data || [];
    const hasBoxBreathing = breathingActs.some((a: any) =>
      a.title.toLowerCase().includes('box breathing'),
    );
    assert(
      breathingRes.status === 200 && breathingActs.length >= 4 && hasBoxBreathing,
      'Test 3: Filter activities by category (Breathing library)',
      `Breathing count: ${breathingActs.length}`,
    );

    // 4. Filter by category: Mindfulness
    const mindfulnessRes = await fetch(`${baseUrl}/activities?category=mindfulness`);
    const mindfulnessJson = await mindfulnessRes.json();
    assert(
      mindfulnessRes.status === 200 && (mindfulnessJson.data || []).length >= 2,
      'Test 4: Filter activities by category (Mindfulness practices)',
    );

    // 5. Filter by category: Relaxation
    const relaxationRes = await fetch(`${baseUrl}/activities?category=relaxation`);
    const relaxationJson = await relaxationRes.json();
    assert(
      relaxationRes.status === 200 && (relaxationJson.data || []).length >= 2,
      'Test 5: Filter activities by category (Relaxation & body scans)',
    );

    // 6. Filter by category: Self-Care
    const selfCareRes = await fetch(`${baseUrl}/activities?category=self-care`);
    const selfCareJson = await selfCareRes.json();
    assert(
      selfCareRes.status === 200 && (selfCareJson.data || []).length >= 2,
      'Test 6: Filter activities by category (Self-Care & micro-resets)',
    );

    // 7. Filter by category: Positive Affirmations
    const affirmationRes = await fetch(`${baseUrl}/activities?category=affirmation`);
    const affirmationJson = await affirmationRes.json();
    assert(
      affirmationRes.status === 200 && (affirmationJson.data || []).length >= 1,
      'Test 7: Filter activities by category (Positive Affirmations)',
    );

    // 8. Filter by category: Reflection
    const reflectionRes = await fetch(`${baseUrl}/activities?category=reflection`);
    const reflectionJson = await reflectionRes.json();
    assert(
      reflectionRes.status === 200 && (reflectionJson.data || []).length >= 2,
      'Test 8: Filter activities by category (Reflection & evening gratitude)',
    );

    // 9. Search activity by title/keyword
    const searchRes = await fetch(`${baseUrl}/activities?search=Box`);
    const searchJson = await searchRes.json();
    assert(
      searchRes.status === 200 &&
        (searchJson.data || []).some((a: any) => a.slug === 'box-breathing'),
      'Test 9: Search activities by text query',
      `Matches: ${(searchJson.data || []).length}`,
    );

    // 10. Filter by difficulty
    const diffRes = await fetch(`${baseUrl}/activities?difficulty=intermediate`);
    const diffJson = await diffRes.json();
    assert(
      diffRes.status === 200 &&
        (diffJson.data || []).every((a: any) => a.difficulty === 'intermediate'),
      'Test 10: Filter activities by difficulty (Intermediate)',
    );

    // 11. Retrieve single activity by ID
    const targetActivity = allActivities[0];
    const singleRes = await fetch(`${baseUrl}/activities/${targetActivity.id}`);
    const singleJson = await singleRes.json();
    assert(
      singleRes.status === 200 && singleJson.data?.id === targetActivity.id,
      'Test 11: Retrieve individual activity by ID',
    );

    // 12. Complete activity and log progress
    const completeRes = await fetch(`${baseUrl}/activities/${targetActivity.id}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        durationCompleted: 180,
        feedback: 'Felt calm and present after breathing.',
      }),
    });
    const completeJson = await completeRes.json();
    assert(
      completeRes.status === 201 &&
        completeJson.data?.activityId === targetActivity.id &&
        completeJson.data?.durationCompleted === 180,
      'Test 12: Record activity completion and save feedback',
      JSON.stringify(completeJson.data),
    );

    // 13. Verify activity completion history
    const historyRes = await fetch(`${baseUrl}/activities/completed/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const historyJson = await historyRes.json();
    assert(
      historyRes.status === 200 &&
        Array.isArray(historyJson.data) &&
        historyJson.data.length === 1 &&
        historyJson.data[0].activityId === targetActivity.id,
      'Test 13: Fetch user completed activities history with populated details',
    );

    // 14. Verify progress tracking integration
    const userProgress = await ProgressModel.findOne({ userId });
    assert(
      !!userProgress && userProgress.currentStreak >= 1 && userProgress.totalActivities >= 1,
      'Test 14: Activity completion updates UserProgress streak and activity count',
      `Streak: ${userProgress?.currentStreak}, Activities: ${userProgress?.totalActivities}`,
    );

    // Cleanup test user and completions
    await Promise.all([
      User.deleteOne({ _id: userId }),
      ActivityCompletionModel.deleteMany({ userId }),
      ProgressModel.deleteMany({ userId }),
    ]);
  } catch (error) {
    console.error('Fatal test error:', error);
    assert(false, 'Fatal Test Error', String(error));
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await Database.disconnect();
  }

  // Summary
  console.log('\n======================================================');
  console.log('📊 TEST SUMMARY');
  console.log('======================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total:  ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.error('\n❌ SOME TESTS FAILED');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL STEP 09 WELLNESS ACTIVITIES TESTS PASSED!');
  }
}

runStep09TestSuite();
