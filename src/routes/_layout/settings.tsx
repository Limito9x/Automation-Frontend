import { createFileRoute } from '@tanstack/react-router'
import { SettingsLayout } from '@/components/layout/SettingsLayout'

export const Route = createFileRoute('/_layout/settings')({
  component: SettingsLayout,
})
