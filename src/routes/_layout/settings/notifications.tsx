import { createFileRoute } from '@tanstack/react-router'
import { NotificationsSettings } from '@/features/settings/components/NotificationsSettings'

export const Route = createFileRoute('/_layout/settings/notifications')({
  staticData: {
    breadcrumb: 'Notifications',
  },
  component: NotificationsSettings,
})
