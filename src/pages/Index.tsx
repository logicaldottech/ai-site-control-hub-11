import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { UserManagement } from "@/components/admin/UserManagement";
import { Settings } from "@/components/admin/Settings";
import { CreateProject } from "@/components/admin/CreateProject";
import { ProjectList } from "@/components/admin/ProjectList";
import { SubAdminManagement } from "@/components/admin/SubAdminManagement";
import { ThemesManagement } from "@/components/admin/ThemesManagement";
import { PluginManagement } from "@/components/admin/PluginManagement";
import { DomainManagement } from "@/components/admin/DomainManagement";
import { WebsiteGeneratorPlugin } from "@/components/admin/WebsiteGeneratorPlugin";
import { PagesManagement } from "@/components/admin/PagesManagement";
import { PostsManagement } from "@/components/admin/PostsManagement";
import { PostCategoriesManagement } from "@/components/admin/PostCategoriesManagement";
import { PostSubcategoriesManagement } from "@/components/admin/PostSubcategoriesManagement";
import { PostTagsManagement } from "@/components/admin/PostTagsManagement";
import { PostEditor } from "@/components/admin/PostEditor";
import { CreditManagement } from "@/components/admin/CreditManagement";
import { HostingDashboard } from "@/components/admin/HostingDashboard";
import ServicesManagement from "@/components/admin/ServicesManagement";
import { useNavigate, useLocation, useParams } from "react-router-dom";

interface IndexProps {
  initialSection?: string;
}

const Index: React.FC<IndexProps> = ({ initialSection = "dashboard" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | undefined>(undefined);

  // Set active section based on URL path when component mounts or URL changes
  useEffect(() => {
    if (location.pathname === "/") {
      setActiveSection("dashboard");
      setIsEditingPost(false);
    } else if (location.pathname === "/posts") {
      setActiveSection("posts");
      setIsEditingPost(false);
    } else if (location.pathname.includes("post-editor")) {
      setActiveSection("posts");
      setIsEditingPost(true);
      const postId = location.pathname.split('/').pop();
      if (postId && postId !== "post-editor") {
        setCurrentPostId(postId);
      } else {
        setCurrentPostId(undefined);
      }
    } else if (location.pathname === "/admin/project-list") {
      setActiveSection("project-list");
      setIsEditingPost(false);
    }

    else if (location.pathname === "/admin/create-project") {
      setActiveSection("create-project");
      setIsEditingPost(false);
    }


    else if (location.pathname.includes("/services/")) {
      setActiveSection("services");
      setIsEditingPost(false);
    }
  }, [location.pathname]);

  const handleSectionChange = (section: string) => {
    // Handle navigation for sections that have dedicated pages
    if (section === "posts") {
      navigate("/posts");
      setActiveSection("posts");
      setIsEditingPost(false);
    } else if (section === "project-list") {
      navigate("/admin/project-list");
      setActiveSection("project-list");
      setIsEditingPost(false);
    } else {
      setActiveSection(section);
      setIsEditingPost(false);
    }
  };

  const renderActiveSection = () => {
    // If we're in post editor mode, return the post editor
    if (isEditingPost) {
      return <PostEditor postId={currentPostId} />;
    }

    // Otherwise render the normal sections
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />;
      case "create-project":
        return <CreateProject setActiveSection={setActiveSection} />;
      case "project-list":
        return <ProjectList />;
      case "services":
        return <ServicesManagement />;
      case "hosting":
        return <HostingDashboard />;
      case "domain-management":
        return <DomainManagement />;
      case "users":
        return <UserManagement />;
      case "manage-subadmin":
        return <SubAdminManagement />;
      case "themes":
        return <ThemesManagement />;
      case "plugins":
        return <PluginManagement />;
      case "website-generator":
        return <WebsiteGeneratorPlugin />;
      case "pages":
        return <PagesManagement />;
      case "posts":
        return <PostsManagement />;
      case "post-categories":
        return <PostCategoriesManagement />;
      case "post-subcategories":
        return <PostSubcategoriesManagement />;
      case "post-tags":
        return <PostTagsManagement />;
      case "credits":
        return <CreditManagement />;
      case "settings":
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 flex font-poppins">
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-800/20 min-h-[calc(100vh-4rem)]">
            <div className="p-8">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
