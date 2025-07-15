
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PostEditor } from "./components/admin/PostEditor";
import { UpdateProject } from "./components/admin/UpdateProject";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Index />} />
          <Route path="/admin/create-project" element={<Index initialSection="create-project" />} />
          <Route path="/admin/project-list" element={<Index initialSection="project-list" />} />
          <Route path="/admin/project/:projectId/details" element={<UpdateProject />} />
          <Route path="/services/:projectId" element={<Index initialSection="services" />} />
          <Route path="/" element={<Index />} />
          <Route path="/posts" element={<Index />} />
          <Route path="/post-editor" element={<Index />} />
          <Route path="/post-editor/:postId" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
