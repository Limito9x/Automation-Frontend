import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getAuthState } from '@/stores/authStore'
export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ location }) => {
    if (!getAuthState().accessToken) {
      throw redirect({
        to: '/auth/login',
        search: () => ({ redirect: location.href }),
      })
    }
  },
  component: () => <Outlet />,
})
