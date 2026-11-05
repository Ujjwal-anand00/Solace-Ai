import { Types } from 'mongoose';
import { Activity, IActivityDocument } from './activity.model';
import { ActivityCompletionModel, IActivityCompletionDocument } from './activityCompletion.model';
import {
  WellnessActivity,
  ActivityCompletion,
  CompleteActivityDto,
  PaginationMeta,
} from '@solace/shared';
import { AppError, buildPaginationMeta, parsePagination } from '../../utils';
import { ProgressService } from '../progress/progress.service';

export class ActivityService {
  /**
   * List all active activities with optional category, difficulty, and search filter
   */
  public static async listActivities(
    category?: string,
    difficulty?: string,
    search?: string,
  ): Promise<WellnessActivity[]> {
    const filter: Record<string, unknown> = { isActive: true };
    if (category && category !== 'all') filter.category = category.toLowerCase();
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty.toLowerCase();
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const activities = await Activity.find(filter).sort({ title: 1 });
    return activities.map((doc: IActivityDocument) => doc.toDto());
  }

  /**
   * Get activity by ID
   */
  public static async getActivityById(id: string): Promise<WellnessActivity> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid activity ID format');
    }

    const activity = await Activity.findById(id);
    if (!activity || !activity.isActive) {
      throw AppError.notFound('Activity not found');
    }

    return activity.toDto();
  }

  /**
   * Complete an activity, log completion record, and update UserProgress
   */
  public static async completeActivity(
    activityId: string,
    userId: string,
    dto: CompleteActivityDto,
  ): Promise<ActivityCompletion> {
    if (!Types.ObjectId.isValid(activityId)) {
      throw AppError.badRequest('Invalid activity ID format');
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw AppError.notFound('Activity not found');
    }

    const completion = await ActivityCompletionModel.create({
      userId: new Types.ObjectId(userId),
      activityId: activity._id,
      durationCompleted: dto.durationCompleted,
      completedAt: new Date(),
      feedback: dto.feedback,
    });

    // Update progress & streak
    const type = activity.category === 'breathing' ? 'breathing' : 'activity';
    await ProgressService.recordActivity(userId, type);

    return completion.toDto(activity.toDto());
  }

  /**
   * Get user's activity completion history
   */
  public static async getCompletedHistory(
    userId: string,
    rawPage?: unknown,
    rawLimit?: unknown,
  ): Promise<{ data: ActivityCompletion[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePagination(rawPage, rawLimit);
    const filter = { userId: new Types.ObjectId(userId) };

    const [completions, total] = await Promise.all([
      ActivityCompletionModel.find(filter)
        .populate('activityId')
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityCompletionModel.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);
    return {
      data: completions.map((c: IActivityCompletionDocument) => c.toDto()),
      meta,
    };
  }
}
