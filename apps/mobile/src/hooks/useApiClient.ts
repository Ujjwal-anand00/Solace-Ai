import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '../services/api/apiClient';
import { AxiosError, AxiosResponse } from 'axios';

export function useApiQuery<TData = unknown, TError = AxiosError>(
  options: UseQueryOptions<TData, TError>,
) {
  return useQuery<TData, TError>(options);
}

export function useApiMutation<TData = unknown, TVariables = void, TError = AxiosError>(
  options: UseMutationOptions<AxiosResponse<TData>, TError, TVariables>,
) {
  return useMutation<AxiosResponse<TData>, TError, TVariables>(options);
}

export { apiClient };
