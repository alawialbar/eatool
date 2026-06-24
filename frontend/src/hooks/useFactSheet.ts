import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import api from "@/lib/api";

export function useFactSheet<T>(
  endpoint: string,
  id: string
): UseQueryResult<T> {
  return useQuery<T>({
    queryKey: [endpoint, id],
    queryFn: async () => {
      const response = await api.get<T>(`${endpoint}/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
