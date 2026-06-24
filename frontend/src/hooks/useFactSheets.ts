import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PaginatedResponse, LifecycleStatus } from "@/types";

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  lifecycleStatus?: LifecycleStatus | "";
  owner?: string;
  entityScope?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useFactSheets<T>(
  endpoint: string,
  params: QueryParams
): UseQueryResult<PaginatedResponse<T>> {
  const queryParams: Record<string, string | number> = {};

  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.search) queryParams.search = params.search;
  if (params.lifecycleStatus) queryParams.lifecycleStatus = params.lifecycleStatus;
  if (params.owner) queryParams.owner = params.owner;
  if (params.entityScope) queryParams.entityScope = params.entityScope;
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

  return useQuery<PaginatedResponse<T>>({
    queryKey: [endpoint, queryParams],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<T>>(endpoint, {
        params: queryParams,
      });
      return response.data;
    },
  });
}
