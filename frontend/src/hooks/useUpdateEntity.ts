import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useUpdateEntity<T>(endpoint: string, id: string) {
  const queryClient = useQueryClient();

  return useMutation<T, Error, Record<string, unknown>>({
    mutationFn: async (data) => {
      const response = await api.put<T>(`${endpoint}/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      queryClient.invalidateQueries({ queryKey: [endpoint, id] });
    },
  });
}
