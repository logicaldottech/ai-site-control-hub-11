
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Eye, Sparkles, PenTool } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SimplePostEditor } from "./SimplePostEditor";

export function PostsManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPostId, setCurrentPostId] = useState("");
  const [showAIGenerateDialog, setShowAIGenerateDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [aiTitle, setAiTitle] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState<"manual" | "ai">("manual");
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Mock data for posts
  const [posts, setPosts] = useState([
    {
      id: "1",
      title: "Getting Started with AI WebGen",
      introduction: "Learn the basics of AI-powered web generation",
      content: "<h2>Welcome to AI WebGen</h2><p>This guide will help you get started...</p>",
      status: "published",
      author: "Admin",
      date: "2023-05-15"
    },
    {
      id: "2", 
      title: "Website Templates Guide",
      introduction: "Customize templates to match your brand",
      content: "<h2>Template Customization</h2><p>Learn how to customize templates...</p>",
      status: "published",
      author: "Editor", 
      date: "2023-05-18"
    }
  ]);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deletePost = () => {
    setPosts(posts.filter(post => post.id !== currentPostId));
    toast.success("Post deleted successfully!");
    setShowDeleteConfirm(false);
  };

  const confirmDeletePost = (postId: string) => {
    setCurrentPostId(postId);
    setShowDeleteConfirm(true);
  };

  const handleManualPost = () => {
    setEditorMode("manual");
    setSelectedPost(null);
    setShowEditor(true);
    setShowManualDialog(false);
  };

  const handleAIPost = () => {
    if (!aiTitle.trim()) {
      toast.error("Please enter a title for your blog post");
      return;
    }
    
    setEditorMode("ai");
    setSelectedPost(null);
    setShowEditor(true);
    setShowAIGenerateDialog(false);
  };

  const handleEditPost = (post: any) => {
    setSelectedPost(post);
    setEditorMode("manual");
    setShowEditor(true);
  };

  if (showEditor) {
    return (
      <SimplePostEditor 
        isAI={editorMode === "ai"} 
        aiTitle={aiTitle}
        key={selectedPost?.id || "new"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
        <div className="flex gap-2">
          <Dialog open={showAIGenerateDialog} onOpenChange={setShowAIGenerateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Post with AI</DialogTitle>
                <DialogDescription>Enter a title for your blog post</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Enter post title..."
                  value={aiTitle}
                  onChange={(e) => setAiTitle(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAIGenerateDialog(false)}>Cancel</Button>
                <Button onClick={handleAIPost}>Generate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
            <DialogTrigger asChild>
              <Button>
                <PenTool className="mr-2 h-4 w-4" />
                Manual Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Manual Post</DialogTitle>
                <DialogDescription>Create a new blog post manually</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowManualDialog(false)}>Cancel</Button>
                <Button onClick={handleManualPost}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <TableHead>Introduction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{post.introduction}</TableCell>
                      <TableCell>
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{post.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditPost(post)}
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
                    <TableCell colSpan={6} className="text-center py-4">
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
