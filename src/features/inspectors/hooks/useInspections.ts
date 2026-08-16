import { useGetInspectionsByResourceVersion, useTriggerInspection as useOrvalTriggerInspection } from "@/gen/endpoints/inspections/inspections";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { TriggerInspectionCommand, InspectionDto } from "@/gen/model";

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

export function useTriggerInspection(resourceVersionId?: string) {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const mutation = useOrvalTriggerInspection({
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
        triggerInspection: (command: TriggerInspectionCommand) => mutation.mutateAsync({ data: command }),
        isTriggering: mutation.isPending,
    };
}
