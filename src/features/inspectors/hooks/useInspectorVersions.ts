import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInspectorVersion, publishInspectorVersion, getGetInspectorByIdQueryKey } from "@/gen/endpoints/inspectors/inspectors";
import { getGetInspectorsQueryKey } from "@/gen/endpoints/default/default";
import { uploadAssetFlow, calculateFileHash } from "@/lib/upload-utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useInspectorVersions(inspectorId: string, projectId?: string) {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const [isUploading, setIsUploading] = useState(false);

    const createVersionMutation = useMutation({
        mutationFn: async ({ file, entryPoint, version = "1.0.0" }: { file: File; entryPoint: string; version?: string }) => {
            setIsUploading(true);
            try {
                // 1. Calculate file SHA256 hash
                const scriptHash = await calculateFileHash(file);

                // 2. Upload script file to storage via AssetSlot
                const assetId = await uploadAssetFlow(file);

                // 3. Create Inspector Version
                const result = await createInspectorVersion(inspectorId, {
                    inspectorId,
                    version,
                    entryPoint: entryPoint.trim(),
                    scriptHash,
                    assetId,
                    originalFileName: file.name,
                    isPublished: true,
                });

                return result;
            } finally {
                setIsUploading(false);
            }
        },
        onSuccess: () => {
            toast.success(t("inspectors.versionCreated", { defaultValue: "Inspector version uploaded successfully" }));
            queryClient.invalidateQueries({ queryKey: getGetInspectorByIdQueryKey(inspectorId) });
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: getGetInspectorsQueryKey(projectId) });
            }
        },
        onError: (err: any) => {
            const errorMsg = err?.response?.data?.message || err?.message || "Failed to create inspector version";
            toast.error(t("inspectors.versionCreateFailed", { defaultValue: errorMsg }));
        }
    });

    const publishVersionMutation = useMutation({
        mutationFn: async (versionId: string) => {
            return await publishInspectorVersion(inspectorId, versionId, { isPublished: true });
        },
        onSuccess: () => {
            toast.success(t("inspectors.versionPublished", { defaultValue: "Version published successfully" }));
            queryClient.invalidateQueries({ queryKey: getGetInspectorByIdQueryKey(inspectorId) });
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: getGetInspectorsQueryKey(projectId) });
            }
        },
        onError: (err: any) => {
            const errorMsg = err?.response?.data?.message || err?.message || "Failed to publish version";
            toast.error(t("inspectors.publishFailed", { defaultValue: errorMsg }));
        }
    });

    return {
        createVersion: createVersionMutation.mutateAsync,
        isCreatingVersion: createVersionMutation.isPending || isUploading,

        publishVersion: publishVersionMutation.mutateAsync,
        isPublishingVersion: publishVersionMutation.isPending,
    };
}
