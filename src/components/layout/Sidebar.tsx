import { startTransition } from "react"
import { useAuthStore } from "@/stores/authStore"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Users, Settings2, Shield, Settings, MonitorCog, Logs } from "lucide-react"
import { NavUser } from "./NavUser"
import { useNavigate, useRouterState } from "@tanstack/react-router"

const projectName = import.meta.env.VITE_PROJECT_NAME;

// 1. Tách cấu hình list item ra riêng biệt
const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard
    // Không có featurePrefix -> Ai cũng xem được
  },
  {
    title: "Identity",
    icon: Settings2,
    items: [
      { title: "Users", url: "/users", icon: Users, featurePrefix: "users:" },
      { title: "Roles", url: "/roles", icon: Shield, featurePrefix: "roles:" },
    ]
  },
  {
    title: "System",
    icon: MonitorCog,
    items: [
      { title: "Audit Logs", url: "/system/audit-logs", icon: Logs, featurePrefix: "auditlogs:" }, // Check lại prefix này nếu cần
      { title: "Settings", url: "/system/settings", icon: Settings, featurePrefix: "systemsettings:" },
    ]
  }
] as const

export function AppSidebar() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  
  // Phải subscribe vào permissions array để component re-render khi quyền thay đổi
  useAuthStore(state => state.permissions)
  const hasAnyPermission = useAuthStore(state => state.hasAnyPermission)

  const handleNav = (url: string) => {
    startTransition(() => {
      navigate({ to: url })
    })
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="font-bold">{projectName[0]}</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{projectName}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* 2. Map dữ liệu lên giao diện */}
              {navItems.map((item) => {
                const Icon = item.icon;

                // Nếu là single item
                if (!("items" in item)) {
                  if (item.featurePrefix && !hasAnyPermission(item.featurePrefix)) {
                    return null;
                  }
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={pathname === item.url}
                        onPress={() => handleNav(item.url)}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                // Lọc các subItem mà user có quyền
                const visibleSubItems = item.items.filter(subItem => {
                   return !subItem.featurePrefix || hasAnyPermission(subItem.featurePrefix);
                });

                if (visibleSubItems.length === 0) {
                  return null;
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton>
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      {visibleSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            isActive={pathname.startsWith(subItem.url)}
                            onPress={() => handleNav(subItem.url)}
                          >
                            <subItem.icon />
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
