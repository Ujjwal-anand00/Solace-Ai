import { Types } from 'mongoose';
import { PersonalizedRecommendation } from '@solace/shared';
import { User } from '../../models/user.model';
import { Mood } from '../mood/mood.model';
import { AssessmentModel } from '../assessments/assessment.model';
import { Activity, IActivityDocument } from '../activities/activity.model';

export class RecommendationService {
  /**
   * Compute personalized wellness recommendations using real user data
   */
  public static async getPersonalizedRecommendations(
    userId: string,
  ): Promise<PersonalizedRecommendation[]> {
    const userObjId = new Types.ObjectId(userId);

    // Fetch user context in parallel
    const [user, recentMoods, latestAssessments, allActivities] =
      await Promise.all([
        User.findById(userObjId),
        Mood.find({ userId: userObjId }).sort({ createdAt: -1 }).limit(5),
        AssessmentModel.find({ userId: userObjId })
          .sort({ completedAt: -1 })
          .limit(4),
        Activity.find({ isActive: true }),
      ]);

    const activityMap = new Map<string, IActivityDocument>();
    allActivities.forEach((act) => {
      activityMap.set(act.slug, act);
      activityMap.set(act._id.toString(), act);
    });

    const recommendations: PersonalizedRecommendation[] = [];
    const addedSlugs = new Set<string>();

    const addRec = (slug: string, reason: string) => {
      if (addedSlugs.has(slug)) return;
      const act = activityMap.get(slug);
      if (act) {
        recommendations.push({
          activityId: act._id.toString(),
          slug: act.slug,
          title: act.title,
          description: act.description,
          category: act.category,
          duration: act.duration,
          difficulty: act.difficulty,
          reason,
        });
        addedSlugs.add(slug);
      }
    };

    // 1. Check assessment indicators
    for (const assessment of latestAssessments) {
      if (assessment.assessmentType === 'stress' && assessment.score >= 5) {
        addRec(
          'box-breathing',
          'Recommended to help ease everyday tension and restore steady inner calm.',
        );
      }
      if (assessment.assessmentType === 'sleep' && assessment.score >= 5) {
        addRec(
          'body-scan-sleep',
          'Recommended based on your sleep check-in to ease bedtime racing thoughts.',
        );
      }
      if (assessment.assessmentType === 'energy' && assessment.score >= 5) {
        addRec(
          'sensory-grounding-54321',
          'Recommended as a refreshing mental reset when experiencing midday fatigue.',
        );
      }
      if (
        assessment.assessmentType === 'emotional-wellbeing' &&
        assessment.score >= 5
      ) {
        addRec(
          'loving-kindness-meditation',
          'Recommended to nurture self-compassion and emotional spaciousness.',
        );
      }
    }

    // 2. Check recent mood indicators
    const hasLowMood = recentMoods.some((m) => m.moodIntensity <= 4 || ['sad', 'tired', 'anxious'].includes(m.mood));
    const hasAnxiousFeelings = recentMoods.some(
      (m) =>
        ['anxious', 'overwhelmed', 'tense'].includes(m.mood) ||
        m.emotions?.some((f: string) =>
          ['anxious', 'overwhelmed', 'stressed', 'tense'].includes(
            f.toLowerCase(),
          ),
        ),
    );

    if (hasAnxiousFeelings) {
      addRec(
        'relaxing-breathing',
        'Recommended because your recent check-in noted feeling tense or overwhelmed.',
      );
    }
    if (hasLowMood) {
      addRec(
        'morning-gratitude-reflection',
        'Recommended to gently orient your attention toward comforting moments of light.',
      );
    }

    // 3. User goals
    const goals: string[] = user?.wellnessGoals || [];
    if (goals.some((g: string) => g.toLowerCase().includes('sleep'))) {
      addRec(
        '4-7-8-breathing',
        'Aligned with your goal for better sleep: naturally calms your resting pulse.',
      );
    }
    if (goals.some((g: string) => g.toLowerCase().includes('stress'))) {
      addRec(
        'extended-exhale',
        'Aligned with your stress management goal: activates your parasympathetic calm response.',
      );
    }

    // 4. Fallbacks if needed to ensure at least 3 curated recommendations
    const defaults = [
      {
        slug: 'equal-breathing',
        reason: 'A balancing practice to bring equilibrium to your breathing and mind.',
      },
      {
        slug: 'progressive-muscle-relaxation',
        reason: 'A wonderful evening ritual to release tension stored physically in your muscles.',
      },
      {
        slug: 'restorative-tea-ritual',
        reason: 'A simple sensory mindfulness break to step away from daily rush.',
      },
    ];

    for (const def of defaults) {
      if (recommendations.length >= 4) break;
      addRec(def.slug, def.reason);
    }

    return recommendations.slice(0, 5);
  }
}
