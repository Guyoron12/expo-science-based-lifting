import {
  QueryClient,
  mutationOptions,
  queryOptions,
  type MutationKey,
  type QueryKey,
} from "@tanstack/react-query";
import Constants from "expo-constants";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryParamsValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

type QueryParams = Record<string, QueryParamsValue>;

type CreateRequestConfig = {
  method: HttpMethod;
  methodName: string;
  path?: string;
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
};

type RequestCallConfig<TBody = unknown> = {
  body?: TBody;
  queryParams?: QueryParams;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

type ExpoExtra = {
  apiBaseUrl?: string;
};

function resolveApiBaseUrl(): string {
  const expoExtra = Constants.expoConfig?.extra as ExpoExtra | undefined;
  return expoExtra?.apiBaseUrl ?? "";
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(
  baseUrl: string,
  path: string,
  queryParams?: QueryParams,
): string {
  const url = `${normalizeBaseUrl(baseUrl)}${normalizePath(path)}`;
  if (!queryParams) {
    return url;
  }

  const searchParams = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

function isJsonResponse(contentType: string | null): boolean {
  return Boolean(contentType && contentType.includes("application/json"));
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  return isJsonResponse(contentType) ? response.json() : response.text();
}

function shouldStringifyBody(body: unknown): boolean {
  return body !== undefined && body !== null && !(body instanceof FormData);
}

export class ApiError extends Error {
  status: number;
  url: string;
  data: unknown;

  constructor(
    message: string,
    options: { status: number; url: string; data: unknown },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.url = options.url;
    this.data = options.data;
  }
}

function createRequest<TResponse, TBody = unknown>({
  method,
  methodName,
  path = `/${methodName}`,
  baseUrl = resolveApiBaseUrl(),
  defaultHeaders,
}: CreateRequestConfig) {
  return async (config: RequestCallConfig<TBody> = {}): Promise<TResponse> => {
    const url = buildUrl(baseUrl, path, config.queryParams);

    const headers = new Headers(defaultHeaders);
    if (config.headers) {
      new Headers(config.headers).forEach((value, key) =>
        headers.set(key, value),
      );
    }
    if (shouldStringifyBody(config.body) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      method,
      headers,
      body:
        config.body instanceof FormData
          ? config.body
          : shouldStringifyBody(config.body)
            ? JSON.stringify(config.body)
            : undefined,
      signal: config.signal,
    });

    const responseData = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError(
        `Request failed for ${methodName} (${response.status})`,
        {
          status: response.status,
          url,
          data: responseData,
        },
      );
    }

    return responseData as TResponse;
  };
}

export const ApiService = {
  // Example shape requested:
  // apiService.getExercises = createRequest({ method: "GET", methodName: "getExercises" })
  getExercises: createRequest({
    method: "GET",
    methodName: "getExercises",
    path: "/exercises",
  }),
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

type CreateQueryOptionsParams<TData, TQueryKey extends QueryKey> = {
  queryKey: TQueryKey;
  queryFn: () => Promise<TData>;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
};

type CreateMutationOptionsParams<
  TData,
  TVariables,
  TMutationKey extends MutationKey,
> = {
  mutationKey: TMutationKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
};

export const tanstackService = {
  createRequest,

  createQueryOptions<TData, TQueryKey extends QueryKey>({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    enabled,
  }: CreateQueryOptionsParams<TData, TQueryKey>) {
    return queryOptions({
      queryKey,
      queryFn,
      staleTime,
      gcTime,
      enabled,
    });
  },

  createMutationOptions<TData, TVariables, TMutationKey extends MutationKey>({
    mutationKey,
    mutationFn,
  }: CreateMutationOptionsParams<TData, TVariables, TMutationKey>) {
    return mutationOptions({
      mutationKey,
      mutationFn,
    });
  },
};
