import { createFileRoute } from '@tanstack/react-router'
import { UpdateContentTypePage } from '@/features/contentTypes/pages/UpdateContentTypePage'

export const Route = createFileRoute('/_protected/_project/projects/$projectId/content-types/$contentTypeId/edit')({
  staticData: {
    breadcrumb: 'Edit ContentType',
  },
  component: UpdateContentTypePage,
})
