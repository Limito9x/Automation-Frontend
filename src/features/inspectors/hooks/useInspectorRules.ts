import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInspectorRules, createInspectorRule, getGetInspectorRulesQueryKey } from "@/gen/endpoints/default/default";
import { updateInspectorRule, deleteInspectorRule } from "@/gen/endpoints/inspector-rules/inspector-rules";
import type { CreateInspectorRuleCommand, UpdateInspectorRuleCommand, InspectorRuleDto } from "@/gen/model";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useInspectorRules(projectId: string) {
    return useQuery({
        queryKey: getGetInspectorRulesQueryKey(projectId),
        queryFn: () => getInspectorRules(projectId) as unknown as Promise<InspectorRuleDto[]>,
        enabled: !!projectId,
    });
}

export function useInspectorRuleMutations(projectId: string) {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const createMutation = useMutation({
        mutationFn: (data: CreateInspectorRuleCommand) => createInspectorRule(projectId, data),
        onSuccess: () => {
            toast.success(t("inspectors.ruleCreated", { defaultValue: "Inspector rule created successfully" }));
            queryClient.invalidateQueries({ queryKey: getGetInspectorRulesQueryKey(projectId) });
        },
        onError: (err: any) => {
            const errorMsg = err?.response?.data?.message || err?.message || "Failed to create inspector rule";
            toast.error(t("inspectors.ruleCreateFailed", { defaultValue: errorMsg }));
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateInspectorRuleCommand }) => updateInspectorRule(id, data),
        onSuccess: () => {
            toast.success(t("inspectors.ruleUpdated", { defaultValue: "Inspector rule updated successfully" }));
            queryClient.invalidateQueries({ queryKey: getGetInspectorRulesQueryKey(projectId) });
        },
        onError: (err: any) => {
            const errorMsg = err?.response?.data?.message || err?.message || "Failed to update inspector rule";
            toast.error(t("inspectors.ruleUpdateFailed", { defaultValue: errorMsg }));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteInspectorRule(id),
        onSuccess: () => {
            toast.success(t("inspectors.ruleDeleted", { defaultValue: "Inspector rule deleted successfully" }));
            queryClient.invalidateQueries({ queryKey: getGetInspectorRulesQueryKey(projectId) });
        },
        onError: (err: any) => {
            const errorMsg = err?.response?.data?.message || err?.message || "Failed to delete inspector rule";
            toast.error(t("inspectors.ruleDeleteFailed", { defaultValue: errorMsg }));
        }
    });

    return {
        createRule: createMutation.mutateAsync,
        isCreatingRule: createMutation.isPending,

        updateRule: updateMutation.mutateAsync,
        isUpdatingRule: updateMutation.isPending,

        deleteRule: deleteMutation.mutateAsync,
        isDeletingRule: deleteMutation.isPending,
    };
}
