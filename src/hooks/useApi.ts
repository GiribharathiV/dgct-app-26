
import { useQuery, useMutation, QueryKey } from '@tanstack/react-query';
import ApiService from '@/services/api';
import { toast } from 'sonner';

export function useApiQuery<T>(
  queryKey: QueryKey,
  endpoint: string,
  options = {}
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await ApiService.get<T>(endpoint);
      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
      return response.data;
    },
    ...options,
  });
}

export function useApiMutation<T, TVariables>(
  endpoint: string,
  method: 'post' | 'put' | 'delete' = 'post',
  options = {}
) {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await (method === 'delete'
        ? ApiService.delete<T>(endpoint)
        : method === 'put'
        ? ApiService.put<T>(endpoint, variables)
        : ApiService.post<T>(endpoint, variables));

      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
      return response.data;
    },
    ...options,
  });
}
