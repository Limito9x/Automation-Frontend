import * as TagsApi from "@/gen/endpoints/tags/tags";
import type { GetTagGroupsParams, GetTagsParams } from "@/gen/model";
import { createMutationHook } from "@/lib/query-utils";

// 1. Queries
export const useTagGroups = (params: GetTagGroupsParams, options?: { enabled?: boolean }) => {
    return TagsApi.useGetTagGroups(params, {
        query: {
            enabled: options?.enabled ?? Boolean(params.projectId),
        },
    });
};

export const useTags = (params?: GetTagsParams, options?: { enabled?: boolean }) => {
    return TagsApi.useGetTags(params, {
        query: {
            enabled: options?.enabled ?? true,
        },
    });
};

// 2. Mutations (với auto query cache invalidation qua createMutationHook)
export const useCreateTagGroup = createMutationHook(
    TagsApi.useCreateTagGroup,
    [TagsApi.getGetTagGroupsQueryKey()]
);

export const useUpdateTagGroup = createMutationHook(
    TagsApi.useUpdateTagGroup,
    [TagsApi.getGetTagGroupsQueryKey()]
);

export const useDeleteTagGroup = createMutationHook(
    TagsApi.useDeleteTagGroup,
    [TagsApi.getGetTagGroupsQueryKey()]
);

export const useCreateTag = createMutationHook(
    TagsApi.useCreateTag,
    [TagsApi.getGetTagsQueryKey()]
);

export const useUpdateTag = createMutationHook(
    TagsApi.useUpdateTag,
    [TagsApi.getGetTagsQueryKey()]
);

export const useDeleteTag = createMutationHook(
    TagsApi.useDeleteTag,
    [TagsApi.getGetTagsQueryKey()]
);

export const useCreateTagLink = createMutationHook(
    TagsApi.useCreateTagLink,
    [TagsApi.getGetTagsQueryKey(), ["/api/inspections"], ["/api/resource-versions"]]
);

export const useDeleteTagLink = createMutationHook(
    TagsApi.useDeleteTagLink,
    [["/api/inspections"], ["/api/resource-versions"]]
);
