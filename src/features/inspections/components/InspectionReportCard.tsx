import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ChevronDown,
    ChevronRight,
    Copy,
    Check,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Info,
    Layers,
} from "lucide-react";
import { JsonTreeTable } from "@/components/custom-ui/tables/JsonTreeTable";
import type { InspectionDto } from "@/gen/model";

interface InspectionReportCardProps {
    inspection: InspectionDto;
    defaultExpanded?: boolean;
}

export function InspectionReportCard({ inspection, defaultExpanded = false }: InspectionReportCardProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [copied, setCopied] = useState(false);

    const handleCopyJson = () => {
        if (inspection.data) {
            navigator.clipboard.writeText(JSON.stringify(inspection.data, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getStatusBadge = () => {
        switch (inspection.status) {
            case 2: // Passed
                return (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1.5 py-0.5 px-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Passed</span>
                    </Badge>
                );
            case 3: // Warning
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1.5 py-0.5 px-2.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Warning</span>
                    </Badge>
                );
            case 4: // Failed
                return (
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 gap-1.5 py-0.5 px-2.5">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Failed</span>
                    </Badge>
                );
            case 1: // Running
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 gap-1.5 py-0.5 px-2.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Running</span>
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-muted text-muted-foreground gap-1.5 py-0.5 px-2.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                    </Badge>
                );
        }
    };

    const inspectedTimeStr = inspection.inspectedAt
        ? new Date(inspection.inspectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : null;

    return (
        <div className="border border-border/70 bg-card/60 hover:bg-card/90 transition-colors rounded-xl overflow-hidden shadow-xs">
            {/* Header Accordion Card */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-4 cursor-pointer flex flex-col gap-3 select-none"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Expand toggle + Inspector Title + Status */}
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent/40"
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-semibold text-base text-foreground tracking-tight">
                                {inspection.inspectorName || inspection.inspectorKey || "Inspector Report"}
                            </span>
                            {getStatusBadge()}
                            {inspection.executionTimeMs > 0 && (
                                <Badge variant="secondary" className="bg-secondary/60 text-xs font-mono py-0.5 px-2">
                                    {inspection.executionTimeMs} ms
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Right: Version info + Copy JSON */}
                    <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
                        {inspection.version != null && (
                            <Badge variant="outline" className="bg-background/80 text-muted-foreground text-xs font-mono py-1 px-2.5 border-border">
                                <Layers className="w-3 h-3 mr-1.5 text-primary" />
                                Inspector v{inspection.version}
                            </Badge>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            onPress={handleCopyJson}
                            isDisabled={!inspection.data}
                            className="h-8 text-xs gap-1.5 px-2.5 bg-background/80 hover:bg-accent"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Copied" : "Copy JSON"}
                        </Button>
                    </div>
                </div>

                {/* Summary bar row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground bg-accent/20 px-3 py-2 rounded-lg border border-border/40">
                    <div className="flex items-center gap-2 min-w-0">
                        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">
                            {inspection.summaryMessage || "Inspection completed. Check detailed tree table below."}
                        </span>
                    </div>
                    {inspectedTimeStr && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 shrink-0 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{inspectedTimeStr}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapsible Content: JsonTreeTable */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-border/40">
                    <div className="mb-2 mt-1 flex items-center justify-between text-xs text-muted-foreground font-mono">
                        <span className="uppercase tracking-wider font-semibold text-[11px] text-primary/80">
                            Cấu trúc kết quả phân tích (JSON Tree Table)
                        </span>
                        <span className="text-[11px] text-muted-foreground/70">
                            Nhấp để mở rộng / thu gọn các nhánh và bảng đối tượng
                        </span>
                    </div>
                    {inspection.data ? (
                        <JsonTreeTable data={inspection.data} />
                    ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground bg-accent/10 rounded-lg border border-dashed border-border/60">
                            Không có dữ liệu chi tiết cho đợt kiểm tra này.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
