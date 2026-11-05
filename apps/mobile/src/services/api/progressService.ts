import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  UserProgress,
  ProgressSummary,
  ProgressTrends,
  ProgressPeriod,
  ActivityTimelineItem,
  StreakDetails,
  WeeklyWellnessReport,
  MonthlyWellnessReport,
  PaginationMeta,
} from '@solace/shared';

export const progressService = {
  /**
   * Fetch current user's progress and streak metrics
   */
  async getProgress(): Promise<UserProgress> {
    const res = await apiClient.get<ApiResponse<UserProgress>>(API_ROUTES.PROGRESS.OVERVIEW);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch progress');
    }
    return res.data.data;
  },

  /**
   * Fetch period summary metrics (week, month, all)
   */
  async getSummary(period: ProgressPeriod = 'week'): Promise<ProgressSummary> {
    const res = await apiClient.get<ApiResponse<ProgressSummary>>(
      API_ROUTES.PROGRESS.SUMMARY,
      { params: { period } },
    );
    return res.data.data!;
  },

  /**
   * Fetch trend chart data for period
   */
  async getTrends(period: 'week' | 'month' = 'week'): Promise<ProgressTrends> {
    const res = await apiClient.get<ApiResponse<ProgressTrends>>(
      API_ROUTES.PROGRESS.TRENDS,
      { params: { period } },
    );
    return res.data.data!;
  },

  /**
   * Fetch unified chronological activity history timeline
   */
  async getActivityTimeline(
    category?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: ActivityTimelineItem[]; meta: PaginationMeta }> {
    const res = await apiClient.get<
      ApiResponse<ActivityTimelineItem[]> & { meta: PaginationMeta }
    >(API_ROUTES.PROGRESS.HISTORY, {
      params: { category, page, limit },
    });
    return {
      data: res.data.data || [],
      meta: res.data.meta!,
    };
  },

  /**
   * Fetch streak status and weekly calendar dots
   */
  async getStreakDetails(): Promise<StreakDetails> {
    const res = await apiClient.get<ApiResponse<StreakDetails>>(
      API_ROUTES.PROGRESS.STREAK,
    );
    return res.data.data!;
  },

  /**
   * Fetch weekly wellness report
   */
  async getWeeklyReport(): Promise<WeeklyWellnessReport> {
    const res = await apiClient.get<ApiResponse<WeeklyWellnessReport>>(
      API_ROUTES.PROGRESS.REPORTS_WEEKLY,
    );
    return res.data.data!;
  },

  /**
   * Fetch monthly wellness report
   */
  async getMonthlyReport(): Promise<MonthlyWellnessReport> {
    const res = await apiClient.get<ApiResponse<MonthlyWellnessReport>>(
      API_ROUTES.PROGRESS.REPORTS_MONTHLY,
    );
    return res.data.data!;
  },
};
