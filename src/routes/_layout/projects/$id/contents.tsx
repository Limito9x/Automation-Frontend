import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getAuthState } from '@/stores/authStore'

export const Route = createFileRoute('/_layout/projects/$id/contents')({
  staticData: {
    breadcrumb: 'ContentItems',
  },
  beforeLoad: () => {
    const permissions = getAuthState().permissions;
    const hasAccess = permissions.some(p => p.startsWith('contentItems:'));
    if (!hasAccess) {
      throw redirect({ to: '/403' });
    }
  },
  component: () => <Outlet />,
})
