import { createFileRoute } from '@tanstack/react-router'
import { WorkspaceDetailPage } from '@/features/workspaces/pages/WorkspaceDetailPage'
import { z } from 'zod'

const workspaceDetailSearchSchema = z.object({
  agentId: z.string().optional(),
})

export const Route = createFileRoute('/_protected/_project/projects/$projectId/workspaces/$workspaceId')({
  validateSearch: workspaceDetailSearchSchema,
  component: WorkspaceDetailRouteComponent,
})

function WorkspaceDetailRouteComponent() {
  const { projectId, workspaceId } = Route.useParams()
  return <WorkspaceDetailPage projectId={projectId} workspaceId={workspaceId} />
}
