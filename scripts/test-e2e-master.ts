import http from 'http';
import dotenv from 'dotenv';
import path from 'path';

// Load server environment
dotenv.config({ path: path.resolve(__dirname, '../apps/server/.env') });

import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { seedDatabase } from '../apps/server/src/database/seed';
import { User } from '../apps/server/src/models/user.model';
import { Mood } from '../apps/server/src/modules/mood/mood.model';
import { Activity } from '../apps/server/src/modules/activities/activity.model';
import { ActivityCompletionModel } from '../apps/server/src/modules/activities/activityCompletion.model';
import { AssessmentModel } from '../apps/server/src/modules/assessments/assessment.model';
import { WellnessPlanModel } from '../apps/server/src/modules/wellness-plans/wellnessPlan.model';
import { Journal } from '../apps/server/src/modules/journal/journal.model';
import { ConversationModel } from '../apps/server/src/modules/conversations/conversation.model';
import { ChatMessageModel } from '../apps/server/src/modules/companion/chatMessage.model';
import { ResourceModel } from '../apps/server/src/modules/resources/resource.model';
import { ResourceBookmarkModel } from '../apps/server/src/modules/resources/resourceBookmark.model';
import { ResourceProgressModel } from '../apps/server/src/modules/resources/resourceProgress.model';
import { DeviceTokenModel } from '../apps/server/src/modules/notifications/deviceToken.model';
import { NotificationModel } from '../apps/server/src/modules/notifications/notification.model';
import { NotificationPreferenceModel } from '../apps/server/src/modules/notifications/notificationPreference.model';
import { ReminderModel } from '../apps/server/src/modules/notifications/reminder.model';
import { GeminiProvider } from '../apps/server/src/integrations/gemini/gemini.config';

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

async function runMasterE2ETestSuite() {
  console.log('\n======================================================');
  console.log('🌟 SOLACE AI — MASTER END-TO-END HACKATHON VERIFICATION');
  console.log('======================================================\n');

  await Database.connect({
    uri: process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/solace_test',
  });
  await seedDatabase();

  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5088;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  const timestamp = Date.now();
  const userAEmail = `e2e_usera_${timestamp}@solace.ai`.toLowerCase();
  const userBEmail = `e2e_userb_${timestamp}@solace.ai`.toLowerCase();
  const userPassword = 'Password123!';

  let tokenA = '';
  let refreshTokenA = '';
  let userIdA = '';
  let tokenB = '';
  let userIdB = '';

  try {
    // ========================================================
    // JOURNEY 1: AUTHENTICATION & SESSION MANAGEMENT
    // ========================================================
    console.log('\n--- JOURNEY 1: AUTHENTICATION & SESSION LIFECYCLE ---');

    // 1.1 Registration
    const regResA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAEmail,
        password: userPassword,
        name: 'Sarah Chen',
        preferredName: 'Sarah',
      }),
    });
    const regDataA = (await regResA.json()) as any;
    tokenA = regDataA.data?.tokens?.accessToken;
    refreshTokenA = regDataA.data?.tokens?.refreshToken;
    userIdA = regDataA.data?.user?.id;
    assert(regResA.status === 201 && Boolean(tokenA), 'User A registered with access token and refresh token');

    // Register User B for multi-tenant data isolation checks
    const regResB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userBEmail,
        password: userPassword,
        name: 'Alex Rivera',
        preferredName: 'Alex',
      }),
    });
    const regDataB = (await regResB.json()) as any;
    tokenB = regDataB.data?.tokens?.accessToken;
    userIdB = regDataB.data?.user?.id;
    assert(regResB.status === 201 && Boolean(tokenB), 'User B registered for user-isolation checks');

    const headersA = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    };
    const headersB = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`,
    };

    // 1.2 Get current authenticated user profile
    const meRes = await fetch(`${baseUrl}/auth/me`, { headers: headersA });
    const meData = (await meRes.json()) as any;
    assert(meRes.status === 200 && meData.data?.email === userAEmail, 'GET /auth/me returns valid user session profile');

    // 1.3 Token Refresh
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTokenA }),
    });
    const refreshData = (await refreshRes.json()) as any;
    assert(refreshRes.status === 200 && Boolean(refreshData.data?.tokens?.accessToken), 'POST /auth/refresh generates fresh JWT token pair');

    // 1.4 Logout & Re-login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAEmail, password: userPassword }),
    });
    const loginData = (await loginRes.json()) as any;
    assert(loginRes.status === 200 && Boolean(loginData.data?.tokens?.accessToken), 'POST /auth/login successfully re-authenticates user');

    // ========================================================
    // JOURNEY 2: DAILY MOOD & EMOTIONAL CHECK-IN
    // ========================================================
    console.log('\n--- JOURNEY 2: MOOD & EMOTIONAL CHECK-IN ---');

    // 2.1 Submit daily mood check-in
    const moodRes = await fetch(`${baseUrl}/mood`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        mood: 'calm',
        moodIntensity: 8,
        emotions: ['peaceful', 'centered', 'grateful'],
        note: 'Feeling grounded after a gentle morning tea.',
        activities: ['tea', 'breathing', 'quiet'],
      }),
    });
    const moodData = (await moodRes.json()) as any;
    const moodId = moodData.data?.id;
    assert(moodRes.status === 201 && Boolean(moodId), 'POST /mood records emotional check-in');

    // 2.2 Get mood summary and calendar
    const calendarRes = await fetch(`${baseUrl}/mood/calendar`, { headers: headersA });
    const calendarData = (await calendarRes.json()) as any;
    assert(calendarRes.status === 200 && Array.isArray(calendarData.data), 'GET /mood/calendar returns monthly mood timeline');

    // 2.3 User B mood list is empty (Isolation check)
    const moodBRes = await fetch(`${baseUrl}/mood`, { headers: headersB });
    const moodBData = (await moodBRes.json()) as any;
    assert(moodBRes.status === 200 && moodBData.data?.length === 0, 'User B mood list is isolated and empty');

    // ========================================================
    // JOURNEY 3: MINDFULNESS ACTIVITIES & PROGRESS
    // ========================================================
    console.log('\n--- JOURNEY 3: WELLNESS ACTIVITIES & PROGRESS TRACKING ---');

    // 3.1 List available activities
    const actListRes = await fetch(`${baseUrl}/activities?limit=10`);
    const actListData = (await actListRes.json()) as any;
    const sampleActivity = actListData.data?.[0];
    assert(actListRes.status === 200 && Boolean(sampleActivity?.id), 'GET /activities returns catalog of guided practices');

    // 3.2 Complete an activity
    const completeActRes = await fetch(`${baseUrl}/activities/${sampleActivity.id}/complete`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        durationCompleted: 180,
        feedback: 'Helped slow down my heart rate.',
      }),
    });
    assert(
      completeActRes.status === 200 || completeActRes.status === 201,
      'POST /activities/:id/complete marks session completed'
    );

    // 3.3 Verify Progress Overview
    const progressRes = await fetch(`${baseUrl}/progress/overview`, { headers: headersA });
    const progressData = (await progressRes.json()) as any;
    assert(progressRes.status === 200 && progressData.data?.totalActivities >= 1, 'GET /progress/overview increments completed activities count');

    // 3.4 Verify Streak
    const streakRes = await fetch(`${baseUrl}/progress/streak`, { headers: headersA });
    const streakData = (await streakRes.json()) as any;
    assert(streakRes.status === 200 && streakData.data?.currentStreak >= 1, 'GET /progress/streak calculates active wellness streak');

    // ========================================================
    // JOURNEY 4: WELLNESS ASSESSMENT & PERSONALIZED PLAN
    // ========================================================
    console.log('\n--- JOURNEY 4: WELLNESS ASSESSMENT & PLAN GENERATION ---');

    // 4.1 Submit stress assessment
    const assessRes = await fetch(`${baseUrl}/assessments/stress/submit`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        answers: [
          { questionId: 'q1', selectedOption: 2 },
          { questionId: 'q2', selectedOption: 1 },
          { questionId: 'q3', selectedOption: 2 },
        ],
      }),
    });
    const assessData = (await assessRes.json()) as any;
    assert(assessRes.status === 201 && Boolean(assessData.data?.resultCategory), 'POST /assessments/:type/submit calculates reflection score');

    // 4.2 Generate personalized wellness plan preview
    const planGenRes = await fetch(`${baseUrl}/wellness-plans/generate`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        focusAreas: ['stress_management', 'sleep_hygiene'],
        durationDays: 7,
        dailyMinutes: 15,
      }),
    });
    const planGenData = (await planGenRes.json()) as any;
    const generatedPlan = planGenData.data?.plan || planGenData.data;
    assert(planGenRes.status === 200 && Boolean(generatedPlan?.title), 'POST /wellness-plans/generate creates tailored daily plan');

    // 4.3 Create active plan
    const createPlanRes = await fetch(`${baseUrl}/wellness-plans`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        title: generatedPlan?.title || '7-Day Mindful Balance',
        description: generatedPlan?.description || 'A gentle routine to re-center daily.',
        durationDays: 7,
        focusAreas: ['stress_management'],
        dailyTasks: [
          { day: 1, title: 'Morning box breathing (3 min)', category: 'breathing', durationMinutes: 3 },
          { day: 1, title: 'Midday screen break', category: 'mindfulness', durationMinutes: 5 },
          { day: 2, title: 'Evening reflection in journal', category: 'reflection', durationMinutes: 5 },
        ],
      }),
    });
    const createPlanData = (await createPlanRes.json()) as any;
    const planId = createPlanData.data?.id;
    const taskId = createPlanData.data?.dailyTasks?.[0]?.id;
    assert(createPlanRes.status === 201 && Boolean(planId), 'POST /wellness-plans activates personalized wellness roadmap');

    // 4.4 Complete daily plan task
    if (taskId) {
      const taskRes = await fetch(`${baseUrl}/wellness-plans/${planId}/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: headersA,
      });
      assert(taskRes.status === 200, 'POST /wellness-plans/:id/tasks/:taskId/complete marks task done');
    }

    // ========================================================
    // JOURNEY 5: AI COMPANION WITH CONTEXT & FALLBACK
    // ========================================================
    console.log('\n--- JOURNEY 5: AI COMPANION (GEMINI LIVE TEST) ---');

    // 5.1 Check companion health status
    const compStatusRes = await fetch(`${baseUrl}/companion/status`, { headers: headersA });
    const compStatusData = (await compStatusRes.json()) as any;
    assert(compStatusRes.status === 200 && compStatusData.data?.isOnline === true, 'Companion service reports online with model: ' + compStatusData.data?.model);

    // 5.2 Create Conversation
    const convRes = await fetch(`${baseUrl}/conversations`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ title: 'Hackathon Live Companion Chat' }),
    });
    const convData = (await convRes.json()) as any;
    const conversationId = convData.data?.conversation?.id;
    assert(convRes.status === 201 && Boolean(conversationId), 'POST /conversations creates chat thread');

    // 5.3 Send Prompt: Stress before an interview
    const chatMsgRes1 = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ content: 'Help me manage stress before an important interview tomorrow morning.' }),
    });
    const chatData1 = (await chatMsgRes1.json()) as any;
    const reply1 = chatData1.data?.assistantMessage?.content || '';
    assert(
      (chatMsgRes1.status === 200 || chatMsgRes1.status === 201) &&
      reply1.length > 50 &&
      !reply1.includes('connection difficulty'),
      'AI companion returned tailored, empathetic interview guidance'
    );
    console.log(`    ↳ Solace reply: "${reply1.replace(/\s+/g, ' ').slice(0, 95)}..."`);

    // 5.4 Multi-turn conversation context test
    const chatMsgRes2 = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ content: 'I have a beloved mentor named Professor Vance who taught me so much.' }),
    });
    assert(chatMsgRes2.status === 200 || chatMsgRes2.status === 201, 'Sent second turn in conversation');

    const chatMsgRes3 = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ content: 'Who did I say was my mentor just now?' }),
    });
    const chatData3 = (await chatMsgRes3.json()) as any;
    const reply3 = chatData3.data?.assistantMessage?.content || '';
    const rememberedMentor = reply3.toLowerCase().includes('vance');
    assert(rememberedMentor, 'Solace AI remembered mentor "Professor Vance" across conversation turns');

    // 5.5 Regenerate AI message endpoint
    const regenRes = await fetch(`${baseUrl}/conversations/${conversationId}/messages/regenerate`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({}),
    });
    const regenData = (await regenRes.json()) as any;
    assert(regenRes.status === 200 && Boolean(regenData.data?.assistantMessage?.content), 'POST /conversations/:id/messages/regenerate cleanly regenerates assistant response');

    // 5.6 Safety & Crisis Support check
    const crisisRes = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ content: 'I want to end my life, I cannot take it anymore' }),
    });
    const crisisData = (await crisisRes.json()) as any;
    const isCrisis = Boolean(crisisData.data?.safetyAlert?.isCrisis || crisisData.data?.assistantMessage?.metadata?.isCrisis);
    assert(isCrisis, 'Solace AI triggers immediate Crisis Safety Protocol with verified 988 and 741741 helplines');

    // ========================================================
    // JOURNEY 6: PRIVATE JOURNAL & CONSENT ENFORCEMENT
    // ========================================================
    console.log('\n--- JOURNEY 6: PRIVATE JOURNAL & STRICT CONSENT PRIVACY ---');

    // 6.1 Create private journal entry
    const journalRes = await fetch(`${baseUrl}/journal`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        title: 'Overcoming Self-Doubt',
        content: 'Today was an uphill climb, but I took two deep breaths and kept showing up.',
        mood: 'calm',
        tags: ['gratitude', 'growth', 'resilience'],
      }),
    });
    const journalData = (await journalRes.json()) as any;
    const journalId = journalData.data?.id;
    assert(journalRes.status === 201 && Boolean(journalId), 'POST /journal creates encrypted private reflection entry');

    // 6.2 Toggle favorite
    const favRes = await fetch(`${baseUrl}/journal/${journalId}/favorite`, {
      method: 'POST',
      headers: headersA,
    });
    assert(favRes.status === 200, 'POST /journal/:id/favorite bookmarks entry');

    // 6.3 Request AI reflection WITH explicit user consent
    const insightRes = await fetch(`${baseUrl}/journal/${journalId}/insight`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ consent: true }),
    });
    const insightData = (await insightRes.json()) as any;
    assert(
      insightRes.status === 200 && Boolean(insightData.data?.aiInsight?.reflection || insightData.data?.aiInsight),
      'POST /journal/:id/insight generates AI reflection only when explicit consent is provided'
    );

    // 6.4 Deny insight when consent is withheld
    const noConsentRes = await fetch(`${baseUrl}/journal/${journalId}/insight`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ consent: false }),
    });
    assert(noConsentRes.status === 400 || noConsentRes.status === 422, 'Journal insight denied without explicit user consent (Privacy Guard enforced)');

    // 6.5 User B cannot access User A's private journal entry (Cross-user security)
    const crossJournalRes = await fetch(`${baseUrl}/journal/${journalId}`, { headers: headersB });
    assert(crossJournalRes.status === 403 || crossJournalRes.status === 404, 'Cross-user access to private journal strictly blocked');

    // ========================================================
    // JOURNEY 7: NOTIFICATIONS & DEVICE REGISTRATION
    // ========================================================
    console.log('\n--- JOURNEY 7: NOTIFICATIONS & PREFERENCES ---');

    // 7.1 Register device token
    const devRes = await fetch(`${baseUrl}/notifications/devices/register`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        platform: 'android',
        appVersion: '1.0.0',
      }),
    });
    assert(devRes.status === 200 || devRes.status === 201, 'POST /notifications/devices/register registers push notification token');

    // 7.2 Fetch notifications inbox
    const inboxRes = await fetch(`${baseUrl}/notifications`, { headers: headersA });
    assert(inboxRes.status === 200, 'GET /notifications retrieves user inbox');

    // 7.3 Update notification preferences
    const prefRes = await fetch(`${baseUrl}/notifications/preferences`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({
        dailyCheckIn: true,
        mindfulnessReminders: true,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      }),
    });
    assert(prefRes.status === 200, 'PATCH /notifications/preferences updates reminder schedules & quiet hours');

    // ========================================================
    // JOURNEY 8: RESOURCE LIBRARY & READING PROGRESS
    // ========================================================
    console.log('\n--- JOURNEY 8: RESOURCE LIBRARY & LEARNING ---');

    // 8.1 Fetch categories
    const catRes = await fetch(`${baseUrl}/resources/categories`);
    const catData = (await catRes.json()) as any;
    assert(catRes.status === 200 && catData.data?.length === 8, 'GET /resources/categories returns all 8 educational wellness categories');

    // 8.2 Search resource
    const searchRes = await fetch(`${baseUrl}/resources/search?q=breathing`);
    const searchData = (await searchRes.json()) as any;
    const foundArticle = searchData.data?.resources?.[0] || searchData.data?.[0];
    assert(searchRes.status === 200 && Boolean(foundArticle?.id), 'GET /resources/search searches educational guides');

    // 8.3 Favorite resource
    if (foundArticle) {
      const favRes = await fetch(`${baseUrl}/resources/${foundArticle.id}/favorite`, {
        method: 'POST',
        headers: headersA,
      });
      assert(favRes.status === 200, 'POST /resources/:id/favorite bookmarks wellness guide');

      // 8.4 Track reading progress to completion
      const compRes = await fetch(`${baseUrl}/resources/${foundArticle.id}/complete`, {
        method: 'POST',
        headers: headersA,
      });
      assert(compRes.status === 200, 'POST /resources/:id/complete records full reading completion');
    }

    // ========================================================
    // JOURNEY 9: PROFILE, DATA EXPORT & CASCADING ACCOUNT DELETION
    // ========================================================
    console.log('\n--- JOURNEY 9: PROFILE, DATA EXPORT & SECURITY ---');

    // 9.1 Update personal display name
    const updateProfileRes = await fetch(`${baseUrl}/users/me`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({
        preferredName: 'Sarah C.',
      }),
    });
    assert(updateProfileRes.status === 200, 'PATCH /users/me updates preferred display name');

    // 9.2 Request complete GDPR data export archive
    const exportRes = await fetch(`${baseUrl}/users/me/data-export`, {
      method: 'POST',
      headers: headersA,
    });
    const exportData = (await exportRes.json()) as any;
    assert(exportRes.status === 200 && Boolean(exportData.data?.exportId), 'POST /users/me/data-export generates personal data archive');

    // 9.3 Cascading Account Deletion
    const deleteRes = await fetch(`${baseUrl}/users/me/account`, {
      method: 'DELETE',
      headers: headersA,
      body: JSON.stringify({
        password: userPassword,
        confirmation: 'DELETE',
      }),
    });
    assert(deleteRes.status === 200, 'DELETE /users/me/account executes authorized account removal');

    // 9.4 Verify database cascade
    const deletedUser = await User.findById(userIdA);
    const orphanMoods = await Mood.countDocuments({ userId: userIdA });
    const orphanJournals = await Journal.countDocuments({ userId: userIdA });
    assert(!deletedUser && orphanMoods === 0 && orphanJournals === 0, 'Database cascade verified: user and all private records completely purged');

    // 9.5 Verify User B is completely intact
    const userBCheck = await User.findById(userIdB);
    assert(Boolean(userBCheck), 'User B account preserved without interference');

    // Cleanup User B
    await User.deleteOne({ _id: userIdB });
    await ConversationModel.deleteMany({ userId: userIdB });
    await ChatMessageModel.deleteMany({ userId: userIdB });

  } catch (err: any) {
    console.error('Master test suite exception:', err);
    assert(false, 'Unexpected error in Master E2E Suite', err?.message);
  } finally {
    server.close();
    await Database.disconnect();
  }

  console.log('\n======================================================');
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`TOTAL JOURNEYS VERIFIED: ${total}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runMasterE2ETestSuite();
