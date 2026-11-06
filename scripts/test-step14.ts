import http from 'http';
import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { User } from '../apps/server/src/models/user.model';
import { Session } from '../apps/server/src/models/session.model';
import { Mood } from '../apps/server/src/modules/mood/mood.model';
import { Journal } from '../apps/server/src/modules/journal/journal.model';
import { ConversationModel } from '../apps/server/src/modules/conversations/conversation.model';
import { ReminderModel } from '../apps/server/src/modules/notifications/reminder.model';
import { DeviceModel } from '../apps/server/src/modules/notifications/device.model';

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

async function runStep14TestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SOLACE AI - STEP 14 PROFILE & SETTINGS TEST SUITE');
  console.log('======================================================\n');

  await Database.connect({
    uri: process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/solace_test',
  });
  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5097;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  const timestamp = Date.now();
  const userAEmail = `step14_userA_${timestamp}@solace.ai`;
  const userBEmail = `step14_userB_${timestamp}@solace.ai`;

  let tokenA = '';
  let userIdA = '';
  let tokenB = '';
  let userIdB = '';

  try {
    // ---------------------------------------------------------
    // 1. Setup: Register User A and User B
    // ---------------------------------------------------------
    console.log('\n--- 1. Authentication & Multi-Tenant Setup ---');

    const regResA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Step 14 User A',
        email: userAEmail,
        password: 'Password123!',
      }),
    });
    const regDataA = (await regResA.json()) as any;
    assert(regResA.status === 201 && !!regDataA.data?.tokens?.accessToken, 'User A registered successfully');
    tokenA = regDataA.data.tokens.accessToken;
    userIdA = regDataA.data.user.id;

    const regResB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Step 14 User B',
        email: userBEmail,
        password: 'Password123!',
      }),
    });
    const regDataB = (await regResB.json()) as any;
    assert(regResB.status === 201 && !!regDataB.data?.tokens?.accessToken, 'User B registered successfully');
    tokenB = regDataB.data.tokens.accessToken;
    userIdB = regDataB.data.user.id;

    // ---------------------------------------------------------
    // 2. Profile Management (/users/me)
    // ---------------------------------------------------------
    console.log('\n--- 2. Profile Inspection & Updates ---');

    const profileRes = await fetch(`${baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const profileData = (await profileRes.json()) as any;
    assert(profileRes.status === 200, 'GET /users/me returns 200');
    assert(
      profileData.data.email.toLowerCase() === userAEmail.toLowerCase(),
      'Profile email matches registered email',
      `Got ${profileData.data.email}, expected ${userAEmail}`,
    );

    // Update profile
    const updateRes = await fetch(`${baseUrl}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        preferredName: 'Aria',
        bio: 'Gentle mindful seeker finding calm each day.',
        timezone: 'Asia/Kolkata',
      }),
    });
    const updateData = (await updateRes.json()) as any;
    assert(updateRes.status === 200, 'PATCH /users/me updates profile (200)');
    assert(updateData.data.preferredName === 'Aria', 'preferredName updated correctly');
    assert(updateData.data.timezone === 'Asia/Kolkata', 'timezone updated correctly');

    // Update Avatar
    const avatarRes = await fetch(`${baseUrl}/users/me/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      }),
    });
    const avatarData = (await avatarRes.json()) as any;
    assert(avatarRes.status === 200 && !!avatarData.data.avatarUrl, 'POST /users/me/avatar sets avatar URL');

    // Remove Avatar
    const removeAvatarRes = await fetch(`${baseUrl}/users/me/avatar`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const removeAvatarData = (await removeAvatarRes.json()) as any;
    assert(removeAvatarRes.status === 200 && removeAvatarData.data.avatarUrl === '', 'DELETE /users/me/avatar removes avatar');

    // ---------------------------------------------------------
    // 3. Wellness & Accessibility Preferences (/users/me/preferences)
    // ---------------------------------------------------------
    console.log('\n--- 3. Wellness & Accessibility Preferences ---');

    const prefRes = await fetch(`${baseUrl}/users/me/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        wellnessPreferences: {
          goals: ['manage_stress', 'improve_sleep'],
          preferredActivityDurationMinutes: 15,
          preferredCategories: ['breathing', 'mindfulness'],
        },
        accessibilityPreferences: {
          reduceMotion: true,
          hapticFeedback: true,
        },
        themePreference: 'dark',
      }),
    });
    const prefData = (await prefRes.json()) as any;
    assert(prefRes.status === 200, 'PATCH /users/me/preferences returns 200');
    assert(prefData.data.wellnessPreferences.preferredActivityDurationMinutes === 15, 'Activity duration saved');
    assert(prefData.data.accessibilityPreferences.reduceMotion === true, 'reduceMotion saved');
    assert(prefData.data.themePreference === 'dark', 'themePreference saved');

    // ---------------------------------------------------------
    // 4. AI Companion Personalization Settings
    // ---------------------------------------------------------
    console.log('\n--- 4. AI Companion Settings & Independence ---');

    const companionPrefRes = await fetch(`${baseUrl}/companion/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        preferredTone: 'gentle',
        enablePersonalization: false,
        journalPersonalizationConsent: false,
      }),
    });
    const companionPrefData = (await companionPrefRes.json()) as any;
    assert(companionPrefRes.status === 200, 'PATCH /companion/settings returns 200');
    assert(companionPrefData.data.preferredTone === 'gentle', 'preferredTone set to gentle');
    assert(companionPrefData.data.enablePersonalization === false, 'enablePersonalization toggled false');
    assert(companionPrefData.data.journalPersonalizationConsent === false, 'journalPersonalizationConsent independent');

    // ---------------------------------------------------------
    // 5. Security: Sessions & Password Change
    // ---------------------------------------------------------
    console.log('\n--- 5. Security & Session Management ---');

    // Create mock active session
    await Session.create({
      userId: userIdA,
      refreshTokenHash: 'hash_test_session_123',
      userAgent: 'Solace iOS Client',
      ipAddress: '192.168.1.1',
      expiresAt: new Date(Date.now() + 86400000),
    });

    const sessionsRes = await fetch(`${baseUrl}/users/me/sessions`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const sessionsData = (await sessionsRes.json()) as any;
    assert(sessionsRes.status === 200, 'GET /users/me/sessions returns 200');
    assert(sessionsData.data.length >= 1, 'Active session listed');

    // Change Password
    const changePwdRes = await fetch(`${baseUrl}/users/me/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123#',
      }),
    });
    assert(changePwdRes.status === 200, 'POST /users/me/change-password succeeds with valid input');

    // Verify session invalidation
    const sessionsAfterPwd = await Session.find({ userId: userIdA, isRevoked: false });
    assert(sessionsAfterPwd.length === 0, 'Password change revokes prior active sessions');

    // ---------------------------------------------------------
    // 6. Data Transparency & Data Export Archive
    // ---------------------------------------------------------
    console.log('\n--- 6. Data Transparency & Export ---');

    // Add sample mood & journal to ensure they are captured in export
    await Mood.create({
      userId: userIdA,
      mood: 'calm',
      moodIntensity: 8,
      emotions: ['peaceful'],
      note: 'Export verification note',
    });

    await Journal.create({
      userId: userIdA,
      title: 'Export Journal',
      content: 'This should be included in data export',
      category: 'free_write',
    });

    const exportRes = await fetch(`${baseUrl}/users/me/data-export`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const exportData = (await exportRes.json()) as any;
    assert(exportRes.status === 200, 'POST /users/me/data-export succeeds (200)');
    assert(exportData.data.status === 'ready', 'Export status is ready');
    assert(!!exportData.data.data.records.moodEntries, 'Export payload contains mood entries');
    assert(!!exportData.data.data.records.journalEntries, 'Export payload contains journal entries');

    const exportId = exportData.data.exportId;
    const fetchExportRes = await fetch(`${baseUrl}/users/me/data-export/${exportId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(fetchExportRes.status === 200, 'GET /users/me/data-export/:id returns export package');

    // User B cannot access User A's data export
    const crossExportRes = await fetch(`${baseUrl}/users/me/data-export/${exportId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(crossExportRes.status === 404 || crossExportRes.status === 403, 'Cross-user access to data export denied (403/404)');

    // ---------------------------------------------------------
    // 7. Feedback Submission
    // ---------------------------------------------------------
    console.log('\n--- 7. Feedback Submission ---');

    const feedbackRes = await fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        category: 'feature',
        message: 'Loving the guided breathing and journal!',
        rating: 5,
      }),
    });
    assert(feedbackRes.status === 201, 'POST /feedback returns 201 created');

    // ---------------------------------------------------------
    // 8. Account Deletion & Cascading Removal
    // ---------------------------------------------------------
    console.log('\n--- 8. Account Deletion & Cascading Cleanup ---');

    // Add reminder & device for User A
    await ReminderModel.create({
      userId: userIdA,
      type: 'daily_wellness',
      title: 'Reminder test',
      message: 'Take a breath',
      time: '08:00',
      daysOfWeek: [1, 2, 3],
    });

    await DeviceModel.create({
      userId: userIdA,
      token: 'ExponentPushToken[userA_del_test]',
      platform: 'android',
    });

    // Delete User A Account
    const deleteAccountRes = await fetch(`${baseUrl}/users/me/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        confirmation: 'DELETE',
      }),
    });
    assert(deleteAccountRes.status === 200, 'DELETE /users/me/account completes successfully');

    // Verify User A document deleted
    const checkUserA = await User.findById(userIdA);
    assert(checkUserA === null, 'User A record deleted from database');

    // Verify Moods cascaded
    const checkMoods = await Mood.find({ userId: userIdA });
    assert(checkMoods.length === 0, 'User A mood entries cascaded & removed');

    // Verify Journals cascaded
    const checkJournals = await Journal.find({ userId: userIdA });
    assert(checkJournals.length === 0, 'User A journal entries cascaded & removed');

    // Verify Reminders & Devices cascaded
    const checkReminders = await ReminderModel.find({ userId: userIdA });
    assert(checkReminders.length === 0, 'User A active reminders canceled & deleted');

    const checkDevices = await DeviceModel.find({ userId: userIdA });
    assert(checkDevices.length === 0, 'User A push tokens deleted');

    // User B account remains intact
    const checkUserB = await User.findById(userIdB);
    assert(checkUserB !== null, 'User B account preserved without interference');
  } catch (err: any) {
    console.error('Unhandled test suite error:', err);
    assert(false, 'Test suite completed without exceptions', err.message);
  } finally {
    try {
      if (userIdB) {
        await User.findByIdAndDelete(userIdB);
        await Mood.deleteMany({ userId: userIdB });
        await Journal.deleteMany({ userId: userIdB });
      }
    } catch {
      // ignore cleanup errors
    }

    server.close();
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passedCount}/${totalCount} PASSED`);
  console.log('======================================================\n');

  if (passedCount < totalCount) {
    process.exit(1);
  }
}

runStep14TestSuite();
