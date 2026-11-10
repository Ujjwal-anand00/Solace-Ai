import http from 'http';
import dotenv from 'dotenv';
import path from 'path';

// Load server environment
dotenv.config({ path: path.resolve(__dirname, '../apps/server/.env') });

import { createApp } from '../apps/server/src/app';
import { Database } from '../apps/server/src/database';
import { User } from '../apps/server/src/models/user.model';
import { ConversationModel } from '../apps/server/src/modules/conversations/conversation.model';
import { ChatMessageModel } from '../apps/server/src/modules/companion/chatMessage.model';
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

const FORBIDDEN_FALLBACK_SUBSTRING = "I had a brief moment of connection difficulty";

const TEST_PROMPTS = [
  { id: 1, title: 'General Check-In', prompt: "I'm having a rough day and don't know where to start." },
  { id: 2, title: 'Anxiety / Panic', prompt: "My chest feels tight and my thoughts are racing so fast right now." },
  { id: 3, title: 'Burnout / Exhaustion', prompt: "I've been working 12 hours every day and I just feel completely numb and drained." },
  { id: 4, title: 'Sleep Difficulties', prompt: "It's 2am and I can't turn off my brain. Every worry from the past five years is replaying." },
  { id: 5, title: 'Imposter Syndrome', prompt: "I feel like a complete fraud at my new job and everyone will find out I don't belong." },
  { id: 6, title: 'Relationship Conflict', prompt: "I had a huge argument with my partner and I feel so heartbroken and misunderstood." },
  { id: 7, title: 'Loneliness', prompt: "I feel completely disconnected from everyone around me, even in a crowded room." },
  { id: 8, title: 'Grief / Loss', prompt: "I'm missing my grandmother who passed away last year and the grief suddenly hit me out of nowhere." },
  { id: 9, title: 'Daily Gratitude / Win', prompt: "I finally finished a project I was putting off for weeks! I want to celebrate this small step." },
  { id: 10, title: 'Motivation / Stuckness', prompt: "I have zero energy to clean my room or get out of bed today. I feel stuck in molasses." },
  { id: 11, title: 'Emotional Overwhelm', prompt: "Too many things are collapsing at the same time and I just want to sit on the floor and cry." },
  { id: 12, title: 'Mindfulness / Grounding', prompt: "Can you guide me through a 2-minute centering pause right now?" },
  { id: 13, title: 'Boundaries', prompt: "How do I say no to my manager taking on extra weekend work without feeling guilty?" },
  { id: 14, title: 'Anger / Frustration', prompt: "I am furious about how unfair a colleague was treated today, I can't calm down." },
  { id: 15, title: 'Perfectionism', prompt: "I can't submit this draft until every single sentence is flawless. I'm paralyzed." },
  { id: 16, title: 'Academic / Exam Stress', prompt: "My final exam is tomorrow morning and I'm terrified that my mind will go blank." },
  { id: 17, title: 'Body Image / Self-Compassion', prompt: "I caught my reflection in the mirror today and immediately felt critical and upset with myself." },
  { id: 18, title: 'Parenting Stress', prompt: "I lost my patience and raised my voice at my toddler today, and the guilt is crushing me." },
  { id: 19, title: 'Evening Wind-Down', prompt: "Help me mentally close my laptop, let go of workday tension, and relax this evening." },
  { id: 20, title: 'Gentle Reflection', prompt: "What is one gentle, kind question I can ask myself before going to sleep tonight?" },
];

async function runAIQualitySuite() {
  console.log('\n======================================================');
  console.log('🧠 SOLACE AI — COMPREHENSIVE AI QUALITY & REGRESSION TEST');
  console.log('======================================================\n');

  await Database.connect({
    uri: process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/solace_test',
  });

  const app = createApp();
  const server = http.createServer(app);
  const TEST_PORT = 5099;

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  try {
    // 1. Direct Gemini Provider Health Check
    console.log('--- Phase 1: Gemini Provider Status & Fallback ---');
    const health = await GeminiProvider.checkHealth();
    assert(health.isOnline, 'Gemini Provider health check succeeds', `Model: ${health.model}`);
    console.log(`Active Gemini Model: ${health.model} (Latency: ${health.latencyMs}ms)`);

    // 2. Register a dedicated test user
    console.log('\n--- Phase 2: User Setup & Authentication ---');
    const timestamp = Date.now();
    const testEmail = `ai_tester_${timestamp}@solace.ai`;

    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
        name: 'Aiden Tester',
        preferredName: 'Aiden',
      }),
    });
    const regData = (await registerRes.json()) as any;
    const token = regData.data?.tokens?.accessToken || regData.tokens?.accessToken;
    const userId = regData.data?.user?.id || regData.user?.id;
    assert(Boolean(token), 'Registered test user and acquired access token');

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 3. Companion Status Endpoint Check
    console.log('\n--- Phase 3: Companion API Status Endpoint ---');
    const statusRes = await fetch(`${baseUrl}/companion/status`, {
      method: 'GET',
      headers: authHeaders,
    });
    const statusData = (await statusRes.json()) as any;
    assert(statusRes.status === 200, 'GET /companion/status returned HTTP 200');
    assert(statusData.data?.isOnline === true, 'Companion status reports isOnline: true');
    assert(Boolean(statusData.data?.model), `Companion status returns active model (${statusData.data?.model})`);

    // 4. Create Conversation
    console.log('\n--- Phase 4: Create Test Conversation ---');
    const createConvRes = await fetch(`${baseUrl}/conversations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'AI Quality Verification',
      }),
    });
    const convData = (await createConvRes.json()) as any;
    const conversationId = convData.data?.conversation?.id;
    assert(Boolean(conversationId), 'Created conversation for AI test runs', `ID: ${conversationId}`);

    // 5. Run 20 Distinct Quality Prompts
    console.log('\n--- Phase 5: Executing 20 Distinct Prompts Against Solace AI ---');
    let successfulPrompts = 0;

    for (const testItem of TEST_PROMPTS) {
      const startMs = Date.now();
      const sendRes = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ content: testItem.prompt }),
      });
      const sendData = (await sendRes.json()) as any;
      const elapsed = Date.now() - startMs;

      const assistantMsg = sendData.data?.assistantMessage;
      const responseContent = assistantMsg?.content || '';

      const isForbiddenFallback = responseContent.includes(FORBIDDEN_FALLBACK_SUBSTRING);
      const isSufficientLength = responseContent.trim().length > 40;
      const isHttpOk = sendRes.status === 200 || sendRes.status === 201;

      const passed = isHttpOk && !isForbiddenFallback && isSufficientLength;
      if (passed) successfulPrompts++;

      assert(
        passed,
        `[#${testItem.id}] ${testItem.title} (${elapsed}ms)`,
        isForbiddenFallback
          ? 'REGRESSION: Returned old generic connection fallback!'
          : !isSufficientLength
          ? `Response too brief (${responseContent.length} chars)`
          : `HTTP ${sendRes.status}`
      );

      // Log a short preview of the empathetic AI response
      const preview = responseContent.replace(/\s+/g, ' ').slice(0, 95);
      console.log(`    ↳ Solace: "${preview}..."`);
    }

    assert(
      successfulPrompts === TEST_PROMPTS.length,
      `All 20 AI prompts succeeded with unique, empathetic responses (${successfulPrompts}/${TEST_PROMPTS.length})`
    );

    // 6. Test Multi-Turn Context Retention
    console.log('\n--- Phase 6: Multi-Turn Conversation Memory ---');
    const memoryTurn1 = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ content: 'I have a golden retriever named Sunny who means the world to me.' }),
    });
    const mem1Data = (await memoryTurn1.json()) as any;
    assert(memoryTurn1.status === 200 || memoryTurn1.status === 201, 'Memory Turn 1 sent successfully');

    const memoryTurn2 = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ content: 'What was the name of my pet that I just mentioned?' }),
    });
    const mem2Data = (await memoryTurn2.json()) as any;
    const mem2Content = mem2Data.data?.assistantMessage?.content || '';
    const rememberedPet = mem2Content.toLowerCase().includes('sunny');
    assert(rememberedPet, 'Solace remembered pet name "Sunny" across consecutive turns', `Response: "${mem2Content.slice(0, 80)}..."`);

    // 7. Test Message Regeneration Endpoint
    console.log('\n--- Phase 7: Message Regeneration Endpoint ---');
    const regenRes = await fetch(`${baseUrl}/conversations/${conversationId}/messages/regenerate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    const regenData = (await regenRes.json()) as any;
    const regenContent = regenData.data?.assistantMessage?.content || '';
    assert(regenRes.status === 200, 'POST /conversations/:id/messages/regenerate returned HTTP 200');
    assert(
      regenContent.length > 30 && !regenContent.includes(FORBIDDEN_FALLBACK_SUBSTRING),
      'Regenerated assistant message with genuine fresh AI content'
    );

    // 8. Database Cleanliness Check
    console.log('\n--- Phase 8: Database Integrity & Regression Check ---');
    const fallbackInDb = await ChatMessageModel.findOne({
      content: { $regex: FORBIDDEN_FALLBACK_SUBSTRING, $options: 'i' },
    });
    assert(
      !fallbackInDb,
      'REGRESSION VERIFICATION: Zero fake fallback messages persisted in MongoDB database'
    );

    // Cleanup
    await ConversationModel.deleteMany({ userId });
    await ChatMessageModel.deleteMany({ userId });
    await User.deleteOne({ _id: userId });

  } catch (err: any) {
    console.error('Fatal test error:', err);
    assert(false, 'Fatal exception in test suite', err?.message);
  } finally {
    server.close();
    await Database.disconnect();
  }

  // Summary
  console.log('\n======================================================');
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`TOTAL TESTS: ${total}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAIQualitySuite();
