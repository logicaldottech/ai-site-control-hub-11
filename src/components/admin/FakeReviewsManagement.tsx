import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { http } from "@/config";
import { toast } from "sonner";
import { Loader2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface FakeReviewFormData {
  count: string;
  exampleNames: string;
}

export function FakeReviewsManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FakeReviewFormData>({
    count: "",
    exampleNames: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchBlogs();
  }, [currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await http.get("/listBlogs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          limit: limit,
        },
      });

      if (response.data.success) {
        setBlogs(response.data.data.blogs || []);
        setTotalPages(Math.ceil((response.data.data.total || 0) / limit));
      } else {
        toast.error("Failed to fetch blogs");
      }
    } catch (error: any) {
      console.error("Error fetching blogs:", error);
      toast.error(error.response?.data?.message || "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReviews = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormData({ count: "", exampleNames: "" });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBlog || !formData.count || !formData.exampleNames) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      
      const formDataToSend = new FormData();
      formDataToSend.append("blogId", selectedBlog._id);
      formDataToSend.append("count", formData.count);
      formDataToSend.append("exampleNames", formData.exampleNames);

      // Use webapp/v1 for this API as shown in the curl
      const response = await http.post("/webapp/v1/add_fake_reviews", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Fake reviews generated successfully!");
        setIsDialogOpen(false);
        setFormData({ count: "", exampleNames: "" });
        setSelectedBlog(null);
      } else {
        toast.error(response.data.message || "Failed to generate reviews");
      }
    } catch (error: any) {
      console.error("Error generating reviews:", error);
      toast.error(error.response?.data?.message || "Failed to generate reviews");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FakeReviewFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Generate Fake Reviews</h1>
      </div>

      {/* Blogs List */}
      <div className="grid gap-4">
        {blogs.map((blog) => (
          <Card key={blog._id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{blog.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={blog.status === "active" ? "default" : "secondary"}>
                    {blog.status}
                  </Badge>
                  <Dialog open={isDialogOpen && selectedBlog?._id === blog._id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => handleGenerateReviews(blog)}
                        size="sm"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Generate Reviews
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Generate Fake Reviews</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="blogTitle">Selected Blog</Label>
                          <Input
                            id="blogTitle"
                            value={selectedBlog?.title || ""}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="count">Count *</Label>
                          <Input
                            id="count"
                            type="number"
                            min="1"
                            max="50"
                            placeholder="Enter number of reviews (e.g., 5)"
                            value={formData.count}
                            onChange={(e) => handleInputChange("count", e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="exampleNames">Example Names *</Label>
                          <Textarea
                            id="exampleNames"
                            placeholder="Enter comma-separated names (e.g., John Doe, Jane Smith, Mike Johnson)"
                            value={formData.exampleNames}
                            onChange={(e) => handleInputChange("exampleNames", e.target.value)}
                            rows={3}
                            required
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Separate multiple names with commas
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Generate Reviews
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {blog.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
              </p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Created: {new Date(blog.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(blog.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <span className="px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {blogs.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No blogs found.</p>
        </div>
      )}
    </div>
  );
}