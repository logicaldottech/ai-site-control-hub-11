import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Edit, Eye, Trash2, Sparkles, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ApiBlog = {
  _id: string;
  title: string;
  type: string;
  views: number;
  author?: string | null;
  status: 0 | 1 | 2;
  createdAt: string;
  updatedAt: string;
  scheduleTime?: string | null;
};

export default function BlogPosts() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateProjectId = (location.state as any)?.projectId;
  const queryProjectId = new URLSearchParams(location.search).get("projectId");
  const projectId = stateProjectId || queryProjectId || "";

  // List state (server)
  const [posts, setPosts] = useState<ApiBlog[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  // Local edit/create state
  const [currentPost, setCurrentPost] = useState<{ id: string; title: string; introduction: string; content: string } | null>(null);
  const [newPost, setNewPost] = useState({ title: "", introduction: "", content: "" });
  const [aiPostTitle, setAiPostTitle] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const BASE_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:1111/admin/v1";

  const mapStatus = (s: ApiBlog["status"]) => (s === 1 ? "published" : s === 2 ? "archived" : "draft");
  const statusBadgeVariant = (s: ApiBlog["status"]) =>
    s === 1 ? { variant: "default", className: "bg-green-500 text-white" } : s === 2 ? { variant: "secondary", className: "" } : { variant: "secondary", className: "" };

  const fmtDate = (value?: string | null) => {
    if (!value) return "—";
    if (/^\d+$/.test(value)) {
      const ms = Number(value) < 1e12 ? Number(value) * 1000 : Number(value);
      const d = new Date(ms);
      return isNaN(d.getTime()) ? "—" : d.toLocaleString();
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString();
  };

  // Fetch list (adds projectId if present)
  async function fetchPosts(nextPage = page, nextLimit = limit) {
    try {
      if (!token) {
        toast({ title: "Auth error", description: "Missing token", variant: "destructive" });
        return;
      }
      setLoading(true);

      const url = new URL(`${BASE_URL}/listBlogs`);
      url.searchParams.set("page", String(nextPage));
      url.searchParams.set("limit", String(nextLimit));
      if (projectId) url.searchParams.set("projectId", projectId);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch blogs");

      const data = json?.data || {};
      const items: ApiBlog[] = (data.items || []).map((it: any) => ({
        _id: it._id,
        title: it.title,
        type: it.type,
        views: it.views ?? 0,
        author: it.author ?? null,
        status: it.status,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
        scheduleTime: it.scheduleTime ?? null,
      }));

      setPosts(items);
      setPage(Number(data.page || nextPage));
      setLimit(Number(data.limit || nextLimit));
      setPages(Number(data.pages || 1));
      setTotal(Number(data.total || 0));
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Could not load blogs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.type || "").toLowerCase().includes(q) || (p.author || "").toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  // AI
  const handleAIPost = () => {
    setAiPostTitle("");
    setIsAIDialogOpen(true);
  };

  const handleGenerateAIPost = async () => {
    if (!aiPostTitle.trim()) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
      return;
    }
    // Call your AI create endpoint here and then refresh
    toast({ title: "Generating…", description: "Call your AI create endpoint here." });
    setIsAIDialogOpen(false);
  };

  // Edit
// Edit -> go to /admin/edit-post and pass the blog id (and projectId for context)
const handleEditPost = (p: ApiBlog) => {
  navigate(`/admin/edit-post?id=${p._id}`, { state: { projectId } });
};


  const handleUpdatePost = async () => {
    if (!currentPost) return;
    // Call your update API here, then refresh
    setIsEditDialogOpen(false);
    toast({ title: "Updated", description: "Post updated (refresh list)" });
    fetchPosts(page, limit);
  };

  const handleDeletePost = async (id: string) => {
    // Call delete API then refresh
    toast({ title: "Deleted", description: "Post removed (refresh list)" });
    fetchPosts(page, limit);
  };

  // Pagination
  const handlePrev = () => {
    if (page <= 1) return;
    fetchPosts(page - 1, limit);
  };
  const handleNext = () => {
    if (page >= pages) return;
    fetchPosts(page + 1, limit);
  };
  const handleLimitChange = (val: number) => {
    setLimit(val);
    fetchPosts(1, val);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-2">
            {projectId ? "Showing blogs for selected project" : "Create and manage your blog posts (server list with pagination)"}
          </p>
        </div>

        {/* TOP BUTTONS */}
        <div className="flex gap-2">
          {/* Add Manual Blog -> navigate */}
          <Button
            onClick={() => navigate("/admin/create-post", { state: { projectId } })}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Add Manual Blog
          </Button>


          {/* AI Generated Blogs -> open dialog */}
        {/* AI Generated Blogs -> go to new page */}
<Button
  onClick={() => navigate("/admin/create-post-ai", { state: { projectId } })}
  variant="outline"
  className="flex items-center gap-2"
>
  <Sparkles className="h-4 w-4" />
  AI Generated Blogs
</Button>

        </div>
      </div>

      {/* Search + page size */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by title / type / author…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows:</span>
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* List (Table) */}
      <Card>
        <CardHeader>
          <CardTitle>Blogs</CardTitle>
          <CardDescription>
            Fetched from {BASE_URL}/listBlogs{projectId ? `?projectId=${projectId}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">Loading…</TableCell>
                </TableRow>
              ) : filteredPosts.length ? (
                filteredPosts.map((p) => {
                  const badge = statusBadgeVariant(p.status);
                  return (
                    <TableRow key={p._id}>
                      <TableCell className="max-w-[360px] truncate">{p.title}</TableCell>
                      <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={badge.variant as any} className={badge.className}>{mapStatus(p.status)}</Badge>
                      </TableCell>
                      <TableCell>{p.author || "—"}</TableCell>
                      <TableCell>{p.views ?? 0}</TableCell>
                      <TableCell>{fmtDate(p.createdAt)}</TableCell>
                      <TableCell>{fmtDate(p.scheduleTime || null)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(`/post/${p._id}`, "_blank")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditPost(p)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeletePost(p._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">No posts found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Page {page} of {pages} · Total {total}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={page <= 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext} disabled={page >= pages}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>Update your blog post</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-introduction">Introduction</Label>
              <Textarea id="edit-introduction" value={newPost.introduction} onChange={(e) => setNewPost({ ...newPost, introduction: e.target.value })} rows={3} />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea id="edit-content" value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} rows={10} className="font-mono" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdatePost}>Update Post</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Blog Post</DialogTitle>
            <DialogDescription>Enter a title and let AI generate the content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-title">Post Title</Label>
              <Input id="ai-title" value={aiPostTitle} onChange={(e) => setAiPostTitle(e.target.value)} placeholder="Enter topic…" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAIDialogOpen(false)}>Cancel</Button>
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
