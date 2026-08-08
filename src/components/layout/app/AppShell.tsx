import { SidebarProvider, SidebarTrigger, SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "./Sidebar"
import { AppBreadcrumb } from "./AppBreadcrumb"
import { LanguageSwitcher } from "@/components/custom-ui/locales/LanguageSwitcher"
import { Separator } from "@/components/ui/separator"
import { useLocation } from "@tanstack/react-router"
import { NotificationPopover } from "@/features/notifications/components/NotificationPopover"

import React from "react"

function MobileNavigationClose() {
  const { isMobile, setOpenMobile } = useSidebar()
  const location = useLocation()

  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [location.pathname, isMobile, setOpenMobile])

  return null
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <MobileNavigationClose />
      <AppSidebar />
      <SidebarInset className="flex flex-col h-full">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 bg-background">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadcrumb />
          </div>
          <div className="flex items-center gap-2">
            <NotificationPopover />
            <LanguageSwitcher />
          </div>
        </header>
        <div className="flex-1 bg-muted/20 min-w-0 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
