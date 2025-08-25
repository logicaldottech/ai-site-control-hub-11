import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Eye, Trash2, Sparkles, FileText, Search } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  introduction: string;
  content: string;
  createdAt: string;
  status: "draft" | "published";
  type: "manual" | "ai";
}

const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with React",
    introduction: "Learn the basics of React development and component-based architecture.",
    content: "<h2>Introduction to React</h2><p>React is a powerful JavaScript library...</p>",
    createdAt: "2024-01-15",
    status: "published",
    type: "manual"
  },
  {
    id: "2", 
    title: "AI-Generated Content Strategies",
    introduction: "Explore how AI can enhance your content creation workflow.",
    content: "<h2>The Future of Content</h2><p>AI-generated content is revolutionizing...</p>",
    createdAt: "2024-01-10",
    status: "draft",
    type: "ai"
  }
];

export default function BlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [newPost, setNewPost] = useState({
    title: "",
    introduction: "",
    content: ""
  });
  const [aiPostTitle, setAiPostTitle] = useState("");

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.introduction.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManualPost = () => {
    setNewPost({ title: "", introduction: "", content: "" });
    setIsAddDialogOpen(true);
  };

  const handleAIPost = () => {
    setAiPostTitle("");
    setIsAIDialogOpen(true);
  };

  const handleSavePost = () => {
    if (!newPost.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the post",
        variant: "destructive"
      });
      return;
    }

    const post: BlogPost = {
      id: Date.now().toString(),
      title: newPost.title,
      introduction: newPost.introduction,
      content: newPost.content,
      createdAt: new Date().toISOString().split('T')[0],
      status: "draft",
      type: "manual"
    };

    setPosts([post, ...posts]);
    setIsAddDialogOpen(false);
    setNewPost({ title: "", introduction: "", content: "" });
    
    toast({
      title: "Success",
      description: "Blog post created successfully!"
    });
  };

  const handleGenerateAIPost = async () => {
    if (!aiPostTitle.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a title for the AI post",
        variant: "destructive"
      });
      return;
    }

    // Simulate AI API call
    toast({
      title: "Generating...",
      description: "AI is creating your blog post. This may take a moment."
    });

    // Mock AI generation - replace with actual API call
    setTimeout(() => {
      const aiPost: BlogPost = {
        id: Date.now().toString(),
        title: aiPostTitle,
        introduction: `AI-generated introduction for "${aiPostTitle}". This content explores the key concepts and provides valuable insights on the topic.`,
        content: `<h2>Introduction</h2><p>This is an AI-generated blog post about ${aiPostTitle}.</p><h2>Key Points</h2><ul><li>Comprehensive coverage of the topic</li><li>Data-driven insights</li><li>Practical applications</li></ul><h2>Conclusion</h2><p>This AI-generated content provides a solid foundation for understanding ${aiPostTitle}.</p>`,
        createdAt: new Date().toISOString().split('T')[0],
        status: "draft",
        type: "ai"
      };

      setPosts([aiPost, ...posts]);
      setIsAIDialogOpen(false);
      setAiPostTitle("");
      
      toast({
        title: "Success",
        description: "AI blog post generated successfully!"
      });
    }, 2000);
  };

  const handleEditPost = (post: BlogPost) => {
    setCurrentPost(post);
    setNewPost({
      title: post.title,
      introduction: post.introduction,
      content: post.content
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePost = () => {
    if (!currentPost || !newPost.title.trim()) return;

    const updatedPosts = posts.map(post =>
      post.id === currentPost.id
        ? { ...post, title: newPost.title, introduction: newPost.introduction, content: newPost.content }
        : post
    );

    setPosts(updatedPosts);
    setIsEditDialogOpen(false);
    setCurrentPost(null);
    setNewPost({ title: "", introduction: "", content: "" });
    
    toast({
      title: "Success",
      description: "Blog post updated successfully!"
    });
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
    toast({
      title: "Success",
      description: "Blog post deleted successfully!"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your blog posts with manual or AI-generated content
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleManualPost} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manual Post
          </Button>
          <Button onClick={handleAIPost} variant="outline" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generated
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search blog posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status}
                    </Badge>
                    <Badge variant={post.type === "ai" ? "outline" : "secondary"}>
                      {post.type === "ai" ? "AI" : "Manual"}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="line-clamp-3 mt-2">
                {post.introduction}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>Created: {post.createdAt}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEditPost(post)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDeletePost(post.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manual Post Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Blog Post</DialogTitle>
            <DialogDescription>
              Create a new blog post manually with custom content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="Enter post title..."
              />
            </div>
            <div>
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                id="introduction"
                value={newPost.introduction}
                onChange={(e) => setNewPost({...newPost, introduction: e.target.value})}
                placeholder="Enter post introduction..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                placeholder="Enter post content... You can use HTML tags for formatting."
                rows={10}
                className="font-mono"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePost}>
                Create Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update your blog post content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="Enter post title..."
              />
            </div>
            <div>
              <Label htmlFor="edit-introduction">Introduction</Label>
              <Textarea
                id="edit-introduction"
                value={newPost.introduction}
                onChange={(e) => setNewPost({...newPost, introduction: e.target.value})}
                placeholder="Enter post introduction..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                placeholder="Enter post content... You can use HTML tags for formatting."
                rows={10}
                className="font-mono"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePost}>
                Update Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Post Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Blog Post</DialogTitle>
            <DialogDescription>
              Enter a title and let AI generate the content for you
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-title">Post Title</Label>
              <Input
                id="ai-title"
                value={aiPostTitle}
                onChange={(e) => setAiPostTitle(e.target.value)}
                placeholder="Enter the topic or title for AI generation..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAIDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateAIPost} className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}