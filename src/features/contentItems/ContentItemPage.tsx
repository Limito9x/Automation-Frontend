import { ContentItemTable } from "./components/ContentItemTable";
import { useResourceQuery, type ResourcePageProps } from "@/lib/useResourceQuery";
import { ResourcePageShell } from "@/components/layout/shells/ResourcePageShell";
import { contentItemFilterConfig } from "./components/contentItemFilter";
import { useContentItems } from "./hooks/useContentItems";
import { useContentItemTable } from "./hooks/useContentItemTable";
import { useTranslation } from "react-i18next";
import { DataTableViewOptions } from "@/components/table/DataTableViewOptions";
import { useDialogStore } from "@/stores/dialogStore";

import { useAuthStore } from "@/stores/authStore";

export function ContentItemPage({ useSearch, useNavigate }: ResourcePageProps) {
    const openDialog = useDialogStore((state) => state.openDialog);
    const { t } = useTranslation("contentItems");
    const hasPermission = useAuthStore((state) => state.hasPermission);

    const search = useSearch();
    const navigate = useNavigate();

    const resourceQuery = useResourceQuery(search, navigate);

    const { data, isLoading } = useContentItems(search as any);

    const { table, columns } = useContentItemTable({
        data: data?.items ?? [],
        totalCount: data?.totalCount ?? 0,
        resource: resourceQuery,
    });

    const canCreate = hasPermission("contentItems:create");

    return (
        <ResourcePageShell
            title={t("page.title", { defaultValue: "ContentItem Management" })}
            description={t("page.description", { defaultValue: "Manage all contentItems in the system." })}
            onAdd={canCreate ? () => openDialog("create-content-item") : undefined}
            addLabel={t("actions.create", { defaultValue: "Add ContentItem" })}
            resource={resourceQuery}
            filterConfig={contentItemFilterConfig}
            searchPlaceholder={t("page.searchPlaceholder", { defaultValue: "Search contentItems..." })}
            renderViewOptions={<DataTableViewOptions table={table} />}
        >
            <ContentItemTable
                table={table}
                columns={columns}
                isLoading={isLoading}
            />
        </ResourcePageShell>
    );
}
