import { Types } from 'mongoose';
import { Achievement, UserAchievement } from '@solace/shared';
import { AchievementModel } from './achievement.model';
import { ProgressModel } from '../progress/progress.model';
import { Mood } from '../mood/mood.model';
import { ActivityCompletionModel } from '../activities/activityCompletion.model';
import { AssessmentModel } from '../assessments/assessment.model';
import { WellnessPlanModel } from '../wellness-plans/wellnessPlan.model';
import { AppError } from '../../utils';

export class AchievementService {
  /**
   * List all system achievement definitions
   */
  public static async getAllAchievements(): Promise<Achievement[]> {
    const list = await AchievementModel.find({ isActive: true }).sort({
      category: 1,
      createdAt: 1,
    });
    return list.map((a) => a.toDto());
  }

  /**
   * Get achievement by ID
   */
  public static async getAchievementById(id: string): Promise<Achievement> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid achievement ID format');
    }
    const achievement = await AchievementModel.findById(id);
    if (!achievement) {
      throw AppError.notFound('Achievement not found');
    }
    return achievement.toDto();
  }

  /**
   * Calculate and evaluate user achievement progress from actual MongoDB data
   */
  public static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const userObjId = new Types.ObjectId(userId);

    const [
      allDefinitions,
      progress,
      moodCount,
      distinctEmotions,
      assessmentsCount,
      completions,
      plans,
    ] = await Promise.all([
      AchievementModel.find({ isActive: true }).sort({ category: 1 }),
      ProgressModel.findOne({ userId: userObjId }),
      Mood.countDocuments({ userId: userObjId }),
      Mood.distinct('emotions', { userId: userObjId }),
      AssessmentModel.countDocuments({ userId: userObjId }),
      ActivityCompletionModel.find({ userId: userObjId }).populate('activityId'),
      WellnessPlanModel.find({ userId: userObjId }),
    ]);

    interface PopulatedCompletion {
      activityId?: { category?: string };
    }
    const typedCompletions = completions as unknown as PopulatedCompletion[];

    const totalActivities = completions.length;
    const totalBreathing = typedCompletions.filter(
      (c) => c.activityId?.category === 'breathing',
    ).length;
    const totalMindfulness = typedCompletions.filter((c) =>
      ['mindfulness', 'relaxation'].includes(c.activityId?.category || ''),
    ).length;

    let totalPlanTasksCompleted = 0;
    plans.forEach((p) => {
      totalPlanTasksCompleted += (p.dailyTasks || []).filter((t) => t.completed).length;
    });

    const activeDaysCount = progress?.activeDates?.length || 0;
    const currentStreak = progress?.currentStreak || 0;
    const earnedSet = new Set(progress?.earnedAchievements || []);

    const result: UserAchievement[] = [];
    const newlyUnlocked: string[] = [];

    for (const def of allDefinitions) {
      let currentVal = 0;
      let targetVal = 1;

      switch (def.criteria) {
        // Consistency
        case 'first_activity':
          currentVal = totalActivities;
          targetVal = 1;
          break;
        case 'active_3_days':
          currentVal = activeDaysCount;
          targetVal = 3;
          break;
        case 'streak_7_days':
          currentVal = currentStreak;
          targetVal = 7;
          break;
        case 'streak_30_days':
          currentVal = currentStreak;
          targetVal = 30;
          break;

        // Emotional Awareness
        case 'first_checkin':
          currentVal = moodCount;
          targetVal = 1;
          break;
        case 'checkin_10':
          currentVal = moodCount;
          targetVal = 10;
          break;
        case 'emotions_5':
          currentVal = (distinctEmotions || []).length;
          targetVal = 5;
          break;

        // Mindfulness
        case 'first_breathing':
          currentVal = totalBreathing;
          targetVal = 1;
          break;
        case 'breathing_5':
          currentVal = totalBreathing;
          targetVal = 5;
          break;
        case 'mindfulness_10':
          currentVal = totalMindfulness;
          targetVal = 10;
          break;

        // Personal Growth
        case 'first_assessment':
          currentVal = assessmentsCount;
          targetVal = 1;
          break;
        case 'first_plan_task':
          currentVal = totalPlanTasksCompleted;
          targetVal = 1;
          break;
        case 'plan_tasks_20':
          currentVal = totalPlanTasksCompleted;
          targetVal = 20;
          break;

        default:
          currentVal = 0;
          targetVal = 1;
      }

      const isEligible = currentVal >= targetVal;
      const isAlreadyUnlocked = earnedSet.has(def.criteria);
      const isUnlocked = isEligible || isAlreadyUnlocked;

      if (isEligible && !isAlreadyUnlocked) {
        newlyUnlocked.push(def.criteria);
        earnedSet.add(def.criteria);
      }

      const cappedCurrent = Math.min(currentVal, targetVal);
      const percentage = targetVal > 0 ? Math.round((cappedCurrent / targetVal) * 100) : 0;

      result.push({
        id: def._id.toString(),
        criteria: def.criteria,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
        unlocked: isUnlocked,
        unlockedAt: isUnlocked ? def.updatedAt.toISOString() : undefined,
        progress: {
          current: cappedCurrent,
          target: targetVal,
          percentage: isUnlocked ? 100 : percentage,
        },
      });
    }

    // Persist newly unlocked achievements idempotently
    if (newlyUnlocked.length > 0 && progress) {
      progress.earnedAchievements = Array.from(earnedSet);
      await progress.save();
    }

    return result;
  }
}
