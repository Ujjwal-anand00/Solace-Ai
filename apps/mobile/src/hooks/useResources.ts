import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService, ResourceListResponse, ResourceSearchResult, ResourceUserProgressItem } from '../services/api/resourceService';
import {
  ResourceDetail,
  ResourceCategoryMeta,
  ResourceFilterParams,
  ResourceProgressItem,
} from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useResources = (params?: ResourceFilterParams) => {
  return useQuery<ResourceListResponse, Error>({
    queryKey: QUERY_KEYS.RESOURCES.LIST(params as Record<string, unknown>),
    queryFn: () => resourceService.getResources(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFeaturedResources = () => {
  return useQuery<ResourceDetail[], Error>({
    queryKey: QUERY_KEYS.RESOURCES.FEATURED,
    queryFn: () => resourceService.getFeatured(),
    staleTime: 1000 * 60 * 10,
  });
};

export const useRecommendedResources = () => {
  return useQuery<ResourceDetail[], Error>({
    queryKey: QUERY_KEYS.RESOURCES.RECOMMENDED,
    queryFn: () => resourceService.getRecommended(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useResourceCategories = () => {
  return useQuery<ResourceCategoryMeta[], Error>({
    queryKey: QUERY_KEYS.RESOURCES.CATEGORIES,
    queryFn: () => resourceService.getCategories(),
    staleTime: 1000 * 60 * 15,
  });
};

export const useResourceSearch = (query: string, filter?: ResourceFilterParams) => {
  return useQuery<ResourceSearchResult, Error>({
    queryKey: QUERY_KEYS.RESOURCES.SEARCH(query, filter as Record<string, unknown>),
    queryFn: () => resourceService.search(query, filter),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
  });
};

export const useResourceDetail = (idOrSlug: string) => {
  return useQuery<ResourceDetail, Error>({
    queryKey: QUERY_KEYS.RESOURCES.DETAIL(idOrSlug),
    queryFn: () => resourceService.getById(idOrSlug),
    enabled: Boolean(idOrSlug),
    staleTime: 1000 * 60 * 5,
  });
};

export const useResourceFavorites = () => {
  return useQuery<ResourceDetail[], Error>({
    queryKey: QUERY_KEYS.RESOURCES.FAVORITES,
    queryFn: () => resourceService.getFavorites(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useResourceProgress = () => {
  return useQuery<ResourceUserProgressItem[], Error>({
    queryKey: QUERY_KEYS.RESOURCES.PROGRESS,
    queryFn: () => resourceService.getProgress(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useToggleResourceFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation<{ isBookmarked: boolean; resourceId: string }, Error, string>({
    mutationFn: (resourceId: string) => resourceService.toggleFavorite(resourceId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES.FAVORITES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES.DETAIL(data.resourceId) });
    },
  });
};

export const useUpdateResourceProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ResourceProgressItem,
    Error,
    { resourceId: string; progressPercent: number }
  >({
    mutationFn: ({ resourceId, progressPercent }) =>
      resourceService.updateProgress(resourceId, progressPercent),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES.PROGRESS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES.DETAIL(data.resourceId) });
    },
  });
};

export const useCompleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation<ResourceProgressItem, Error, string>({
    mutationFn: (resourceId: string) => resourceService.complete(resourceId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES.PROGRESS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES.DETAIL(data.resourceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.OVERVIEW });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.STREAK });
    },
  });
};
