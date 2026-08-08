import { createFileRoute } from '@tanstack/react-router'
import { ContentTypeDetailPage } from '@/features/contentTypes/pages/ContentTypeDetailPage'

export const Route = createFileRoute('/_layout/projects/$id/content-types/$id/')({
  staticData: {
    breadcrumb: 'View Details',
  },
  component: ContentTypeDetailPage,
})
