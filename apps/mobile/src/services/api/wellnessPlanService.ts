import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  WellnessPlan,
  GenerateWellnessPlanDto,
  CreateWellnessPlanDto,
  PaginationMeta,
} from '@solace/shared';

export const wellnessPlanService = {
  /**
   * Get user's current active or paused wellness plan
   */
  async getCurrentPlan(): Promise<WellnessPlan | null> {
    const res = await apiClient.get<ApiResponse<WellnessPlan | null>>(
      API_ROUTES.WELLNESS_PLANS.CURRENT,
    );
    return res.data.data || null;
  },

  /**
   * Request Gemini to generate a personalized wellness plan preview
   */
  async generatePlan(
    dto: GenerateWellnessPlanDto,
  ): Promise<CreateWellnessPlanDto> {
    const res = await apiClient.post<ApiResponse<CreateWellnessPlanDto>>(
      API_ROUTES.WELLNESS_PLANS.GENERATE,
      dto,
    );
    return res.data.data!;
  },

  /**
   * Activate / save a wellness plan
   */
  async activatePlan(dto: CreateWellnessPlanDto): Promise<WellnessPlan> {
    const res = await apiClient.post<ApiResponse<WellnessPlan>>(
      API_ROUTES.WELLNESS_PLANS.BASE,
      dto,
    );
    return res.data.data!;
  },

  /**
   * List past and current plans
   */
  async listPlans(
    page = 1,
    limit = 10,
  ): Promise<{ data: WellnessPlan[]; meta: PaginationMeta }> {
    const res = await apiClient.get<
      ApiResponse<WellnessPlan[]> & { meta: PaginationMeta }
    >(API_ROUTES.WELLNESS_PLANS.BASE, {
      params: { page, limit },
    });
    return {
      data: res.data.data || [],
      meta: res.data.meta!,
    };
  },

  /**
   * Get plan details by ID
   */
  async getPlanById(id: string): Promise<WellnessPlan> {
    const res = await apiClient.get<ApiResponse<WellnessPlan>>(
      API_ROUTES.WELLNESS_PLANS.DETAIL(id),
    );
    return res.data.data!;
  },

  /**
   * Complete or undo task completion
   */
  async completeTask(
    planId: string,
    taskId: string,
    completed = true,
  ): Promise<WellnessPlan> {
    const res = await apiClient.post<ApiResponse<WellnessPlan>>(
      API_ROUTES.WELLNESS_PLANS.COMPLETE_TASK(planId, taskId),
      { completed },
    );
    return res.data.data!;
  },

  /**
   * Skip a task
   */
  async skipTask(planId: string, taskId: string): Promise<WellnessPlan> {
    const res = await apiClient.post<ApiResponse<WellnessPlan>>(
      API_ROUTES.WELLNESS_PLANS.SKIP_TASK(planId, taskId),
    );
    return res.data.data!;
  },

  /**
   * Pause an active plan
   */
  async pausePlan(planId: string): Promise<WellnessPlan> {
    const res = await apiClient.post<ApiResponse<WellnessPlan>>(
      API_ROUTES.WELLNESS_PLANS.PAUSE(planId),
    );
    return res.data.data!;
  },

  /**
   * Resume a paused plan
   */
  async resumePlan(planId: string): Promise<WellnessPlan> {
    const res = await apiClient.post<ApiResponse<WellnessPlan>>(
      API_ROUTES.WELLNESS_PLANS.RESUME(planId),
    );
    return res.data.data!;
  },

  /**
   * Delete or abandon a plan
   */
  async deletePlan(planId: string): Promise<void> {
    await apiClient.delete(API_ROUTES.WELLNESS_PLANS.DETAIL(planId));
  },
};
