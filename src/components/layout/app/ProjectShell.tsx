import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { ProjectSidebar } from './ProjectSidebar'
import { MobileNavigationClose } from './AppShell'
import { AppHeader } from './AppHeader'

export function ProjectShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <MobileNavigationClose />
      <ProjectSidebar />
      <SidebarInset className="flex flex-col h-full">
        <AppHeader showSidebarTrigger={true} />
        <div className="flex-1 bg-muted/20 min-w-0 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
