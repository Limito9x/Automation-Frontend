import { keepPreviousData } from "@tanstack/react-query";
import { createMutationHook } from "@/lib/query-utils";
import * as ContentTypesApi from "@/gen/endpoints/contentTypes/contentTypes";
import { GetContentTypesQueryParams } from "@/gen/endpoints/contentTypes/contentTypes.zod";
import { z } from "zod";

type contentTypeQuery = z.infer<typeof GetContentTypesQueryParams>;

export const useContentTypes = (params: contentTypeQuery) => {
    return ContentTypesApi.useGetContentTypes(params, {
        query: {
            placeholderData: keepPreviousData,
        }
    });
};

export const useGetContentTypeById = (id: string) => {
    return ContentTypesApi.useGetContentTypeById(id, {
        query: {
            enabled: !!id,
        }
    });
};

export const useCreateContentType = createMutationHook(ContentTypesApi.useCreateContentType, [ContentTypesApi.getGetContentTypesQueryKey()]);
export const useUpdateContentType = createMutationHook(ContentTypesApi.useUpdateContentType, [ContentTypesApi.getGetContentTypesQueryKey()]);
export const useDeleteContentType = createMutationHook(ContentTypesApi.useDeleteContentType, [ContentTypesApi.getGetContentTypesQueryKey()]);
