import { FormPageShell } from "@/components/layout/shells/FormPageShell";
import { ContentItemForm, type ContentItemFormValues } from "./components/ContentItemForm";
import { useGetContentItemById, useUpdateContentItem } from "./hooks/useContentItems";
import { useLoaderData, useNavigate, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { ContentTypeDto } from "@/gen/model";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function UpdateContentItemPage() {
    const { t } = useTranslation("contentItems");
    const navigate = useNavigate();

    const parentData = useLoaderData({
        from: "/_protected/_project/projects/$projectId/contents/$typeKey",
    }) as { contentType: ContentTypeDto } | undefined;
    const contentType = parentData?.contentType;

    const { projectId, typeKey, contentItemId } = useParams({
        from: "/_protected/_project/projects/$projectId/contents/$typeKey/$contentItemId/edit",
    });

    const { data: itemData, isLoading, error } = useGetContentItemById(contentItemId);

    const updateContentItem = useUpdateContentItem({ projectId: projectId, contentTypeKey: typeKey });

    const initialFormValues = useMemo(() => {
        if (!itemData) return undefined;
        return {
            name: itemData.name || "",
            thumbnailAssetId: itemData.thumbnailAssetId ?? undefined,
            thumbnailUrl: itemData.thumbnailUrl ?? undefined,
            ...((itemData.values as Record<string, any>) || {}),
        };
    }, [itemData]);

    const handleSubmit = (data: ContentItemFormValues) => {
        if (!projectId || !typeKey || !contentItemId) return;

        const { name, thumbnailAssetId, ...values } = data;
        const itemName = name || "Untitled";

        updateContentItem.mutate(
            {
                id: contentItemId,
                data: {
                    name: itemName,
                    values: values as any,
                    thumbnailAssetId: thumbnailAssetId ?? undefined,
                },
            },
            {
                onSuccess: () => {
                    toast.success(t("messages.updateSuccess", { defaultValue: "Content Item updated successfully" }));
                    navigate({
                        to: "/projects/$projectId/contents/$typeKey",
                        params: { projectId, typeKey },
                    });
                },
                onError: (error: any) => {
                    toast.error(error?.message || t("messages.updateError", { defaultValue: "Failed to update content item" }));
                },
            }
        );
    };

    const handleCancel = () => {
        if (projectId && typeKey) {
            navigate({
                to: "/projects/$projectId/contents/$typeKey",
                params: { projectId, typeKey },
            });
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-4 max-w-3xl mx-auto">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-64 w-full mt-6" />
            </div>
        );
    }

    if (error || !itemData || !contentType) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-destructive font-semibold">Error loading content item</p>
                <button
                    onClick={handleCancel}
                    className="mt-4 text-sm text-primary underline hover:text-primary/80"
                >
                    Back to Content List
                </button>
            </div>
        );
    }

    return (
        <FormPageShell
            title={t("actions.editTitle", { defaultValue: `Edit ${contentType.displayName || 'Content Item'}` })}
            description={t("actions.editDescription", { defaultValue: `Update details for ${itemData.name || 'this item'}.` })}
            formId="update-content-item-form"
            isPending={updateContentItem.isPending}
            onCancel={handleCancel}
        >
            <ContentItemForm
                formId="update-content-item-form"
                contentType={contentType}
                initialData={initialFormValues}
                onSubmit={handleSubmit}
            />
        </FormPageShell>
    );
}
