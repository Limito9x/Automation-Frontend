import { createFileRoute } from '@tanstack/react-router'
import { UpdateContentTypePage } from '@/features/contentTypes/pages/UpdateContentTypePage'

export const Route = createFileRoute('/_layout/projects/$id/content-types/$id/edit')({
  staticData: {
    breadcrumb: 'Edit ContentType',
  },
  component: UpdateContentTypePage,
})
