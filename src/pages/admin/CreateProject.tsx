import { CreateProject as CreateProjectComponent } from "@/components/admin/CreateProject";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const navigate = useNavigate();
  
  const handleSectionChange = (section: string) => {
    if (section === "project-list") {
      navigate("/admin/projects");
    }
  };

  return <CreateProjectComponent setActiveSection={handleSectionChange} />;
}