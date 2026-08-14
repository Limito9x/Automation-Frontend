import { createFileRoute } from '@tanstack/react-router'
import { WorkspaceDetailPage } from '@/features/workspaces/pages/WorkspaceDetailPage'
import { buildPagedSearchSchema } from '@/lib/schemas/pagedSearch.schema'
import { z } from 'zod'

const baseSchema = buildPagedSearchSchema({
  name: ['Equal', 'Contains'],
  filePath: ['Equal', 'Contains'],
  createdAt: ['GreaterThan', 'GreaterThanOrEqual', 'LessThan', 'LessThanOrEqual'],
  resourceName: ['Equal', 'Contains'],
  relativePath: ['Equal', 'Contains'],
})

export const workspaceDetailSearchSchema = baseSchema.extend({
  tab: z.enum(['resources', 'agents']).catch('resources').default('resources'),
  agentId: z.string().optional(),
})

export const Route = createFileRoute('/_protected/_project/projects/$projectId/workspaces/$workspaceId')({
  validateSearch: workspaceDetailSearchSchema,
  component: WorkspaceDetailRouteComponent,
})

function WorkspaceDetailRouteComponent() {
  const { projectId, workspaceId } = Route.useParams()
  return (
    <WorkspaceDetailPage 
      projectId={projectId} 
      workspaceId={workspaceId} 
      useSearch={Route.useSearch} 
      useNavigate={Route.useNavigate} 
    />
  )
}
