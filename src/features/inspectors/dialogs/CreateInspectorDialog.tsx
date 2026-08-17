import { useState, useRef } from "react";
import { BaseDialog } from "@/components/custom-ui/overlays/dialog/BaseDialog";
import { useInspectorMutations } from "../hooks/useInspectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadAssetFlow, calculateFileHash } from "@/lib/upload-utils";
import { Loader2, Plus, Cpu, Terminal, FileCode, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface CreateInspectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
}

export function CreateInspectorDialog({ open, onOpenChange, projectId }: CreateInspectorDialogProps) {
    const { t } = useTranslation();
    const { createInspector, isCreating } = useInspectorMutations(projectId);

    const [name, setName] = useState("");
    const [executorKey, setExecutorKey] = useState("blender");
    const [description, setDescription] = useState("");
    const [entryPoint, setEntryPoint] = useState("main.py");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.name.endsWith(".py")) {
                setEntryPoint(file.name);
            }
        }
    };

    const handleReset = () => {
        setName("");
        setDescription("");
        setEntryPoint("main.py");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !selectedFile || !entryPoint.trim()) return;

        setIsUploading(true);
        try {
            // 1. Tính hash và upload script file độc lập tại component
            const scriptHash = await calculateFileHash(selectedFile);
            const assetId = await uploadAssetFlow(selectedFile);

            // 2. Gửi dữ liệu hoàn chỉnh vào mutation API
            await createInspector({
                name: name.trim(),
                executorKey,
                entryPoint: entryPoint.trim(),
                scriptHash,
                assetId,
                description: description.trim() || undefined,
            });

            handleReset();
            onOpenChange(false);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err?.message || "Failed to upload script or create inspector";
            toast.error(errorMsg);
        } finally {
            setIsUploading(false);
        }
    };

    const isLoading = isCreating || isUploading;

    return (
        <BaseDialog
            open={open}
            onOpenChange={(val) => {
                if (!val) handleReset();
                onOpenChange(val);
            }}
            title={t("inspectors.createTitle", { defaultValue: "Create New Inspector" })}
            description={t("inspectors.createDesc", { defaultValue: "Define an automated validator and upload its initial script." })}
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

                <div className="p-3 rounded-lg border bg-muted/30 space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-primary" />
                        {t("inspectors.scriptSection", { defaultValue: "Script Package" })} *
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="scriptFile" className="text-xs">
                                {t("inspectors.scriptFile", { defaultValue: "Script File (.py / .zip)" })} *
                            </Label>
                            <input
                                id="scriptFile"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".py,.zip"
                                className="hidden"
                            />
                            <div className="flex items-center gap-2 mt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs shrink-0"
                                    onPress={() => fileInputRef.current?.click()}
                                >
                                    <FileCode className="w-3.5 h-3.5 mr-1" />
                                    {selectedFile
                                        ? t("common.changeFile", { defaultValue: "Change" })
                                        : t("common.chooseFile", { defaultValue: "Choose File" })}
                                </Button>
                                <span className="text-xs text-muted-foreground truncate font-mono">
                                    {selectedFile ? selectedFile.name : t("inspectors.noFileSelected", { defaultValue: "No file selected" })}
                                </span>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="entryPoint" className="text-xs">
                                {t("inspectors.entryPoint", { defaultValue: "Entry Point" })} *
                            </Label>
                            <Input
                                id="entryPoint"
                                value={entryPoint}
                                onChange={(e) => setEntryPoint(e.target.value)}
                                placeholder="main.py"
                                className="h-8 text-xs font-mono mt-1"
                                required
                            />
                        </div>
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
                    <Button variant="outline" type="button" onPress={() => onOpenChange(false)} isDisabled={isLoading}>
                        {t("common.cancel", { defaultValue: "Cancel" })}
                    </Button>
                    <Button type="submit" isDisabled={isLoading || !name.trim() || !selectedFile || !entryPoint.trim()}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                {isUploading
                                    ? t("inspectors.uploadingScript", { defaultValue: "Uploading Script..." })
                                    : t("common.creating", { defaultValue: "Creating..." })}
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

