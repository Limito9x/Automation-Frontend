import { createFileRoute } from "@tanstack/react-router";
import { WorkflowEditorPage } from "@/features/workflows/pages/WorkflowEditorPage";

export const Route = createFileRoute(
  "/_protected/_project/projects/$projectId/workflows/$workflowId"
)({
  component: WorkflowEditorRoute,
});

function WorkflowEditorRoute() {
  const { projectId, workflowId } = Route.useParams();
  return <WorkflowEditorPage projectId={projectId} workflowId={workflowId} />;
}
