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
  SidebarGroupAction,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Users, Settings2, Shield, Settings, MonitorCog, Logs, Folder, Plus } from "lucide-react"
import { NavUser } from "./NavUser"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useGetProjects } from "@/gen/endpoints/projects/projects"

const projectName = import.meta.env.VITE_PROJECT_NAME;

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard
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
      { title: "Audit Logs", url: "/system/audit-logs", icon: Logs, featurePrefix: "auditlogs:" },
      { title: "Settings", url: "/system/settings", icon: Settings, featurePrefix: "systemsettings:" },
    ]
  }
] as const

export function AppSidebar() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  
  useAuthStore(state => state.permissions)
  const hasAnyPermission = useAuthStore(state => state.hasAnyPermission)

  const { data: projectsData } = useGetProjects({ pageSize: 10, pageNumber: 1 });

  const isProjectContext = pathname.startsWith("/projects/") && pathname.split("/").length >= 3 && pathname.split("/")[2] !== "new";
  const currentProjectId = isProjectContext ? pathname.split("/")[2] : null;
  const currentProject = projectsData?.items?.find(p => p.id === currentProjectId);

  const projectNavItems = [
    {
      title: "Overview",
      url: `/projects/${currentProjectId}/overview`,
      icon: LayoutDashboard
    },
    {
      title: "Assets",
      url: `/projects/${currentProjectId}/assets`,
      icon: Folder
    },
    {
      title: "Content Types",
      url: `/projects/${currentProjectId}/content-types`,
      icon: Settings
    },
    {
      title: "Contents",
      url: `/projects/${currentProjectId}/contents`,
      icon: Logs
    }
  ];

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
            {isProjectContext && currentProject ? (
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" onPress={() => handleNav("/projects")}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Folder className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{currentProject.name}</span>
                  <span className="truncate text-xs text-muted-foreground">Back to all projects</span>
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="font-bold">{projectName[0]}</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{projectName}</span>
                </div>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isProjectContext ? (
          <SidebarGroup>
            <SidebarGroupLabel>Project Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projectNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={pathname.startsWith(item.url)}
                        onPress={() => handleNav(item.url)}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            {/* Projects Group */}
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupAction title="Create Project" onClick={() => handleNav("/projects/new")}>
                <Plus /> <span className="sr-only">Create Project</span>
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={pathname === "/projects"} onPress={() => handleNav("/projects")}>
                      <LayoutDashboard />
                      <span>All Projects</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {projectsData?.items?.map(project => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton isActive={pathname.startsWith(`/projects/${project.id}`)} onPress={() => handleNav(`/projects/${project.id}/overview`)}>
                        <Folder />
                        <span>{project.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Application Group */}
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;

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
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
