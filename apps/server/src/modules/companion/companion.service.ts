import { Types } from 'mongoose';
import {
  CompanionSettings,
  UpdateCompanionSettingsDto,
  ChatMessage,
} from '@solace/shared';
import { CompanionSettingsModel } from './companionSettings.model';
import { User } from '../../models/user.model';
import { Mood } from '../mood/mood.model';
import { Journal } from '../journal/journal.model';
import { WellnessPlanModel } from '../wellness-plans/wellnessPlan.model';
import { GeminiProvider } from '../../integrations/gemini/gemini.config';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export interface CrisisCheckResult {
  isCrisis: boolean;
  message: string;
  helplines: Array<{ name: string; contact: string }>;
}

export class CompanionService {
  /**
   * Retrieve companion settings for user, creating defaults if not yet created.
   */
  public static async getSettings(userId: string): Promise<CompanionSettings> {
    const userObjectId = new Types.ObjectId(userId);
    let settings = await CompanionSettingsModel.findOne({ userId: userObjectId });

    if (!settings) {
      settings = await CompanionSettingsModel.create({
        userId: userObjectId,
        enablePersonalization: true,
        journalPersonalizationConsent: false,
        preferredTone: 'balanced',
      });
    }

    return settings.toDto();
  }

  /**
   * Update companion settings for user.
   */
  public static async updateSettings(
    userId: string,
    dto: UpdateCompanionSettingsDto,
  ): Promise<CompanionSettings> {
    const userObjectId = new Types.ObjectId(userId);
    const settings = await CompanionSettingsModel.findOneAndUpdate(
      { userId: userObjectId },
      {
        $set: {
          ...(dto.enablePersonalization !== undefined && {
            enablePersonalization: dto.enablePersonalization,
          }),
          ...(dto.journalPersonalizationConsent !== undefined && {
            journalPersonalizationConsent: dto.journalPersonalizationConsent,
          }),
          ...(dto.preferredTone && { preferredTone: dto.preferredTone }),
        },
      },
      { new: true, upsert: true },
    );

    return settings.toDto();
  }

  /**
   * Crisis detector for self-harm or suicidal ideation.
   */
  public static checkCrisis(text: string): CrisisCheckResult | null {
    const crisisPatterns = [
      /\b(suicid|suicidal)\b/i,
      /\b(kill (myself|me)|ending my life|end my life|want to die|wish i (was|were) dead)\b/i,
      /\b(harm myself|self-harm|cutting myself|overdose|overdosing)\b/i,
      /\b(don't want to live|dont want to live|no reason to live|cannot go on anymore|can't go on anymore)\b/i,
    ];

    const isMatch = crisisPatterns.some((pattern) => pattern.test(text));

    if (!isMatch) {
      return null;
    }

    return {
      isCrisis: true,
      message:
        "I hear how much pain you're in right now, and I care deeply about your safety. You don't have to carry this alone. Please connect with people who can support you right away:",
      helplines: [
        {
          name: '988 Suicide & Crisis Lifeline (US & Canada)',
          contact: 'Call or text 988 (Available 24/7, free, confidential)',
        },
        {
          name: 'Crisis Text Line',
          contact: 'Text HOME to 741741',
        },
        {
          name: 'The Trevor Project (LGBTQ Youth)',
          contact: 'Call 1-866-488-7386 or text START to 678-678',
        },
        {
          name: 'International Emergency Resources',
          contact: 'Visit https://findahelpline.com or call your local emergency services (911/999/112)',
        },
      ],
    };
  }

  /**
   * Build personalized context based on user profile, recent moods, plans, and consented journal data.
   */
  public static async buildConversationContext(
    userId: string,
    settings: CompanionSettings,
  ): Promise<string> {
    if (!settings.enablePersonalization) {
      return 'Personalization is disabled by the user. Do not use past history or personal specifics.';
    }

    try {
      const userObjectId = new Types.ObjectId(userId);
      const user = await User.findById(userObjectId);
      const preferredName = user?.preferredName || user?.name || 'Friend';
      const wellnessGoals = user?.wellnessGoals?.length ? user.wellnessGoals.join(', ') : 'General well-being';

      // 1. Fetch recent moods (up to 5 entries)
      const recentMoods = await Mood.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      let moodContext = 'No recent mood check-ins recorded.';
      if (recentMoods.length > 0) {
        moodContext = recentMoods
          .map((m) => {
            const date = new Date(m.createdAt).toLocaleDateString();
            const emotions = m.emotions?.length ? ` (${m.emotions.join(', ')})` : '';
            return `${date}: ${m.mood} [Intensity: ${m.moodIntensity}/10]${emotions}`;
          })
          .join('\n');
      }

      // 2. Fetch active wellness plan
      const activePlan = await WellnessPlanModel.findOne({
        userId: userObjectId,
        status: 'active',
      }).lean();

      let planContext = 'No active wellness plan currently set.';
      if (activePlan) {
        planContext = `Plan: "${activePlan.title}" - Focus: ${activePlan.goals?.join(', ') || 'N/A'}`;
      }

      // 3. Fetch journal themes ONLY if user has explicitly granted consent
      let journalContext = 'User has not opted in to journal sharing.';
      if (settings.journalPersonalizationConsent) {
        const recentJournals = await Journal.find({ userId: userObjectId })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();

        if (recentJournals.length > 0) {
          journalContext = recentJournals
            .map((j) => {
              const tags = j.tags?.length ? ` [Tags: ${j.tags.join(', ')}]` : '';
              return `Title: "${j.title}"${tags}`;
            })
            .join('; ');
        } else {
          journalContext = 'No recent journal entries.';
        }
      }

      return `User Preferred Name: ${preferredName}
User Wellness Goals: ${wellnessGoals}
Recent Mood History:
${moodContext}
Active Wellness Plan:
${planContext}
Journal Themes (Consented):
${journalContext}`;
    } catch (error) {
      logger.error('Error building conversation context:', error);
      return 'Context temporarily unavailable.';
    }
  }

  /**
   * Build the complete system instructions for Solace AI.
   */
  public static buildSystemInstruction(
    tone: 'gentle' | 'balanced' | 'direct',
    userContext: string,
  ): string {
    const toneGuidelines: Record<typeof tone, string> = {
      gentle:
        'Your tone should be exceptionally soothing, soft, deeply affirming, and patient. Give the user space to feel without rushing to solutions.',
      balanced:
        'Your tone should be warm, thoughtful, emotionally grounding, and conversational. Balance validation with gentle reflection.',
      direct:
        'Your tone should be caring, clear, structured, and action-oriented. Provide grounded observations and concise practical steps.',
    };

    return `You are Solace, a compassionate, emotionally intelligent, and grounded AI wellness companion.
Your mission is to support the user's emotional and mental well-being through active listening, empathetic reflection, and mindful guidance.

# Core Personality & Values:
1. Warmth & Non-Judgment: Every emotion is welcome. Validate the user's feelings first before offering perspectives or coping ideas.
2. Listening First: Acknowledge the emotional weight of what they share. Do not rush to fix or give toxic positivity.
3. Conversational & Human: Speak naturally, gently, and warmly. Keep responses concise (1 to 3 short paragraphs max, or clean bullet points when helpful). Avoid robotic or clinical jargon.
4. Boundaries: You are a supportive AI companion, NOT a licensed therapist, clinical psychologist, or medical doctor.
   - Do NOT provide clinical diagnoses (e.g., never say "You have clinical depression" or "This is bipolar disorder").
   - Do NOT prescribe medications or medical treatments.
   - Always encourage professional human care for severe or chronic distress.

# Selected Tone Style:
${toneGuidelines[tone] || toneGuidelines.balanced}

# User Context:
${userContext}

# Guidelines for Interaction:
- Address the user naturally by their preferred name when appropriate, but do not overuse it.
- If they ask for breathing exercises, grounding techniques, or reframing exercises, provide simple, accessible steps.
- Conclude responses with a gentle, open-ended question to help them reflect, unless they are saying goodbye or winding down.`;
  }

  /**
   * Generate an AI response using Google Gemini.
   */
  public static async generateResponse(
    userId: string,
    userMessage: string,
    history: ChatMessage[],
  ): Promise<{
    content: string;
    safetyAlert?: CrisisCheckResult;
    metadata?: Record<string, unknown>;
  }> {
    // 1. Safety & Crisis check
    const crisis = CompanionService.checkCrisis(userMessage);
    if (crisis) {
      const helplinesText = crisis.helplines
        .map((h) => `• **${h.name}**: ${h.contact}`)
        .join('\n');
      const responseContent = `${crisis.message}\n\n${helplinesText}\n\n*Please reach out to one of these services or someone you trust right now. You matter, and support is waiting.*`;

      return {
        content: responseContent,
        safetyAlert: crisis,
        metadata: { isCrisis: true },
      };
    }

    // 2. Fetch settings and build context
    const settings = await CompanionService.getSettings(userId);
    const userContext = await CompanionService.buildConversationContext(userId, settings);
    const systemInstruction = CompanionService.buildSystemInstruction(
      settings.preferredTone,
      userContext,
    );

    // 3. Fallback if Gemini is not configured
    if (!GeminiProvider.isConfigured()) {
      logger.info('Gemini is not configured with an API key. Using warm empathetic fallback.');
      const fallbackContent =
        "Thank you for sharing that with me. I'm here with you and listening closely. While my connection to the AI reasoning engine is currently in offline mode, please take a slow, gentle breath. What is one small, kind thing you can do for yourself in this moment?";
      return {
        content: fallbackContent,
        metadata: { model: 'fallback-offline' },
      };
    }

    // 4. Prepare contents for Gemini
    try {
      const client = GeminiProvider.getClient();

      // Format previous messages: Gemini expects 'user' | 'model'
      const formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Limit history to the last 10 messages for prompt efficiency and context focus
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role === 'user') {
          formattedHistory.push({
            role: 'user',
            parts: [{ text: msg.content }],
          });
        } else if (msg.role === 'assistant') {
          formattedHistory.push({
            role: 'model',
            parts: [{ text: msg.content }],
          });
        }
      }

      // Add current message
      formattedHistory.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const response = await client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-1.5-flash',
        contents: formattedHistory,
        config: {
          systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      const responseText = response.text || '';
      if (!responseText.trim()) {
        throw new Error('Received empty response from Gemini API');
      }

      return {
        content: responseText.trim(),
        metadata: {
          model: env.GEMINI_MODEL || 'gemini-1.5-flash',
          tokens: response.usageMetadata?.totalTokenCount,
        },
      };
    } catch (error) {
      logger.error('Gemini generateContent error:', error);
      // Graceful fallback rather than crashing
      return {
        content:
          "I hear you, and I'm right here with you. I had a brief moment of connection difficulty, but I want you to know you are heard. Could you share a little more about how you're feeling right now?",
        metadata: { error: 'gemini_service_unavailable', fallback: true },
      };
    }
  }

  /**
   * Generate streaming AI response using SSE
   */
  public static async generateStreamingResponse(
    userId: string,
    userMessage: string,
    history: ChatMessage[],
    onChunk: (chunk: string) => void,
  ): Promise<{
    fullContent: string;
    safetyAlert?: CrisisCheckResult;
    metadata?: Record<string, unknown>;
  }> {
    // 1. Crisis check
    const crisis = CompanionService.checkCrisis(userMessage);
    if (crisis) {
      const helplinesText = crisis.helplines
        .map((h) => `• **${h.name}**: ${h.contact}`)
        .join('\n');
      const responseContent = `${crisis.message}\n\n${helplinesText}\n\n*Please reach out to one of these services or someone you trust right now. You matter, and support is waiting.*`;

      onChunk(responseContent);
      return {
        fullContent: responseContent,
        safetyAlert: crisis,
        metadata: { isCrisis: true },
      };
    }

    // 2. Settings & Context
    const settings = await CompanionService.getSettings(userId);
    const userContext = await CompanionService.buildConversationContext(userId, settings);
    const systemInstruction = CompanionService.buildSystemInstruction(
      settings.preferredTone,
      userContext,
    );

    // 3. Fallback if not configured
    if (!GeminiProvider.isConfigured()) {
      const fallback =
        "Thank you for sharing that with me. I'm here with you and listening closely. Please take a slow, gentle breath. What is one small, kind thing you can do for yourself in this moment?";
      onChunk(fallback);
      return {
        fullContent: fallback,
        metadata: { model: 'fallback-offline' },
      };
    }

    // 4. Stream from Gemini
    try {
      const client = GeminiProvider.getClient();
      const formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      const recentHistory = history.slice(-10);

      for (const msg of recentHistory) {
        if (msg.role === 'user') {
          formattedHistory.push({
            role: 'user',
            parts: [{ text: msg.content }],
          });
        } else if (msg.role === 'assistant') {
          formattedHistory.push({
            role: 'model',
            parts: [{ text: msg.content }],
          });
        }
      }

      formattedHistory.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const responseStream = await client.models.generateContentStream({
        model: env.GEMINI_MODEL || 'gemini-1.5-flash',
        contents: formattedHistory,
        config: {
          systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      let fullContent = '';
      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          fullContent += text;
          onChunk(text);
        }
      }

      return {
        fullContent: fullContent.trim(),
        metadata: { model: env.GEMINI_MODEL || 'gemini-1.5-flash' },
      };
    } catch (error) {
      logger.error('Gemini generateContentStream error:', error);
      const fallback =
        "I hear you, and I'm right here with you. I had a brief moment of connection difficulty, but I want you to know you are heard. Could you share a little more about how you're feeling right now?";
      onChunk(fallback);
      return {
        fullContent: fallback,
        metadata: { error: 'gemini_stream_error', fallback: true },
      };
    }
  }
}

