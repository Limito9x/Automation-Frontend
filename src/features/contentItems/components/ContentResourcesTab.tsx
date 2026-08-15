import { useGetResourcesByContent, useAssignResourcesContent } from "@/features/workspaces/hooks/useWorkspaceResources";
import { FileCode, GitBranch, HardDrive, Unlink, Loader2, FolderTree, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ContentResourcesTabProps {
  contentId: string;
}

export function ContentResourcesTab({ contentId }: ContentResourcesTabProps) {
  const { data: resources, isLoading, refetch } = useGetResourcesByContent(contentId);
  const assignMutation = useAssignResourcesContent();

  const handleUnlink = (resourceId: string, resourceName: string) => {
    assignMutation.mutate(
      {
        data: {
          resourceIds: [resourceId],
          contentId: null,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Unlinked "${resourceName}" from this content.`);
          refetch();
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to unlink resource.");
        },
      }
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-xs">Loading linked resources...</p>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl bg-card/50 space-y-3">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Layers className="size-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-sm text-foreground">No resources assigned</h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            You can assign project workspace files (.blend, .fbx, textures...) to this content item from the Workspace Resources page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Linked Workspace Resources ({resources.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {resources.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileCode className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {item.displayName}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono font-medium text-foreground">
                    <GitBranch className="size-2.5 text-muted-foreground" />
                    v{item.latestVersionNo || 1}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1 truncate max-w-xs">
                    <FolderTree className="size-3 text-muted-foreground" />
                    {item.workspaceName} / {item.relativePath}
                  </span>
                  {item.latestSizeBytes > 0 && (
                    <span className="flex items-center gap-1 shrink-0">
                      <HardDrive className="size-3 text-muted-foreground" />
                      {formatBytes(item.latestSizeBytes)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              isDisabled={assignMutation.isPending}
              onClick={() => handleUnlink(item.id, item.displayName)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 text-xs gap-1.5 shrink-0"
            >
              <Unlink className="size-3.5" />
              Unlink
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
