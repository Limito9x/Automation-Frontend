import { useState } from "react";
import { BaseDialog } from "@/components/custom-ui/overlays/dialog/BaseDialog";
import { useInspectorMutations } from "../hooks/useInspectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Cpu, Terminal } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreateInspectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
}

export function CreateInspectorDialog({ open, onOpenChange, projectId }: CreateInspectorDialogProps) {
    const { t } = useTranslation();
    const { createInspector, isCreating } = useInspectorMutations(projectId);

    const [key, setKey] = useState("");
    const [name, setName] = useState("");
    const [executorKey, setExecutorKey] = useState("blender");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!key.trim() || !name.trim()) return;

        try {
            await createInspector({
                key: key.trim().toLowerCase(),
                name: name.trim(),
                executorKey,
                description: description.trim() || undefined,
            });
            // Reset form
            setKey("");
            setName("");
            setDescription("");
            onOpenChange(false);
        } catch {
            // Error handled in hook
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={t("inspectors.createTitle", { defaultValue: "Create New Inspector" })}
            description={t("inspectors.createDesc", { defaultValue: "Define an automated validator script runner for this project." })}
            size="lg"
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
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                executorKey === "blender"
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
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                executorKey === "python"
                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                    : "border-border hover:bg-muted/50 text-muted-foreground"
                            }`}
                        >
                            <Terminal className="w-4 h-4 text-blue-500" />
                            <span>Standard Python</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="inspectorKey" className="text-xs">
                            {t("inspectors.key", { defaultValue: "Unique Key" })} *
                        </Label>
                        <Input
                            id="inspectorKey"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="e.g. mesh-polycount-check"
                            className="h-8 text-xs font-mono mt-1"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="inspectorName" className="text-xs">
                            {t("inspectors.name", { defaultValue: "Display Name" })} *
                        </Label>
                        <Input
                            id="inspectorName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Mesh Polycount Inspector"
                            className="h-8 text-xs mt-1"
                            required
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="inspectorDesc" className="text-xs">
                        {t("inspectors.description", { defaultValue: "Description (Optional)" })}
                    </Label>
                    <Textarea
                        id="inspectorDesc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this inspector checks (e.g. checks vertex count, UV channels, texture size)..."
                        className="text-xs mt-1 min-h-[70px]"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button variant="outline" type="button" onPress={() => onOpenChange(false)} isDisabled={isCreating}>
                        {t("common.cancel", { defaultValue: "Cancel" })}
                    </Button>
                    <Button type="submit" isDisabled={isCreating || !key.trim() || !name.trim()}>
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                {t("common.creating", { defaultValue: "Creating..." })}
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-1.5" />
                                {t("inspectors.createButton", { defaultValue: "Create Inspector" })}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </BaseDialog>
    );
}
