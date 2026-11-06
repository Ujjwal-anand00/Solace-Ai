import http from 'http';
import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { User } from '../apps/server/src/models/user.model';
import { Journal } from '../apps/server/src/modules/journal/journal.model';
import { JournalPromptService } from '../apps/server/src/modules/journal/journalPrompt.service';

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

async function runStep13TestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SOLACE AI - STEP 13 PRIVATE JOURNAL & INSIGHTS TEST SUITE');
  console.log('======================================================\n');

  await Database.connect({
    uri: process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/solace_test',
  });
  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5099;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  const timestamp = Date.now();
  const userAEmail = `step13_userA_${timestamp}@solace.ai`;
  const userBEmail = `step13_userB_${timestamp}@solace.ai`;

  let tokenA = '';
  let userIdA = '';
  let tokenB = '';
  let userIdB = '';

  let createdEntryId = '';

  try {
    // ---------------------------------------------------------
    // 1. Auth Setup: Register User A and User B
    // ---------------------------------------------------------
    console.log('\n--- 1. Authentication & Multi-User Setup ---');

    const regResA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Step 13 User A',
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
        name: 'Step 13 User B',
        email: userBEmail,
        password: 'Password123!',
      }),
    });
    const regDataB = (await regResB.json()) as any;
    assert(regResB.status === 201 && !!regDataB.data?.tokens?.accessToken, 'User B registered successfully');
    tokenB = regDataB.data.tokens.accessToken;
    userIdB = regDataB.data.user.id;

    // ---------------------------------------------------------
    // 2. Guided Prompts API & Seed Data Verification
    // ---------------------------------------------------------
    console.log('\n--- 2. Guided Journal Prompts & Categories ---');

    await JournalPromptService.ensureSeedPrompts();

    const promptsRes = await fetch(`${baseUrl}/journal/prompts`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const promptsData = (await promptsRes.json()) as any;
    assert(promptsRes.status === 200, 'GET /journal/prompts returns 200');
    assert(Array.isArray(promptsData.data) && promptsData.data.length >= 30, 'Prompts contain at least 30 seeded items', `Count: ${promptsData.data?.length}`);

    const gratPromptsRes = await fetch(`${baseUrl}/journal/prompts?category=gratitude`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const gratData = (await gratPromptsRes.json()) as any;
    assert(gratData.data.every((p: any) => p.category === 'gratitude'), 'Filtering prompts by category works');

    const randomPromptRes = await fetch(`${baseUrl}/journal/prompts/random`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const randomData = (await randomPromptRes.json()) as any;
    assert(randomPromptRes.status === 200 && !!randomData.data?.text, 'GET /journal/prompts/random returns a prompt');

    // ---------------------------------------------------------
    // 3. Journal Entry Creation (Free write, Gratitude, Guided)
    // ---------------------------------------------------------
    console.log('\n--- 3. Journal CRUD & Specialized Categories ---');

    // Free write
    const createRes = await fetch(`${baseUrl}/journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Morning Awakening & Stillness',
        content: 'Woke up early today. The silence in the room gave me space to breathe without rush.',
        category: 'free_write',
        moodAssociation: 'peaceful',
        tags: ['morning', 'peace', 'breathing'],
        isFavorite: true,
      }),
    });
    const createData = (await createRes.json()) as any;
    assert(createRes.status === 201, 'POST /journal creates entry (201)');
    assert(createData.data.title === 'Morning Awakening & Stillness', 'Journal title persisted accurately');
    assert(createData.data.isFavorite === true, 'isFavorite field persisted');
    createdEntryId = createData.data.id;

    // Gratitude entry
    const gratEntryRes = await fetch(`${baseUrl}/journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Gratitude Reflection 🌻',
        content: 'Gratitude List:\n1. Warm tea\n2. Kind colleague\n3. Evening walk',
        category: 'gratitude',
        gratitudeItems: ['Warm tea', 'Kind colleague', 'Evening walk'],
        tags: ['gratitude', 'joy'],
      }),
    });
    const gratEntryData = (await gratEntryRes.json()) as any;
    assert(gratEntryRes.status === 201, 'Gratitude journal entry created (201)');
    assert(gratEntryData.data.gratitudeItems?.length === 3, 'gratitudeItems array persisted');

    // Draft entry
    const draftRes = await fetch(`${baseUrl}/journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Unfinished thoughts',
        content: 'Still thinking about how to phrase this...',
        isDraft: true,
      }),
    });
    const draftData = (await draftRes.json()) as any;
    assert(draftRes.status === 201 && draftData.data.isDraft === true, 'Draft journal created with isDraft=true');

    // ---------------------------------------------------------
    // 4. Listing, Searching & Filtering
    // ---------------------------------------------------------
    console.log('\n--- 4. Listing, Searching & Filtering ---');

    const listRes = await fetch(`${baseUrl}/journal`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const listData = (await listRes.json()) as any;
    assert(listRes.status === 200, 'GET /journal returns 200');
    assert(listData.data.length >= 3, 'Retrieved all entries for User A', `Count: ${listData.data.length}`);

    // Filter by favorite
    const favRes = await fetch(`${baseUrl}/journal?isFavorite=true`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const favData = (await favRes.json()) as any;
    assert(favData.data.every((e: any) => e.isFavorite === true), 'Filter by isFavorite=true works');

    // Filter by category
    const catRes = await fetch(`${baseUrl}/journal?category=gratitude`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const catFilterData = (await catRes.json()) as any;
    assert(catFilterData.data.every((e: any) => e.category === 'gratitude'), 'Filter by category=gratitude works');

    // Search query
    const searchRes = await fetch(`${baseUrl}/journal?search=Awakening`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const searchData = (await searchRes.json()) as any;
    assert(searchData.data.length >= 1 && searchData.data[0].title.includes('Awakening'), 'Search query finds entry by word');

    // ---------------------------------------------------------
    // 5. Update & Toggle Favorite
    // ---------------------------------------------------------
    console.log('\n--- 5. Update & Favorite Toggling ---');

    const updateRes = await fetch(`${baseUrl}/journal/${createdEntryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Updated Stillness Note',
        tags: ['morning', 'peace', 'updated'],
      }),
    });
    const updateData = (await updateRes.json()) as any;
    assert(updateRes.status === 200 && updateData.data.title === 'Updated Stillness Note', 'PATCH /journal/:id updates entry');

    // Toggle favorite
    const favToggleRes = await fetch(`${baseUrl}/journal/${createdEntryId}/favorite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const favToggleData = (await favToggleRes.json()) as any;
    assert(favToggleRes.status === 200 && favToggleData.data.isFavorite === false, 'POST /journal/:id/favorite toggles favorite');

    // ---------------------------------------------------------
    // 6. Calendar & Stats Endpoints
    // ---------------------------------------------------------
    console.log('\n--- 6. Calendar & Aggregate Statistics ---');

    const calendarRes = await fetch(`${baseUrl}/journal/calendar`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const calendarData = (await calendarRes.json()) as any;
    assert(calendarRes.status === 200 && Array.isArray(calendarData.data), 'GET /journal/calendar returns array of days');
    const dayWithEntries = calendarData.data.find((d: any) => d.count > 0);
    assert(!!dayWithEntries, 'Calendar correctly maps created entries to today');

    const statsRes = await fetch(`${baseUrl}/journal/stats`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const statsData = (await statsRes.json()) as any;
    assert(statsRes.status === 200, 'GET /journal/stats returns 200');
    assert(statsData.data.totalEntries >= 2, 'Stats reports correct total non-draft entries');
    assert(statsData.data.totalWords > 0, 'Stats calculates total word count');
    assert(statsData.data.currentStreak >= 1, 'Stats calculates writing day streak');

    // ---------------------------------------------------------
    // 7. Strict Privacy & Cross-User Isolation Enforcement
    // ---------------------------------------------------------
    console.log('\n--- 7. Strict Privacy & Multi-Tenant Isolation ---');

    // User B tries to view User A's entry
    const crossGetRes = await fetch(`${baseUrl}/journal/${createdEntryId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(
      crossGetRes.status === 403 || crossGetRes.status === 404,
      'User B cannot read User A journal entry (403/404)',
      `Status: ${crossGetRes.status}`,
    );

    // User B tries to update User A's entry
    const crossUpdateRes = await fetch(`${baseUrl}/journal/${createdEntryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ title: 'Hacked title' }),
    });
    assert(
      crossUpdateRes.status === 403 || crossUpdateRes.status === 404,
      'User B cannot modify User A journal entry (403/404)',
      `Status: ${crossUpdateRes.status}`,
    );

    // User B tries to delete User A's entry
    const crossDeleteRes = await fetch(`${baseUrl}/journal/${createdEntryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(
      crossDeleteRes.status === 403 || crossDeleteRes.status === 404,
      'User B cannot delete User A journal entry (403/404)',
      `Status: ${crossDeleteRes.status}`,
    );

    // User B list should NOT contain User A's journals
    const userBListRes = await fetch(`${baseUrl}/journal`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const userBListData = (await userBListRes.json()) as any;
    assert(userBListData.data.length === 0, 'User B journal list is completely isolated (0 entries)');

    // ---------------------------------------------------------
    // 8. AI Reflection & Explicit Consent Requirements
    // ---------------------------------------------------------
    console.log('\n--- 8. AI Reflection & Explicit Consent ---');

    // Calling insight without consent must fail
    const noConsentRes = await fetch(`${baseUrl}/journal/${createdEntryId}/insight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ consent: false }),
    });
    assert(
      noConsentRes.status === 400 || noConsentRes.status === 422,
      'Insight request without explicit consent fails (400 or 422)',
    );

    // Calling insight with consent succeeds and attaches reflection
    const withConsentRes = await fetch(`${baseUrl}/journal/${createdEntryId}/insight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ consent: true }),
    });
    const withConsentData = (await withConsentRes.json()) as any;
    assert(withConsentRes.status === 200, 'Insight request with consent succeeds (200)');
    assert(!!withConsentData.data.aiInsight, 'aiInsight attached to journal entry');
    assert(!!withConsentData.data.aiInsight.theme, 'aiInsight contains theme');
    assert(!!withConsentData.data.aiInsight.reflection, 'aiInsight contains reflection text');
    assert(withConsentData.data.aiConsentGranted === true, 'aiConsentGranted marked true on record');

    // ---------------------------------------------------------
    // 9. Deletion & Cleanup
    // ---------------------------------------------------------
    console.log('\n--- 9. Journal Deletion ---');

    const deleteRes = await fetch(`${baseUrl}/journal/${createdEntryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(deleteRes.status === 200, 'DELETE /journal/:id successfully deletes entry');

    const verifyDeleted = await fetch(`${baseUrl}/journal/${createdEntryId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(verifyDeleted.status === 404, 'Deleted entry returns 404');
  } catch (err: any) {
    console.error('Unhandled test suite error:', err);
    assert(false, 'Test suite completed without exceptions', err.message);
  } finally {
    // Cleanup created users & journals
    try {
      if (userIdA) {
        await User.findByIdAndDelete(userIdA);
        await Journal.deleteMany({ userId: userIdA });
      }
      if (userIdB) {
        await User.findByIdAndDelete(userIdB);
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

runStep13TestSuite();
