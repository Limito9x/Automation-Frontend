import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDialogStore } from "@/stores/dialogStore";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "@tanstack/react-router";
import { DataTableRowActions, type ActionItem } from "@/components/table/DataTableRowActions";
import type { BaseSearchParams, useResourceQuery } from "@/lib/useResourceQuery";
import type { ColumnDef } from "@tanstack/react-table";
import type { ContentTypeDto } from "@/gen/model";
import { EditIcon, TrashIcon, TypeIcon } from "lucide-react";
import { useDataTable } from "@/lib/useDataTable";

export interface UseContentTypeTableOptions {
    data: ContentTypeDto[];
    totalCount: number;
    resource: ReturnType<typeof useResourceQuery<BaseSearchParams>>;
}

export function useContentTypeTable({ data, totalCount, resource }: UseContentTypeTableOptions) {
    const { t } = useTranslation(["contentTypes", "common"]);
    const openDialog = useDialogStore((state) => state.openDialog);
    const hasPermission = useAuthStore((state) => state.hasPermission);
    const navigate = useNavigate();

    const columns = useMemo<ColumnDef<ContentTypeDto>[]>(
        () => [
            {
                accessorKey: "name",
                header: () => t("fields.name", { defaultValue: "Name" }),
                meta: { label: t("fields.name", { defaultValue: "Name" }), icon: TypeIcon },
                cell: (info) => (
                    <span className="font-semibold text-foreground">
                        {info.getValue() as string}
                    </span>
                ),
            },
            {
                id: "actions",
                enableSorting: false,
                cell: ({ row }) => {
                    const item = row.original;
                    const actions = [
                        {
                            label: t("common:viewDetails", { defaultValue: "View Details" }),
                            icon: EditIcon, // Using EditIcon or EyeIcon
                            onClick: () => navigate({ to: "/content-types/$id", params: { id: item.id! } }),
                        },
                        hasPermission("contentTypes:update") && {
                            label: t("common:edit", { defaultValue: "Edit" }),
                            icon: EditIcon,
                            onClick: () => navigate({ to: "/content-types/$id/edit", params: { id: item.id! } }),
                        },
                        hasPermission("contentTypes:delete") && {
                            label: t("common:delete", { defaultValue: "Delete" }),
                            icon: TrashIcon,
                            onClick: () => openDialog("delete-content-type", { id: item.id! }),
                            destructive: true,
                            separatorBefore: true,
                        }
                    ].filter(Boolean) as ActionItem[];

                    return <DataTableRowActions actions={actions} />;
                },
            },
        ],
        [openDialog, hasPermission, t, navigate]
    );

    const table = useDataTable({ data, columns, totalCount, resource });

    return { table, columns };
}
