import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '../services/api/assessmentService';
import {
  Assessment,
  AssessmentTypeMetadata,
  SubmitAssessmentDto,
} from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Hook to retrieve all assessment categories/types
 */
export const useAssessmentTypes = () => {
  return useQuery<AssessmentTypeMetadata[], Error>({
    queryKey: QUERY_KEYS.ASSESSMENTS.TYPES,
    queryFn: () => assessmentService.getAssessmentTypes(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

/**
 * Hook to retrieve specific assessment questions and metadata
 */
export const useAssessmentTypeDetail = (type: string) => {
  return useQuery<AssessmentTypeMetadata, Error>({
    queryKey: QUERY_KEYS.ASSESSMENTS.TYPE_DETAIL(type),
    queryFn: () => assessmentService.getAssessmentTypeDetail(type),
    enabled: Boolean(type),
    staleTime: 1000 * 60 * 30,
  });
};

/**
 * Hook to submit completed assessment answers
 */
export const useSubmitAssessment = (type: string) => {
  const queryClient = useQueryClient();

  return useMutation<Assessment, Error, SubmitAssessmentDto>({
    mutationFn: (dto) => assessmentService.submitAssessment(type, dto),
    onSuccess: (newAssessment) => {
      queryClient.setQueryData(
        QUERY_KEYS.ASSESSMENTS.LATEST(type),
        newAssessment,
      );
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSESSMENTS.ALL });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.WELLNESS_PLANS.RECOMMENDATIONS,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.CURRENT });
    },
  });
};

/**
 * Hook to retrieve user's historical assessments
 */
export const useAssessmentHistory = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.ASSESSMENTS.HISTORY(page),
    queryFn: () => assessmentService.getAssessmentHistory(page, limit),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to retrieve user's latest assessment of a specific type
 */
export const useLatestAssessment = (type: string) => {
  return useQuery<Assessment | null, Error>({
    queryKey: QUERY_KEYS.ASSESSMENTS.LATEST(type),
    queryFn: () => assessmentService.getLatestAssessment(type),
    enabled: Boolean(type),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to retrieve single assessment by ID
 */
export const useAssessmentDetail = (id: string) => {
  return useQuery<Assessment, Error>({
    queryKey: QUERY_KEYS.ASSESSMENTS.DETAIL(id),
    queryFn: () => assessmentService.getAssessmentById(id),
    enabled: Boolean(id),
  });
};

