import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  Assessment,
  AssessmentTypeMetadata,
  SubmitAssessmentDto,
  PaginationMeta,
} from '@solace/shared';

export const assessmentService = {
  /**
   * Get all assessment types with question counts and descriptions
   */
  async getAssessmentTypes(): Promise<AssessmentTypeMetadata[]> {
    const res = await apiClient.get<ApiResponse<AssessmentTypeMetadata[]>>(
      API_ROUTES.ASSESSMENTS.TYPES,
    );
    return res.data.data || [];
  },

  /**
   * Get specific assessment type definition including all questions
   */
  async getAssessmentTypeDetail(type: string): Promise<AssessmentTypeMetadata> {
    const res = await apiClient.get<ApiResponse<AssessmentTypeMetadata>>(
      API_ROUTES.ASSESSMENTS.TYPE_DETAIL(type),
    );
    return res.data.data!;
  },

  /**
   * Submit completed assessment answers
   */
  async submitAssessment(
    type: string,
    dto: SubmitAssessmentDto,
  ): Promise<Assessment> {
    const res = await apiClient.post<ApiResponse<Assessment>>(
      API_ROUTES.ASSESSMENTS.SUBMIT(type),
      dto,
    );
    return res.data.data!;
  },

  /**
   * Get user's assessment history
   */
  async getAssessmentHistory(
    page = 1,
    limit = 10,
  ): Promise<{ data: Assessment[]; meta: PaginationMeta }> {
    const res = await apiClient.get<
      ApiResponse<Assessment[]> & { meta: PaginationMeta }
    >(API_ROUTES.ASSESSMENTS.HISTORY, {
      params: { page, limit },
    });
    return {
      data: res.data.data || [],
      meta: res.data.meta!,
    };
  },

  /**
   * Get latest completed assessment of a specific type
   */
  async getLatestAssessment(type: string): Promise<Assessment | null> {
    const res = await apiClient.get<ApiResponse<Assessment | null>>(
      API_ROUTES.ASSESSMENTS.LATEST(type),
    );
    return res.data.data || null;
  },

  /**
   * Get single assessment by ID
   */
  async getAssessmentById(id: string): Promise<Assessment> {
    const res = await apiClient.get<ApiResponse<Assessment>>(
      API_ROUTES.ASSESSMENTS.DETAIL(id),
    );
    return res.data.data!;
  },
};

