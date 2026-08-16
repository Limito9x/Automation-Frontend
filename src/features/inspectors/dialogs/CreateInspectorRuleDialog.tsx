import { useState } from "react";
import { BaseDialog } from "@/components/custom-ui/overlays/dialog/BaseDialog";
import { useInspectorRuleMutations } from "../hooks/useInspectorRules";
import { useInspectors } from "../hooks/useInspectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreateInspectorRuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
}

export function CreateInspectorRuleDialog({ open, onOpenChange, projectId }: CreateInspectorRuleDialogProps) {
    const { t } = useTranslation();
    const { createRule, isCreatingRule } = useInspectorRuleMutations(projectId);
    const { data: inspectorsData } = useInspectors(projectId);

    const inspectors = Array.isArray(inspectorsData) ? inspectorsData : [];

    const [inspectorId, setInspectorId] = useState<string>("");
    const [platformExtensionId, setPlatformExtensionId] = useState<string>("");
    const [isEnabled, setIsEnabled] = useState<boolean>(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inspectorId) return;

        try {
            await createRule({
                inspectorId,
                platformExtensionId: platformExtensionId.trim() || inspectorId,
                enabled: isEnabled,
            });
            // Reset
            setPlatformExtensionId("");
            setInspectorId("");
            onOpenChange(false);
        } catch {
            // Handled in hook
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={t("inspectors.createRuleTitle", { defaultValue: "Create Automation Rule" })}
            description={t("inspectors.createRuleDesc", { defaultValue: "Automatically trigger inspections when files with specific extensions are uploaded." })}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <div>
                    <Label htmlFor="selectInspector" className="text-xs">
                        {t("inspectors.selectInspector", { defaultValue: "Inspector" })} *
                    </Label>
                    <select
                        id="selectInspector"
                        value={inspectorId}
                        onChange={(e) => setInspectorId(e.target.value)}
                        className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background mt-1"
                        required
                    >
                        <option value="">{t("inspectors.chooseInspectorPlaceholder", { defaultValue: "-- Select an Inspector --" })}</option>
                        {inspectors.map((ins) => (
                            <option key={ins.id} value={ins.id}>
                                {ins.name} ({ins.executorKey} - {ins.key})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="ruleExtensionId" className="text-xs">
                        {t("inspectors.platformExtensionId", { defaultValue: "Platform Extension ID (Optional)" })}
                    </Label>
                    <Input
                        id="ruleExtensionId"
                        value={platformExtensionId}
                        onChange={(e) => setPlatformExtensionId(e.target.value)}
                        placeholder="Leave blank or enter extension ID"
                        className="h-8 text-xs font-mono mt-1"
                    />
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                        isSelected={isEnabled}
                        onChange={setIsEnabled}
                    >
                        <span className="text-xs">{t("inspectors.enableRule", { defaultValue: "Enable rule immediately" })}</span>
                    </Checkbox>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button variant="outline" type="button" onPress={() => onOpenChange(false)} isDisabled={isCreatingRule}>
                        {t("common.cancel", { defaultValue: "Cancel" })}
                    </Button>
                    <Button type="submit" isDisabled={isCreatingRule || !inspectorId}>
                        {isCreatingRule ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                {t("common.creating", { defaultValue: "Creating..." })}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-1.5 text-yellow-400" />
                                {t("inspectors.createRuleButton", { defaultValue: "Create Rule" })}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </BaseDialog>
    );
}
