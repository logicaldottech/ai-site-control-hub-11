
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { PostEditor } from "./components/admin/PostEditor";
import { UpdateProject } from "./components/admin/UpdateProject";
import Login from "./pages/Login";
import { AdminLayout } from "./components/admin/AdminLayout";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import CreateProject from "./pages/admin/CreateProject";
import Projects from "./pages/admin/Projects";
import Hosting from "./pages/admin/Hosting";
import Domains from "./pages/admin/Domains";

import SubAdmin from "./pages/admin/SubAdmin";
import Themes from "./pages/admin/Themes";

import CreateBlogPost from "./pages/admin/CreateBlogPost"
import CreateBlogPostAi from "./pages/admin/CreateBlogPostAi"

import EditBlogPost from "./pages/admin/EditBlogPost"


import Pages from "./pages/admin/Pages";
import Services from "./pages/admin/Services";
import WebsiteGenerator from "./pages/admin/WebsiteGenerator";
import BlogPosts from "./pages/admin/BlogPosts";
import ProjectBlogs from "./pages/admin/ProjectBlogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/create-project" element={<AdminLayout><CreateProject /></AdminLayout>} />
          <Route path="/admin/projects" element={<AdminLayout><Projects /></AdminLayout>} />
          <Route path="/admin/project-list" element={<AdminLayout><Projects /></AdminLayout>} />
          <Route path="/admin/hosting" element={<AdminLayout><Hosting /></AdminLayout>} />
          <Route path="/admin/domains" element={<AdminLayout><Domains /></AdminLayout>} />
    
          <Route path="/admin/subadmin" element={<AdminLayout><SubAdmin /></AdminLayout>} />
          <Route path="/admin/themes" element={<AdminLayout><Themes /></AdminLayout>} />
      
  
   
          <Route path="/admin/pages" element={<AdminLayout><Pages /></AdminLayout>} />
          <Route path="/admin/services" element={<AdminLayout><Services /></AdminLayout>} />
          <Route path="/admin/website-generator" element={<AdminLayout><WebsiteGenerator /></AdminLayout>} />
          <Route path="/admin/project-blogs" element={<AdminLayout><ProjectBlogs /></AdminLayout>} />
          <Route path="/admin/blog-posts" element={<AdminLayout><BlogPosts /></AdminLayout>} />
          <Route path="/admin/create-post" element={<AdminLayout><CreateBlogPost /></AdminLayout>} />
          <Route path="/admin/create-post-ai" element={<AdminLayout><CreateBlogPostAi /></AdminLayout>} />
          <Route path="/admin/edit-post" element={<AdminLayout><EditBlogPost /></AdminLayout>} />
          
          {/* Project and Post Editor Routes */}
          <Route path="/admin/project/:projectId/details" element={<UpdateProject />} />
          <Route path="/post-editor" element={<AdminLayout><PostEditor /></AdminLayout>} />
          <Route path="/post-editor/:postId" element={<AdminLayout><PostEditor /></AdminLayout>} />
          
          {/* Legacy Routes - Redirect to Admin */}
          <Route path="/" element={<AdminLayout><Dashboard /></AdminLayout>} />

          <Route path="/services/:projectId" element={<AdminLayout><Services /></AdminLayout>} />
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
