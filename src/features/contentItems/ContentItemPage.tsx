import { ContentItemTable } from "./components/ContentItemTable";
import { useResourceQuery, type ResourcePageProps } from "@/lib/useResourceQuery";
import { ResourcePageShell } from "@/components/layout/shells/ResourcePageShell";
import { contentItemFilterConfig } from "./components/contentItemFilter";
import { useContentItems } from "./hooks/useContentItems";
import { useContentItemTable } from "./hooks/useContentItemTable";
import { useTranslation } from "react-i18next";
import { DataTableViewOptions } from "@/components/table/DataTableViewOptions";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate as useAppNavigate, useLoaderData, useParams } from "@tanstack/react-router";
import { BaseCardGrid } from "@/components/custom-ui/data-display/card/BaseCardGrid";
import { BaseCard } from "@/components/custom-ui/data-display/card/BaseCard";
import { ContentDisplayModes } from "./constants/contentDisplayModes";
import type { ContentTypeDto } from "@/gen/model";

export function ContentItemPage({ useSearch, useNavigate }: ResourcePageProps) {
    const { t } = useTranslation("contentItems");
    const hasPermission = useAuthStore((state) => state.hasPermission);

    const search = useSearch();
    const navigate = useNavigate();

    const appNavigate = useAppNavigate();

    const parentData = useLoaderData({
        from: "/_protected/_project/projects/$projectId/contents/$typeKey",
    }) as { contentType: ContentTypeDto } | undefined;
    const contentType = parentData?.contentType;

    const { projectId, typeKey } = useParams({
        from: "/_protected/_project/projects/$projectId/contents/$typeKey",
    });

    const resourceQuery = useResourceQuery(search, navigate);

    const { data, isLoading } = useContentItems(search as any, {
        projectId,
        contentTypeKey: typeKey,
    });

    const { table, columns } = useContentItemTable({
        data: data?.items ?? [],
        totalCount: data?.totalCount ?? 0,
        resource: resourceQuery,
        typeKey,
        projectId,
    });

    const canCreate = hasPermission("contentitems:create");

    const displayConfig = (contentType?.displayConfig as any) || {};
    const displayMode = displayConfig.mode || ContentDisplayModes.TABLE;

    const getCardData = (item: any) => {
        const values = item.values || {};
        const thumbnailKey = displayConfig?.thumbnailField || "avatarUrl";
        const thumbnailUrl = item[thumbnailKey] || values[thumbnailKey] || values.avatarUrl || values.imageUrl || values.thumbnail || values.cover || values.avatar;

        const titleKey = displayConfig?.titleField || "name";
        const title = item[titleKey] || values[titleKey] || item.name || "Untitled";

        const descKey = displayConfig?.descriptionField || "description";
        const description = item[descKey] || values[descKey] || values.description || values.summary || "";

        return { title, description, thumbnailUrl };
    };

    return (
        <ResourcePageShell
            title={contentType?.displayName || t("page.title", { defaultValue: "ContentItem Management" })}
            description={`Manage all ${contentType?.name} in project` || t("page.description", { defaultValue: "Manage all contentItems in the system." })}
            onAdd={canCreate ? () => appNavigate({ to: "/projects/$projectId/contents/$typeKey/new", params: { projectId, typeKey } }) : undefined}
            addLabel={contentType?.name ? `Add ${contentType.name}` : t("actions.create", { defaultValue: `Add Content Item` })}
            resource={resourceQuery}
            filterConfig={contentItemFilterConfig}
            searchPlaceholder={t("page.searchPlaceholder", { defaultValue: "Search..." })}
            renderViewOptions={<DataTableViewOptions table={table} />}
        >
            {displayMode === ContentDisplayModes.TABLE ? (
                <ContentItemTable
                    table={table}
                    columns={columns}
                    isLoading={isLoading}
                />
            ) : (
                <BaseCardGrid
                    table={table}
                    isLoading={isLoading}
                    renderCard={(item) => {
                        const { title, description, thumbnailUrl } = getCardData(item);
                        return (
                            <BaseCard
                                key={item.id}
                                title={title}
                                description={description}
                                thumbnailUrl={thumbnailUrl}
                                onClick={() => appNavigate({
                                    to: "/projects/$projectId/contents/$typeKey/$contentItemId/edit",
                                    params: { projectId, typeKey, contentItemId: item.id }
                                })}
                            />
                        );
                    }}
                />
            )}
        </ResourcePageShell>
    );
}
