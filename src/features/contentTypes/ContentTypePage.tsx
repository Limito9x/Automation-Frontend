import { ContentTypeTable } from "./components/ContentTypeTable";
import { useResourceQuery, type ResourcePageProps } from "@/lib/useResourceQuery";
import { ResourcePageShell } from "@/components/layout/shells/ResourcePageShell";
import { contentTypeFilterConfig } from "./components/contentTypeFilter";
import { useContentTypes } from "./hooks/useContentTypes";
import { useContentTypeTable } from "./hooks/useContentTypeTable";
import { useTranslation } from "react-i18next";
import { DataTableViewOptions } from "@/components/table/DataTableViewOptions";
import { useParams } from "@tanstack/react-router";

import { useAuthStore } from "@/stores/authStore";

export function ContentTypePage({ useSearch, useNavigate }: ResourcePageProps) {
    const { t } = useTranslation("contentTypes");
    const hasPermission = useAuthStore((state) => state.hasPermission);

    const search = useSearch();
    const navigate = useNavigate();

    const { id: projectId } = useParams({ strict: false }) as { id: string };

    const resourceQuery = useResourceQuery(search, navigate);

    const { data, isLoading } = useContentTypes(search as any);

    const { table, columns } = useContentTypeTable({
        data: data?.items ?? [],
        totalCount: data?.totalCount ?? 0,
        resource: resourceQuery,
    });

    const canCreate = hasPermission("contenttypes:create");

    return (
        <ResourcePageShell
            title={t("page.title", { defaultValue: "ContentType Management" })}
            description={t("page.description", { defaultValue: "Manage all contentTypes in the system." })}
            onAdd={canCreate ? () => navigate({ to: "/projects/$id/content-types/new", params: { id: projectId } }) : undefined}
            addLabel={t("actions.create", { defaultValue: "Add ContentType" })}
            resource={resourceQuery}
            filterConfig={contentTypeFilterConfig}
            searchPlaceholder={t("page.searchPlaceholder", { defaultValue: "Search contentTypes..." })}
            renderViewOptions={<DataTableViewOptions table={table} />}
        >
            <ContentTypeTable
                table={table}
                columns={columns}
                isLoading={isLoading}
            />
        </ResourcePageShell>
    );
}
