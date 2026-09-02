import { createFileRoute } from "@tanstack/react-router";
import { WorkflowListPage } from "@/features/workflows/pages/WorkflowListPage";

export const Route = createFileRoute(
  "/_protected/_project/projects/$projectId/workflows/"
)({
  component: WorkflowListRoute,
});

function WorkflowListRoute() {
  const { projectId } = Route.useParams();
  return <WorkflowListPage projectId={projectId} />;
}
