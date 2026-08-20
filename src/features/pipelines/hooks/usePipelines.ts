import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNodePalette,
  getGetNodePaletteQueryKey,
  parseScriptSchema,
  createCustomNode,
  updateCustomNode,
  deleteCustomNode,
  getCustomNodeById,
  getGetCustomNodeByIdQueryKey,
} from "@/gen/endpoints/pipeline-nodes/pipeline-nodes";
import type {
  CreateCustomNodeCommand,
  UpdateCustomNodeRequest,
  ParseScriptCommand,
  NodePaletteItemDto,
  ParseScriptResponseDto,
} from "@/gen/model";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import {
  getPipelines,
  getGetPipelinesQueryKey,
  createPipeline,
} from "@/gen/endpoints/pipelines/pipelines";
import type {
  CreatePipelineCommand,
  PipelineSummaryDto,
} from "@/gen/model";

export function usePipelines(projectId?: string) {
  return useQuery({
    queryKey: getGetPipelinesQueryKey(projectId ? { projectId } : undefined),
    queryFn: () =>
      getPipelines(projectId ? { projectId } : undefined) as unknown as Promise<
        PipelineSummaryDto[]
      >,
    enabled: !!projectId,
  });
}

export function useCreatePipelineMutation(projectId?: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreatePipelineCommand) =>
      createPipeline(data) as unknown as Promise<PipelineSummaryDto>,
    onSuccess: () => {
      toast.success(
        t("pipelines.createSuccess", { defaultValue: "Pipeline created successfully" })
      );
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: getGetPipelinesQueryKey({ projectId }),
        });
      }
    },
    onError: (err: any) => {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Failed to create pipeline";
      toast.error(t("pipelines.createFailed", { defaultValue: errorMsg }));
    },
  });
}

export function useNodePalette(projectId?: string) {
  return useQuery({
    queryKey: getGetNodePaletteQueryKey(projectId ? { projectId } : undefined),
    queryFn: () =>
      getNodePalette(projectId ? { projectId } : undefined) as unknown as Promise<
        NodePaletteItemDto[]
      >,
    enabled: !!projectId,
  });
}

export function usePipelineNodeMutations(projectId?: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const parseScriptMutation = useMutation({
    mutationFn: (data: ParseScriptCommand) =>
      parseScriptSchema(data) as unknown as Promise<ParseScriptResponseDto>,
    onError: (err: any) => {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Failed to parse script schema";
      toast.error(t("pipelines.parseFailed", { defaultValue: errorMsg }));
    },
  });

  const createNodeMutation = useMutation({
    mutationFn: (data: CreateCustomNodeCommand) => createCustomNode(data),
    onSuccess: () => {
      toast.success(
        t("pipelines.createNodeSuccess", { defaultValue: "Custom node created successfully" })
      );
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: getGetNodePaletteQueryKey({ projectId }),
        });
      }
    },
    onError: (err: any) => {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Failed to create custom node";
      toast.error(t("pipelines.createNodeFailed", { defaultValue: errorMsg }));
    },
  });

  const updateNodeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomNodeRequest }) =>
      updateCustomNode(id, data),
    onSuccess: () => {
      toast.success(
        t("pipelines.updateNodeSuccess", { defaultValue: "Custom node updated successfully" })
      );
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: getGetNodePaletteQueryKey({ projectId }),
        });
      }
    },
    onError: (err: any) => {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Failed to update custom node";
      toast.error(t("pipelines.updateNodeFailed", { defaultValue: errorMsg }));
    },
  });

  const deleteNodeMutation = useMutation({
    mutationFn: (id: string) => deleteCustomNode(id),
    onSuccess: () => {
      toast.success(
        t("pipelines.deleteNodeSuccess", { defaultValue: "Custom node deleted successfully" })
      );
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: getGetNodePaletteQueryKey({ projectId }),
        });
      }
    },
    onError: (err: any) => {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Failed to delete node";
      toast.error(t("pipelines.deleteNodeFailed", { defaultValue: errorMsg }));
    },
  });

  return {
    parseScript: parseScriptMutation.mutateAsync,
    isParsingScript: parseScriptMutation.isPending,

    createNode: createNodeMutation.mutateAsync,
    isCreatingNode: createNodeMutation.isPending,

    updateNode: updateNodeMutation.mutateAsync,
    isUpdatingNode: updateNodeMutation.isPending,

    deleteNode: deleteNodeMutation.mutateAsync,
    isDeletingNode: deleteNodeMutation.isPending,
  };
}

export function useCustomNodeById(id?: string) {
  return useQuery({
    queryKey: id ? getGetCustomNodeByIdQueryKey(id) : ["nodes", "custom"],
    queryFn: () => getCustomNodeById(id!),
    enabled: !!id,
  });
}
