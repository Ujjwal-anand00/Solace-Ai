import http from 'http';
import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { User } from '../apps/server/src/models/user.model';
import { ProgressModel } from '../apps/server/src/modules/progress/progress.model';
import { AchievementModel } from '../apps/server/src/modules/achievements/achievement.model';
import { Mood } from '../apps/server/src/modules/mood/mood.model';
import { Activity } from '../apps/server/src/modules/activities/activity.model';
import { ActivityCompletionModel } from '../apps/server/src/modules/activities/activityCompletion.model';
import { Journal } from '../apps/server/src/modules/journal/journal.model';
import { ProgressService } from '../apps/server/src/modules/progress/progress.service';

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

async function runStep11TestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SOLACE AI - STEP 11 PROGRESS, STREAKS & ACHIEVEMENTS TEST SUITE');
  console.log('======================================================\n');

  await Database.connect();
  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5099;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  const timestamp = Date.now();
  const userAEmail = `step11_userA_${timestamp}@solace.ai`;
  const userBEmail = `step11_userB_${timestamp}@solace.ai`;

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
        name: 'Progress Explorer A',
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
        name: 'Progress Explorer B',
      }),
    });
    const regBJson = (await regBRes.json()) as any;
    assert(regBRes.status === 201, 'User B registered successfully');
    tokenB = regBJson.data?.tokens?.accessToken;
    userIdB = regBJson.data?.user?.id;

    // 2. Verify Seeded Achievements Catalog
    const achListRes = await fetch(`${baseUrl}/achievements`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const achListJson = (await achListRes.json()) as any;
    assert(
      achListRes.status === 200 && Array.isArray(achListJson.data),
      'GET /achievements returns achievements catalog',
    );
    assert(
      achListJson.data.length >= 13,
      `All 13 achievements seeded in catalog (found ${achListJson.data?.length})`,
    );

    const categories = new Set(achListJson.data.map((a: any) => a.category));
    assert(
      categories.has('consistency') &&
        categories.has('emotional_awareness') &&
        categories.has('mindfulness') &&
        categories.has('personal_growth'),
      'Achievements span all 4 expected categories',
    );

    // 3. Verify Initial Progress & Streak for User A
    const overviewInitRes = await fetch(`${baseUrl}/progress/overview`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const overviewInitJson = (await overviewInitRes.json()) as any;
    assert(
      overviewInitRes.status === 200,
      'GET /progress/overview returns 200 for new user',
    );
    assert(
      overviewInitJson.data.currentStreak === 0 &&
        overviewInitJson.data.longestStreak === 0 &&
        overviewInitJson.data.activeDaysCount === 0 &&
        overviewInitJson.data.totalMoodCheckIns === 0,
      'Initial progress state has zero streak and counters',
    );

    const streakInitRes = await fetch(`${baseUrl}/progress/streak`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const streakInitJson = (await streakInitRes.json()) as any;
    assert(
      streakInitRes.status === 200 &&
        streakInitJson.data.weeklyCalendar?.length === 7,
      'GET /progress/streak returns 7-day ribbon with encouraging message',
    );

    const myAchInitRes = await fetch(`${baseUrl}/achievements/mine`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const myAchInitJson = (await myAchInitRes.json()) as any;
    assert(
      myAchInitRes.status === 200 &&
        myAchInitJson.data.every((a: any) => !a.unlocked),
      'Initial user achievements are all locked (0% unlocked)',
    );

    // 4. Log First Activity: Mood Check-in
    const moodRes1 = await fetch(`${baseUrl}/mood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        mood: 'calm',
        moodIntensity: 4,
        emotions: ['grateful', 'peaceful'],
        note: 'First mindful step in Solace sanctuary',
      }),
    });
    assert(moodRes1.status === 201, 'User A logs first mood check-in');

    // Verify progress updated: 1 day streak
    const overview1Res = await fetch(`${baseUrl}/progress/overview`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const overview1Json = (await overview1Res.json()) as any;
    assert(
      overview1Json.data.currentStreak === 1 &&
        overview1Json.data.longestStreak === 1 &&
        overview1Json.data.activeDaysCount === 1 &&
        overview1Json.data.totalMoodCheckIns === 1,
      'Streak increments to 1 after first active check-in',
    );

    // Verify achievements: first_checkin unlocked after mood check-in!
    const myAch1Res = await fetch(`${baseUrl}/achievements/mine`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const myAch1Json = (await myAch1Res.json()) as any;
    const firstCheckinAch = myAch1Json.data.find(
      (a: any) => a.criteria === 'first_checkin',
    );
    assert(
      firstCheckinAch?.unlocked === true,
      'first_checkin achievement is unlocked after first mood check-in',
    );

    // 5. Multiple Activities on SAME Calendar Day MUST NOT Increment Streak Artificially
    // Log 2nd mood check-in
    await fetch(`${baseUrl}/mood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        mood: 'happy',
        moodIntensity: 5,
        emotions: ['joyful'],
        note: 'Afternoon sun reflection',
      }),
    });

    // Complete a wellness activity
    const sampleActivity = await Activity.findOne({ category: 'breathing' });
    if (sampleActivity) {
      const compRes = await fetch(`${baseUrl}/activities/${sampleActivity._id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
          durationCompleted: 180,
          feedback: 'Deep calming breath practice',
        }),
      });
      assert(compRes.status === 201, 'User A completes breathing activity');
    }

    // Write a journal entry
    await fetch(`${baseUrl}/journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Gratitude evening',
        content:
          'Taking time to honor the moments that brought ease and quiet today.',
        tags: ['gratitude', 'evening'],
      }),
    });

    // Verify streak is STILL 1 (same calendar day)
    const overviewSameDayRes = await fetch(`${baseUrl}/progress/overview`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const overviewSameDayJson = (await overviewSameDayRes.json()) as any;
    assert(
      overviewSameDayJson.data.currentStreak === 1,
      'Streak remains 1 despite multiple activities on the same calendar day (no duplicate increment)',
    );
    assert(
      overviewSameDayJson.data.activeDaysCount === 1,
      'activeDaysCount remains 1 for same day',
    );
    assert(
      overviewSameDayJson.data.totalMoodCheckIns === 2 &&
        overviewSameDayJson.data.totalActivities >= 1 &&
        overviewSameDayJson.data.totalJournalEntries >= 1,
      'Lifetime counters accurately reflect all completed actions',
    );

    // Verify first_breathing and first_activity achievements unlocked
    const myAchSameDayRes = await fetch(`${baseUrl}/achievements/mine`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const myAchSameDayJson = (await myAchSameDayRes.json()) as any;
    const firstBreathingAch = myAchSameDayJson.data.find(
      (a: any) => a.criteria === 'first_breathing',
    );
    const firstActivityAch = myAchSameDayJson.data.find(
      (a: any) => a.criteria === 'first_activity',
    );
    assert(
      firstBreathingAch?.unlocked === true && firstActivityAch?.unlocked === true,
      'first_breathing and first_activity achievements unlocked after activity completion',
    );

    // Verify Idempotent Achievements: no duplicate awards
    const progressDoc = await ProgressModel.findOne({ userId: userIdA });
    const earnedCounts = progressDoc?.earnedAchievements || [];
    const uniqueEarned = new Set(earnedCounts);
    assert(
      earnedCounts.length === uniqueEarned.size,
      'User earnedAchievements array has zero duplicate awards (idempotent)',
    );

    // 6. Chronological Activity Timeline & Category Filters
    const timelineAllRes = await fetch(`${baseUrl}/progress/history?category=all`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const timelineAllJson = (await timelineAllRes.json()) as any;
    assert(
      timelineAllRes.status === 200 && timelineAllJson.data.length >= 3,
      'Timeline returns unified chronological activity feed (moods, activities, journals)',
    );

    const timelineMoodRes = await fetch(
      `${baseUrl}/progress/history?category=mood`,
      { headers: { Authorization: `Bearer ${tokenA}` } },
    );
    const timelineMoodJson = (await timelineMoodRes.json()) as any;
    assert(
      timelineMoodJson.data.every((i: any) => i.type === 'mood'),
      'Timeline category filter=mood returns only mood items',
    );

    const timelinePageRes = await fetch(
      `${baseUrl}/progress/history?category=all&page=1&limit=2`,
      { headers: { Authorization: `Bearer ${tokenA}` } },
    );
    const timelinePageJson = (await timelinePageRes.json()) as any;
    assert(
      timelinePageJson.data.length === 2 &&
        timelinePageJson.meta?.totalPages >= 2 &&
        timelinePageJson.meta?.page === 1,
      'Timeline pagination works with page & limit metadata',
    );

    // 7. Progress Summary & Trends API
    const summaryWeekRes = await fetch(`${baseUrl}/progress/summary?period=week`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const summaryWeekJson = (await summaryWeekRes.json()) as any;
    assert(
      summaryWeekRes.status === 200 &&
        summaryWeekJson.data.activeDays === 1 &&
        summaryWeekJson.data.moodCheckIns === 2,
      'Summary API accurately aggregates week metrics',
    );

    const trendsWeekRes = await fetch(`${baseUrl}/progress/trends?period=week`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const trendsWeekJson = (await trendsWeekRes.json()) as any;
    assert(
      trendsWeekRes.status === 200 && trendsWeekJson.data.points?.length === 7,
      'Trends API returns 7 points for week view',
    );

    const trendsMonthRes = await fetch(`${baseUrl}/progress/trends?period=month`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const trendsMonthJson = (await trendsMonthRes.json()) as any;
    assert(
      trendsMonthRes.status === 200 &&
        trendsMonthJson.data.points?.length >= 28,
      'Trends API returns 30 points for month view',
    );

    // 8. Weekly & Monthly Reports
    const weeklyReportRes = await fetch(`${baseUrl}/progress/reports/weekly`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const weeklyReportJson = (await weeklyReportRes.json()) as any;
    assert(
      weeklyReportRes.status === 200 &&
        Array.isArray(weeklyReportJson.data.observations),
      'GET /progress/reports/weekly returns gentle observations',
    );
    assert(
      weeklyReportJson.data.hasSufficientData === false,
      'Weekly report honestly marks hasSufficientData: false when active days < 2',
    );

    const monthlyReportRes = await fetch(`${baseUrl}/progress/reports/monthly`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const monthlyReportJson = (await monthlyReportRes.json()) as any;
    assert(
      monthlyReportRes.status === 200 &&
        monthlyReportJson.data.moodDistribution &&
        monthlyReportJson.data.streakPerformance,
      'GET /progress/reports/monthly returns longitudinal distribution and consistency rate',
    );

    // 9. Timezone-Aware Calculation & Consecutive Days Simulation
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    // Insert a real Mood entry for yesterday to verify contiguous streak calculation
    await Mood.create({
      userId: userIdA,
      mood: 'peaceful',
      moodIntensity: 4,
      emotions: ['calm'],
      createdAt: yesterdayDate,
    });

    const recalculated = await ProgressService.recalculateProgress(
      userIdA,
      'UTC',
    );
    assert(
      recalculated.currentStreak === 2 && recalculated.longestStreak >= 2,
      'Consecutive active calendar days correctly compute currentStreak = 2 and longestStreak = 2',
    );

    // Simulate an older 3-day continuous chain (5-7 days ago) to test historical longest streak
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    await Mood.create([
      {
        userId: userIdA,
        mood: 'calm',
        moodIntensity: 3,
        emotions: ['grounded'],
        createdAt: sevenDaysAgo,
      },
      {
        userId: userIdA,
        mood: 'calm',
        moodIntensity: 3,
        emotions: ['grounded'],
        createdAt: sixDaysAgo,
      },
      {
        userId: userIdA,
        mood: 'calm',
        moodIntensity: 3,
        emotions: ['grounded'],
        createdAt: fiveDaysAgo,
      },
    ]);

    const streakHistorical = await ProgressService.recalculateProgress(
      userIdA,
      'UTC',
    );
    assert(
      streakHistorical.currentStreak === 2,
      'Current streak remains 2 (contiguous from yesterday + today)',
    );
    assert(
      streakHistorical.longestStreak >= 3,
      'Longest streak is preserved historically (longestStreak = 3)',
    );

    // 10. User B Privacy & Isolation
    const userBOverviewRes = await fetch(`${baseUrl}/progress/overview`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const userBOverviewJson = (await userBOverviewRes.json()) as any;
    assert(
      userBOverviewJson.data.currentStreak === 0 &&
        userBOverviewJson.data.totalMoodCheckIns === 0,
      'User B has isolated progress (0 streak, 0 check-ins)',
    );

    const userBAchRes = await fetch(`${baseUrl}/achievements/mine`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const userBAchJson = (await userBAchRes.json()) as any;
    assert(
      userBAchJson.data.every((a: any) => !a.unlocked),
      'User B has completely separate achievements (none unlocked)',
    );

    const userBTimelineRes = await fetch(`${baseUrl}/progress/history`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const userBTimelineJson = (await userBTimelineRes.json()) as any;
    assert(
      userBTimelineJson.data.length === 0,
      "User B timeline is clean and empty (no leak from User A's activities)",
    );
  } finally {
    // Cleanup test data
    console.log('\n🧹 Cleaning up test artifacts...');
    if (userIdA) {
      await User.findByIdAndDelete(userIdA);
      await ProgressModel.deleteMany({ userId: userIdA });
      await Mood.deleteMany({ userId: userIdA });
      await ActivityCompletionModel.deleteMany({ userId: userIdA });
      await Journal.deleteMany({ userId: userIdA });
    }
    if (userIdB) {
      await User.findByIdAndDelete(userIdB);
      await ProgressModel.deleteMany({ userId: userIdB });
      await Mood.deleteMany({ userId: userIdB });
      await ActivityCompletionModel.deleteMany({ userId: userIdB });
      await Journal.deleteMany({ userId: userIdB });
    }
    server.close();
    await Database.disconnect();
  }

  // Summary
  console.log('\n======================================================');
  console.log('📊 TEST SUMMARY');
  console.log('======================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);

  if (failedCount > 0) {
    console.error('\n❌ SOME TESTS FAILED:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.error(` - ${r.name}: ${r.details || ''}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL STEP 11 INTEGRATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  }
}

runStep11TestSuite().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
