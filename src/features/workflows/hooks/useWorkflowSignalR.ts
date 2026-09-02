import { useEffect, useRef } from "react";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetWorkflowExecutionsQueryKey,
  getGetWorkflowExecutionQueryKey,
} from "@/gen/endpoints/workflows/workflows";
import type { WorkflowExecutionDto, WorkflowNodeExecutionDto } from "@/gen/model";

export interface WorkflowSignalREvents {
  onExecutionStarted?: (execution: {
    executionId: string;
    workflowId: string;
    triggerEventType: string;
    status: string;
    startedAt?: string;
  }) => void;
  onNodeUpdated?: (nodeExec: {
    executionId: string;
    workflowNodeId: string;
    status: string;
    startedAt?: string;
    finishedAt?: string;
    output?: any;
    errorMessage?: string;
  }) => void;
  onExecutionFinished?: (execution: {
    executionId: string;
    workflowId: string;
    status: string;
    finishedAt?: string;
    errorMessage?: string;
  }) => void;
}

export const useWorkflowSignalR = (
  workflowId?: string,
  events?: WorkflowSignalREvents
) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !workflowId) {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
      return;
    }

    const hubUrl = `${import.meta.env.VITE_API_URL || ""}/hubs/workflow-executions`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection
      .start()
      .then(async () => {
        await connection.invoke("JoinWorkflow", workflowId);

        connection.on("WorkflowExecutionStarted", (data: any) => {
          events?.onExecutionStarted?.(data);

          // Update executions list in cache
          queryClient.setQueryData(
            getGetWorkflowExecutionsQueryKey(workflowId),
            (old: WorkflowExecutionDto[] | undefined) => {
              const newExec: WorkflowExecutionDto = {
                id: data.executionId,
                workflowId: data.workflowId,
                triggerEventType: data.triggerEventType,
                triggerPayload: {} as any,
                status: data.status,
                startedAt: data.startedAt,
                finishedAt: null,
                errorMessage: null,
                nodeExecutions: [],
              };
              return old ? [newExec, ...old] : [newExec];
            }
          );
        });

        connection.on("WorkflowNodeExecutionUpdated", (data: any) => {
          events?.onNodeUpdated?.(data);

          // Update execution detail in cache
          queryClient.setQueryData(
            getGetWorkflowExecutionQueryKey(data.executionId),
            (old: WorkflowExecutionDto | undefined) => {
              if (!old) return old;
              const nodeExecs = (old.nodeExecutions ? [...old.nodeExecutions] : []) as WorkflowNodeExecutionDto[];
              const idx = nodeExecs.findIndex(
                (ne) => ne.workflowNodeId === data.workflowNodeId
              );

              const updatedNodeExec: WorkflowNodeExecutionDto = {
                id: data.executionId + "_" + data.workflowNodeId,
                workflowExecutionId: data.executionId,
                workflowNodeId: data.workflowNodeId,
                status: data.status,
                startedAt: data.startedAt,
                finishedAt: data.finishedAt,
                output: data.output || ({} as any),
                errorMessage: data.errorMessage,
              };

              if (idx >= 0) {
                nodeExecs[idx] = updatedNodeExec;
              } else {
                nodeExecs.push(updatedNodeExec);
              }

              return {
                ...old,
                nodeExecutions: nodeExecs,
              };
            }
          );
        });

        connection.on("WorkflowExecutionFinished", (data: any) => {
          events?.onExecutionFinished?.(data);

          // Update execution status in cache
          queryClient.setQueryData(
            getGetWorkflowExecutionsQueryKey(workflowId),
            (old: WorkflowExecutionDto[] | undefined) => {
              if (!old) return old;
              return old.map((e) =>
                e.id === data.executionId
                  ? {
                      ...e,
                      status: data.status,
                      finishedAt: data.finishedAt,
                      errorMessage: data.errorMessage,
                    }
                  : e
              );
            }
          );

          queryClient.setQueryData(
            getGetWorkflowExecutionQueryKey(data.executionId),
            (old: WorkflowExecutionDto | undefined) => {
              if (!old) return old;
              return {
                ...old,
                status: data.status,
                finishedAt: data.finishedAt,
                errorMessage: data.errorMessage,
              };
            }
          );
        });
      })
      .catch((err) => {
        console.error("Workflow SignalR connection failed: ", err);
      });

    return () => {
      if (connectionRef.current) {
        connectionRef.current
          .invoke("LeaveWorkflow", workflowId)
          .catch(() => {})
          .finally(() => {
            connectionRef.current?.stop();
            connectionRef.current = null;
          });
      }
    };
  }, [token, workflowId, queryClient]);
};
