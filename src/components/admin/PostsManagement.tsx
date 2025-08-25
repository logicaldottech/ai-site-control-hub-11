
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function PostsManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPostId, setCurrentPostId] = useState("");
  const [showAIGenerateDialog, setShowAIGenerateDialog] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiCategory, setAiCategory] = useState("");

  // Mock data for posts
  const [posts, setPosts] = useState([
    {
      id: "1",
      title: "Getting Started with AI WebGen",
      category: "Tutorial",
      status: "published",
      author: "Admin",
      date: "2023-05-15",
      comments: 5,
      content: "This is a comprehensive guide to getting started with AI WebGen. Learn how to create your first AI-powered website in minutes.",
      featuredImage: "https://images.unsplash.com/photo-1677442135145-40703ad880fa?w=500&auto=format&fit=crop&q=60",
      tags: ["AI", "Tutorial", "Beginner"]
    },
    {
      id: "2",
      title: "How to Customize Your Website Templates",
      category: "Guide",
      status: "published",
      author: "Editor",
      date: "2023-05-18",
      comments: 3,
      content: "Learn how to customize the built-in templates to create unique websites that match your brand identity.",
      featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60",
      tags: ["Templates", "Customization"]
    },
    {
      id: "3",
      title: "Upcoming Features in AI WebGen",
      category: "News",
      status: "draft",
      author: "Admin",
      date: "2023-05-20",
      comments: 0,
      content: "Get a sneak peek at the exciting new features coming soon to AI WebGen platform.",
      featuredImage: "",
      tags: ["News", "Features"]
    },
    {
      id: "4",
      title: "Optimizing Your Website for Speed",
      category: "Performance",
      status: "published",
      author: "Contributor",
      date: "2023-05-22",
      comments: 8,
      content: "Follow these best practices to optimize your AI-generated website for maximum performance and speed.",
      featuredImage: "https://images.unsplash.com/photo-1607798748738-b15c40d33d57?w=500&auto=format&fit=crop&q=60",
      tags: ["Performance", "Optimization"]
    }
  ]);

  // Mock data for categories
  const [categories, setCategories] = useState([
    { id: "1", name: "Tutorial", slug: "tutorial", count: 1 },
    { id: "2", name: "Guide", slug: "guide", count: 1 },
    { id: "3", name: "News", slug: "news", count: 1 },
    { id: "4", name: "Performance", slug: "performance", count: 1 },
  ]);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deletePost = () => {
    // Remove post
    setPosts(posts.filter(post => post.id !== currentPostId));
    toast.success("Post deleted successfully!");
    setShowDeleteConfirm(false);
  };

  const confirmDeletePost = (postId: string) => {
    setCurrentPostId(postId);
    setShowDeleteConfirm(true);
  };

  const handleGenerateFullPost = () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic for your blog post");
      return;
    }

    setAiGenerating(true);

    // In a real app, this would call an AI service
    setTimeout(() => {
      // Generate a full post with AI
      const generatedPost = {
        id: (posts.length + 1).toString(),
        title: aiTopic,
        content: "# " + aiTopic + "\n\n## Introduction\n\nWelcome to this comprehensive guide about " + 
                aiTopic + ". In this article, we'll explore everything you need to know about this fascinating topic.\n\n" +
                "## What is " + aiTopic + "?\n\n" + aiTopic + " refers to an innovative approach to solving complex problems in the digital world. " +
                "By leveraging advanced technologies and methodologies, it provides unprecedented capabilities for businesses and individuals alike.\n\n" +
                "## Key Benefits\n\n1. **Enhanced Efficiency** - Streamline your workflow and save valuable time\n" +
                "2. **Improved Results** - Achieve better outcomes through intelligent optimization\n" +
                "3. **Future-Proof Solutions** - Stay ahead of the curve with cutting-edge capabilities\n\n" +
                "## How to Get Started\n\n1. Identify your specific needs and goals\n" +
                "2. Research available tools and platforms\n" +
                "3. Start with a small pilot project\n" +
                "4. Scale based on initial results\n\n" +
                "## Conclusion\n\n" + aiTopic + " represents a significant advancement in how we approach digital solutions. " +
                "By incorporating these concepts into your strategy, you'll be well-positioned to thrive in today's competitive landscape.",
        category: aiCategory || "Technology",
        status: "draft",
        author: "AI Assistant",
        date: new Date().toISOString().split('T')[0],
        comments: 0,
        featuredImage: "https://images.unsplash.com/photo-1677442135145-40703ad880fa?w=500&auto=format&fit=crop&q=60",
        tags: [aiCategory || "Technology", "AI Generated"]
      };
      
      // Add to posts
      setPosts([...posts, generatedPost]);
      
      // Reset and close dialog
      setAiTopic("");
      setAiCategory("");
      setAiGenerating(false);
      setShowAIGenerateDialog(false);
      
      toast.success("AI has generated a new blog post! View it in the post list.");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Posts Management</h1>
        <div className="flex gap-2">
          <Dialog open={showAIGenerateDialog} onOpenChange={setShowAIGenerateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Blog with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate Blog with AI</DialogTitle>
                <DialogDescription>
                  Enter a topic and the AI will generate a complete blog post for you.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="ai-topic" className="text-sm font-medium">Blog Topic</label>
                  <Input
                    id="ai-topic"
                    placeholder="e.g., 'The Future of AI in Web Development'"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="ai-category" className="text-sm font-medium">Category</label>
                  <select 
                    id="ai-category"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={aiCategory} 
                    onChange={(e) => setAiCategory(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAIGenerateDialog(false)}>Cancel</Button>
                <Button 
                  onClick={handleGenerateFullPost}
                  disabled={aiGenerating}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {aiGenerating ? "Generating..." : "Generate Blog"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button onClick={() => navigate('/post-editor', { state: { from: '/posts' } })}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Post
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={deletePost}>Delete Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <div className="flex space-x-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search posts by title or category..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blog Posts</CardTitle>
            <CardDescription>
              Manage your blog posts. You can create, edit, and delete posts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {post.featuredImage && (
                            <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                              <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          {post.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={post.status === "published" ? "default" : "secondary"}
                          className={post.status === "published" ? "bg-green-500" : ""}
                        >
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{post.date}</TableCell>
                      <TableCell>{post.comments}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/post/${post.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/post-editor/${post.id}`, { state: { from: '/posts' } })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => confirmDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No posts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
