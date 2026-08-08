import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { FilterPanel } from "@/components/filter-panel/FilterPanel";
import type { BaseSearchParams, useResourceQuery } from "@/lib/useResourceQuery";
import type { ResolvedFilterConfig } from "@/components/filter-panel/filter-types";
import { useTranslation } from "react-i18next";

export interface ResourcePageShellProps {
    title: string;
    description?: string;

    /** Action for the Add button */
    onAdd?: () => void;
    /** Text for the Add button. Default is "Add" */
    addLabel?: string;

    /** Query state from useResourceQuery hook */
    resource: ReturnType<typeof useResourceQuery<BaseSearchParams>>;

    /** Filter panel config. If not provided, filter panel is hidden. */
    filterConfig?: ResolvedFilterConfig;
    searchPlaceholder?: string;
    renderViewOptions?: React.ReactNode;

    children: React.ReactNode;
}

export function ResourcePageShell({
    title,
    description,
    onAdd,
    addLabel,
    resource,
    filterConfig,
    searchPlaceholder,
    renderViewOptions,
    children,
}: ResourcePageShellProps) {
    const { t } = useTranslation("common");
    const resolvedAddLabel = addLabel ?? t("create");

    return (
        <div className="p-6 mx-auto space-y-6 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {onAdd && (
                    <Button onClick={onAdd}>
                        <PlusIcon className="mr-2 h-4 w-4" /> {resolvedAddLabel}
                    </Button>
                )}
            </div>

            {filterConfig && (
                <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <FilterPanel
                            keyword={resource.search.globalKeyword ?? ""}
                            onKeywordChange={resource.onSearchChange}
                            config={filterConfig}
                            filters={resource.search.filters}
                            onFiltersApply={resource.onFiltersApply}
                            searchPlaceholder={searchPlaceholder}
                        />
                    </div>
                    {renderViewOptions && (
                        <div className="flex-shrink-0">
                            {renderViewOptions}
                        </div>
                    )}
                </div>
            )}

            {children}
        </div>
    );
}
