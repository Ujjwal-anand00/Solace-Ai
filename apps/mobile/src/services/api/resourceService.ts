import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  PaginationMeta,
  ResourceDetail,
  ResourceCategoryMeta,
  ResourceProgressItem,
  ResourceFilterParams,
} from '@solace/shared';

export interface ResourceListResponse {
  data: ResourceDetail[];
  meta?: PaginationMeta;
}

export interface ResourceSearchResult {
  resources: ResourceDetail[];
  total: number;
  query: string;
}

export interface ResourceUserProgressItem {
  resource: ResourceDetail;
  progress: ResourceProgressItem;
}

export const resourceService = {
  /**
   * Fetch paginated resources with optional filtering
   */
  async getResources(params?: ResourceFilterParams): Promise<ResourceListResponse> {
    const res = await apiClient.get<ApiResponse<ResourceDetail[]> & { meta?: PaginationMeta }>(
      API_ROUTES.RESOURCES.BASE,
      { params },
    );
    return {
      data: res.data.data || [],
      meta: res.data.meta,
    };
  },

  /**
   * Fetch featured resources for top spotlight
   */
  async getFeatured(): Promise<ResourceDetail[]> {
    const res = await apiClient.get<ApiResponse<ResourceDetail[]>>(
      API_ROUTES.RESOURCES.FEATURED,
    );
    return res.data.data || [];
  },

  /**
   * Fetch personalized resource recommendations based on user goals
   */
  async getRecommended(): Promise<ResourceDetail[]> {
    const res = await apiClient.get<ApiResponse<ResourceDetail[]>>(
      API_ROUTES.RESOURCES.RECOMMENDED,
    );
    return res.data.data || [];
  },

  /**
   * Fetch 8 educational categories with counts
   */
  async getCategories(): Promise<ResourceCategoryMeta[]> {
    const res = await apiClient.get<ApiResponse<ResourceCategoryMeta[]>>(
      API_ROUTES.RESOURCES.CATEGORIES,
    );
    return res.data.data || [];
  },

  /**
   * Search resources by query string and filters
   */
  async search(query: string, filter?: ResourceFilterParams): Promise<ResourceSearchResult> {
    const res = await apiClient.get<ApiResponse<ResourceSearchResult>>(
      API_ROUTES.RESOURCES.SEARCH,
      {
        params: {
          q: query,
          ...filter,
        },
      },
    );
    return res.data.data || { resources: [], total: 0, query };
  },

  /**
   * Fetch full resource detail by ID or slug
   */
  async getById(idOrSlug: string): Promise<ResourceDetail> {
    const res = await apiClient.get<ApiResponse<ResourceDetail>>(
      API_ROUTES.RESOURCES.DETAIL(idOrSlug),
    );
    if (!res.data.data) {
      throw new Error('Resource not found');
    }
    return res.data.data;
  },

  /**
   * Toggle bookmark favorite status
   */
  async toggleFavorite(resourceId: string): Promise<{ isBookmarked: boolean; resourceId: string }> {
    const res = await apiClient.post<ApiResponse<{ isBookmarked: boolean; resourceId: string }>>(
      API_ROUTES.RESOURCES.TOGGLE_FAVORITE(resourceId),
    );
    return res.data.data || { isBookmarked: false, resourceId };
  },

  /**
   * Fetch all user's favorite bookmarked resources
   */
  async getFavorites(): Promise<ResourceDetail[]> {
    const res = await apiClient.get<ApiResponse<ResourceDetail[]>>(
      API_ROUTES.RESOURCES.FAVORITES,
    );
    return res.data.data || [];
  },

  /**
   * Fetch user's reading progress and completion history
   */
  async getProgress(): Promise<ResourceUserProgressItem[]> {
    const res = await apiClient.get<ApiResponse<ResourceUserProgressItem[]>>(
      API_ROUTES.RESOURCES.PROGRESS,
    );
    return res.data.data || [];
  },

  /**
   * Update reading progress (0 - 100)
   */
  async updateProgress(
    resourceId: string,
    progressPercent: number,
  ): Promise<ResourceProgressItem> {
    const res = await apiClient.put<ApiResponse<ResourceProgressItem>>(
      API_ROUTES.RESOURCES.UPDATE_PROGRESS(resourceId),
      { progressPercent },
    );
    if (!res.data.data) {
      throw new Error('Failed to update progress');
    }
    return res.data.data;
  },

  /**
   * Complete a resource reading
   */
  async complete(resourceId: string): Promise<ResourceProgressItem> {
    const res = await apiClient.post<ApiResponse<ResourceProgressItem>>(
      API_ROUTES.RESOURCES.COMPLETE(resourceId),
    );
    if (!res.data.data) {
      throw new Error('Failed to complete resource');
    }
    return res.data.data;
  },
};
