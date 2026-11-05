import { Types } from 'mongoose';
import { GenerateWellnessPlanDto, CreateWellnessPlanDto } from '@solace/shared';
import { User } from '../../models/user.model';
import { Mood } from '../mood/mood.model';
import { AssessmentModel } from '../assessments/assessment.model';
import { ActivityCompletionModel } from '../activities/activityCompletion.model';
import { CompanionSettingsModel } from '../companion/companionSettings.model';
import { Journal } from '../journal/journal.model';
import { GeminiProvider } from '../../integrations/gemini/gemini.config';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export class GeminiPlanService {
  /**
   * Build personalized wellness context respecting user consent
   */
  public static async buildWellnessContext(
    userId: string,
    focusAreas: string[],
    durationDays: number,
    dailyMinutes: number,
  ): Promise<string> {
    try {
      const userObjId = new Types.ObjectId(userId);
      const user = await User.findById(userObjId);
      const preferredName = user?.preferredName || user?.name || 'Friend';
      const userGoals = (user?.wellnessGoals || []).join(', ') || 'General calm and balance';

      // 1. Recent Mood Patterns
      const recentMoods = await Mood.find({ userId: userObjId })
        .sort({ createdAt: -1 })
        .limit(7);
      const moodSummary =
        recentMoods.length > 0
          ? recentMoods
              .map(
                (m) =>
                  `Intensity: ${m.moodIntensity}/10 (${m.mood}), emotions: [${m.emotions?.join(', ') || ''}]`,
              )
              .join('; ')
          : 'No recent mood check-ins recorded.';

      // 2. Recent Assessment Findings
      const recentAssessments = await AssessmentModel.find({ userId: userObjId })
        .sort({ completedAt: -1 })
        .limit(3);
      const assessmentSummary =
        recentAssessments.length > 0
          ? recentAssessments
              .map(
                (a) =>
                  `${a.assessmentType}: ${a.resultCategory} (Score: ${a.score}/${a.maxScore || 12})`,
              )
              .join('; ')
          : 'No self-reflection assessments taken yet.';

      // 3. Completed Activities
      const recentCompletions = await ActivityCompletionModel.find({ userId: userObjId })
        .populate('activityId')
        .sort({ completedAt: -1 })
        .limit(5);
      const completionSummary =
        recentCompletions.length > 0
          ? recentCompletions
              .map((c) => (c.activityId as unknown as { title?: string })?.title || 'Mindful practice')
              .join(', ')
          : 'Getting started with daily wellness.';

      // 4. Privacy Guard: Only check journal if user explicitly granted consent
      let journalSummary = 'Journal personalization not consented.';
      const settings = await CompanionSettingsModel.findOne({ userId: userObjId });
      if (settings?.journalPersonalizationConsent) {
        const recentJournals = await Journal.find({ userId: userObjId })
          .sort({ createdAt: -1 })
          .limit(3);
        if (recentJournals.length > 0) {
          journalSummary = recentJournals
            .map((j) => (j.tags?.length ? `Tags: [${j.tags.join(', ')}]` : 'Reflection entry'))
            .join('; ');
        }
      }

      return `User Name: ${preferredName}
User Goals: ${userGoals}
Requested Focus Areas: ${focusAreas.join(', ')}
Plan Duration: ${durationDays} days
Available Daily Time: ${dailyMinutes} minutes
Recent Moods: ${moodSummary}
Assessment Insights: ${assessmentSummary}
Recent Completed Activities: ${completionSummary}
Journal Themes (Consented only): ${journalSummary}`;
    } catch (err) {
      logger.error('Error building wellness plan context:', err);
      return `Requested Focus Areas: ${focusAreas.join(', ')}. Duration: ${durationDays} days. Time: ${dailyMinutes} mins daily.`;
    }
  }

  /**
   * Generate personalized wellness plan via Google Gemini or fallback
   */
  public static async generateWellnessPlan(
    userId: string,
    dto: GenerateWellnessPlanDto,
  ): Promise<CreateWellnessPlanDto> {
    const isConfigured = GeminiProvider.isConfigured();

    if (!isConfigured) {
      logger.info('Gemini API is not configured. Generating high-quality curated wellness plan fallback.');
      return this.buildCuratedFallbackPlan(dto);
    }

    try {
      const userContext = await this.buildWellnessContext(
        userId,
        dto.focusAreas,
        dto.durationDays,
        dto.dailyMinutes,
      );

      const prompt = `You are Solace AI, a compassionate and supportive wellness companion.
Generate a structured, personalized, realistic ${dto.durationDays}-day wellness plan tailored to the user's available daily time of ${dto.dailyMinutes} minutes and their focus areas: ${dto.focusAreas.join(', ')}.

# Strict Guidelines:
1. Provide exactly ${dto.durationDays} daily tasks, one for each day from Day 1 to Day ${dto.durationDays}.
2. Task duration must strictly match approximately ${dto.dailyMinutes} minutes (e.g., between ${Math.max(3, dto.dailyMinutes - 2)} and ${dto.dailyMinutes} minutes).
3. Activity category MUST be one of: "breathing", "mindfulness", "relaxation", "self-care", "affirmation", "reflection".
4. Tone: gentle, encouraging, achievable, non-clinical.
5. NO medical claims, NO diagnostic labels, NO extreme routines.
6. Return ONLY valid raw JSON with NO markdown formatting, matching this exact structure:
{
  "title": "A Gentle Title",
  "description": "Warm, inspiring summary of the plan.",
  "durationDays": ${dto.durationDays},
  "focusAreas": ${JSON.stringify(dto.focusAreas)},
  "dailyTasks": [
    {
      "day": 1,
      "title": "Task title",
      "description": "Short gentle instruction (1-2 sentences).",
      "category": "breathing",
      "durationMinutes": ${dto.dailyMinutes}
    }
  ]
}

# User Context:
${userContext}`;

      const client = GeminiProvider.getClient();
      const response = await client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.7,
        },
      });

      const responseText = response.text?.trim() || '';
      const parsed = this.parseAndValidateGeminiResponse(responseText, dto);

      if (parsed) {
        return {
          ...parsed,
          replaceActive: false,
          isAiGenerated: true,
        };
      }

      logger.warn('Gemini response could not be validated. Falling back to curated plan.');
      return this.buildCuratedFallbackPlan(dto);
    } catch (error) {
      logger.error('Gemini plan generation error:', error);
      return this.buildCuratedFallbackPlan(dto);
    }
  }

  /**
   * Safely parse and validate the AI generated JSON
   */
  private static parseAndValidateGeminiResponse(
    text: string,
    dto: GenerateWellnessPlanDto,
  ): CreateWellnessPlanDto | null {
    try {
      let cleanJson = text;
      // Strip markdown code fences if present
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleanJson);

      if (!parsed.title || !parsed.description || !Array.isArray(parsed.dailyTasks)) {
        return null;
      }

      // Ensure tasks exist and day numbers are correct
      const tasks = parsed.dailyTasks.map(
        (t: Record<string, unknown>, index: number) => ({
          id: `task-${index + 1}-${Date.now()}`,
          day: typeof t.day === 'number' ? t.day : index + 1,
          title: String(t.title || `Day ${index + 1} Practice`).trim(),
          description: String(t.description || '').trim(),
          category: [
            'breathing',
            'mindfulness',
            'relaxation',
            'self-care',
            'affirmation',
            'reflection',
          ].includes(String(t.category).toLowerCase())
            ? String(t.category).toLowerCase()
            : 'mindfulness',
          durationMinutes: Number(t.durationMinutes) || dto.dailyMinutes,
        }),
      );

      // Require task count to match requested duration
      if (tasks.length !== dto.durationDays) {
        logger.warn(`Task count mismatch: expected ${dto.durationDays}, got ${tasks.length}`);
        return null;
      }

      return {
        title: String(parsed.title).slice(0, 120),
        description: String(parsed.description),
        durationDays: dto.durationDays,
        focusAreas: dto.focusAreas,
        dailyTasks: tasks,
        isAiGenerated: true,
      };
    } catch (err) {
      logger.error('Failed to parse Gemini JSON output:', err);
      return null;
    }
  }

  /**
   * Build curated fallback wellness plan using verified practices
   */
  public static buildCuratedFallbackPlan(
    dto: GenerateWellnessPlanDto,
  ): CreateWellnessPlanDto {
    const focusTitle = dto.focusAreas.length > 0 ? dto.focusAreas[0] : 'Mindful Wellness';
    const formattedTitle = focusTitle.charAt(0).toUpperCase() + focusTitle.slice(1);

    const curatedLibrary: Array<{
      title: string;
      description: string;
      category: string;
    }> = [
      {
        title: 'Mindful Morning Intention',
        description: 'Take a gentle breath and acknowledge one small comfort you are grateful for today.',
        category: 'reflection',
      },
      {
        title: 'Box Breathing Grounding',
        description: 'A 4-4-4-4 rhythm to soothe your nervous system and steady your mind.',
        category: 'breathing',
      },
      {
        title: '5-4-3-2-1 Sensory Reset',
        description: 'Notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.',
        category: 'mindfulness',
      },
      {
        title: 'Midday Shoulder & Neck Release',
        description: 'Consciously soften physical tension held in your shoulders and jaw.',
        category: 'relaxation',
      },
      {
        title: 'Restorative Tea Ritual',
        description: 'Prepare a warm beverage with full sensory presence, savoring each sip.',
        category: 'self-care',
      },
      {
        title: 'Compassionate Affirmations',
        description: 'Anchor yourself in gentle self-worth: you are allowed to move at your own pace.',
        category: 'affirmation',
      },
      {
        title: 'Evening Body Scan for Rest',
        description: 'Travel through your body with caring awareness, releasing the day.',
        category: 'relaxation',
      },
      {
        title: 'Equal Breathing (4-4)',
        description: 'Cultivate balance and steady presence with rhythmic inhalation and exhalation.',
        category: 'breathing',
      },
      {
        title: 'Loving-Kindness Meditation',
        description: 'Direct warm wishes of safety, ease, and calm to yourself and others.',
        category: 'mindfulness',
      },
      {
        title: 'Digital Pause & Nature Window',
        description: 'Step away from screens for a few moments to rest your eyes on natural daylight.',
        category: 'self-care',
      },
      {
        title: '4-7-8 Relaxing Breath',
        description: 'A deeply soothing cadence that naturally slows your pulse before rest.',
        category: 'breathing',
      },
      {
        title: 'Evening Compassion Reflection',
        description: 'Forgive yourself for anything unfinished today; acknowledge you did enough.',
        category: 'reflection',
      },
      {
        title: 'Progressive Muscle Relaxation',
        description: 'Gently tense and release muscle groups from your toes to your forehead.',
        category: 'relaxation',
      },
      {
        title: 'Celebration of Small Wins',
        description: 'Honor every small step you took toward caring for yourself this past week.',
        category: 'reflection',
      },
    ];

    const tasks = [];
    for (let day = 1; day <= dto.durationDays; day++) {
      const template = curatedLibrary[(day - 1) % curatedLibrary.length];
      tasks.push({
        id: `curated-task-${day}-${Date.now()}`,
        day,
        title: template.title,
        description: template.description,
        category: template.category,
        durationMinutes: dto.dailyMinutes,
      });
    }

    return {
      title: `${formattedTitle} Journey (${dto.durationDays} Days)`,
      description: `A manageable ${dto.durationDays}-day routine designed around ${dto.dailyMinutes} minutes of daily care, focusing on ${dto.focusAreas.join(' & ')}.`,
      durationDays: dto.durationDays,
      focusAreas: dto.focusAreas,
      dailyTasks: tasks,
      replaceActive: false,
      isAiGenerated: false,
    };
  }
}
