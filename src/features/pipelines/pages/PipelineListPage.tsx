import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { usePipelines, useCreatePipelineMutation } from "../hooks/usePipelines";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Workflow,
  Plus,
  ArrowRight,
  Boxes,
  Calendar,
  Layers,
  FileCode,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PipelineListPageProps {
  projectId: string;
}

export function PipelineListPage({ projectId }: PipelineListPageProps) {
  const navigate = useNavigate();
  const { data: pipelines = [], isLoading } = usePipelines(projectId);
  const createMutation = useCreatePipelineMutation(projectId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pipelineName, setPipelineName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineName.trim()) return;

    try {
      const created = await createMutation.mutateAsync({
        projectId,
        name: pipelineName.trim(),
      });

      setIsCreateOpen(false);
      setPipelineName("");

      // Navigate straight into the canvas editor!
      if (created?.id) {
        navigate({
          to: "/projects/$projectId/pipeline/$pipelineId",
          params: { projectId, pipelineId: created.id },
        });
      }
    } catch {
      // Handled by toast
    }
  };

  return (
    <div className="p-6 mx-auto space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            Pipelines
          </h1>
          <p className="text-xs text-muted-foreground">
            Design, execute and monitor automated DAG workflows and execution steps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/projects/$projectId/pipeline/nodes/new"
            params={{ projectId }}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 text-xs")}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>New Custom Node</span>
          </Link>

          <Button size="sm" onPress={() => setIsCreateOpen(true)} className="gap-1.5 text-xs shadow-sm">
            <Plus className="h-3.5 w-3.5" />
            <span>New Pipeline</span>
          </Button>
        </div>
      </div>

      {/* Pipeline Cards Grid */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
            Loading pipelines...
          </div>
        ) : pipelines.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner mb-4">
              <Workflow className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No pipelines created yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Create your first visual pipeline to orchestrate multi-step tasks across Python, Blender, and .NET tools.
            </p>
            <Button onPress={() => setIsCreateOpen(true)} size="sm" className="mt-5 gap-1.5 text-xs shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              <span>Create Pipeline</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pipelines.map((p) => (
              <Card
                key={p.id}
                className="group relative flex flex-col justify-between border-border/80 bg-card/80 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md overflow-hidden"
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Workflow className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                          {p.name}
                        </CardTitle>
                        <CardDescription className="text-[11px] font-mono text-muted-foreground truncate">
                          {p.id}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/40">
                    <div className="flex items-center gap-1">
                      <Boxes className="h-3.5 w-3.5 text-primary" />
                      <span>{p.nodeCount} nodes</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{p.edgeCount} connections</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>

                    <Link
                      to="/projects/$projectId/pipeline/$pipelineId"
                      params={{ projectId, pipelineId: p.id }}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "h-7 text-xs gap-1 group-hover:text-primary"
                      )}
                    >
                      <span>Open Canvas</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Create Pipeline Dialog */}
      <Dialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <form onSubmit={handleCreate} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Workflow className="h-4 w-4 text-primary" />
              <span>Create New Pipeline</span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pname" className="text-xs font-semibold">Pipeline Name</Label>
              <Input
                id="pname"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                placeholder="e.g. Asset Ingestion & Inspection Flow"
                autoFocus
                required
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onPress={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isDisabled={!pipelineName.trim() || createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create & Open Canvas"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
