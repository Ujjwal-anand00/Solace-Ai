import http from 'http';
import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { User } from '../apps/server/src/models/user.model';
import { AssessmentModel } from '../apps/server/src/modules/assessments/assessment.model';
import { WellnessPlanModel } from '../apps/server/src/modules/wellness-plans/wellnessPlan.model';
import { CompanionSettingsModel } from '../apps/server/src/modules/companion/companionSettings.model';
import { Journal } from '../apps/server/src/modules/journal/journal.model';
import { Mood } from '../apps/server/src/modules/mood/mood.model';
import { Activity } from '../apps/server/src/modules/activities/activity.model';
import { GeminiPlanService } from '../apps/server/src/modules/wellness-plans/geminiPlan.service';

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

async function runStep10TestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SOLACE AI - STEP 10 WELLNESS PLANS & ASSESSMENTS TEST SUITE');
  console.log('======================================================\n');

  await Database.connect();
  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5098;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  const timestamp = Date.now();
  const userAEmail = `step10_userA_${timestamp}@solace.ai`;
  const userBEmail = `step10_userB_${timestamp}@solace.ai`;

  let tokenA = '';
  let userIdA = '';
  let tokenB = '';
  let userIdB = '';

  try {
    // 1. Register User A and User B
    const regARes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAEmail,
        password: 'Password123!',
        name: 'Alex Rivera',
      }),
    });
    const regAJson = await regARes.json();
    tokenA = regAJson.data?.tokens?.accessToken;
    userIdA = regAJson.data?.user?.id;

    const regBRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userBEmail,
        password: 'Password123!',
        name: 'Jordan Lee',
      }),
    });
    const regBJson = await regBRes.json();
    tokenB = regBJson.data?.tokens?.accessToken;
    userIdB = regBJson.data?.user?.id;

    assert(
      regARes.status === 201 && Boolean(tokenA) && Boolean(tokenB),
      'Test 1: Register test users and acquire authentication tokens',
    );

    // 2. Unauthorized access blocked (401)
    const unauthRes = await fetch(`${baseUrl}/assessments/types`);
    assert(
      unauthRes.status === 401,
      'Test 2: Unauthorized assessment access is blocked (401)',
    );

    // 3. Load all assessment types
    const typesRes = await fetch(`${baseUrl}/assessments/types`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const typesJson = await typesRes.json();
    const types = typesJson.data || [];
    assert(
      typesRes.status === 200 &&
        types.length === 4 &&
        types.some((t: any) => t.id === 'stress') &&
        types.some((t: any) => t.id === 'sleep') &&
        types.some((t: any) => t.id === 'energy') &&
        types.some((t: any) => t.id === 'emotional-wellbeing'),
      'Test 3: Retrieve all 4 non-diagnostic assessment types',
      `Count: ${types.length}`,
    );

    // 4. Retrieve assessment definition and questions
    const stressDefRes = await fetch(`${baseUrl}/assessments/types/stress`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const stressDefJson = await stressDefRes.json();
    assert(
      stressDefRes.status === 200 &&
        stressDefJson.data.questionsVersion === '1.0' &&
        Array.isArray(stressDefJson.data.questions) &&
        stressDefJson.data.questions.length === 4,
      'Test 4: Retrieve assessment questions and versioning',
      `Questions: ${stressDefJson.data?.questions?.length}`,
    );

    // 5. Validation rejection on invalid option value
    const invalidSubmitRes = await fetch(`${baseUrl}/assessments/stress/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        answers: [{ questionId: 'stress-q1', selectedOption: 99 }],
      }),
    });
    assert(
      invalidSubmitRes.status === 400,
      'Test 5: Assessment submission rejects out-of-range option values',
    );

    // 6. Submit valid assessment and verify score calculation & reflection category
    const validSubmitRes = await fetch(`${baseUrl}/assessments/stress/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        questionsVersion: '1.0',
        answers: [
          { questionId: 'stress-q1', selectedOption: 2 },
          { questionId: 'stress-q2', selectedOption: 2 },
          { questionId: 'stress-q3', selectedOption: 2 },
          { questionId: 'stress-q4', selectedOption: 2 },
        ], // Score = 8 (Elevated Demands)
      }),
    });
    const validSubmitJson = await validSubmitRes.json();
    const createdAssessment = validSubmitJson.data;

    assert(
      validSubmitRes.status === 201 &&
        createdAssessment.score === 8 &&
        createdAssessment.resultCategory === 'Elevated Demands' &&
        createdAssessment.suggestedActivities.length > 0 &&
        Boolean(createdAssessment.disclaimer),
      'Test 6: Submit assessment with accurate score and non-diagnostic categorization',
      `Score: ${createdAssessment?.score}, Category: ${createdAssessment?.resultCategory}`,
    );

    // 7. Verify assessment history persistence
    const historyRes = await fetch(`${baseUrl}/assessments/history`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const historyJson = await historyRes.json();
    assert(
      historyRes.status === 200 &&
        Array.isArray(historyJson.data) &&
        historyJson.data.length >= 1,
      'Test 7: Assessment history persists and is retrievable',
      `History count: ${historyJson.data?.length}`,
    );

    // 8. Retrieve latest assessment by type
    const latestRes = await fetch(`${baseUrl}/assessments/stress/latest`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const latestJson = await latestRes.json();
    assert(
      latestRes.status === 200 &&
        latestJson.data &&
        latestJson.data.assessmentType === 'stress' &&
        latestJson.data.id === createdAssessment.id,
      'Test 8: Retrieve user latest assessment of specific type',
    );

    // 9. Enforce user ownership privacy (User B cannot access User A's assessment)
    const crossAccessRes = await fetch(
      `${baseUrl}/assessments/${createdAssessment.id}`,
      {
        headers: { Authorization: `Bearer ${tokenB}` },
      },
    );
    assert(
      crossAccessRes.status === 403,
      'Test 9: Privacy boundary enforces user ownership on assessments (403 Forbidden)',
    );

    // 10. Generate personalized wellness plan preview
    const genRes = await fetch(`${baseUrl}/wellness-plans/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        focusAreas: ['stress', 'mindfulness'],
        durationDays: 7,
        dailyMinutes: 10,
      }),
    });
    const genJson = await genRes.json();
    const generatedPlan = genJson.data;

    assert(
      genRes.status === 200 &&
        Boolean(generatedPlan.title) &&
        generatedPlan.durationDays === 7 &&
        generatedPlan.dailyTasks.length === 7 &&
        generatedPlan.dailyTasks.every(
          (t: any) => t.durationMinutes > 0 && Boolean(t.category),
        ),
      'Test 10: Generate structured 7-day personalized wellness plan preview',
      `Tasks generated: ${generatedPlan?.dailyTasks?.length}`,
    );

    // 11. Verify plan preview is NOT saved prematurely to DB
    const preCheckPlan = await WellnessPlanModel.findOne({ userId: userIdA });
    assert(
      preCheckPlan === null,
      'Test 11: Plan preview is transient and not prematurely saved to database',
    );

    // 12. Activate wellness plan
    const activateRes = await fetch(`${baseUrl}/wellness-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify(generatedPlan),
    });
    const activateJson = await activateRes.json();
    const activePlan = activateJson.data;

    assert(
      activateRes.status === 201 &&
        activePlan.status === 'active' &&
        activePlan.progress === 0 &&
        activePlan.dailyTasks.length === 7,
      'Test 12: Activate wellness plan and persist to MongoDB',
      `Plan ID: ${activePlan?.id}, Status: ${activePlan?.status}`,
    );

    // 13. Retrieve current active plan
    const currentRes = await fetch(`${baseUrl}/wellness-plans/current`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const currentJson = await currentRes.json();
    assert(
      currentRes.status === 200 && currentJson.data?.id === activePlan.id,
      'Test 13: Retrieve user current active wellness plan',
    );

    // 14. Complete a daily task and verify progress recalculation
    const targetTaskId = activePlan.dailyTasks[0].id;
    const completeTaskRes = await fetch(
      `${baseUrl}/wellness-plans/${activePlan.id}/tasks/${targetTaskId}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ completed: true }),
      },
    );
    const completeTaskJson = await completeTaskRes.json();
    const updatedPlan = completeTaskJson.data;
    const taskCompleted = updatedPlan.dailyTasks.find(
      (t: any) => t.id === targetTaskId,
    )?.completed;
    const expectedProgress = Math.round((1 / 7) * 100);

    assert(
      completeTaskRes.status === 200 &&
        taskCompleted === true &&
        updatedPlan.progress === expectedProgress,
      'Test 14: Daily task completion recalculates overall plan progress',
      `Progress: ${updatedPlan?.progress}% (expected ${expectedProgress}%)`,
    );

    // 15. Skip a task
    const skipTaskId = activePlan.dailyTasks[1].id;
    const skipTaskRes = await fetch(
      `${baseUrl}/wellness-plans/${activePlan.id}/tasks/${skipTaskId}/skip`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenA}` },
      },
    );
    const skipTaskJson = await skipTaskRes.json();
    const skippedTask = skipTaskJson.data.dailyTasks.find(
      (t: any) => t.id === skipTaskId,
    );
    assert(
      skipTaskRes.status === 200 &&
        skippedTask.skipped === true &&
        skippedTask.completed === false,
      'Test 15: Skipping a task sets skipped flag without false completion credit',
    );

    // 16. Pause and Resume Plan
    const pauseRes = await fetch(`${baseUrl}/wellness-plans/${activePlan.id}/pause`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const pauseJson = await pauseRes.json();

    const resumeRes = await fetch(`${baseUrl}/wellness-plans/${activePlan.id}/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const resumeJson = await resumeRes.json();

    assert(
      pauseRes.status === 200 &&
        pauseJson.data.status === 'paused' &&
        resumeRes.status === 200 &&
        resumeJson.data.status === 'active',
      'Test 16: Pausing and resuming a wellness plan transition states properly',
    );

    // 17. Active plan replacement conflict detection
    const duplicateActivateRes = await fetch(`${baseUrl}/wellness-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        ...generatedPlan,
        replaceActive: false,
      }),
    });
    assert(
      duplicateActivateRes.status === 409,
      'Test 17: Activating a new plan when one is active returns 409 Conflict',
    );

    // 18. Replacing active plan with explicit confirmation
    const replaceActivateRes = await fetch(`${baseUrl}/wellness-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        ...generatedPlan,
        title: 'New Replaced Journey',
        replaceActive: true,
      }),
    });
    const replaceJson = await replaceActivateRes.json();
    const oldPlanDoc = await WellnessPlanModel.findById(activePlan.id);

    assert(
      replaceActivateRes.status === 201 &&
        replaceJson.data.status === 'active' &&
        oldPlanDoc?.status === 'abandoned',
      'Test 18: Explicit replaceActive confirms replacement and archives previous plan',
    );

    // 19. Personalized recommendations using real user data
    const recsRes = await fetch(`${baseUrl}/wellness-plans/recommendations`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const recsJson = await recsRes.json();
    const recommendations = recsJson.data || [];

    assert(
      recsRes.status === 200 &&
        Array.isArray(recommendations) &&
        recommendations.length >= 3 &&
        recommendations.every((r: any) => Boolean(r.reason) && Boolean(r.title)),
      'Test 19: Personalized recommendations return contextual reasons from real DB activities',
      `Recommendations: ${recommendations.length}`,
    );

    // 20. Privacy & Consent Guard: Journal data omitted when consent is false
    const contextWithoutConsent = await GeminiPlanService.buildWellnessContext(
      userIdA,
      ['stress'],
      7,
      10,
    );
    assert(
      contextWithoutConsent.includes('Journal personalization not consented.'),
      'Test 20: Privacy Guard strictly omits private journal data when consent is false',
    );

    // Cleanup test data
    await Promise.all([
      User.deleteMany({ _id: { $in: [userIdA, userIdB] } }),
      AssessmentModel.deleteMany({ userId: { $in: [userIdA, userIdB] } }),
      WellnessPlanModel.deleteMany({ userId: { $in: [userIdA, userIdB] } }),
      CompanionSettingsModel.deleteMany({ userId: { $in: [userIdA, userIdB] } }),
      Mood.deleteMany({ userId: { $in: [userIdA, userIdB] } }),
      Journal.deleteMany({ userId: { $in: [userIdA, userIdB] } }),
    ]);
  } catch (error) {
    console.error('Fatal test error:', error);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await Database.disconnect();
  }

  console.log('\n======================================================');
  console.log('📊 STEP 10 TEST SUMMARY');
  console.log('======================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`Total:  ${results.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);

  if (failedCount === 0 && results.length >= 20) {
    console.log('\n🎉 ALL 20 STEP 10 VERIFICATION TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME STEP 10 TESTS FAILED\n');
    process.exit(1);
  }
}

runStep10TestSuite();
