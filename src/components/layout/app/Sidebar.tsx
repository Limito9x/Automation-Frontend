import { useRouterState } from "@tanstack/react-router";
import { GlobalSidebar } from "./GlobalSidebar";
import { ProjectSidebar } from "./ProjectSidebar";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  // Logic to determine if we are in a project context
  const isProjectContext = pathname.startsWith("/projects/") && pathname.split("/").length >= 3 && pathname.split("/")[2] !== "new";

  if (isProjectContext) {
    return <ProjectSidebar />;
  }

  return <GlobalSidebar />;
}
