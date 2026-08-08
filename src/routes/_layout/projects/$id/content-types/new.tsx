import { createFileRoute } from '@tanstack/react-router'
import { CreateContentTypePage } from '@/features/contentTypes/pages/CreateContentTypePage'

export const Route = createFileRoute('/_layout/projects/$id/content-types/new')({
  staticData: {
    breadcrumb: 'New ContentType',
  },
  component: CreateContentTypePage,
})
