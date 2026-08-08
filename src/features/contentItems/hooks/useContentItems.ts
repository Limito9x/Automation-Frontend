import { keepPreviousData } from "@tanstack/react-query";
import { createMutationHook } from "@/lib/query-utils";
import * as ContentItemsApi from "@/gen/endpoints/contentItems/contentItems";
import { GetContentItemsQueryParams } from "@/gen/endpoints/contentItems/contentItems.zod";
import { z } from "zod";

type contentItemQuery = z.infer<typeof GetContentItemsQueryParams>;

export const useContentItems = (params: contentItemQuery) => {
    return ContentItemsApi.useGetContentItems(params, {
        query: {
            placeholderData: keepPreviousData,
        }
    });
};

export const useGetContentItemById = (id: string) => {
    return ContentItemsApi.useGetContentItemById(id, {
        query: {
            enabled: !!id,
        }
    });
};

export const useCreateContentItem = createMutationHook(ContentItemsApi.useCreateContentItem, [ContentItemsApi.getGetContentItemsQueryKey()]);
export const useUpdateContentItem = createMutationHook(ContentItemsApi.useUpdateContentItem, [ContentItemsApi.getGetContentItemsQueryKey()]);
export const useDeleteContentItem = createMutationHook(ContentItemsApi.useDeleteContentItem, [ContentItemsApi.getGetContentItemsQueryKey()]);
