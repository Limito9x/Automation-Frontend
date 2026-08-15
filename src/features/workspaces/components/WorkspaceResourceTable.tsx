import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/components/table/BaseTable";
import { useDataTable } from "@/lib/useDataTable";
import type { WorkspaceResourceDto } from "../types/workspace-resources";
import type { useResourceQuery, BaseSearchParams } from "@/lib/useResourceQuery";
import { 
  FileCode, 
  Search, 
  Tag, 
  Calendar, 
  GitBranch, 
  Folder 
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface WorkspaceResourceTableProps {
  data: WorkspaceResourceDto[];
  totalCount: number;
  isLoading: boolean;
  resource: ReturnType<typeof useResourceQuery<BaseSearchParams>>;
}

export function WorkspaceResourceTable({
  data,
  totalCount,
  isLoading,
  resource,
}: WorkspaceResourceTableProps) {
  const columns = useMemo<ColumnDef<WorkspaceResourceDto>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Resource File",
        meta: { label: "Name", icon: FileCode },
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2.5 py-1 min-w-[180px]">
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <FileCode className="size-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {item.displayName || item.name || "Unnamed Resource"}
                </p>
                {(item.relativePath || item.filePath) && (
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {item.relativePath || item.filePath}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "contentTypeName",
        header: "Content Type",
        meta: { label: "Type", icon: Tag },
        cell: ({ row }) => {
          const item = row.original;
          if (!item.contentTypeName) {
            return <span className="text-xs text-muted-foreground italic">Unassigned</span>;
          }
          return (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: item.contentTypeColor ? `${item.contentTypeColor}15` : undefined,
                color: item.contentTypeColor || undefined,
                borderColor: item.contentTypeColor ? `${item.contentTypeColor}40` : undefined,
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: item.contentTypeColor || "#64748b" }}
              />
              {item.contentTypeName}
            </span>
          );
        },
      },
      {
        accessorKey: "contentName",
        header: "Linked Content",
        meta: { label: "Content", icon: Folder },
        cell: ({ row }) => {
          const item = row.original;
          if (!item.contentName) {
            return <span className="text-xs text-muted-foreground">-</span>;
          }
          return (
            <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
              <Folder className="size-3.5 text-muted-foreground" />
              <span>{item.contentName}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "versionCount",
        header: "Versions",
        meta: { label: "Versions", icon: GitBranch },
        cell: ({ row }) => {
          const count = row.original.versionCount;
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs font-mono font-medium text-foreground">
              <GitBranch className="size-3 text-muted-foreground" />
              v{count > 0 ? count : 1}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        meta: { label: "Created", icon: Calendar },
        cell: ({ row }) => {
          const date = row.original.createdAt ? new Date(row.original.createdAt) : null;
          return (
            <span className="text-xs text-muted-foreground">
              {date ? date.toLocaleDateString() : "N/A"}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useDataTable({
    data,
    columns,
    totalCount,
    resource,
  });

  return (
    <div className="space-y-4">
      {/* Omni-Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, path, content..."
            value={resource.search.globalKeyword || ""}
            onChange={(e) => resource.onSearchChange(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Showing <span className="text-foreground font-semibold">{data.length}</span> of{" "}
          <span className="text-foreground font-semibold">{totalCount}</span> resources
        </div>
      </div>

      {/* Table */}
      <BaseTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        caption="Workspace Resources List"
      />
    </div>
  );
}
