import http from 'http';
import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { User } from '../apps/server/src/models/user.model';
import { ResourceModel } from '../apps/server/src/modules/resources/resource.model';
import { ResourceBookmarkModel } from '../apps/server/src/modules/resources/resourceBookmark.model';
import { ResourceProgressModel } from '../apps/server/src/modules/resources/resourceProgress.model';

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

async function runStep15TestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SOLACE AI - STEP 15 RESOURCE LIBRARY TEST SUITE');
  console.log('======================================================\n');

  await Database.connect({
    uri: process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/solace_test',
  });
  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5098;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  const timestamp = Date.now();
  const userAEmail = `step15_userA_${timestamp}@solace.ai`;
  const userBEmail = `step15_userB_${timestamp}@solace.ai`;

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
        name: 'Reader Alpha',
        email: userAEmail,
        password: 'Password123!',
      }),
    });
    const regDataA = await regResA.json();
    tokenA = regDataA.data?.tokens?.accessToken || '';
    userIdA = regDataA.data?.user?.id || '';
    assert(Boolean(tokenA && userIdA), 'User A registered with auth token');

    const regResB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Reader Beta',
        email: userBEmail,
        password: 'Password123!',
      }),
    });
    const regDataB = await regResB.json();
    tokenB = regDataB.data?.tokens?.accessToken || '';
    userIdB = regDataB.data?.user?.id || '';
    assert(Boolean(tokenB && userIdB), 'User B registered for user-isolation verification');

    // ---------------------------------------------------------
    // 2. Seeding & 24 Educational Articles
    // ---------------------------------------------------------
    console.log('\n--- 2. Resource Seeding & Category Verification ---');

    const listRes = await fetch(`${baseUrl}/resources?limit=50`);
    const listData = await listRes.json();
    const resources = listData.data || [];
    assert(resources.length >= 24, `At least 24 initial educational resources seeded (found: ${resources.length})`);

    const catRes = await fetch(`${baseUrl}/resources/categories`);
    const catData = await catRes.json();
    const categories = catData.data || [];
    assert(categories.length === 8, `Exactly 8 educational wellness categories returned (found: ${categories.length})`);

    const expectedCategoryIds = [
      'emotions',
      'stress',
      'mindfulness',
      'sleep',
      'self_care',
      'confidence',
      'habits',
      'growth',
    ];
    const foundIds = categories.map((c: any) => c.id);
    const allCategoriesPresent = expectedCategoryIds.every((id) => foundIds.includes(id));
    assert(allCategoriesPresent, 'All 8 required educational categories present in catalog');

    const allHaveCounts = categories.every((c: any) => typeof c.count === 'number' && c.count >= 3);
    assert(allHaveCounts, 'Each category has accurate count >= 3 articles');

    // ---------------------------------------------------------
    // 3. Featured Resources
    // ---------------------------------------------------------
    console.log('\n--- 3. Featured Resources Verification ---');

    const featRes = await fetch(`${baseUrl}/resources/featured`);
    const featData = await featRes.json();
    const featuredList = featData.data || [];
    assert(featuredList.length > 0, `Featured resources retrieved successfully (found: ${featuredList.length})`);
    assert(featuredList.every((r: any) => r.isFeatured === true), 'All featured items have isFeatured = true');

    // ---------------------------------------------------------
    // 4. Personalized Recommendations
    // ---------------------------------------------------------
    console.log('\n--- 4. Recommendation Engine ---');

    // Update User A's wellness goals
    await User.findByIdAndUpdate(userIdA, {
      $set: { wellnessGoals: ['stress', 'mindfulness'] },
    });

    const recResA = await fetch(`${baseUrl}/resources/recommended`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const recDataA = await recResA.json();
    const recommendedList = recDataA.data || [];
    assert(recommendedList.length > 0, `Personalized recommendations generated (found: ${recommendedList.length})`);

    const topItem = recommendedList[0];
    assert(Boolean(topItem.title && topItem.category), 'Recommended resource contains title and category');

    // ---------------------------------------------------------
    // 5. Search & Category Filtering
    // ---------------------------------------------------------
    console.log('\n--- 5. Search & Category Filtering ---');

    const searchRes = await fetch(`${baseUrl}/resources/search?q=breathing`);
    const searchData = await searchRes.json();
    const searchItems = searchData.data?.resources || searchData.data || [];
    assert(searchItems.length > 0, `Search for 'breathing' returned matching articles (found: ${searchItems.length})`);

    const sleepFilterRes = await fetch(`${baseUrl}/resources?category=sleep`);
    const sleepFilterData = await sleepFilterRes.json();
    const sleepItems = sleepFilterData.data || [];
    assert(sleepItems.length > 0, `Filtering by 'sleep' returned articles (found: ${sleepItems.length})`);
    assert(sleepItems.every((r: any) => r.category === 'sleep'), 'All filtered items strictly belong to sleep category');

    // ---------------------------------------------------------
    // 6. Detail View with Content Blocks
    // ---------------------------------------------------------
    console.log('\n--- 6. Single Resource Detail View ---');

    const targetResource = resources[0];
    const detailRes = await fetch(`${baseUrl}/resources/${targetResource.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const detailData = await detailRes.json();
    const detail = detailData.data;

    assert(detail && detail.id === targetResource.id, 'Resource detail retrieved by ID');
    assert(Array.isArray(detail.blocks) && detail.blocks.length > 0, 'Resource contains structured content blocks');
    assert(detail.readingMinutes > 0, `Reading duration present (${detail.readingMinutes} min)`);
    assert(detail.isBookmarked === false, 'Initially not bookmarked for User A');
    assert(detail.progressPercent === 0, 'Initial progress is 0%');

    // ---------------------------------------------------------
    // 7. Bookmarking & User Data Isolation
    // ---------------------------------------------------------
    console.log('\n--- 7. Bookmarks / Favorites & User Isolation ---');

    // User A bookmarks the resource
    const toggleResA = await fetch(`${baseUrl}/resources/${targetResource.id}/favorite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const toggleDataA = await toggleResA.json();
    assert(toggleDataA.data?.isBookmarked === true, 'User A successfully bookmarked resource');

    // User A checks favorites
    const favResA = await fetch(`${baseUrl}/resources/favorites`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const favDataA = await favResA.json();
    const favoritesA = favDataA.data || [];
    assert(favoritesA.some((r: any) => r.id === targetResource.id), 'Resource appears in User A favorites list');

    // User B checks favorites - MUST BE EMPTY
    const favResB = await fetch(`${baseUrl}/resources/favorites`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const favDataB = await favResB.json();
    const favoritesB = favDataB.data || [];
    assert(favoritesB.length === 0, 'User B favorites list is empty (User Data Isolation confirmed)');

    // Detail for User A now shows isBookmarked = true
    const detailAgainA = await (
      await fetch(`${baseUrl}/resources/${targetResource.id}`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      })
    ).json();
    assert(detailAgainA.data?.isBookmarked === true, 'Resource detail reflects bookmarked state for User A');

    // Detail for User B still shows isBookmarked = false
    const detailAgainB = await (
      await fetch(`${baseUrl}/resources/${targetResource.id}`, {
        headers: { Authorization: `Bearer ${tokenB}` },
      })
    ).json();
    assert(detailAgainB.data?.isBookmarked === false, 'Resource detail reflects unbookmarked state for User B');

    // User A unbookmarks
    const untoggleResA = await fetch(`${baseUrl}/resources/${targetResource.id}/favorite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const untoggleDataA = await untoggleResA.json();
    assert(untoggleDataA.data?.isBookmarked === false, 'User A toggled bookmark off successfully');

    // ---------------------------------------------------------
    // 8. Reading Progress & Completion
    // ---------------------------------------------------------
    console.log('\n--- 8. Reading Progress & Completion ---');

    // User A updates progress to 50%
    const progResA = await fetch(`${baseUrl}/resources/${targetResource.id}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ progressPercent: 50 }),
    });
    const progDataA = await progResA.json();
    assert(progDataA.data?.progressPercent === 50, 'Reading progress updated to 50% for User A');
    assert(progDataA.data?.isCompleted === false, 'Resource not yet completed at 50%');

    // User A completes the resource (100%)
    const completeResA = await fetch(`${baseUrl}/resources/${targetResource.id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const completeDataA = await completeResA.json();
    assert(completeDataA.data?.isCompleted === true, 'Resource marked as completed for User A');
    assert(completeDataA.data?.progressPercent === 100, 'Progress set to 100% on complete');

    // User A queries reading progress list
    const userProgResA = await fetch(`${baseUrl}/resources/progress`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const userProgDataA = await userProgResA.json();
    const progressListA = userProgDataA.data || [];
    assert(progressListA.length > 0, `User A has reading progress records (found: ${progressListA.length})`);
    assert(
      progressListA.some((p: any) => p.progress?.isCompleted === true),
      'User A progress history includes completed guide',
    );

    // User B reading progress is isolated
    const userProgResB = await fetch(`${baseUrl}/resources/progress`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const userProgDataB = await userProgResB.json();
    const progressListB = userProgDataB.data || [];
    assert(progressListB.length === 0, 'User B reading progress is empty (Strict isolation verified)');

    // ---------------------------------------------------------
    // 9. Admin Content Management Endpoints
    // ---------------------------------------------------------
    console.log('\n--- 9. Admin Content Management ---');

    const newSlug = `admin-test-guide-${timestamp}`;
    const createRes = await fetch(`${baseUrl}/admin/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Admin Created Test Guide',
        slug: newSlug,
        description: 'A test educational article created by admin workflow.',
        category: 'mindfulness',
        readingMinutes: 3,
        tags: ['test', 'admin', 'mindfulness'],
        blocks: [
          {
            type: 'heading',
            text: 'Admin Guide Heading',
          },
          {
            type: 'paragraph',
            text: 'This is test content written via the admin API.',
          },
        ],
        isPublished: true,
      }),
    });
    const createData = await createRes.json();
    const createdId = createData.data?.id;
    assert(createRes.status === 201 && Boolean(createdId), 'Admin created custom educational resource (201 Created)');

    // Admin updates guide
    const updateRes = await fetch(`${baseUrl}/admin/resources/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: 'Admin Created Test Guide (Updated)',
        readingMinutes: 5,
      }),
    });
    const updateData = await updateRes.json();
    assert(updateData.data?.title.includes('(Updated)'), 'Admin updated resource details');
    assert(updateData.data?.readingMinutes === 5, 'Admin updated reading duration to 5 mins');

    // Admin toggles featured status
    const featToggleRes = await fetch(`${baseUrl}/admin/resources/${createdId}/feature`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ isFeatured: true }),
    });
    const featToggleData = await featToggleRes.json();
    assert(featToggleData.data?.isFeatured === true, 'Admin set isFeatured = true on custom resource');

    // Admin deletes resource
    const deleteRes = await fetch(`${baseUrl}/admin/resources/${createdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const deleteData = await deleteRes.json();
    assert(deleteData.success === true, 'Admin deleted custom resource');

    // Verify it is inactive / not in public list
    const checkDeletedRes = await fetch(`${baseUrl}/resources/${createdId}`);
    assert(checkDeletedRes.status === 404, 'Deleted resource returns 404 on public detail');

    // Clean up test data
    await User.deleteMany({ email: { $in: [userAEmail, userBEmail] } });
    await ResourceBookmarkModel.deleteMany({ userId: { $in: [userIdA, userIdB] } });
    await ResourceProgressModel.deleteMany({ userId: { $in: [userIdA, userIdB] } });
    await ResourceModel.deleteOne({ slug: newSlug });

    console.log('\n======================================================');
    console.log('🎉 STEP 15 TEST SUITE RESULTS');
    console.log('======================================================');
    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    console.log(`Passed: ${passed}/${total}`);

    if (passed === total) {
      console.log('🌟 ALL STEP 15 TESTS PASSED SUCCESSFULLY!\n');
    } else {
      console.error(`💥 ${total - passed} test(s) failed.\n`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await Database.disconnect();
  }
}

runStep15TestSuite();
