import { useState, useEffect } from "react";
import type { InspectorDto } from "@/gen/model";
import { BaseDialog } from "@/components/custom-ui/overlays/dialog/BaseDialog";
import { useInspectorMutations } from "../hooks/useInspectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Cpu, Terminal } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UpdateInspectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    inspector: InspectorDto | null;
}

export function UpdateInspectorDialog({ open, onOpenChange, projectId, inspector }: UpdateInspectorDialogProps) {
    const { t } = useTranslation();
    const { updateInspector, isUpdating } = useInspectorMutations(projectId);

    const [name, setName] = useState("");
    const [executorKey, setExecutorKey] = useState("blender");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (inspector) {
            setName(inspector.name);
            setExecutorKey(inspector.executorKey || "blender");
            setDescription(inspector.description || "");
        }
    }, [inspector]);

    if (!inspector) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            await updateInspector({
                id: inspector.id,
                data: {
                    name: name.trim(),
                    description: description.trim() || undefined,
                }
            });
            onOpenChange(false);
        } catch {
            // Error handled in hook
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={t("inspectors.updateTitle", { defaultValue: `Edit Inspector — ${inspector.name}` })}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label className="text-xs font-medium">
                        {t("inspectors.executorType", { defaultValue: "Executor Environment" })}
                    </Label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setExecutorKey("blender")}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${executorKey === "blender"
                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                    : "border-border hover:bg-muted/50 text-muted-foreground"
                                }`}
                        >
                            <Cpu className="w-4 h-4 text-orange-500" />
                            <span>Blender Python</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setExecutorKey("python")}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${executorKey === "python"
                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                    : "border-border hover:bg-muted/50 text-muted-foreground"
                                }`}
                        >
                            <Terminal className="w-4 h-4 text-blue-500" />
                            <span>Standard Python</span>
                        </button>
                    </div>
                </div>

                <div>
                    <Label htmlFor="editInspectorName" className="text-xs">
                        {t("inspectors.name", { defaultValue: "Display Name" })} *
                    </Label>
                    <Input
                        id="editInspectorName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-8 text-xs mt-1"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="editInspectorDesc" className="text-xs">
                        {t("inspectors.description", { defaultValue: "Description" })}
                    </Label>
                    <Textarea
                        id="editInspectorDesc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="text-xs mt-1 min-h-[70px]"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button variant="outline" type="button" onPress={() => onOpenChange(false)} isDisabled={isUpdating}>
                        {t("common.cancel", { defaultValue: "Cancel" })}
                    </Button>
                    <Button type="submit" isDisabled={isUpdating || !name.trim()}>
                        {isUpdating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                {t("common.saving", { defaultValue: "Saving..." })}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-1.5" />
                                {t("common.save", { defaultValue: "Save Changes" })}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </BaseDialog>
    );
}
