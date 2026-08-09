import { ContentTypeTable } from "./components/ContentTypeTable";
import { useResourceQuery, type ResourcePageProps } from "@/lib/useResourceQuery";
import { ResourcePageShell } from "@/components/layout/shells/ResourcePageShell";
import { contentTypeFilterConfig } from "./components/contentTypeFilter";
import { useContentTypes } from "./hooks/useContentTypes";
import { useContentTypeTable } from "./hooks/useContentTypeTable";
import { useTranslation } from "react-i18next";
import { DataTableViewOptions } from "@/components/table/DataTableViewOptions";
import { useParams, useNavigate as useAppNavigate } from "@tanstack/react-router";

import { useAuthStore } from "@/stores/authStore";

interface ContentTypePageProps extends ResourcePageProps {
    projectId: string;
}

export function ContentTypePage({ useSearch, useNavigate, projectId }: ContentTypePageProps) {
    const { t } = useTranslation("contentTypes");
    const hasPermission = useAuthStore((state) => state.hasPermission);

    const search = useSearch();
    const navigateResource = useNavigate();
    const appNavigate = useAppNavigate();

    const resourceQuery = useResourceQuery(search, navigateResource);

    const { data, isLoading } = useContentTypes({
        ...search,
    }, projectId);

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
            onAdd={canCreate ? () => appNavigate({ to: "/projects/$projectId/content-types/new", params: { projectId } }) : undefined}
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
