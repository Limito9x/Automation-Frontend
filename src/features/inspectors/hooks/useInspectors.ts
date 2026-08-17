import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInspectors, createInspector, getGetInspectorsQueryKey } from "@/gen/endpoints/default/default";
import { getInspectorById, updateInspector, deleteInspector, getGetInspectorByIdQueryKey } from "@/gen/endpoints/inspectors/inspectors";
import type { CreateInspectorCommand, UpdateInspectorCommand, InspectorDto } from "@/gen/model";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useInspectors(projectId: string) {
    return useQuery({
        queryKey: getGetInspectorsQueryKey(projectId),
        queryFn: () => getInspectors(projectId) as unknown as Promise<InspectorDto[]>,
        enabled: !!projectId,
    });
}

export function useInspector(inspectorId: string) {
    return useQuery({
        queryKey: getGetInspectorByIdQueryKey(inspectorId),
        queryFn: () => getInspectorById(inspectorId) as unknown as Promise<InspectorDto>,
        enabled: !!inspectorId,
    });
}

export function useInspectorMutations(projectId: string) {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const createMutation = useMutation({
        mutationFn: (data: CreateInspectorCommand) => createInspector(projectId, data),
        onSuccess: () => {
            toast.success(t("inspectors.createSuccess", { defaultValue: "Inspector created successfully" }));
            queryClient.invalidateQueries({ queryKey: getGetInspectorsQueryKey(projectId) });
        },
        onError: (err: any) => {
            const errorMsg = err?.response?.data?.message || err?.message || "Failed to create inspector";
            toast.error(t("inspectors.createFailed", { defaultValue: errorMsg }));
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateInspectorCommand }) => updateInspector(id, data),
        onSuccess: (_, variables) => {
            toast.success(t("inspectors.updateSuccess", { defaultValue: "Inspector updated successfully" }));
            queryClient.invalidateQueries({ queryKey: getGetInspectorsQueryKey(projectId) });
            queryClient.invalidateQueries({ queryKey: getGetInspectorByIdQueryKey(variables.id) });
        },
        onError: (err: any) => {
            const errorMsg = err?.response?.data?.message || err?.message || "Failed to update inspector";
            toast.error(t("inspectors.updateFailed", { defaultValue: errorMsg }));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteInspector(id),
        onSuccess: () => {
            toast.success(t("inspectors.deleteSuccess", { defaultValue: "Inspector deleted successfully" }));
            queryClient.invalidateQueries({ queryKey: getGetInspectorsQueryKey(projectId) });
        },
        onError: (err: any) => {
            const errorMsg = err?.response?.data?.message || err?.message || "Failed to delete inspector";
            toast.error(t("inspectors.deleteFailed", { defaultValue: errorMsg }));
        }
    });

    return {
        createInspector: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateInspector: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteInspector: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}


