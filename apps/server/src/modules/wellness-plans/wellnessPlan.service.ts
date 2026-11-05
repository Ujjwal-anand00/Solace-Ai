import { Types } from 'mongoose';
import {
  WellnessPlan,
  GenerateWellnessPlanDto,
  CreateWellnessPlanDto,
  UpdateWellnessPlanDto,
  PaginationMeta,
} from '@solace/shared';
import { WellnessPlanModel } from './wellnessPlan.model';
import { GeminiPlanService } from './geminiPlan.service';
import { AppError, buildPaginationMeta, parsePagination } from '../../utils';
import { ProgressService } from '../progress/progress.service';

export class WellnessPlanService {
  /**
   * Get user's current active or paused wellness plan
   */
  public static async getCurrentPlan(userId: string): Promise<WellnessPlan | null> {
    const plan = await WellnessPlanModel.findOne({
      userId: new Types.ObjectId(userId),
      status: { $in: ['active', 'paused'] },
    }).sort({ createdAt: -1 });

    return plan ? plan.toDto() : null;
  }

  /**
   * Generate plan preview without saving to database
   */
  public static async generatePreview(
    userId: string,
    dto: GenerateWellnessPlanDto,
  ): Promise<CreateWellnessPlanDto> {
    return GeminiPlanService.generateWellnessPlan(userId, dto);
  }

  /**
   * Create and activate a wellness plan, safely managing existing active plans
   */
  public static async createAndActivatePlan(
    userId: string,
    dto: CreateWellnessPlanDto,
  ): Promise<WellnessPlan> {
    const userObjId = new Types.ObjectId(userId);

    // Check if user currently has an active plan
    const existingActive = await WellnessPlanModel.findOne({
      userId: userObjId,
      status: 'active',
    });

    if (existingActive) {
      if (!dto.replaceActive) {
        throw AppError.conflict(
          'An active wellness plan is already in progress. Please confirm replacement before activating a new plan.',
        );
      }
      // Archive the existing active plan
      existingActive.status = 'abandoned';
      await existingActive.save();
    }

    const startDate = new Date();
    const durationDays = dto.durationDays || dto.dailyTasks.length || 7;
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const formattedTasks = dto.dailyTasks.map((task, idx) => ({
      id: task.id || `task-${task.day || idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      day: task.day || idx + 1,
      title: task.title,
      description: task.description || '',
      category: task.category || 'mindfulness',
      durationMinutes: task.durationMinutes || 5,
      completed: false,
      skipped: false,
    }));

    const newPlan = await WellnessPlanModel.create({
      userId: userObjId,
      title: dto.title,
      description: dto.description,
      durationDays,
      focusAreas: dto.focusAreas || [],
      goals: dto.focusAreas || [],
      dailyTasks: formattedTasks,
      startDate,
      endDate,
      status: 'active',
      progress: 0,
      isAiGenerated: dto.isAiGenerated ?? true,
    });

    return newPlan.toDto();
  }

  /**
   * List user's past and current wellness plans with pagination
   */
  public static async listPlans(
    userId: string,
    rawPage?: unknown,
    rawLimit?: unknown,
  ): Promise<{ data: WellnessPlan[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePagination(rawPage, rawLimit);
    const filter = { userId: new Types.ObjectId(userId) };

    const [plans, total] = await Promise.all([
      WellnessPlanModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      WellnessPlanModel.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);
    return {
      data: plans.map((p) => p.toDto()),
      meta,
    };
  }

  /**
   * Get plan by ID with user ownership check
   */
  public static async getPlanById(userId: string, planId: string): Promise<WellnessPlan> {
    if (!Types.ObjectId.isValid(planId)) {
      throw AppError.badRequest('Invalid wellness plan ID format');
    }

    const plan = await WellnessPlanModel.findById(planId);
    if (!plan) {
      throw AppError.notFound('Wellness plan not found');
    }

    if (plan.userId.toString() !== userId) {
      throw AppError.forbidden('You do not have permission to view this wellness plan');
    }

    return plan.toDto();
  }

  /**
   * Update plan metadata (title, description)
   */
  public static async updatePlan(
    userId: string,
    planId: string,
    dto: UpdateWellnessPlanDto,
  ): Promise<WellnessPlan> {
    if (!Types.ObjectId.isValid(planId)) {
      throw AppError.badRequest('Invalid wellness plan ID format');
    }

    const plan = await WellnessPlanModel.findById(planId);
    if (!plan) {
      throw AppError.notFound('Wellness plan not found');
    }

    if (plan.userId.toString() !== userId) {
      throw AppError.forbidden('You do not have permission to modify this wellness plan');
    }

    if (dto.title !== undefined) plan.title = dto.title;
    if (dto.description !== undefined) plan.description = dto.description;

    await plan.save();
    return plan.toDto();
  }

  /**
   * Mark a daily task complete or undo completion
   */
  public static async completeTask(
    userId: string,
    planId: string,
    taskId: string,
    completed = true,
  ): Promise<WellnessPlan> {
    if (!Types.ObjectId.isValid(planId)) {
      throw AppError.badRequest('Invalid wellness plan ID format');
    }

    const plan = await WellnessPlanModel.findById(planId);
    if (!plan) {
      throw AppError.notFound('Wellness plan not found');
    }

    if (plan.userId.toString() !== userId) {
      throw AppError.forbidden('You do not have permission to update this wellness plan');
    }

    const taskIndex = plan.dailyTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw AppError.notFound(`Task with ID '${taskId}' not found in plan`);
    }

    const task = plan.dailyTasks[taskIndex];
    const wasAlreadyCompleted = task.completed;
    task.completed = completed;
    task.completedAt = completed ? new Date() : undefined;
    if (completed) task.skipped = false;

    // Recalculate overall progress
    const totalTasks = plan.dailyTasks.length;
    const completedTasks = plan.dailyTasks.filter((t) => t.completed).length;
    plan.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (plan.progress === 100 && plan.status === 'active') {
      plan.status = 'completed';
    }

    await plan.save();

    // If completing for the first time, record activity for streaks and achievements
    if (completed && !wasAlreadyCompleted) {
      await ProgressService.recordActivity(userId, 'activity');
    }

    return plan.toDto();
  }

  /**
   * Skip a task
   */
  public static async skipTask(
    userId: string,
    planId: string,
    taskId: string,
  ): Promise<WellnessPlan> {
    if (!Types.ObjectId.isValid(planId)) {
      throw AppError.badRequest('Invalid wellness plan ID format');
    }

    const plan = await WellnessPlanModel.findById(planId);
    if (!plan) {
      throw AppError.notFound('Wellness plan not found');
    }

    if (plan.userId.toString() !== userId) {
      throw AppError.forbidden('You do not have permission to update this wellness plan');
    }

    const taskIndex = plan.dailyTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw AppError.notFound(`Task with ID '${taskId}' not found in plan`);
    }

    const task = plan.dailyTasks[taskIndex];
    task.skipped = true;
    task.completed = false;
    task.completedAt = undefined;

    // Recalculate progress
    const totalTasks = plan.dailyTasks.length;
    const completedTasks = plan.dailyTasks.filter((t) => t.completed).length;
    plan.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await plan.save();
    return plan.toDto();
  }

  /**
   * Pause an active plan
   */
  public static async pausePlan(userId: string, planId: string): Promise<WellnessPlan> {
    if (!Types.ObjectId.isValid(planId)) {
      throw AppError.badRequest('Invalid wellness plan ID format');
    }

    const plan = await WellnessPlanModel.findById(planId);
    if (!plan) {
      throw AppError.notFound('Wellness plan not found');
    }

    if (plan.userId.toString() !== userId) {
      throw AppError.forbidden('You do not have permission to modify this plan');
    }

    if (plan.status !== 'active') {
      throw AppError.badRequest(`Cannot pause plan with status '${plan.status}'`);
    }

    plan.status = 'paused';
    await plan.save();
    return plan.toDto();
  }

  /**
   * Resume a paused plan
   */
  public static async resumePlan(userId: string, planId: string): Promise<WellnessPlan> {
    if (!Types.ObjectId.isValid(planId)) {
      throw AppError.badRequest('Invalid wellness plan ID format');
    }

    const plan = await WellnessPlanModel.findById(planId);
    if (!plan) {
      throw AppError.notFound('Wellness plan not found');
    }

    if (plan.userId.toString() !== userId) {
      throw AppError.forbidden('You do not have permission to modify this plan');
    }

    if (plan.status !== 'paused') {
      throw AppError.badRequest(`Cannot resume plan with status '${plan.status}'`);
    }

    plan.status = 'active';
    await plan.save();
    return plan.toDto();
  }

  /**
   * Delete or abandon a wellness plan
   */
  public static async deletePlan(userId: string, planId: string): Promise<void> {
    if (!Types.ObjectId.isValid(planId)) {
      throw AppError.badRequest('Invalid wellness plan ID format');
    }

    const plan = await WellnessPlanModel.findById(planId);
    if (!plan) {
      throw AppError.notFound('Wellness plan not found');
    }

    if (plan.userId.toString() !== userId) {
      throw AppError.forbidden('You do not have permission to delete this plan');
    }

    await WellnessPlanModel.deleteOne({ _id: plan._id });
  }
}
