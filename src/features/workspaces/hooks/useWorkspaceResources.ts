import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { customInstance } from "@/lib/api-client";
import * as ResourcesApi from "@/gen/endpoints/resources/resources";
import type {
  WorkspaceResourceDto,
  WorkspaceAgentResourceDto,
  PagedResult,
} from "../types/workspace-resources";
import type { BaseSearchParams } from "@/lib/useResourceQuery";

export const getWorkspaceResourcesQueryKey = (
  workspaceId: string,
  params?: Partial<BaseSearchParams> & { projectId?: string }
) => ["workspaces", workspaceId, "resources", params] as const;

export const useWorkspaceResources = (
  workspaceId: string,
  projectId?: string,
  searchParams?: Partial<BaseSearchParams>
) => {
  return useQuery({
    queryKey: getWorkspaceResourcesQueryKey(workspaceId, {
      ...searchParams,
      projectId,
    }),
    queryFn: () => {
      return customInstance<PagedResult<WorkspaceResourceDto>>({
        url: `/api/workspaces/${workspaceId}/resources`,
        method: "GET",
        params: {
          projectId,
          globalKeyword: searchParams?.globalKeyword,
          page: searchParams?.page,
          pageSize: searchParams?.pageSize,
          sort: searchParams?.sort,
          filters: searchParams?.filters,
        },
      });
    },
    enabled: Boolean(workspaceId && projectId),
    placeholderData: keepPreviousData,
  });
};

export const getWorkspaceAgentResourcesQueryKey = (
  workspaceId: string,
  agentId: string,
  params?: Partial<BaseSearchParams> & { projectId?: string }
) => ["workspaces", workspaceId, "agents", agentId, "resources", params] as const;

export const useWorkspaceAgentResources = (
  workspaceId: string,
  agentId?: string,
  projectId?: string,
  searchParams?: Partial<BaseSearchParams>
) => {
  return useQuery({
    queryKey: getWorkspaceAgentResourcesQueryKey(workspaceId, agentId || "", {
      ...searchParams,
      projectId,
    }),
    queryFn: () => {
      return customInstance<PagedResult<WorkspaceAgentResourceDto>>({
        url: `/api/workspaces/${workspaceId}/agents/${agentId}/resources`,
        method: "GET",
        params: {
          projectId,
          globalKeyword: searchParams?.globalKeyword,
          page: searchParams?.page,
          pageSize: searchParams?.pageSize,
          sort: searchParams?.sort,
          filters: searchParams?.filters,
        },
      });
    },
    enabled: Boolean(workspaceId && agentId && projectId),
    placeholderData: keepPreviousData,
  });
};

export const useAssignResourcesContent = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  return ResourcesApi.useAssignResourcesContent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            (Array.isArray(query.queryKey) && query.queryKey.includes("resources")) ||
            (typeof query.queryKey[0] === "string" && query.queryKey[0].includes("resources")),
        });
        if (workspaceId) {
          queryClient.invalidateQueries({
            queryKey: ["workspaces", workspaceId, "resources"],
          });
        }
      },
    },
  });
};

export const useGetResourcesByContent = (
  contentId: string,
  options?: { enabled?: boolean }
) => {
  return ResourcesApi.useGetResourcesByContent(contentId, {
    query: {
      enabled: !!contentId && (options?.enabled ?? true),
      placeholderData: keepPreviousData,
    },
  });
};

