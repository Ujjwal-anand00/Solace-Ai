import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wellnessPlanService } from '../services/api/wellnessPlanService';
import { recommendationService } from '../services/api/recommendationService';
import {
  WellnessPlan,
  GenerateWellnessPlanDto,
  CreateWellnessPlanDto,
  PersonalizedRecommendation,
} from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Hook to retrieve user's current active or paused wellness plan
 */
export const useCurrentWellnessPlan = () => {
  return useQuery<WellnessPlan | null, Error>({
    queryKey: QUERY_KEYS.WELLNESS_PLANS.CURRENT,
    queryFn: () => wellnessPlanService.getCurrentPlan(),
    staleTime: 1000 * 60 * 3,
  });
};

/**
 * Hook to list all historical and active plans
 */
export const useWellnessPlansList = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.WELLNESS_PLANS.LIST(page),
    queryFn: () => wellnessPlanService.listPlans(page, limit),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to generate AI plan preview
 */
export const useGenerateWellnessPlan = () => {
  return useMutation<CreateWellnessPlanDto, Error, GenerateWellnessPlanDto>({
    mutationFn: (dto) => wellnessPlanService.generatePlan(dto),
  });
};

/**
 * Hook to activate and save a wellness plan
 */
export const useActivateWellnessPlan = () => {
  const queryClient = useQueryClient();

  return useMutation<WellnessPlan, Error, CreateWellnessPlanDto>({
    mutationFn: (dto) => wellnessPlanService.activatePlan(dto),
    onSuccess: (newPlan) => {
      queryClient.setQueryData(QUERY_KEYS.WELLNESS_PLANS.CURRENT, newPlan);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WELLNESS_PLANS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.CURRENT });
    },
  });
};

/**
 * Hook to toggle task completion with instant cache update
 */
export const useCompleteWellnessTask = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WellnessPlan,
    Error,
    { planId: string; taskId: string; completed?: boolean }
  >({
    mutationFn: ({ planId, taskId, completed }) =>
      wellnessPlanService.completeTask(planId, taskId, completed),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(QUERY_KEYS.WELLNESS_PLANS.CURRENT, updatedPlan);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WELLNESS_PLANS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.CURRENT });
    },
  });
};

/**
 * Hook to skip a daily task
 */
export const useSkipWellnessTask = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WellnessPlan,
    Error,
    { planId: string; taskId: string }
  >({
    mutationFn: ({ planId, taskId }) =>
      wellnessPlanService.skipTask(planId, taskId),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(QUERY_KEYS.WELLNESS_PLANS.CURRENT, updatedPlan);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WELLNESS_PLANS.ALL });
    },
  });
};

/**
 * Hook to pause plan
 */
export const usePauseWellnessPlan = () => {
  const queryClient = useQueryClient();

  return useMutation<WellnessPlan, Error, string>({
    mutationFn: (planId) => wellnessPlanService.pausePlan(planId),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(QUERY_KEYS.WELLNESS_PLANS.CURRENT, updatedPlan);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WELLNESS_PLANS.ALL });
    },
  });
};

/**
 * Hook to resume plan
 */
export const useResumeWellnessPlan = () => {
  const queryClient = useQueryClient();

  return useMutation<WellnessPlan, Error, string>({
    mutationFn: (planId) => wellnessPlanService.resumePlan(planId),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(QUERY_KEYS.WELLNESS_PLANS.CURRENT, updatedPlan);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WELLNESS_PLANS.ALL });
    },
  });
};

/**
 * Hook for personalized recommendations
 */
export const usePersonalizedRecommendations = () => {
  return useQuery<PersonalizedRecommendation[], Error>({
    queryKey: QUERY_KEYS.WELLNESS_PLANS.RECOMMENDATIONS,
    queryFn: () => recommendationService.getPersonalizedRecommendations(),
    staleTime: 1000 * 60 * 10,
  });
};
