import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createMutationHook } from "@/lib/query-utils";
import { customInstance } from "@/lib/api-client";
import * as PipelinesApi from "@/gen/endpoints/pipelines/pipelines";
import type {
  PipelineGraphDto,
  PipelineNodeGraphDto,
  PipelineEdgeGraphDto,
  PipelineInputDto,
  AddPipelineNodeRequest,
  UpdatePipelineNodeRequest,
  AddPipelineEdgeRequest,
  AddPipelineInputRequest,
  UpdatePipelineInputRequest,
  RunPipelineRequest,
  ValidatePipelineQuery,
  ValidatePipelineResponse,
  PipelineExecutionDto,
  PipelineSummaryDto,
  CreatePipelineCommand,
  EdgeKind,
  ExecutionStatus,
} from "@/gen/model";

export type {
  PipelineGraphDto,
  PipelineNodeGraphDto,
  PipelineEdgeGraphDto,
  PipelineInputDto,
  AddPipelineNodeRequest,
  UpdatePipelineNodeRequest,
  AddPipelineEdgeRequest,
  AddPipelineInputRequest,
  UpdatePipelineInputRequest,
  RunPipelineRequest,
  ValidatePipelineQuery,
  ValidatePipelineResponse,
  PipelineExecutionDto,
  PipelineSummaryDto,
  CreatePipelineCommand,
  EdgeKind,
  ExecutionStatus,
};

// -----------------------------------------------------------------------------
// Queries
// -----------------------------------------------------------------------------

export const usePipelines = (projectId?: string) => {
  return PipelinesApi.useGetPipelines(
    projectId ? { projectId } : undefined,
    {
      query: {
        placeholderData: keepPreviousData,
      },
    }
  );
};

export const usePipelineGraph = (pipelineId?: string) => {
  return PipelinesApi.useGetPipelineGraph(pipelineId || "", {
    query: {
      enabled: !!pipelineId,
      placeholderData: keepPreviousData,
    },
  });
};

export const usePipelineInputSchema = (pipelineId?: string) => {
  return PipelinesApi.useGetPipelineInputSchema(pipelineId || "", {
    query: {
      enabled: !!pipelineId,
      placeholderData: keepPreviousData,
    },
  });
};

export const getPipelineExecutionsQueryKey = (pipelineId: string) => [
  "/api/pipelines",
  pipelineId,
  "executions",
];

export const usePipelineExecutions = (pipelineId?: string) => {
  return useQuery({
    queryKey: getPipelineExecutionsQueryKey(pipelineId || ""),
    queryFn: ({ signal }) =>
      customInstance<PipelineExecutionDto[]>({
        url: `/api/pipelines/${pipelineId}/executions`,
        method: "GET",
        signal,
      }),
    enabled: !!pipelineId,
    placeholderData: keepPreviousData,
    refetchInterval: 5000,
  });
};

export const usePipelineExecution = (executionId?: string) => {
  return PipelinesApi.useGetPipelineExecution(executionId || "", {
    query: {
      enabled: !!executionId,
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (
          status === 1 ||
          status === 2 ||
          status === 3 ||
          (status as any) === "Running" ||
          (status as any) === "WaitingForAgent" ||
          (status as any) === "Pending"
        ) {
          return 2500;
        }
        return false;
      },
    },
  });
};

// -----------------------------------------------------------------------------
// Mutations (Wrapped with createMutationHook & Orval Generated APIs)
// -----------------------------------------------------------------------------

export const useCreatePipeline = (projectId?: string) => {
  const queryKey = projectId ? PipelinesApi.getGetPipelinesQueryKey({ projectId }) : ["pipelines"];
  return createMutationHook(PipelinesApi.useCreatePipeline, [queryKey])();
};

export const useAddPipelineNode = (pipelineId?: string) => {
  const queryKey = pipelineId ? PipelinesApi.getGetPipelineGraphQueryKey(pipelineId) : ["pipelines"];
  const mutation = createMutationHook(PipelinesApi.useAddPipelineNode, [queryKey])();
  return {
    ...mutation,
    mutate: (data: AddPipelineNodeRequest, options?: any) =>
      mutation.mutate({ pipelineId: pipelineId!, data }, options),
    mutateAsync: (data: AddPipelineNodeRequest, options?: any) =>
      mutation.mutateAsync({ pipelineId: pipelineId!, data }, options),
  };
};

export const useUpdatePipelineNode = (pipelineId?: string) => {
  const queryKey = pipelineId ? PipelinesApi.getGetPipelineGraphQueryKey(pipelineId) : ["pipelines"];
  const mutation = createMutationHook(PipelinesApi.useUpdatePipelineNode, [queryKey])();
  return {
    ...mutation,
    mutate: ({ nodeId, data }: { nodeId: string; data: UpdatePipelineNodeRequest }, options?: any) =>
      mutation.mutate({ pipelineId: pipelineId!, nodeId, data }, options),
    mutateAsync: ({ nodeId, data }: { nodeId: string; data: UpdatePipelineNodeRequest }, options?: any) =>
      mutation.mutateAsync({ pipelineId: pipelineId!, nodeId, data }, options),
  };
};

export const useDeletePipelineNode = (pipelineId?: string) => {
  const queryKey = pipelineId ? PipelinesApi.getGetPipelineGraphQueryKey(pipelineId) : ["pipelines"];
  const mutation = createMutationHook(PipelinesApi.useDeletePipelineNode, [queryKey])();
  return {
    ...mutation,
    mutate: (nodeId: string, options?: any) =>
      mutation.mutate({ pipelineId: pipelineId!, nodeId }, options),
    mutateAsync: (nodeId: string, options?: any) =>
      mutation.mutateAsync({ pipelineId: pipelineId!, nodeId }, options),
  };
};

export const useAddPipelineEdge = (pipelineId?: string) => {
  const queryKey = pipelineId ? PipelinesApi.getGetPipelineGraphQueryKey(pipelineId) : ["pipelines"];
  const mutation = createMutationHook(PipelinesApi.useAddPipelineEdge, [queryKey])();
  return {
    ...mutation,
    mutate: (data: AddPipelineEdgeRequest, options?: any) =>
      mutation.mutate({ pipelineId: pipelineId!, data }, options),
    mutateAsync: (data: AddPipelineEdgeRequest, options?: any) =>
      mutation.mutateAsync({ pipelineId: pipelineId!, data }, options),
  };
};

export const useDeletePipelineEdge = (pipelineId?: string) => {
  const queryKey = pipelineId ? PipelinesApi.getGetPipelineGraphQueryKey(pipelineId) : ["pipelines"];
  const mutation = createMutationHook(PipelinesApi.useDeletePipelineEdge, [queryKey])();
  return {
    ...mutation,
    mutate: (edgeId: string, options?: any) =>
      mutation.mutate({ pipelineId: pipelineId!, edgeId }, options),
    mutateAsync: (edgeId: string, options?: any) =>
      mutation.mutateAsync({ pipelineId: pipelineId!, edgeId }, options),
  };
};

export const useRunPipeline = (pipelineId?: string) => {
  const queryKeys = pipelineId
    ? [
        PipelinesApi.getGetPipelineGraphQueryKey(pipelineId),
        ["pipelines", pipelineId, "executions"],
      ]
    : [["pipelines"]];
  const mutation = createMutationHook(PipelinesApi.useRunPipeline, queryKeys)();
  return {
    ...mutation,
    mutate: (data: RunPipelineRequest, options?: any) =>
      mutation.mutate({ pipelineId: pipelineId!, data }, options),
    mutateAsync: (data: RunPipelineRequest, options?: any) =>
      mutation.mutateAsync({ pipelineId: pipelineId!, data }, options),
  };
};

export const useValidatePipeline = (pipelineId?: string) => {
  const mutation = createMutationHook(PipelinesApi.useValidatePipeline, [])();
  return {
    ...mutation,
    mutate: (data: ValidatePipelineQuery, options?: any) =>
      mutation.mutate({ pipelineId: pipelineId!, data }, options),
    mutateAsync: (data: ValidatePipelineQuery, options?: any) =>
      mutation.mutateAsync({ pipelineId: pipelineId!, data }, options),
  };
};

export const useAddPipelineInput = (pipelineId?: string) => {
  const queryKeys = pipelineId
    ? [
        PipelinesApi.getGetPipelineGraphQueryKey(pipelineId),
        PipelinesApi.getGetPipelineInputSchemaQueryKey(pipelineId),
      ]
    : [["pipelines"]];
  const mutation = createMutationHook(PipelinesApi.useAddPipelineInput, queryKeys)();
  return {
    ...mutation,
    mutate: (data: AddPipelineInputRequest, options?: any) =>
      mutation.mutate({ pipelineId: pipelineId!, data }, options),
    mutateAsync: (data: AddPipelineInputRequest, options?: any) =>
      mutation.mutateAsync({ pipelineId: pipelineId!, data }, options),
  };
};

export const useUpdatePipelineInput = (pipelineId?: string) => {
  const queryKeys = pipelineId
    ? [
        PipelinesApi.getGetPipelineGraphQueryKey(pipelineId),
        PipelinesApi.getGetPipelineInputSchemaQueryKey(pipelineId),
      ]
    : [["pipelines"]];
  const mutation = createMutationHook(PipelinesApi.useUpdatePipelineInput, queryKeys)();
  return {
    ...mutation,
    mutate: ({ inputId, data }: { inputId: string; data: UpdatePipelineInputRequest }, options?: any) =>
      mutation.mutate({ pipelineId: pipelineId!, inputId, data }, options),
    mutateAsync: ({ inputId, data }: { inputId: string; data: UpdatePipelineInputRequest }, options?: any) =>
      mutation.mutateAsync({ pipelineId: pipelineId!, inputId, data }, options),
  };
};

export const useDeletePipelineInput = (pipelineId?: string) => {
  const queryKeys = pipelineId
    ? [
        PipelinesApi.getGetPipelineGraphQueryKey(pipelineId),
        PipelinesApi.getGetPipelineInputSchemaQueryKey(pipelineId),
      ]
    : [["pipelines"]];
  const mutation = createMutationHook(PipelinesApi.useDeletePipelineInput, queryKeys)();
  return {
    ...mutation,
    mutate: (inputId: string, options?: any) =>
      mutation.mutate({ pipelineId: pipelineId!, inputId }, options),
    mutateAsync: (inputId: string, options?: any) =>
      mutation.mutateAsync({ pipelineId: pipelineId!, inputId }, options),
  };
};
