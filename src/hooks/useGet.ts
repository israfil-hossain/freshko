"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "@/lib/axios";

export function useGet<T>(
  key: string[],
  url: string,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get(url);
      return data;
    },
    ...options,
  });
}
