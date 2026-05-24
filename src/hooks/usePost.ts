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

export function usePost<TData = Record<string, any>, TResponse = unknown>(
  url: string,
  options?: Omit<
    UseMutationOptions<TResponse, Error, TData>,
    "mutationFn"
  >,
  invalidateKeys?: string[][]
) {
  const queryClient = useQueryClient();

  return useMutation<TResponse, Error, TData>({
    mutationFn: async (body) => {
      const bodyCopy = body ? { ...body } : {} as any;
      const resolvedUrl = resolveUrl(url, bodyCopy);
      const { data } = await api.post(resolvedUrl, bodyCopy);
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
