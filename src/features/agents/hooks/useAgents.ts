import * as AgentsApi from "@/gen/endpoints/agents/agents";
import { createMutationHook } from "@/lib/query-utils";

export const useAgents = () => {
  return AgentsApi.useGetAgents({
    query: {
      placeholderData: (prev) => prev,
    },
  });
};

export const useGenerateSetupToken = createMutationHook(AgentsApi.useGenerateSetupToken, [AgentsApi.getGetAgentsQueryKey()]);
export const useRevokeAgent = createMutationHook(AgentsApi.useRevokeAgent, [AgentsApi.getGetAgentsQueryKey()]);
