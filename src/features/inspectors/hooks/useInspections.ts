import {
    useGetInspectionsByResourceVersion,
    useManualTriggerInspection as useOrvalManualTriggerInspection,
} from "@/gen/endpoints/inspections/inspections";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { ManualTriggerInspectionCommand, InspectionDto } from "@/gen/model";

export function useResourceInspections(resourceVersionId: string) {
    return useGetInspectionsByResourceVersion(resourceVersionId, {
        query: {
            enabled: !!resourceVersionId,
            refetchInterval: (query) => {
                // Tự động poll mỗi 2 giây nếu có inspection đang Pending/Running
                const inspections = query.state.data as unknown as InspectionDto[] | undefined;
                const hasPending = inspections?.some((i) => i.status === 0 || i.status === 1);
                return hasPending ? 2000 : false;
            },
        },
    });
}

export function useManualTriggerInspection(resourceVersionId?: string) {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const mutation = useOrvalManualTriggerInspection({
        mutation: {
            onSuccess: () => {
                toast.success(t("inspections.triggerSuccess", { defaultValue: "Inspection job dispatched to agent worker" }));
                if (resourceVersionId) {
                    queryClient.invalidateQueries({
                        queryKey: [`/api/inspections/resource-versions/${resourceVersionId}`],
                    });
                }
            },
            onError: (err: any) => {
                const errorMsg = err?.response?.data?.message || err?.message || "Failed to trigger inspection";
                toast.error(t("inspections.triggerFailed", { defaultValue: errorMsg }));
            },
        },
    });

    return {
        manualTrigger: (command: ManualTriggerInspectionCommand) => mutation.mutateAsync({ data: command }),
        isTriggering: mutation.isPending,
    };
}
