import { useState } from "react";
import { BaseDialog } from "@/components/custom-ui/overlays/dialog/BaseDialog";
import { useInspectorRuleMutations } from "../hooks/useInspectorRules";
import { useInspectors } from "../hooks/useInspectors";
import { useExtensions } from "@/features/platforms/hooks/usePlatforms";
import { useContentTypes } from "@/features/contentTypes/hooks/useContentTypes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles, FileCode, Layers, Cpu } from "lucide-react";
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
    const { data: extensionsData } = useExtensions();
    const { data: contentTypesData } = useContentTypes({}, projectId);

    const inspectors = Array.isArray(inspectorsData) ? inspectorsData : [];
    const extensions = Array.isArray(extensionsData) ? extensionsData : [];
    const contentTypes = Array.isArray(contentTypesData) ? contentTypesData : [];

    const [inspectorId, setInspectorId] = useState<string>("");
    const [platformExtensionId, setPlatformExtensionId] = useState<string>("");
    const [contentTypeId, setContentTypeId] = useState<string>("");
    const [isEnabled, setIsEnabled] = useState<boolean>(true);

    const handleReset = () => {
        setInspectorId("");
        setPlatformExtensionId("");
        setContentTypeId("");
        setIsEnabled(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inspectorId || !platformExtensionId) return;

        try {
            await createRule({
                inspectorId,
                platformExtensionId,
                contentTypeId: contentTypeId || undefined,
                enabled: isEnabled,
            });
            handleReset();
            onOpenChange(false);
        } catch {
            // Handled in hook
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={(val) => {
                if (!val) handleReset();
                onOpenChange(val);
            }}
            title={t("inspectors.createRuleTitle", { defaultValue: "Create Automation Rule" })}
            description={t("inspectors.createRuleDesc", { defaultValue: "Automatically trigger inspections when files with specific extensions or content types are synced." })}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                {/* Select Inspector */}
                <div>
                    <Label htmlFor="selectInspector" className="text-xs flex items-center gap-1.5 font-medium">
                        <Cpu className="w-3.5 h-3.5 text-primary" />
                        {t("inspectors.selectInspector", { defaultValue: "Inspector" })} *
                    </Label>
                    <select
                        id="selectInspector"
                        value={inspectorId}
                        onChange={(e) => setInspectorId(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background mt-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                    >
                        <option value="">{t("inspectors.chooseInspectorPlaceholder", { defaultValue: "-- Select Inspector --" })}</option>
                        {inspectors.map((ins) => (
                            <option key={ins.id} value={ins.id}>
                                {ins.name} ({ins.executorKey.toUpperCase()})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Select Extension */}
                <div>
                    <Label htmlFor="selectExtension" className="text-xs flex items-center gap-1.5 font-medium">
                        <FileCode className="w-3.5 h-3.5 text-primary" />
                        {t("inspectors.targetExtension", { defaultValue: "Trigger on File Extension" })} *
                    </Label>
                    <select
                        id="selectExtension"
                        value={platformExtensionId}
                        onChange={(e) => setPlatformExtensionId(e.target.value)}
                        className="w-full h-9 px-3 text-xs font-mono rounded-md border border-input bg-background mt-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                    >
                        <option value="">{t("inspectors.chooseExtensionPlaceholder", { defaultValue: "-- Select File Extension (e.g. .blend, .fbx, .png) --" })}</option>
                        {extensions.map((ext) => (
                            <option key={ext.id} value={ext.id}>
                                {ext.extension}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Optional Content Type */}
                <div>
                    <Label htmlFor="selectContentType" className="text-xs flex items-center gap-1.5 font-medium">
                        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                        {t("inspectors.targetContentType", { defaultValue: "Content Type Scope (Optional)" })}
                    </Label>
                    <select
                        id="selectContentType"
                        value={contentTypeId}
                        onChange={(e) => setContentTypeId(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background mt-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="">{t("inspectors.allContentTypes", { defaultValue: "All Content Types (Global)" })}</option>
                        {contentTypes.map((ct) => (
                            <option key={ct.id} value={ct.id}>
                                {ct.displayName || ct.name || ct.key}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Enable Toggle */}
                <div className="flex items-center gap-2.5 pt-2 border-t">
                    <Switch
                        id="enable-rule-switch"
                        isSelected={isEnabled}
                        onChange={setIsEnabled}
                    />
                    <Label htmlFor="enable-rule-switch" className="text-xs font-medium cursor-pointer">
                        {t("inspectors.enableRule", { defaultValue: "Enable rule immediately" })}
                    </Label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button variant="outline" type="button" onPress={() => onOpenChange(false)} isDisabled={isCreatingRule}>
                        {t("common.cancel", { defaultValue: "Cancel" })}
                    </Button>
                    <Button type="submit" isDisabled={isCreatingRule || !inspectorId || !platformExtensionId}>
                        {isCreatingRule ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                {t("common.creating", { defaultValue: "Creating..." })}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-1.5 text-yellow-400" />
                                {t("inspectors.createRuleButton", { defaultValue: "Create Automation Rule" })}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </BaseDialog>
    );
}

