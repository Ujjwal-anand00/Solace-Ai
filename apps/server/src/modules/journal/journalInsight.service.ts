import { GeminiProvider } from '../../integrations/gemini/gemini.config';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { JournalAiInsight } from '@solace/shared';

export class JournalInsightService {
  /**
   * Generates a compassionate, non-judgmental reflection insight based on user journal text.
   * STRICT PRIVACY: Only called on explicit user consent.
   * STRICT SAFETY: Never diagnoses or prescribes.
   */
  public static async generateReflectionInsight(
    title: string,
    content: string,
    category: string,
    moodAssociation?: string,
  ): Promise<JournalAiInsight> {
    const fallbackInsight: JournalAiInsight = {
      theme: 'Self-Awareness & Inner Space',
      reflection:
        'Taking intentional time to write and honor your experiences is a gentle act of self-care. Your words reflect an open heart tuning into what matters most.',
      suggestedAction:
        'Take three long, softening breaths and carry this sense of space into your next activity.',
      affirmingThought: 'My feelings are valid, and I can move at my own peaceful pace.',
      sentimentTone: 'uplifting',
      createdAt: new Date().toISOString(),
    };

    if (!GeminiProvider.isConfigured()) {
      logger.info('Gemini is unconfigured. Returning default warm journal reflection insight.');
      return fallbackInsight;
    }

    try {
      const client = GeminiProvider.getClient();

      const promptText = `You are Solace, a compassionate, emotionally intelligent wellness companion.
The user has requested an AI reflection insight on a private journal entry they wrote.

JOURNAL ENTRY:
Title: "${title}"
Category: "${category}"
${moodAssociation ? `Associated Mood: ${moodAssociation}` : ''}
Content:
"""
${content.substring(0, 3000)}
"""

REQUIREMENTS:
1. Provide a thoughtful, validating reflection that highlights the underlying emotional theme.
2. Maintain a warm, encouraging, grounded tone. Never sound clinical or diagnostic.
3. Suggest one gentle, doable mindful action or somatic grounding step.
4. Provide one short affirming thought the user can hold onto.
5. Identify the overall tone (uplifting, gentle, neutral, or introspective).
6. Return your response ONLY as a valid JSON object with the following schema:
{
  "theme": "Short 2-5 word title of the emotional theme",
  "reflection": "1-2 warm, validating paragraphs reflecting on what they shared without judging or fixing",
  "suggestedAction": "One small, accessible mindfulness or grounding suggestion",
  "affirmingThought": "A short, soothing affirmation in first person",
  "sentimentTone": "uplifting" | "gentle" | "neutral" | "introspective"
}
Do not include markdown code fence formatting like \`\`\`json. Output raw JSON only.`;

      const response = await client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          temperature: 0.6,
          maxOutputTokens: 800,
        },
      });

      const responseText = response.text?.trim() || '';
      const cleanJson = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(cleanJson);

      return {
        theme: parsed.theme || fallbackInsight.theme,
        reflection: parsed.reflection || fallbackInsight.reflection,
        suggestedAction: parsed.suggestedAction || fallbackInsight.suggestedAction,
        affirmingThought: parsed.affirmingThought || fallbackInsight.affirmingThought,
        sentimentTone: ['uplifting', 'gentle', 'neutral', 'introspective'].includes(
          parsed.sentimentTone,
        )
          ? parsed.sentimentTone
          : 'gentle',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error generating AI reflection insight via Gemini:', error);
      return fallbackInsight;
    }
  }
}

