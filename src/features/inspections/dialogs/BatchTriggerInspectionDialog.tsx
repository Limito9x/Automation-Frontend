import { useState } from "react";
import { BaseDialog } from "@/components/custom-ui/overlays/dialog/BaseDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useInspectors } from "@/features/inspectors/hooks/useInspectors";
import { useTriggerInspection } from "@/features/inspectors/hooks/useInspections";
import { Play, Loader2, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BatchTriggerInspectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    selectedResourceVersionIds: string[];
    onSuccess?: () => void;
}

export function BatchTriggerInspectionDialog({
    open,
    onOpenChange,
    projectId,
    selectedResourceVersionIds,
    onSuccess,
}: BatchTriggerInspectionDialogProps) {
    const { t } = useTranslation();
    const { data: inspectorsData } = useInspectors(projectId);
    const { triggerInspection, isTriggering } = useTriggerInspection();

    const inspectors = Array.isArray(inspectorsData) ? inspectorsData : [];
    const [selectedInspectorId, setSelectedInspectorId] = useState<string>("");

    const handleBatchRun = async () => {
        if (selectedResourceVersionIds.length === 0) return;
        try {
            await triggerInspection({
                projectId,
                resourceVersionIds: selectedResourceVersionIds,
                specificInspectorId: selectedInspectorId || undefined,
            });
            onOpenChange(false);
            setSelectedInspectorId("");
            onSuccess?.();
        } catch {
            // Handled by hook toast
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={t("inspections.batchTriggerTitle", { defaultValue: "Kích hoạt Kiểm tra Hàng loạt (Batch Run Inspection)" })}
            description={t("inspections.batchTriggerDesc", {
                defaultValue: "Chọn Inspector để thực thi đồng thời trên các tài nguyên đã chọn.",
            })}
            size="md"
        >
            <div className="space-y-4 py-2">
                {/* Summary Box */}
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Số lượng tài nguyên được chọn:</span>
                    </div>
                    <Badge variant="default" className="font-mono text-xs font-semibold py-0.5 px-2.5">
                        {selectedResourceVersionIds.length} Resources
                    </Badge>
                </div>

                {/* Inspector Select */}
                <div className="space-y-1.5">
                    <Label htmlFor="batchSelectInspector" className="text-xs font-medium">
                        {t("inspections.selectInspectorLabel", { defaultValue: "Chọn Inspector muốn chạy:" })}
                    </Label>
                    <select
                        id="batchSelectInspector"
                        value={selectedInspectorId}
                        onChange={(e) => setSelectedInspectorId(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
                    >
                        <option value="">
                            {t("inspections.allMatchingRules", { defaultValue: "-- Tự động theo Automation Rules --" })}
                        </option>
                        {inspectors.map((inspector) => (
                            <option key={inspector.id} value={inspector.id}>
                                {inspector.name} ({inspector.executorKey})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button
                        variant="outline"
                        type="button"
                        onPress={() => onOpenChange(false)}
                        isDisabled={isTriggering}
                    >
                        {t("common.cancel", { defaultValue: "Hủy" })}
                    </Button>
                    <Button
                        onPress={handleBatchRun}
                        isDisabled={isTriggering || selectedResourceVersionIds.length === 0}
                        className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        {isTriggering ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                {t("inspections.dispatchingBatch", { defaultValue: "Đang gửi tác vụ..." })}
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-1.5 fill-current" />
                                {t("inspections.runNow", { defaultValue: "Kích hoạt kiểm tra" })}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </BaseDialog>
    );
}
