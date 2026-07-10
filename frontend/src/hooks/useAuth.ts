import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, setUser, setIsLoading } = useAuthStore();

  const getMeQuery = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const { data } = await api.get('auth/me');
        return data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    enabled: true,
  });

  useEffect(() => {
    if (getMeQuery.isFetched) {
      setUser(getMeQuery.data || null);
      setIsLoading(false);
    }
  }, [getMeQuery.isFetched, getMeQuery.data, setUser, setIsLoading]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(['me'], data);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.post('auth/register', userData);
      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(['me'], data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('auth/logout');
    },
    onSuccess: () => {
      setUser(null);
      queryClient.setQueryData(['me'], null);
      queryClient.clear();
    },
  });

  return {
    user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoading: getMeQuery.isLoading || loginMutation.isPending || registerMutation.isPending,
  };
}
