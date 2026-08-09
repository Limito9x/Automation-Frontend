import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { DataTableRowActions, type ActionItem } from "@/components/table/DataTableRowActions";
import type { BaseSearchParams, useResourceQuery } from "@/lib/useResourceQuery";
import type { ColumnDef } from "@tanstack/react-table";
import type { ContentItemDto } from "@/gen/model";
import { EditIcon, TrashIcon, TypeIcon } from "lucide-react";
import { useDataTable } from "@/lib/useDataTable";
import { useDialogStore } from "@/stores/dialogStore";

export interface UseContentItemTableOptions {
    data: ContentItemDto[];
    totalCount: number;
    resource: ReturnType<typeof useResourceQuery<BaseSearchParams>>;
    typeKey: string
    projectId: string;
}

export function useContentItemTable({ data, totalCount, resource, typeKey, projectId }: UseContentItemTableOptions) {
    const { t } = useTranslation(["contentItems", "common"]);
    const navigate = useNavigate();
    const openDialog = useDialogStore((state) => state.openDialog);
    const hasPermission = useAuthStore((state) => state.hasPermission);


    const columns = useMemo<ColumnDef<ContentItemDto>[]>(() => {

        return [
            {
                accessorKey: "name",
                header: () => t("fields.name", { defaultValue: "Name" }),
                meta: { label: t("fields.name", { defaultValue: "Name" }), icon: TypeIcon },
            },
            {
                id: "actions",
                enableSorting: false,
                cell: ({ row }) => {
                    const item = row.original;
                    const actions = [
                        hasPermission("contentitems:update") && {
                            label: t("common:edit", { defaultValue: "Edit" }),
                            icon: EditIcon,
                            onClick: () => navigate({
                                to: "/projects/$projectId/contents/$typeKey/$contentItemId/edit",
                                params: { projectId, typeKey, contentItemId: item.id! },
                            }),
                        },
                        hasPermission("contentitems:delete") && {
                            label: t("common:delete", { defaultValue: "Delete" }),
                            icon: TrashIcon,
                            onClick: () => openDialog("delete-content-item", { id: item.id }),
                            destructive: true,
                            separatorBefore: true,
                        }
                    ].filter(Boolean) as ActionItem[];

                    return <DataTableRowActions actions={actions} />;
                },
            },
        ];
    }, [navigate, hasPermission, t, projectId, openDialog]);

    const table = useDataTable({ data, columns, totalCount, resource });

    return { table, columns };
}
