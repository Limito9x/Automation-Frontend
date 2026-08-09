import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import * as ContentItemsApi from "@/gen/endpoints/content-items/content-items";
import { GetContentItemsQueryParams } from "@/gen/endpoints/content-items/content-items.zod";
import { z } from "zod";

type contentItemQuery = z.infer<typeof GetContentItemsQueryParams>;

export const useContentItems = (params: contentItemQuery, { projectId, contentTypeKey}: {
    projectId: string
    contentTypeKey: string
}) => {
    return ContentItemsApi.useGetContentItems(projectId, contentTypeKey, params, {
        query: {
            placeholderData: keepPreviousData,
        }
    });
};

export const useGetContentItemById = (id: string) => {
    return ContentItemsApi.useGetContentItemById( id, {
        query: {
            enabled: !!id,
        }
    });
};


export const useCreateContentItem = ({projectId, contentTypeKey}: {projectId: string, contentTypeKey: string}) => {
    const queryClient = useQueryClient();
    return ContentItemsApi.useCreateContentItem({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ContentItemsApi.getGetContentItemsQueryKey(projectId, contentTypeKey)
                });
            }
        }
    });
};

export const useUpdateContentItem = ({projectId, contentTypeKey}: {projectId: string, contentTypeKey: string}) => {
    const queryClient = useQueryClient();
    return ContentItemsApi.useUpdateContentItem({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ContentItemsApi.getGetContentItemsQueryKey(projectId, contentTypeKey)
                });
            }
        }
    });
};

export const useDeleteContentItem = ({projectId, contentTypeKey}:{projectId: string, contentTypeKey: string}) => {
    const queryClient = useQueryClient();
    return ContentItemsApi.useDeleteContentItem({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ContentItemsApi.getGetContentItemsQueryKey(projectId, contentTypeKey)
                });
            }
        }
    });
};
