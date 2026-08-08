import { startTransition } from "react";
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
} from "@/components/ui/sidebar";
import { LayoutDashboard, Settings, Logs, Folder } from "lucide-react";
import { NavUser } from "./NavUser";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useGetProjectById } from "@/features/projects/hooks/useProjects";

export function ProjectSidebar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const currentProjectId = pathname.split("/")[2];
  const { data: currentProject } = useGetProjectById(currentProjectId);

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
      navigate({ to: url });
    });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {currentProject && (
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" onPress={() => handleNav("/projects")}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Folder className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{currentProject.name}</span>
                  <span className="truncate text-xs text-muted-foreground">Back to all projects</span>
                </div>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
