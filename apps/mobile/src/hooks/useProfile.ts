import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants/queryKeys';
import { userService } from '../services/api/userService';
import { UpdateProfileDto, ChangePasswordDto, CreateFeedbackDto } from '@solace/shared';

export const useUserProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER.PROFILE,
    queryFn: () => userService.getProfile(),
  });
};

export const useUserSessions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER.SESSIONS,
    queryFn: () => userService.getSessions(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => userService.updateProfile(dto),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(QUERY_KEYS.USER.PROFILE, updatedUser);
    },
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      wellnessPreferences?: Record<string, unknown>;
      accessibilityPreferences?: Record<string, unknown>;
      themePreference?: 'light' | 'dark' | 'system';
    }) => userService.updatePreferences(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(QUERY_KEYS.USER.PROFILE, updatedUser);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => userService.changePassword(dto),
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => userService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.SESSIONS });
    },
  });
};

export const useLogoutAll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => userService.logoutAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.SESSIONS });
    },
  });
};

export const useRequestDataExport = () => {
  return useMutation({
    mutationFn: () => userService.requestDataExport(),
  });
};

export const useSubmitFeedback = () => {
  return useMutation({
    mutationFn: (dto: CreateFeedbackDto) => userService.submitFeedback(dto),
  });
};

