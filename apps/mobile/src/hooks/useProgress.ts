import { useQuery } from '@tanstack/react-query';
import { progressService } from '../services/api/progressService';
import {
  UserProgress,
  ProgressSummary,
  ProgressTrends,
  ProgressPeriod,
  StreakDetails,
  WeeklyWellnessReport,
  MonthlyWellnessReport,
  ProgressHistoryItem,
} from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Hook to retrieve user progress overview and lifetime counters
 */
export const useProgressOverview = () => {
  return useQuery<UserProgress, Error>({
    queryKey: QUERY_KEYS.PROGRESS.OVERVIEW,
    queryFn: () => progressService.getProgress(),
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Backwards-compatibility alias
 */
export const useProgress = useProgressOverview;

/**
 * Backwards-compatibility alias for progress history
 */
export const useProgressHistory = (_days = 30) => {
  return useQuery<ProgressHistoryItem[], Error>({
    queryKey: QUERY_KEYS.PROGRESS.HISTORY,
    queryFn: async () => {
      const trends = await progressService.getTrends('month');
      return (trends.points || []).map((pt) => ({
        date: pt.date,
        activitiesCompleted: pt.activitiesCount,
        moodLogged: pt.moodIntensity !== null,
        journalWritten: false,
        breathingMinutes: pt.breathingMinutes,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to fetch period summary (weekly, monthly, all)
 */
export const useProgressSummary = (period: ProgressPeriod = 'week') => {
  return useQuery<ProgressSummary, Error>({
    queryKey: QUERY_KEYS.PROGRESS.SUMMARY(period),
    queryFn: () => progressService.getSummary(period),
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook to fetch chart trend points
 */
export const useProgressTrends = (period: 'week' | 'month' = 'week') => {
  return useQuery<ProgressTrends, Error>({
    queryKey: QUERY_KEYS.PROGRESS.TRENDS(period),
    queryFn: () => progressService.getTrends(period),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to fetch chronological activity timeline with category filtering
 */
export const useActivityTimeline = (category = 'all', page = 1) => {
  return useQuery({
    queryKey: QUERY_KEYS.PROGRESS.TIMELINE(category, page),
    queryFn: () => progressService.getActivityTimeline(category, page),
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook to fetch streak details and weekly calendar dots
 */
export const useStreakDetails = () => {
  return useQuery<StreakDetails, Error>({
    queryKey: QUERY_KEYS.PROGRESS.STREAK,
    queryFn: () => progressService.getStreakDetails(),
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook to fetch weekly wellness report
 */
export const useWeeklyReport = () => {
  return useQuery<WeeklyWellnessReport, Error>({
    queryKey: QUERY_KEYS.PROGRESS.REPORT_WEEKLY,
    queryFn: () => progressService.getWeeklyReport(),
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook to fetch monthly wellness report
 */
export const useMonthlyReport = () => {
  return useQuery<MonthlyWellnessReport, Error>({
    queryKey: QUERY_KEYS.PROGRESS.REPORT_MONTHLY,
    queryFn: () => progressService.getMonthlyReport(),
    staleTime: 1000 * 60 * 10,
  });
};
