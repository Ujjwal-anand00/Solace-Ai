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
import { buildSystemInstruction } from './companionPrompt';
import { AppError } from '../../utils/apiError';
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
          name: 'International Resources (Befrienders Worldwide)',
          contact: 'Visit https://www.befrienders.org to find confidential support in your country',
        },
      ],
    };
  }

  /**
   * Build personalized user context strictly respecting privacy settings.
   */
  public static async buildConversationContext(
    userId: string,
    settings: CompanionSettings,
  ): Promise<{ userContext: string; preferredName?: string }> {
    if (!settings.enablePersonalization) {
      return { userContext: 'User has disabled personalization features.' };
    }

    try {
      const userObjectId = new Types.ObjectId(userId);

      // 1. Fetch user profile
      const user = await User.findById(userObjectId).lean();
      const preferredName = user?.preferredName || user?.name || undefined;
      const wellnessGoals = user?.wellnessGoals?.length
        ? user.wellnessGoals.join(', ')
        : 'General well-being';

      // 2. Fetch recent mood entries (last 3, within last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentMoods = await Mood.find({
        userId: userObjectId,
        createdAt: { $gte: sevenDaysAgo },
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      let moodContext = 'No recent mood check-ins recorded.';
      if (recentMoods.length > 0) {
        moodContext = recentMoods
          .map((m) => {
            const dateStr = new Date(m.createdAt).toLocaleDateString();
            const emotionsStr = m.emotions?.length ? ` (${m.emotions.join(', ')})` : '';
            return `${dateStr}: Felt ${m.mood}${emotionsStr}, intensity: ${m.moodIntensity}/10`;
          })
          .join('\n');
      }

      // 3. Fetch active wellness plan summary
      const activePlan = await WellnessPlanModel.findOne({
        userId: userObjectId,
        status: 'active',
      }).lean();

      let planContext = 'No active wellness plan currently set.';
      if (activePlan) {
        planContext = `Plan: "${activePlan.title}" - Focus: ${activePlan.goals?.join(', ') || 'N/A'}`;
      }

      // 4. Fetch journal themes ONLY if user has explicitly granted consent
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

      const userContext = `Wellness Goals: ${wellnessGoals}
Recent Mood History:
${moodContext}
Active Wellness Plan:
${planContext}
Journal Themes (Consented):
${journalContext}`;

      return { userContext, preferredName };
    } catch (error) {
      logger.error('Error building conversation context:', error);
      return { userContext: 'Context temporarily unavailable.' };
    }
  }

  /**
   * Format history for Gemini API, ensuring alternating user/model roles and clean text.
   */
  public static formatGeminiContents(
    history: ChatMessage[],
    userMessage: string,
  ): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
    const formatted: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Filter valid history messages (last 12)
    const validHistory = history
      .filter((m) => Boolean(m.content && m.content.trim()))
      // Filter out any previous fallback error messages
      .filter((m) => !m.content.includes("I had a brief moment of connection difficulty"))
      .slice(-12);

    for (const msg of validHistory) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const text = msg.content.trim();

      // Ensure alternating roles: if last role matches current role, combine parts
      if (formatted.length > 0 && formatted[formatted.length - 1].role === role) {
        formatted[formatted.length - 1].parts[0].text += `\n\n${text}`;
      } else {
        formatted.push({
          role,
          parts: [{ text }],
        });
      }
    }

    // Append current user message
    const trimmedUserMsg = userMessage.trim();
    if (formatted.length > 0 && formatted[formatted.length - 1].role === 'user') {
      formatted[formatted.length - 1].parts[0].text += `\n\n${trimmedUserMsg}`;
    } else {
      formatted.push({
        role: 'user',
        parts: [{ text: trimmedUserMsg }],
      });
    }

    return formatted;
  }

  /**
   * Generate an AI response using Google Gemini with automatic multi-model fallback.
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
    const { userContext, preferredName } = await CompanionService.buildConversationContext(
      userId,
      settings,
    );
    const systemInstruction = buildSystemInstruction({
      tone: settings.preferredTone,
      userName: preferredName,
      userContext,
    });

    // 3. Fallback check if Gemini is completely unconfigured
    if (!GeminiProvider.isConfigured()) {
      throw AppError.serviceUnavailable(
        'Solace AI is currently offline because the AI reasoning service is unconfigured.',
      );
    }

    // 4. Format history
    const contents = CompanionService.formatGeminiContents(history, userMessage);

    // 5. Query Gemini with multi-model fallback
    try {
      const result = await GeminiProvider.generateWithFallback({
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 1200,
        },
        timeoutMs: 20000,
      });

      return {
        content: result.text,
        metadata: {
          model: result.modelUsed,
          tokens: result.usage?.totalTokenCount,
        },
      };
    } catch (error: any) {
      logger.error('Gemini generateWithFallback failed completely:', error);

      const status = error?.status || error?.statusCode;
      if (status === 401 || status === 403) {
        throw AppError.unauthorized('Invalid or unauthorized Gemini API credentials');
      }
      if (status === 429) {
        throw AppError.tooManyRequests('AI usage rate limit reached. Please wait a moment and try again.');
      }

      // DO NOT return static mock assistant messages. Throw honest service error.
      throw AppError.serviceUnavailable(
        'Solace AI is temporarily unavailable. Your message is safe. Please try again.',
      );
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
    const { userContext, preferredName } = await CompanionService.buildConversationContext(
      userId,
      settings,
    );
    const systemInstruction = buildSystemInstruction({
      tone: settings.preferredTone,
      userName: preferredName,
      userContext,
    });

    if (!GeminiProvider.isConfigured()) {
      throw AppError.serviceUnavailable('Gemini AI is not configured.');
    }

    const contents = CompanionService.formatGeminiContents(history, userMessage);
    const client = GeminiProvider.getClient();
    const candidateModels = GeminiProvider.candidateModels;

    let fullContent = '';
    let usedModel = '';
    let streamSuccess = false;

    for (const model of candidateModels) {
      try {
        const responseStream = await client.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 1200,
          },
        });

        fullContent = '';
        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            fullContent += text;
            onChunk(text);
          }
        }

        if (fullContent.trim()) {
          usedModel = model;
          streamSuccess = true;
          break;
        }
      } catch (err: any) {
        logger.warn(`Streaming failed on model ${model}: ${err?.message?.slice(0, 100)}. Trying fallback candidate...`);
      }
    }

    if (!streamSuccess || !fullContent.trim()) {
      throw AppError.serviceUnavailable('Streaming response failed across all available models.');
    }

    return {
      fullContent: fullContent.trim(),
      metadata: { model: usedModel },
    };
  }

  /**
   * Check connection status of Solace companion backend & AI engine.
   */
  public static async checkStatus(): Promise<{
    isOnline: boolean;
    model: string;
    latencyMs?: number;
    error?: string;
  }> {
    return GeminiProvider.checkHealth();
  }
}
