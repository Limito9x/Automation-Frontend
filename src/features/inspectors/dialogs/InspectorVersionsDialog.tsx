import { useState, useRef } from "react";
import type { InspectorDto, InspectorVersionDto } from "@/gen/model";
import { BaseDialog } from "@/components/custom-ui/overlays/dialog/BaseDialog";
import { useInspector } from "../hooks/useInspectors";
import { useInspectorVersions } from "../hooks/useInspectorVersions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, CheckCircle, FileCode, Check, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";

interface InspectorVersionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    inspectorId: string;
}

export function InspectorVersionsDialog({ open, onOpenChange, projectId, inspectorId }: InspectorVersionsDialogProps) {
    const { t } = useTranslation();
    const { data: inspectorData, isLoading } = useInspector(inspectorId);
    const { createVersion, isCreatingVersion, publishVersion, isPublishingVersion } = useInspectorVersions(inspectorId, projectId);

    const inspector = inspectorData as InspectorDto | undefined;
    const versions = (inspector?.versions || []) as unknown as InspectorVersionDto[];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [entryPoint, setEntryPoint] = useState<string>("main.py");
    const [versionNumber, setVersionNumber] = useState<string>("1.0.0");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.name.endsWith(".py")) {
                setEntryPoint(file.name);
            }
        }
    };

    const handleUploadVersion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !entryPoint.trim()) return;

        try {
            await createVersion({
                file: selectedFile,
                entryPoint: entryPoint.trim(),
            });
            // Reset
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch {
            // Handled in hook
        }
    };

    const handlePublish = async (versionId: string) => {
        try {
            await publishVersion(versionId);
        } catch {
            // Handled in hook
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={t("inspectors.versionsTitle", { defaultValue: `Manage Script Versions — ${inspector?.name || ""}` })}
            description={t("inspectors.versionsDesc", { defaultValue: "Upload validation scripts (.py / .zip) and publish active versions." })}
            size="2xl"
        >
            <div className="space-y-6 py-2">
                {/* Upload Form Card */}
                <div className="p-4 rounded-lg border bg-muted/20 space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-primary" />
                        {t("inspectors.uploadNewVersion", { defaultValue: "Upload New Script Version" })}
                    </h4>

                    <form onSubmit={handleUploadVersion} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <Label htmlFor="scriptFile" className="text-xs">
                                    {t("inspectors.scriptFile", { defaultValue: "Script (.py / .zip)" })} *
                                </Label>
                                <input
                                    id="scriptFile"
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".py,.zip"
                                    className="hidden"
                                    required
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
                                        {selectedFile ? t("common.changeFile", { defaultValue: "Change" }) : t("common.chooseFile", { defaultValue: "Choose Script" })}
                                    </Button>
                                    <span className="text-xs text-muted-foreground truncate font-mono">
                                        {selectedFile ? selectedFile.name : t("inspectors.noFileSelected", { defaultValue: "No file" })}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="versionNumber" className="text-xs">
                                    {t("inspectors.versionNumber", { defaultValue: "Version" })}
                                </Label>
                                <Input
                                    id="versionNumber"
                                    value={versionNumber}
                                    onChange={(e) => setVersionNumber(e.target.value)}
                                    placeholder="1.0.0"
                                    className="h-8 text-xs font-mono mt-1"
                                />
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

                        <div className="flex justify-end pt-1">
                            <Button
                                type="submit"
                                size="sm"
                                isDisabled={isCreatingVersion || !selectedFile || !entryPoint.trim()}
                            >
                                {isCreatingVersion ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                        {t("inspectors.uploadingScript", { defaultValue: "Uploading & Linking..." })}
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                                        {t("inspectors.uploadVersionButton", { defaultValue: "Create Version" })}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Versions List Table */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        <span>{t("inspectors.versionHistory", { defaultValue: "Version History" })}</span>
                        <span className="text-xs font-normal">
                            {versions.length} {t("inspectors.versionsCount", { defaultValue: "versions" })}
                        </span>
                    </h4>

                    {isLoading ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                            <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin text-primary" />
                            {t("common.loading", { defaultValue: "Loading versions..." })}
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-card">
                            {t("inspectors.noVersionsYet", { defaultValue: "No script versions uploaded yet. Upload your first version above." })}
                        </div>
                    ) : (
                        <div className="border rounded-md divide-y divide-border overflow-hidden">
                            {versions.map((ver) => (
                                <div
                                    key={ver.id}
                                    className={`p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${ver.isPublished ? "bg-primary/5 font-medium" : "hover:bg-muted/30"
                                        }`}
                                >
                                    <div className="space-y-1.5 min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={ver.isPublished ? "default" : "outline"} className="font-mono text-xs">
                                                v{ver.version}
                                            </Badge>
                                            <span className="font-mono text-foreground font-semibold flex items-center gap-1">
                                                <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                                                {ver.entryPoint}
                                            </span>
                                            {ver.isPublished && (
                                                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] py-0">
                                                    <Check className="w-3 h-3 mr-0.5" />
                                                    {t("inspectors.activePublished", { defaultValue: "Published / Active" })}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                                            <span className="font-mono truncate" title={ver.scriptHash}>
                                                SHA: {ver.scriptHash ? ver.scriptHash.substring(0, 16) : ""}...
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(ver.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {!ver.isPublished && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-7"
                                                isDisabled={isPublishingVersion}
                                                onPress={() => handlePublish(ver.id)}
                                            >
                                                <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                                                {t("inspectors.publishButton", { defaultValue: "Publish" })}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </BaseDialog>
    );
}
