import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, CheckCircle2, XCircle, AlertTriangle, Search, Braces, Table2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TagDroppableCell } from "@/features/tags/components/TagDroppableCell";
import type { TagLinkDetailDto } from "@/features/tags/types";

interface JsonTreeTableProps {
    data: any;
    className?: string;
    tagsByPath?: Record<string, TagLinkDetailDto[]>;
    entityId?: string;
    entityType?: string;
}

export function JsonTreeTable({
    data,
    className = "",
    tagsByPath = {},
    entityId,
    entityType = "Inspection",
}: JsonTreeTableProps) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");

    const parsedData = useMemo(() => {
        if (typeof data === "string") {
            try {
                return JSON.parse(data);
            } catch {
                return data;
            }
        }
        return data;
    }, [data]);

    if (!parsedData || (typeof parsedData !== "object" && !Array.isArray(parsedData))) {
        return (
            <div className="p-4 text-xs font-mono bg-muted/40 rounded border overflow-x-auto">
                {String(parsedData)}
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Search Filter Header */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                    placeholder={t("inspections.filterReport", { defaultValue: "Filter inspection metrics..." })}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-card"
                />
            </div>

            {/* Tree / Table Content */}
            <div className="border rounded-lg bg-card overflow-hidden divide-y divide-border">
                {renderNode("", parsedData, searchQuery, "", { tagsByPath, entityId, entityType })}
            </div>
        </div>
    );
}

interface RenderContext {
    tagsByPath: Record<string, TagLinkDetailDto[]>;
    entityId?: string;
    entityType: string;
}

function renderNode(
    key: string,
    value: any,
    search: string,
    currentPath: string,
    ctx: RenderContext
): React.ReactNode {
    // Build next path
    const nodePath = currentPath ? (key ? `${currentPath}.${key}` : currentPath) : key;

    // 1. Nếu là Array of Objects -> Render Sub-Table
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        return (
            <ArrayOfObjectsTable
                key={nodePath || "root-array"}
                tableKey={key}
                basePath={nodePath}
                items={value}
                search={search}
                ctx={ctx}
            />
        );
    }

    // 2. Nếu là Array các kiểu primitive
    if (Array.isArray(value)) {
        return (
            <div
                key={nodePath || "array-item"}
                className="p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
                <span className="font-mono font-medium text-foreground">{key}:</span>
                <div className="flex flex-wrap gap-1.5 items-center">
                    {value.map((item, idx) => {
                        const itemPath = `${nodePath}[${idx}]`;
                        const existingTags = ctx.tagsByPath[itemPath] || [];
                        return (
                            <TagDroppableCell
                                key={itemPath}
                                path={itemPath}
                                value={item}
                                entityId={ctx.entityId}
                                entityType={ctx.entityType}
                                existingTags={existingTags}
                                renderValueContent={(val) => (
                                    <Badge variant="secondary" className="font-mono text-[11px]">
                                        {String(val)}
                                    </Badge>
                                )}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

    // 3. Nếu là Object lồng nhau -> Render Collapsible Section
    if (typeof value === "object" && value !== null) {
        const entries = Object.entries(value);
        const filteredEntries = search
            ? entries.filter(
                  ([k, v]) =>
                      k.toLowerCase().includes(search.toLowerCase()) ||
                      JSON.stringify(v).toLowerCase().includes(search.toLowerCase())
              )
            : entries;

        if (filteredEntries.length === 0 && search) return null;

        return (
            <Collapsible key={nodePath || "root-obj"} defaultExpanded className="w-full">
                <div className="flex items-center p-2.5 bg-muted/20 hover:bg-muted/40 transition-colors">
                    <CollapsibleTrigger className="p-1 rounded hover:bg-muted mr-1.5 flex items-center justify-center [&[aria-expanded=true]_.chevron]:rotate-90 [&[data-expanded=true]_.chevron]:rotate-90">
                        <ChevronRight className="h-3.5 w-3.5 chevron transition-transform duration-200 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2 flex-1 font-semibold text-xs">
                        <Braces className="w-3.5 h-3.5 text-primary" />
                        <span>{key || "Inspection Data"}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                            ({entries.length} fields)
                        </span>
                    </div>
                </div>

                <CollapsibleContent>
                    <div className="pl-6 pr-3 pb-2 pt-1 border-t divide-y divide-border/60">
                        {filteredEntries.map(([childKey, childVal]) =>
                            renderNode(childKey, childVal, search, nodePath, ctx)
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        );
    }

    // 4. Primitive (Boolean, Number, String)
    const stringVal = String(value);
    if (
        search &&
        !key.toLowerCase().includes(search.toLowerCase()) &&
        !stringVal.toLowerCase().includes(search.toLowerCase())
    ) {
        return null;
    }

    const existingTags = ctx.tagsByPath[nodePath] || [];

    return (
        <div
            key={nodePath}
            className="p-2 text-xs flex items-center justify-between gap-4 hover:bg-muted/10"
        >
            <span className="font-mono text-muted-foreground font-medium">{key}</span>
            <TagDroppableCell
                path={nodePath}
                value={value}
                entityId={ctx.entityId}
                entityType={ctx.entityType}
                existingTags={existingTags}
                renderValueContent={(val) => renderValueBadge(val)}
            />
        </div>
    );
}

function renderValueBadge(value: any) {
    if (typeof value === "boolean") {
        return value ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[11px] gap-1 py-0">
                <CheckCircle2 className="w-3 h-3" />
                PASSED
            </Badge>
        ) : (
            <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 text-[11px] gap-1 py-0">
                <XCircle className="w-3 h-3" />
                FAILED
            </Badge>
        );
    }

    if (typeof value === "number") {
        return <span className="font-mono font-semibold text-primary">{value.toLocaleString()}</span>;
    }

    const lowerStr = String(value).toLowerCase();
    if (lowerStr === "warning") {
        return (
            <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[11px] gap-1 py-0">
                <AlertTriangle className="w-3 h-3" />
                WARNING
            </Badge>
        );
    }

    return <span className="font-mono text-foreground">{String(value)}</span>;
}

function ArrayOfObjectsTable({
    tableKey,
    basePath,
    items,
    search,
    ctx,
}: {
    tableKey: string;
    basePath: string;
    items: any[];
    search: string;
    ctx: RenderContext;
}) {
    const columns = useMemo(() => {
        const keysSet = new Set<string>();
        items.forEach((item) => {
            if (typeof item === "object" && item !== null) {
                Object.keys(item).forEach((k) => keysSet.add(k));
            }
        });
        return Array.from(keysSet);
    }, [items]);

    const filteredItems = useMemo(() => {
        if (!search) return items;
        const s = search.toLowerCase();
        return items.filter((item) => JSON.stringify(item).toLowerCase().includes(s));
    }, [items, search]);

    if (filteredItems.length === 0 && search) return null;

    return (
        <Collapsible defaultExpanded className="w-full">
            <div className="flex items-center p-2.5 bg-muted/30 hover:bg-muted/50 transition-colors">
                <CollapsibleTrigger className="p-1 rounded hover:bg-muted mr-1.5 flex items-center justify-center [&[aria-expanded=true]_.chevron]:rotate-90 [&[data-expanded=true]_.chevron]:rotate-90">
                    <ChevronRight className="h-3.5 w-3.5 chevron transition-transform duration-200 text-muted-foreground" />
                </CollapsibleTrigger>
                <div className="flex items-center gap-2 flex-1 font-semibold text-xs">
                    <Table2 className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono">{tableKey}</span>
                    <Badge variant="outline" className="text-[10px] font-normal py-0">
                        {filteredItems.length} items
                    </Badge>
                </div>
            </div>

            <CollapsibleContent>
                <div className="p-3 border-t overflow-x-auto">
                    <table className="w-full text-xs text-left border rounded-md overflow-hidden font-mono">
                        <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px]">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col} className="p-2 border-b font-medium">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredItems.map((item, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-muted/20">
                                    {columns.map((col) => {
                                        const cellPath = `${basePath}[${rowIdx}].${col}`;
                                        const existingTags = ctx.tagsByPath[cellPath] || [];
                                        return (
                                            <td key={col} className="p-1.5">
                                                <TagDroppableCell
                                                    path={cellPath}
                                                    value={item[col]}
                                                    entityId={ctx.entityId}
                                                    entityType={ctx.entityType}
                                                    existingTags={existingTags}
                                                    renderValueContent={(val) => renderValueBadge(val)}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
