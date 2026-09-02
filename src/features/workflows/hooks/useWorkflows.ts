import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  getWorkflows,
  getGetWorkflowsQueryKey,
  getWorkflowGraph,
  getGetWorkflowGraphQueryKey,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  addWorkflowNode,
  updateWorkflowNode,
  deleteWorkflowNode,
  addWorkflowEdge,
  deleteWorkflowEdge,
  triggerWorkflow,
  getWorkflowExecutions,
  getGetWorkflowExecutionsQueryKey,
  getWorkflowExecution,
  getGetWorkflowExecutionQueryKey,
  getWorkflowNodePalette,
  getGetWorkflowNodePaletteQueryKey,
} from "@/gen/endpoints/workflows/workflows";
import type {
  WorkflowSummaryDto,
  WorkflowGraphDto,
  WorkflowNodeDto,
  WorkflowEdgeDto,
  WorkflowExecutionDto,
  WorkflowNodeExecutionDto,
  WorkflowNodePaletteItemDto,
  CreateWorkflowCommand,
  UpdateWorkflowCommand,
  AddWorkflowNodeCommand,
  UpdateWorkflowNodeCommand,
  AddWorkflowEdgeCommand,
  TriggerWorkflowCommand,
  WorkflowNodeKind,
  WorkflowEventType,
  ExecutionStatus,
} from "@/gen/model";

export type {
  WorkflowSummaryDto,
  WorkflowGraphDto,
  WorkflowNodeDto,
  WorkflowEdgeDto,
  WorkflowExecutionDto,
  WorkflowNodeExecutionDto,
  WorkflowNodePaletteItemDto,
  CreateWorkflowCommand,
  UpdateWorkflowCommand,
  AddWorkflowNodeCommand,
  UpdateWorkflowNodeCommand,
  AddWorkflowEdgeCommand,
  TriggerWorkflowCommand,
  WorkflowNodeKind,
  WorkflowEventType,
  ExecutionStatus,
};

// -----------------------------------------------------------------------------
// Queries
// -----------------------------------------------------------------------------

export const useWorkflows = (projectId?: string) => {
  return useQuery({
    queryKey: getGetWorkflowsQueryKey({ projectId: projectId || "" }),
    queryFn: () =>
      getWorkflows({ projectId: projectId! }) as unknown as Promise<
        WorkflowSummaryDto[]
      >,
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });
};

export const useWorkflowGraph = (workflowId?: string) => {
  return useQuery({
    queryKey: getGetWorkflowGraphQueryKey(workflowId!),
    queryFn: () =>
      getWorkflowGraph(workflowId!) as unknown as Promise<WorkflowGraphDto>,
    enabled: !!workflowId,
    staleTime: 0,
  });
};

export const useWorkflowExecutions = (workflowId?: string) => {
  return useQuery({
    queryKey: getGetWorkflowExecutionsQueryKey(workflowId!),
    queryFn: () =>
      getWorkflowExecutions(workflowId!) as unknown as Promise<
        WorkflowExecutionDto[]
      >,
    enabled: !!workflowId,
  });
};

export const useWorkflowExecution = (executionId?: string) => {
  return useQuery({
    queryKey: getGetWorkflowExecutionQueryKey(executionId!),
    queryFn: () =>
      getWorkflowExecution(executionId!) as unknown as Promise<WorkflowExecutionDto>,
    enabled: !!executionId,
  });
};

export const useWorkflowNodePalette = () => {
  return useQuery({
    queryKey: getGetWorkflowNodePaletteQueryKey(),
    queryFn: () =>
      getWorkflowNodePalette() as unknown as Promise<WorkflowNodePaletteItemDto[]>,
    staleTime: 1000 * 60 * 10,
  });
};

// -----------------------------------------------------------------------------
// Mutations
// -----------------------------------------------------------------------------

export const useCreateWorkflowMutation = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateWorkflowCommand) =>
      createWorkflow(data) as unknown as Promise<WorkflowSummaryDto>,
    onSuccess: () => {
      toast.success(
        t("workflows.createSuccess", { defaultValue: "Workflow created successfully" })
      );
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: getGetWorkflowsQueryKey({ projectId }),
        });
      }
    },
  });
};

export const useUpdateWorkflowMutation = (projectId?: string, workflowId?: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkflowCommand }) =>
      updateWorkflow(id, data),
    onSuccess: () => {
      toast.success(
        t("workflows.updateSuccess", { defaultValue: "Workflow updated successfully" })
      );
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: getGetWorkflowsQueryKey({ projectId }),
        });
      }
      if (workflowId) {
        queryClient.invalidateQueries({
          queryKey: getGetWorkflowGraphQueryKey(workflowId),
        });
      }
    },
  });
};

export const useDeleteWorkflowMutation = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteWorkflow(id),
    onSuccess: () => {
      toast.success(
        t("workflows.deleteSuccess", { defaultValue: "Workflow deleted successfully" })
      );
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: getGetWorkflowsQueryKey({ projectId }),
        });
      }
    },
  });
};

export const useAddWorkflowNodeMutation = (workflowId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddWorkflowNodeCommand) =>
      addWorkflowNode(workflowId, data) as unknown as Promise<WorkflowNodeDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getGetWorkflowGraphQueryKey(workflowId),
      });
    },
  });
};

export const useUpdateWorkflowNodeMutation = (workflowId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      nodeId,
      data,
    }: {
      nodeId: string;
      data: UpdateWorkflowNodeCommand;
    }) => updateWorkflowNode(workflowId, nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getGetWorkflowGraphQueryKey(workflowId),
      });
    },
  });
};

export const useDeleteWorkflowNodeMutation = (workflowId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nodeId: string) => deleteWorkflowNode(workflowId, nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getGetWorkflowGraphQueryKey(workflowId),
      });
    },
  });
};

export const useAddWorkflowEdgeMutation = (workflowId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddWorkflowEdgeCommand) =>
      addWorkflowEdge(workflowId, data) as unknown as Promise<WorkflowEdgeDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getGetWorkflowGraphQueryKey(workflowId),
      });
    },
  });
};

export const useDeleteWorkflowEdgeMutation = (workflowId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (edgeId: string) => deleteWorkflowEdge(workflowId, edgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getGetWorkflowGraphQueryKey(workflowId),
      });
    },
  });
};

export const useTriggerWorkflowMutation = (workflowId: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: TriggerWorkflowCommand) =>
      triggerWorkflow(workflowId, data) as unknown as Promise<WorkflowExecutionDto>,
    onSuccess: () => {
      toast.success(
        t("workflows.triggerSuccess", { defaultValue: "Workflow triggered successfully" })
      );
      queryClient.invalidateQueries({
        queryKey: getGetWorkflowExecutionsQueryKey(workflowId),
      });
    },
  });
};
