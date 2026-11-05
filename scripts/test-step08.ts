import http from 'http';
import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { User } from '../apps/server/src/models/user.model';
import { ConversationModel } from '../apps/server/src/modules/conversations/conversation.model';
import { ChatMessageModel } from '../apps/server/src/modules/companion/chatMessage.model';
import { CompanionSettingsModel } from '../apps/server/src/modules/companion/companionSettings.model';

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

async function runStep08TestSuite() {
  console.log('\n======================================================');
  console.log('🧪 SOLACE AI - STEP 08 AI COMPANION TEST SUITE');
  console.log('======================================================\n');

  await Database.connect();
  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5098;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  try {
    const timestamp = Date.now();
    const testUserEmail = `companion_test_${timestamp}@solace.ai`;
    const userTwoEmail = `companion_user2_${timestamp}@solace.ai`;

    // 1. Register User 1
    const regRes1 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'Password123!',
        name: 'Serena Joy',
        preferredName: 'Serena',
      }),
    });
    const regJson1 = await regRes1.json();
    const token1 = regJson1.data?.tokens?.accessToken;
    const user1Id = regJson1.data?.user?.id;
    assert(regRes1.status === 201 && !!token1, 'Test 1: User 1 registration & authentication');

    // 2. Register User 2 (for authorization checks)
    const regRes2 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userTwoEmail,
        password: 'Password123!',
        name: 'Jordan Lee',
        preferredName: 'Jordan',
      }),
    });
    const regJson2 = await regRes2.json();
    const token2 = regJson2.data?.tokens?.accessToken;
    const user2Id = regJson2.data?.user?.id;
    assert(regRes2.status === 201 && !!token2, 'Test 2: User 2 registration');

    // 3. Test Companion Settings (Default GET)
    const settingsGetRes = await fetch(`${baseUrl}/companion/settings`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const settingsGetJson = await settingsGetRes.json();
    assert(
      settingsGetRes.status === 200 &&
        settingsGetJson.data?.enablePersonalization === true &&
        settingsGetJson.data?.journalPersonalizationConsent === false &&
        settingsGetJson.data?.preferredTone === 'balanced',
      'Test 3: Retrieve default companion settings',
      JSON.stringify(settingsGetJson),
    );

    // 4. Test Companion Settings (Update PATCH)
    const settingsPatchRes = await fetch(`${baseUrl}/companion/settings`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        journalPersonalizationConsent: true,
        preferredTone: 'gentle',
      }),
    });
    const settingsPatchJson = await settingsPatchRes.json();
    assert(
      settingsPatchRes.status === 200 &&
        settingsPatchJson.data?.journalPersonalizationConsent === true &&
        settingsPatchJson.data?.preferredTone === 'gentle',
      'Test 4: Update companion settings (journal consent & gentle tone)',
      JSON.stringify(settingsPatchJson),
    );

    // 5. Test Create Conversation with Initial Message
    const createConvRes = await fetch(`${baseUrl}/conversations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initialMessage: "Hello Solace, I'm feeling a little overwhelmed today with work.",
      }),
    });
    const createConvJson = await createConvRes.json();
    const conversationId = createConvJson.data?.conversation?.id;
    const userMsg = createConvJson.data?.userMessage;
    const assistantMsg = createConvJson.data?.assistantMessage;

    assert(
      createConvRes.status === 201 &&
        !!conversationId &&
        userMsg?.role === 'user' &&
        assistantMsg?.role === 'assistant' &&
        assistantMsg?.content?.length > 10,
      'Test 5: Create conversation with initial message & generate assistant response',
      JSON.stringify(createConvJson),
    );

    // 6. Test List Conversations
    const listConvRes = await fetch(`${baseUrl}/conversations`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const listConvJson = await listConvRes.json();
    assert(
      listConvRes.status === 200 &&
        Array.isArray(listConvJson.data) &&
        listConvJson.data.length >= 1 &&
        listConvJson.data[0].id === conversationId,
      'Test 6: List user conversations with pagination',
      JSON.stringify(listConvJson),
    );

    // 7. Test Retrieve Conversation by ID
    const getConvRes = await fetch(`${baseUrl}/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const getConvJson = await getConvRes.json();
    assert(
      getConvRes.status === 200 && getConvJson.data?.id === conversationId,
      'Test 7: Retrieve conversation by ID',
      JSON.stringify(getConvJson),
    );

    // 8. Test Update Conversation Title
    const patchConvRes = await fetch(`${baseUrl}/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Work Stress Reflection',
      }),
    });
    const patchConvJson = await patchConvRes.json();
    assert(
      patchConvRes.status === 200 && patchConvJson.data?.title === 'Work Stress Reflection',
      'Test 8: Update conversation title',
      JSON.stringify(patchConvJson),
    );

    // 9. Test Send Follow-up Message
    const sendMsgRes = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'Could you give me a simple grounding exercise right now?',
      }),
    });
    const sendMsgJson = await sendMsgRes.json();
    assert(
      sendMsgRes.status === 201 &&
        sendMsgJson.data?.userMessage?.content === 'Could you give me a simple grounding exercise right now?' &&
        sendMsgJson.data?.assistantMessage?.role === 'assistant' &&
        sendMsgJson.data?.assistantMessage?.content?.length > 10,
      'Test 9: Send follow-up chat message and receive AI response',
      JSON.stringify(sendMsgJson),
    );

    // 10. Test Messages List for Conversation
    const listMsgsRes = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const listMsgsJson = await listMsgsRes.json();
    assert(
      listMsgsRes.status === 200 &&
        Array.isArray(listMsgsJson.data) &&
        listMsgsJson.data.length >= 4, // 2 user messages + 2 assistant responses
      'Test 10: Retrieve chronological messages list for conversation',
      `Count: ${listMsgsJson.data?.length}`,
    );

    // 11. Test Crisis Safety Interceptor
    const crisisMsgRes = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'I feel completely hopeless and want to end my life.',
      }),
    });
    const crisisMsgJson = await crisisMsgRes.json();
    const isCrisis = crisisMsgJson.data?.safetyAlert?.isCrisis;
    const responseHas988 = crisisMsgJson.data?.assistantMessage?.content?.includes('988');

    assert(
      crisisMsgRes.status === 201 && isCrisis === true && responseHas988 === true,
      'Test 11: Safety Interceptor detects crisis and provides 988 Lifeline resources',
      JSON.stringify(crisisMsgJson.data?.safetyAlert),
    );

    // 12. Test Security & Ownership Boundary (User 2 cannot access User 1's conversation)
    const unauthorizedAccessRes = await fetch(`${baseUrl}/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert(
      unauthorizedAccessRes.status === 403,
      'Test 12: Cross-user authorization check blocks unauthorized conversation access (403 Forbidden)',
      `Status: ${unauthorizedAccessRes.status}`,
    );

    // 13. Test Delete Conversation (Cascade Message Deletion)
    const deleteConvRes = await fetch(`${baseUrl}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    const deleteConvJson = await deleteConvRes.json();
    const remainingMessagesCount = await ChatMessageModel.countDocuments({
      conversationId,
    });

    assert(
      deleteConvRes.status === 200 && remainingMessagesCount === 0,
      'Test 13: Delete conversation with clean cascade deletion of chat messages',
      JSON.stringify(deleteConvJson),
    );

    // Cleanup test data
    await Promise.all([
      User.deleteMany({ _id: { $in: [user1Id, user2Id] } }),
      ConversationModel.deleteMany({ userId: { $in: [user1Id, user2Id] } }),
      ChatMessageModel.deleteMany({ userId: { $in: [user1Id, user2Id] } }),
      CompanionSettingsModel.deleteMany({ userId: { $in: [user1Id, user2Id] } }),
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
    console.log('\n🎉 ALL STEP 08 COMPANION TESTS PASSED SUCCESSFULLY!');
  }
}

runStep08TestSuite();
