import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDialogStore } from "@/stores/dialogStore";
import { useAuthStore } from "@/stores/authStore";
import { DataTableRowActions, type ActionItem } from "@/components/table/DataTableRowActions";
import type { BaseSearchParams, useResourceQuery } from "@/lib/useResourceQuery";
import type { ColumnDef } from "@tanstack/react-table";
import type { ContentTypeDto } from "@/gen/model";
import { EditIcon, TrashIcon, TypeIcon, KeyIcon, FileTextIcon } from "lucide-react";
import { useDataTable } from "@/lib/useDataTable";
import { useRouter } from "@tanstack/react-router";

export interface UseContentTypeTableOptions {
    data: ContentTypeDto[];
    totalCount: number;
    resource: ReturnType<typeof useResourceQuery<BaseSearchParams>>;
}

export function useContentTypeTable({ data, totalCount, resource }: UseContentTypeTableOptions) {
    const { t } = useTranslation(["contentTypes", "common"]);
    const openDialog = useDialogStore((state) => state.openDialog);
    const hasPermission = useAuthStore((state) => state.hasPermission);
    const router = useRouter();

    const columns = useMemo<ColumnDef<ContentTypeDto>[]>(
        () => [
            {
                accessorKey: "displayName",
                header: () => t("fields.displayName", { defaultValue: "Display Name" }),
                meta: { label: t("fields.displayName", { defaultValue: "Display Name" }), icon: TypeIcon },
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold text-foreground">{row.original.displayName}</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "key",
                header: () => t("fields.key", { defaultValue: "Key" }),
                meta: { label: t("fields.key", { defaultValue: "Key" }), icon: KeyIcon },
            },
            {
                accessorKey: "description",
                header: () => t("fields.description", { defaultValue: "Description" }),
                meta: { label: t("fields.description", { defaultValue: "Description" }), icon: FileTextIcon },
                cell: ({ row }) => {
                    return <span className="text-muted-foreground truncate max-w-[300px] inline-block">{row.original.description}</span>;
                },
            },
            {
                id: "actions",
                enableSorting: false,
                cell: ({ row }) => {
                    const item = row.original;
                    const actions = [
                        hasPermission("contenttypes:update") && {
                            label: t("common:edit", { defaultValue: "Edit" }),
                            icon: EditIcon,
                            onClick: () => {
                                router.navigate({
                                    to: `/projects/$id/content-types/${item.id}/edit`,
                                    params: { id: item.projectId! }
                                });
                            },
                        },
                        hasPermission("contenttypes:delete") && {
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
        [openDialog, hasPermission, t, router]
    );

    const table = useDataTable({ data, columns, totalCount, resource });

    return { table, columns };
}
