import http from 'http';
import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { User } from '../apps/server/src/models/user.model';
import { DeviceModel } from '../apps/server/src/modules/notifications/device.model';
import { NotificationPreferencesModel } from '../apps/server/src/modules/notifications/notification-preferences.model';
import { ReminderModel } from '../apps/server/src/modules/notifications/reminder.model';
import { NotificationModel } from '../apps/server/src/modules/notifications/notification.model';
import { Mood } from '../apps/server/src/modules/mood/mood.model';
import { WellnessPlanModel } from '../apps/server/src/modules/wellness-plans/wellnessPlan.model';
import { NotificationService } from '../apps/server/src/modules/notifications/notification.service';
import { NotificationScheduler } from '../apps/server/src/modules/notifications/notification.scheduler';

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

async function runStep12TestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SOLACE AI - STEP 12 NOTIFICATIONS & SCHEDULING TEST SUITE');
  console.log('======================================================\n');

  await Database.connect({ uri: process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/solace_test' });
  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5098;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  const timestamp = Date.now();
  const userAEmail = `step12_userA_${timestamp}@solace.ai`;
  const userBEmail = `step12_userB_${timestamp}@solace.ai`;

  let tokenA = '';
  let userIdA = '';
  let tokenB = '';
  let userIdB = '';

  try {
    // 1. Auth Setup: Register User A and User B
    const regARes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAEmail,
        password: 'Password123!',
        name: 'Mindful User A',
      }),
    });
    const regAJson = (await regARes.json()) as any;
    assert(regARes.status === 201, 'User A registered successfully');
    tokenA = regAJson.data?.tokens?.accessToken;
    userIdA = regAJson.data?.user?.id;

    const regBRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userBEmail,
        password: 'Password123!',
        name: 'Mindful User B',
      }),
    });
    const regBJson = (await regBRes.json()) as any;
    assert(regBRes.status === 201, 'User B registered successfully');
    tokenB = regBJson.data?.tokens?.accessToken;
    userIdB = regBJson.data?.user?.id;

    // 2. Device Registration API
    const pushTokenA = `ExponentPushToken[userA_${timestamp}_phone]`;
    const regDevRes = await fetch(`${baseUrl}/notifications/devices/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        token: pushTokenA,
        platform: 'android',
        appVersion: '1.0.0',
      }),
    });
    const regDevJson = (await regDevRes.json()) as any;
    assert(regDevRes.status === 201, 'Device registered successfully (HTTP 201)', JSON.stringify(regDevJson));
    assert(regDevJson.data?.token === pushTokenA, 'Device token matches registered token');
    assert(regDevJson.data?.isActive === true, 'Device is marked active');

    // Register duplicate token (idempotency check)
    const regDupRes = await fetch(`${baseUrl}/notifications/devices/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        token: pushTokenA,
        platform: 'android',
        appVersion: '1.0.1',
      }),
    });
    const regDupJson = (await regDupRes.json()) as any;
    assert(regDupRes.status === 201 || regDupRes.status === 200, 'Duplicate device registration succeeds (idempotent)');
    const deviceCountA = await DeviceModel.countDocuments({ userId: userIdA, token: pushTokenA });
    assert(deviceCountA === 1, 'Only one device document exists for token');

    // 3. Notification Preferences API
    // GET default preferences
    const getPrefRes = await fetch(`${baseUrl}/notifications/preferences`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const getPrefJson = (await getPrefRes.json()) as any;
    assert(getPrefRes.status === 200, 'Preferences fetched successfully');
    assert(getPrefJson.data?.masterEnabled === true, 'Default masterEnabled is true');
    assert(getPrefJson.data?.dailyWellness?.enabled === true, 'Default dailyWellness category enabled');
    assert(getPrefJson.data?.moodCheckin?.enabled === true, 'Default moodCheckin category enabled');

    // PATCH preferences (update quiet hours & disable a category)
    const patchPrefRes = await fetch(`${baseUrl}/notifications/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        timezone: 'America/New_York',
        quietHours: {
          enabled: true,
          startTime: '21:30',
          endTime: '07:30',
        },
        breathingReminders: {
          enabled: false,
        },
      }),
    });
    const patchPrefJson = (await patchPrefRes.json()) as any;
    assert(patchPrefRes.status === 200, 'Preferences updated successfully');
    assert(patchPrefJson.data?.timezone === 'America/New_York', 'Timezone updated');
    assert(patchPrefJson.data?.quietHours?.enabled === true, 'Quiet hours enabled');
    assert(patchPrefJson.data?.quietHours?.startTime === '21:30', 'Quiet hours start updated');
    assert(patchPrefJson.data?.breathingReminders?.enabled === false, 'Breathing category toggled off');
    assert(patchPrefJson.data?.dailyWellness?.enabled === true, 'Other categories remain enabled');

    // 4. Reminders API (CRUD)
    // Create Reminder for User A
    const createRemRes = await fetch(`${baseUrl}/notifications/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        type: 'daily_wellness',
        title: 'Morning Mindful Moment',
        message: 'Take three slow breaths and ground yourself.',
        time: '08:00',
        daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
      }),
    });
    const createRemJson = (await createRemRes.json()) as any;
    assert(createRemRes.status === 201, 'Reminder created successfully');
    const reminderAId = createRemJson.data?.id || createRemJson.data?._id;
    assert(reminderAId !== undefined, 'Reminder ID returned');

    // List Reminders
    const listRemRes = await fetch(`${baseUrl}/notifications/reminders`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const listRemJson = (await listRemRes.json()) as any;
    assert(listRemRes.status === 200, 'Reminders list retrieved');
    assert(Array.isArray(listRemJson.data) && listRemJson.data.length >= 1, 'Reminder present in list');

    // Update Reminder
    const updateRemRes = await fetch(`${baseUrl}/notifications/reminders/${reminderAId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        time: '08:30',
        isEnabled: false,
      }),
    });
    const updateRemJson = (await updateRemRes.json()) as any;
    assert(updateRemRes.status === 200, 'Reminder updated successfully');
    assert(updateRemJson.data?.time === '08:30', 'Reminder time updated');
    assert(updateRemJson.data?.isEnabled === false, 'Reminder paused (isEnabled is false)');

    // 5. In-App Notification Inbox API
    // Dispatch direct notification to User A
    const directNotif = await NotificationService.createNotification({
      userId: userIdA,
      type: 'achievement',
      title: '7-Day Streak Achieved! 🌿',
      message: 'You have nurtured consistency for 7 mindful days in a row.',
      channelId: 'milestones',
      deepLink: '/progress',
    });
    assert(directNotif !== null, 'Notification created in DB');

    // Get Inbox
    const inboxRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const inboxJson = (await inboxRes.json()) as any;
    assert(inboxRes.status === 200, 'Inbox fetched successfully');
    assert(Array.isArray(inboxJson.data) && inboxJson.data.length >= 1, 'Notification present in inbox');
    const notifId = directNotif!.id;

    // Check Unread Count
    const countRes = await fetch(`${baseUrl}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const countJson = (await countRes.json()) as any;
    assert(countRes.status === 200, 'Unread count fetched');
    assert(countJson.data?.unreadCount >= 1, 'Unread count is at least 1');

    // Mark single notification as read
    const readRes = await fetch(`${baseUrl}/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const readJson = (await readRes.json()) as any;
    assert(readRes.status === 200, 'Notification marked as read');
    assert(readJson.data?.status === 'read', 'Status updated to read');

    // Mark all as read
    // Create another notification first
    await NotificationService.createNotification({
      userId: userIdA,
      type: 'daily_wellness',
      title: 'Evening Reflection',
      message: 'Release the day with peace.',
    });
    const readAllRes = await fetch(`${baseUrl}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const readAllJson = (await readAllRes.json()) as any;
    assert(readAllRes.status === 200, 'Mark all as read succeeded');
    assert(readAllJson.data?.updatedCount >= 1, 'Modified at least 1 notification');

    // Unread count should now be 0
    const countZeroRes = await fetch(`${baseUrl}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const countZeroJson = (await countZeroRes.json()) as any;
    assert(countZeroJson.data?.unreadCount === 0, 'Unread count is 0 after mark-all-read');

    // Delete single notification
    const delNotifRes = await fetch(`${baseUrl}/notifications/${notifId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(delNotifRes.status === 200, 'Notification deleted from inbox');
    const foundDeleted = await NotificationModel.findById(notifId);
    assert(foundDeleted === null, 'Notification removed from database');

    // 6. Security & Multi-tenant Ownership Isolation
    // User B tries to read User A's remaining notification
    const remainingNotif = await NotificationModel.findOne({ userId: userIdA });
    if (remainingNotif) {
      const crossReadRes = await fetch(`${baseUrl}/notifications/${remainingNotif._id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tokenB}` },
      });
      assert(crossReadRes.status === 403 || crossReadRes.status === 404, 'User B cannot mark User A notification as read (returns 403/404)');

      const crossDelRes = await fetch(`${baseUrl}/notifications/${remainingNotif._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenB}` },
      });
      assert(crossDelRes.status === 403 || crossDelRes.status === 404, 'User B cannot delete User A notification (returns 403/404)');
    }

    // User B tries to update User A's reminder
    const crossRemRes = await fetch(`${baseUrl}/notifications/reminders/${reminderAId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ isEnabled: true }),
    });
    assert(crossRemRes.status === 403 || crossRemRes.status === 404, 'User B cannot modify User A reminder (returns 403/404)');

    // Delete Reminder for User A
    const delRemRes = await fetch(`${baseUrl}/notifications/reminders/${reminderAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(delRemRes.status === 200, 'Reminder deleted successfully');
    const remExists = await ReminderModel.findById(reminderAId);
    assert(remExists === null, 'Reminder deleted from database');

    // 7. Background Scheduling Logic & Edge Cases

    // A. Master switch suppression test
    await NotificationPreferencesModel.findOneAndUpdate(
      { userId: userIdA },
      { $set: { masterEnabled: false } }
    );
    const suppressedByMaster = await NotificationService.createNotification({
      userId: userIdA,
      type: 'daily_wellness',
      title: 'Should be suppressed',
      message: 'Master is disabled',
    });
    assert(suppressedByMaster === null, 'Notification suppressed when masterEnabled is false');

    // Re-enable master switch
    await NotificationPreferencesModel.findOneAndUpdate(
      { userId: userIdA },
      { $set: { masterEnabled: true } }
    );

    // B. Category-specific toggle suppression test
    // We previously set breathingReminders.enabled: false
    const suppressedByCategory = await NotificationService.createNotification({
      userId: userIdA,
      type: 'breathing',
      title: 'Should be suppressed',
      message: 'Breathing category is disabled',
    });
    assert(suppressedByCategory === null, 'Notification suppressed when category is disabled');

    // C. Timezone Quiet Hours evaluation
    // Test 23:00 during 21:30 - 07:30
    const inQuietHours = NotificationScheduler.isWithinQuietHours('23:00', '21:30', '07:30');
    assert(inQuietHours === true, 'Quiet hours correctly identifies 23:00 as inside 21:30-07:30 range');
    // Test 14:00 outside 21:30 - 07:30
    const outsideQuietHours = NotificationScheduler.isWithinQuietHours('14:00', '21:30', '07:30');
    assert(outsideQuietHours === false, 'Quiet hours correctly identifies 14:00 as outside 21:30-07:30 range');

    // D. Mood Check-In Suppression: when user has already logged a mood today
    const { time: currentTimeUtc, dayOfWeek: currentWeekday, dateString: todayStr } =
      NotificationScheduler.getLocalTimeAndDay('UTC');

    // Reset user A preferences to UTC for predictable scheduler test
    await NotificationPreferencesModel.findOneAndUpdate(
      { userId: userIdA },
      {
        $set: {
          timezone: 'UTC',
          'quietHours.enabled': false,
          'moodCheckin.enabled': true,
        },
      }
    );

    // Remove any leftover reminders from User A to have a clean slate
    await ReminderModel.deleteMany({ userId: userIdA });

    const moodReminder = await ReminderModel.create({
      userId: userIdA,
      type: 'mood_checkin',
      title: 'Evening Mood Check-In',
      message: 'How did today feel for you?',
      time: currentTimeUtc,
      daysOfWeek: [currentWeekday],
      isEnabled: true,
    });

    // Case 1: User has NOT checked in yet today -> Reminder triggers and creates notification
    await NotificationModel.deleteMany({ userId: userIdA });
    await NotificationScheduler.processDueReminders();
    const notifAfterDue = await NotificationModel.findOne({
      userId: userIdA,
      type: 'mood_checkin',
    });
    assert(notifAfterDue !== null, 'Mood reminder triggered and created notification');

    // Case 2: Reset lastTriggeredAt to null to simulate another run after user logs a mood entry
    await ReminderModel.findByIdAndUpdate(moodReminder._id, { $unset: { lastTriggeredAt: 1 } });
    await NotificationModel.deleteMany({ userId: userIdA });

    // User logs a mood check-in for today
    await Mood.create({
      userId: userIdA,
      mood: 'content',
      moodIntensity: 8,
      emotions: ['peaceful'],
      note: 'Feeling good test',
      createdAt: new Date(),
    });

    // Run scheduler again -> should be suppressed because mood was logged!
    await NotificationScheduler.processDueReminders();
    const notifAfterMoodLogged = await NotificationModel.findOne({
      userId: userIdA,
      type: 'mood_checkin',
    });
    assert(notifAfterMoodLogged === null, 'Mood reminder is suppressed after user already logged mood today');

    // E. Plan Task Reminder Suppression: when plan task is completed
    const plan = await WellnessPlanModel.create({
      userId: userIdA,
      title: 'Personalized Stress Relief Plan',
      description: 'A 7-day gentle path to lower stress',
      durationDays: 7,
      focusAreas: ['stress_management'],
      goals: ['Stress Reduction'],
      dailyTasks: [
        {
          id: 'task-mindful-walk-1',
          day: 1,
          title: '10-minute mindful walk',
          description: 'Walk slowly in fresh air',
          category: 'exercise',
          durationMinutes: 10,
          completed: true, // marked completed!
        },
      ],
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 86400000),
      status: 'active',
      isAiGenerated: true,
    });

    const taskReminder = await ReminderModel.create({
      userId: userIdA,
      type: 'plan_task',
      title: 'Mindful Walk Reminder',
      message: 'Ready for your walk?',
      time: currentTimeUtc,
      daysOfWeek: [currentWeekday],
      isEnabled: true,
      relatedResourceId: 'task-mindful-walk-1',
    });

    await NotificationModel.deleteMany({ userId: userIdA });
    await NotificationScheduler.processDueReminders();
    const taskNotif = await NotificationModel.findOne({
      userId: userIdA,
      type: 'plan_task',
    });
    assert(taskNotif === null, 'Plan task reminder is suppressed because task is completed');

    // F. Duplicate Prevention: reminder not triggered twice on same calendar day
    const genericReminder = await ReminderModel.create({
      userId: userIdA,
      type: 'daily_wellness',
      title: 'Gentle Hydration',
      message: 'Sip a glass of water.',
      time: currentTimeUtc,
      daysOfWeek: [currentWeekday],
      isEnabled: true,
      lastTriggeredAt: new Date(), // Already triggered today!
    });

    await NotificationModel.deleteMany({ userId: userIdA });
    await NotificationScheduler.processDueReminders();
    const genericNotif = await NotificationModel.findOne({
      userId: userIdA,
      type: 'daily_wellness',
    });
    assert(genericNotif === null, 'Reminder is not triggered twice on the same calendar day');

    // G. Atomic claiming and pending notifications processing
    const pendingNotif = await NotificationModel.create({
      userId: userIdA,
      type: 'daily_wellness',
      title: 'Pending Test Notification',
      message: 'Delivering via scheduler',
      status: 'pending',
      scheduledAt: new Date(Date.now() - 5000), // 5 seconds ago
    });

    await NotificationScheduler.processPendingNotifications();
    const processedNotif = await NotificationModel.findById(pendingNotif._id);
    assert(processedNotif?.status === 'sent', 'Pending notification atomically processed and marked sent');
    assert(processedNotif?.claimedAt !== undefined, 'Pending notification was claimed atomically');

    // Device Removal API
    const removeDevRes = await fetch(`${baseUrl}/notifications/devices/${encodeURIComponent(pushTokenA)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(removeDevRes.status === 200, 'Device removed successfully');
    const devExists = await DeviceModel.findOne({ token: pushTokenA });
    assert(devExists === null, 'Device removed from database');

  } catch (error) {
    console.error('Unexpected error in test suite:', error);
    assert(false, 'Test execution completed without unexpected exceptions', (error as Error).message);
  } finally {
    // Teardown test data
    console.log('\n🧹 Cleaning up test artifacts...');
    if (userIdA) {
      await User.findByIdAndDelete(userIdA);
      await NotificationModel.deleteMany({ userId: userIdA });
      await NotificationPreferencesModel.deleteMany({ userId: userIdA });
      await ReminderModel.deleteMany({ userId: userIdA });
      await DeviceModel.deleteMany({ userId: userIdA });
      await Mood.deleteMany({ userId: userIdA });
      await WellnessPlanModel.deleteMany({ userId: userIdA });
    }
    if (userIdB) {
      await User.findByIdAndDelete(userIdB);
      await NotificationModel.deleteMany({ userId: userIdB });
      await NotificationPreferencesModel.deleteMany({ userId: userIdB });
      await ReminderModel.deleteMany({ userId: userIdB });
      await DeviceModel.deleteMany({ userId: userIdB });
    }

    // Allow asynchronous push delivery queues to settle
    await new Promise((r) => setTimeout(r, 500));

    await new Promise<void>((resolve) => server.close(() => resolve()));
    await Database.disconnect();
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log('\n======================================================');
  console.log(`📊 TEST SUMMARY: ${passed}/${results.length} PASSED (${failed} FAILED)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStep12TestSuite();
