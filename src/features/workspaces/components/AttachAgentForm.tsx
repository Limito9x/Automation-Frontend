import { Form, FormGrid, zodResolver, useForm } from "@/components/form";
import { useWatch } from "react-hook-form";
import { FormInput, FormSelect } from "@/components/form-controls";
import { attachAgentSchema, type AttachAgentInput, type AttachAgentOutput } from "../schemas/workspaceSchema";
import { useGetAgents } from "@/gen/endpoints/agents/agents";
import { DirectoryTree } from "@/components/custom-ui/file-tree/DirectoryTree";
import { FolderTree } from "lucide-react";

interface AttachAgentFormProps {
  workspaceId?: string;
  onSubmit: (values: AttachAgentOutput) => void;
}

export function AttachAgentForm({ workspaceId, onSubmit }: AttachAgentFormProps) {
  // Query available agents
  const { data: agents = [] } = useGetAgents();

  const agentOptions = (agents as any[]).map((a) => ({
    label: `${a.name || a.id} (${a.machineKey || "Unknown Machine"})`,
    value: a.id,
  }));

  const form = useForm<AttachAgentInput, any, AttachAgentOutput>({
    resolver: zodResolver(attachAgentSchema),
    defaultValues: {
      agentId: "",
      rootPath: "/",
    },
  });

  const selectedAgentId = useWatch({ control: form.control, name: "agentId" });

  return (
    <Form form={form} formId="attach-agent-form" onSubmit={onSubmit}>
      <FormGrid cols={1} className="gap-4">
        <FormSelect
          control={form.control}
          label="Select Agent"
          name="agentId"
          placeholder="Choose an agent..."
          options={agentOptions}
        />
        <FormInput
          control={form.control}
          label="Root Path"
          name="rootPath"
          type="text"
          placeholder="e.g. /var/workspace or C:\Workspaces"
        />

        {/* Directory Tree Preview / Browser */}
        {selectedAgentId && workspaceId && (
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <FolderTree className="size-3.5 text-primary" />
                <span>Browse & Select Directory</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                Click folder to auto-fill Root Path
              </span>
            </div>

            <DirectoryTree
              workspaceId={workspaceId}
              agentId={selectedAgentId}
              height={300}
              onSelectNode={(node) => {
                if (node.isDirectory) {
                  form.setValue("rootPath", node.path, { shouldValidate: true });
                }
              }}
            />
          </div>
        )}
      </FormGrid>
    </Form>
  );
}
