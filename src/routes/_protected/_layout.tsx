import { useEffect } from 'react'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app/AppShell'
import { getAuthState, useAuthStore } from '@/stores/authStore'
import { useGetProfile } from '@/features/settings/hooks/useProfile'
import { useGetPermissions } from '@/gen/endpoints/auth/auth'
export const Route = createFileRoute('/_protected/_layout')({
  beforeLoad: ({ location }) => {
    if (!getAuthState().accessToken) {
      throw redirect({
        to: '/auth/login',
        search: () => ({ redirect: location.href }),
      })
    }
  },
  component: LayoutComponent,
})

function LayoutComponent() {
  const { data: profile } = useGetProfile()
  const { data: permissions } = useGetPermissions()
  const setProfile = useAuthStore(state => state.setProfile)
  const setPermissions = useAuthStore(state => state.setPermissions)

  useEffect(() => {
    if (profile) {
      setProfile(profile)
    }
  }, [profile, setProfile])

  useEffect(() => {
    if (permissions) {
      setPermissions(permissions as unknown as string[])
    }
  }, [permissions, setPermissions])

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
