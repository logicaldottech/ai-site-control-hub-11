import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { useNavigate, useLocation } from "react-router-dom";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleSectionChange = (section: string) => {
    const routeMap: Record<string, string> = {
      "dashboard": "/admin",
      "create-project": "/admin/create-project",
      "project-list": "/admin/projects",
      "hosting": "/admin/hosting",
      "domain-management": "/admin/domains",
      "users": "/admin/users",
      "manage-subadmin": "/admin/subadmin",
      "themes": "/admin/themes",
      "posts": "/admin/posts",
      "post-categories": "/admin/post-categories",
      "post-tags": "/admin/post-tags",
      "pages": "/admin/pages",
      "services": "/admin/services",
      "blog-posts": "/admin/blog-posts"
    };

    const route = routeMap[section];
    if (route) {
      navigate(route);
    }
  };

  // Get current section from URL
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === "/admin") return "dashboard";
    if (path === "/admin/create-project") return "create-project";
    if (path === "/admin/projects") return "project-list";
    if (path === "/admin/hosting") return "hosting";
    if (path === "/admin/domains") return "domain-management";
    if (path === "/admin/users") return "users";
    if (path === "/admin/subadmin") return "manage-subadmin";
    if (path === "/admin/themes") return "themes";
    if (path === "/admin/posts") return "posts";
    if (path === "/admin/post-categories") return "post-categories";
    if (path === "/admin/post-tags") return "post-tags";
    if (path === "/admin/pages") return "pages";
    if (path === "/admin/services") return "services";
    if (path === "/admin/blog-posts") return "blog-posts";
    return "dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 flex font-poppins">
      <AdminSidebar
        activeSection={getCurrentSection()}
        setActiveSection={handleSectionChange}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-800/20 min-h-[calc(100vh-4rem)]">
            <div className="p-8">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}