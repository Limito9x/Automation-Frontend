import { createFileRoute } from '@tanstack/react-router'
import { CreateContentTypePage } from '@/features/contentTypes/pages/CreateContentTypePage'

export const Route = createFileRoute('/_protected/_project/projects/$projectId/content-types/new')({
  staticData: {
    breadcrumb: 'New ContentType',
  },
  component: CreateContentTypePage,
})

function RouteCreateContentTypePage() {
  return <CreateContentTypePage />
}