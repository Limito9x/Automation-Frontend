import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  CheckCircle,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  History,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface CanvasToolbarProps {
  projectId: string;
  pipelineId?: string;
  pipelineName: string;
  isSaving: boolean;
  onOpenRunModal: () => void;
  onOpenHistory?: () => void;
  onValidate: () => void;
  isValidating?: boolean;
}

export function CanvasToolbar({
  projectId,
  pipelineName,
  isSaving,
  onOpenRunModal,
  onOpenHistory,
  onValidate,
  isValidating,
}: CanvasToolbarProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  return (
    <div className="flex h-14 w-full items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur-md px-4 shadow-sm z-30">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/projects/$projectId/pipeline"
          params={{ projectId }}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-muted-foreground")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate max-w-xs md:max-w-md">
            {pipelineName}
          </h1>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono text-muted-foreground">
            Pipeline Editor
          </Badge>
        </div>

        {/* Live Auto-save Cloud Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] text-muted-foreground bg-muted/40 border border-border/40">
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              <span>Saved</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Canvas Actions & Run */}
      <div className="flex items-center gap-2">
        {/* Zoom & Fit View */}
        <div className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40">
          <Button variant="ghost" size="icon" className="h-7 w-7" onPress={() => zoomIn()}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onPress={() => zoomOut()}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onPress={() => fitView({ padding: 0.2 })}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* History / Executions Drawer Trigger */}
        {onOpenHistory && (
          <Button
            variant="outline"
            size="sm"
            onPress={onOpenHistory}
            className="h-8 text-xs gap-1.5"
          >
            <History className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Executions</span>
          </Button>
        )}

        {/* Validate */}
        <Button
          variant="outline"
          size="sm"
          onPress={onValidate}
          isDisabled={isValidating}
          className="h-8 text-xs gap-1.5"
        >
          {isValidating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          )}
          <span className="hidden sm:inline">Validate</span>
        </Button>

        {/* Run Pipeline Button */}
        <Button size="sm" onPress={onOpenRunModal} className="h-8 text-xs gap-1.5 shadow-sm">
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Run Pipeline</span>
        </Button>
      </div>
    </div>
  );
}
