"use client";

import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/axios";

function resolveUrl(url: string, data: any): string {
  return url.replace(/:([a-zA-Z]+)/g, (_, key) => {
    if (data && data[key] !== undefined) {
      const val = data[key];
      delete data[key];
      return val;
    }
    return `:${key}`;
  });
}

export function useDelete<TData = Record<string, any>, TResponse = unknown>(
  url: string,
  options?: Omit<
    UseMutationOptions<TResponse, Error, TData>,
    "mutationFn"
  >,
  invalidateKeys?: string[][]
) {
  const queryClient = useQueryClient();

  return useMutation<TResponse, Error, TData>({
    mutationFn: async (params) => {
      const paramsCopy = params ? { ...params } : {} as any;
      const resolvedUrl = resolveUrl(url, paramsCopy);
      const { data } = await api.delete(resolvedUrl);
      return data;
    },
    ...options,
    onSuccess: (...args) => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key })
        );
      }
      options?.onSuccess?.(...args);
    },
  });
}
