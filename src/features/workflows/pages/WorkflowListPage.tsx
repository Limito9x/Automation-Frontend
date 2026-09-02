import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  useWorkflows,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
} from "../hooks/useWorkflows";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  ArrowRight,
  Zap,
  MoreVertical,
  Trash2,
  Layers,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { cn } from "@/lib/utils";
import type { WorkflowSummaryDto } from "@/gen/model";

interface WorkflowListPageProps {
  projectId: string;
}

export function WorkflowListPage({ projectId }: WorkflowListPageProps) {
  const navigate = useNavigate();
  const { data: workflows = [], isLoading } = useWorkflows(projectId);
  const createMutation = useCreateWorkflowMutation(projectId);
  const updateMutation = useUpdateWorkflowMutation(projectId);
  const deleteMutation = useDeleteWorkflowMutation(projectId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workflowToDelete, setWorkflowToDelete] = useState<WorkflowSummaryDto | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const created = await createMutation.mutateAsync({
        projectId,
        name: name.trim(),
        description: description.trim() || null,
      });

      setIsCreateOpen(false);
      setName("");
      setDescription("");

      if (created?.id) {
        navigate({
          to: "/projects/$projectId/workflows/$workflowId",
          params: { projectId, workflowId: created.id },
        });
      }
    } catch {}
  };

  const handleToggleActive = async (wf: WorkflowSummaryDto, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateMutation.mutateAsync({
      id: wf.id,
      data: {
        name: wf.name,
        description: wf.description,
        isActive: !wf.isActive,
      },
    });
  };

  const handleDelete = async () => {
    if (!workflowToDelete) return;
    try {
      await deleteMutation.mutateAsync(workflowToDelete.id);
      setWorkflowToDelete(null);
    } catch {}
  };

  return (
    <div className="p-6 mx-auto space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-500" />
            Workflows
          </h1>
          <p className="text-xs text-muted-foreground">
            Automate actions on workspace events (e.g. file upload, version update) using event-driven graphs.
          </p>
        </div>

        <Button
          onPress={() => setIsCreateOpen(true)}
          className="gap-2 shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Grid of Workflows */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-border/60 bg-card/40 animate-pulse"
            />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl text-center space-y-4 bg-muted/10">
          <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
            <Zap className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-semibold text-base">No workflows yet</h3>
            <p className="text-xs text-muted-foreground">
              Create an automated workflow to react whenever 3D models or resources are uploaded to your workspaces.
            </p>
          </div>
          <Button onPress={() => setIsCreateOpen(true)} className="gap-2 text-xs">
            <Plus className="h-4 w-4" />
            Create First Workflow
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => (
            <Card
              key={wf.id}
              onClick={() =>
                navigate({
                  to: "/projects/$projectId/workflows/$workflowId",
                  params: { projectId, workflowId: wf.id },
                })
              }
              className="group cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-md relative overflow-hidden bg-card flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 overflow-hidden">
                    <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors truncate">
                      {wf.name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 min-h-[32px]">
                      {wf.description || "No description provided."}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleToggleActive(wf, e)}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors",
                        wf.isActive
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      )}
                    >
                      {wf.isActive ? "Active" : "Paused"}
                    </button>

                    <MenuTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      <Popover className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                        <Menu className="outline-none">
                          <MenuItem
                            onAction={() => setWorkflowToDelete(wf)}
                            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-destructive outline-none hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Workflow
                          </MenuItem>
                        </Menu>
                      </Popover>
                    </MenuTrigger>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 text-xs border-t border-border/40 mt-2 bg-muted/10 py-3 flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Layers className="h-3 w-3" />
                    <span>{wf.nodesCount} nodes</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(wf.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link
                  to="/projects/$projectId/workflows/$workflowId"
                  params={{ projectId, workflowId: wf.id }}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-7 text-xs gap-1 group-hover:text-primary"
                  )}
                >
                  <span>Open Canvas</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <form onSubmit={handleCreate} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Zap className="h-4 w-4 text-purple-500" />
              <span>Create New Workflow</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Set up a new workflow with automatic event listening and pipeline execution steps.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="wname" className="text-xs font-semibold">Workflow Name</Label>
              <Input
                id="wname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Auto Texture Bake on Model Upload"
                autoFocus
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wdesc" className="text-xs font-semibold">Description (Optional)</Label>
              <Input
                id="wdesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short explanation of the automated task..."
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onPress={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isDisabled={!name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create & Open Canvas"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!workflowToDelete}
        onOpenChange={(open) => !open && setWorkflowToDelete(null)}
      >
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-destructive">
              <Trash2 className="h-4 w-4" />
              <span>Delete Workflow</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete workflow{" "}
              <span className="font-semibold text-foreground">
                {workflowToDelete?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onPress={() => setWorkflowToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onPress={handleDelete}
              isDisabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
