// pages/admin/EditBlogPost.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Save, Sparkles, Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/editor/RichTextEditor";

const BASE_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:1111/admin/v1";
const UPLOAD_URL = `${BASE_URL.replace(/\/$/, "")}/uploadFile`;

const BLOG_TYPES = [
  "technical", "tutorial", "guide", "case-study", "news",
  "opinion", "how-to", "product", "performance", "security",
];

function toLocalDatetimeInput(msLike?: string | number | null): string {
  if (!msLike) return "";
  const n = typeof msLike === "string" ? Number(msLike) : msLike;
  if (!n) return "";
  const d = new Date(n);
  if (isNaN(d.getTime())) return "";
  // YYYY-MM-DDTHH:mm (local)
  const pad = (x: number) => `${x}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditBlogPost() {
  const navigate = useNavigate();
  const location = useLocation();

  // Accept id from: /edit-post/:id OR ?id=... OR location.state.id
  const params = useParams();
  const [sp] = useSearchParams();
  const routeId = params.id;
  const queryId = sp.get("id");
  const stateId = (location.state as any)?.id;
  const blogId = routeId || queryId || stateId || "";

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Data fields
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>("");

  const [title, setTitle] = useState("");
  const [information, setInformation] = useState("");
  const [content, setContent] = useState("<p>Start writing…</p>");
  const [type, setType] = useState<string>(BLOG_TYPES[0]);
  const [authorName, setAuthorName] = useState("");

  // Meta
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState<string>(""); // comma-separated in UI

  // Cover image
  const [coverUrl, setCoverUrl] = useState("");
  const [coverAlt, setCoverAlt] = useState("");

  // Status / schedule
  const [status, setStatus] = useState<0 | 1 | 2>(0);
  const [isSchedule, setIsSchedule] = useState(false);
  const [scheduleLocal, setScheduleLocal] = useState<string>("");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // ----- Load blog -----
  useEffect(() => {
    const run = async () => {
      if (!blogId) {
        toast.error("Missing blog id");
        setLoading(false);
        return;
      }
      try {
        const url = new URL(`${BASE_URL}/getBlog`);
        url.searchParams.set("id", blogId);
        const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token || ""}` } });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to load blog");

        const b = json?.data || {};
        setProjectId(b.projectId || "");

        setTitle(b.title || "");
        setInformation(b.information || "");
        setContent(b.content || "<p></p>");
        setType(b.type || BLOG_TYPES[0]);
        setAuthorName(b.authorName || "");

        // meta
        const sm = b.seoMeta || {};
        setMetaTitle(sm.metaTitle || "");
        setMetaDescription(sm.metaDescription || "");
        setMetaKeywords(Array.isArray(sm.keywords) ? sm.keywords.join(", ") : "");

        // cover (if your API returns it)
        const ci = b.coverImage || {};
        setCoverUrl(ci.url || "");
        setCoverAlt(ci.alt || "");

        // status + schedule
        setStatus(Number(b.status ?? 0) as 0 | 1 | 2);
        const sch = !!b.isSchedule;
        setIsSchedule(sch);
        setScheduleLocal(sch ? toLocalDatetimeInput(b.scheduleTime) : "");
      } catch (e: any) {
        toast.error(e?.message || "Could not load blog");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [blogId, token]);

  // ----- Upload cover -----
  const onUploadCover = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(UPLOAD_URL, { method: "POST", body: fd, headers: { Authorization: `Bearer ${token || ""}` } });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      let url: string =
        (data?.data && (typeof data.data === "string" ? data.data : data.data?.url)) ||
        data?.url || data?.filePath || data?.path || "";
      if (!url) throw new Error("No URL in response");
      if (!/^https?:\/\//i.test(url)) url = `https://aibackend.todaystrends.site${url.startsWith("/") ? "" : "/"}${url}`;
      setCoverUrl(url);
      toast.success("Cover image uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Cover upload failed");
    }
  };

  // ----- Generate meta -----
  const doGenerateMetaTitle = async () => {
    if (!title.trim()) return toast.error("Enter the blog title first");
    try {
      const res = await fetch(`${BASE_URL}/blog/meta-title`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ title, type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed");
      setMetaTitle(json.data || "");
      toast.success("Meta title generated");
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
    }
  };

  const doGenerateMetaKeywords = async () => {
    if (!title.trim()) return toast.error("Enter the blog title first");
    try {
      const res = await fetch(`${BASE_URL}/blog/meta-keywords`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ title, type, count: 8 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed");
      setMetaKeywords((json.data || []).join(", "));
      toast.success("Meta keywords generated");
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
    }
  };

  const doGenerateMetaDescription = async () => {
    if (!title.trim()) return toast.error("Enter the blog title first");
    try {
      const res = await fetch(`${BASE_URL}/blog/meta-description`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ title, type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed");
      setMetaDescription(json.data || "");
      toast.success("Meta description generated");
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
    }
  };

  // ----- Save (PATCH updateBlog/:id using FormData) -----
  const handleUpdate = async () => {
    if (!blogId) return toast.error("Missing blog id");
    if (!title.trim()) return toast.error("Please enter a title");
    if (!token) return toast.error("Missing auth token");

    // schedule ms (if provided)
    let scheduleTime: number | undefined;
    if (isSchedule && scheduleLocal) {
      const ms = new Date(scheduleLocal).getTime();
      if (!isNaN(ms)) scheduleTime = ms;
    }

    const keywordsArray = metaKeywords
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const form = new FormData();
    form.append("title", title.trim());
    form.append("information", information.trim());
    form.append("content", content);
    form.append("type", type);
    if (projectId) form.append("projectId", projectId);
    if (authorName.trim()) form.append("authorName", authorName.trim());

    if (metaTitle.trim()) form.append("meta_title", metaTitle.trim());
    if (metaDescription.trim()) form.append("meta_description", metaDescription.trim());
    form.append("meta_keywords", JSON.stringify(keywordsArray));

    if (coverUrl) form.append("coverImage.url", coverUrl);
    if (coverAlt) form.append("coverImage.alt", coverAlt);

    form.append("status", String(status));

    if (isSchedule) {
      form.append("isSchedule", "true");
      if (scheduleTime !== undefined) form.append("scheduleTime", String(scheduleTime));
    }

    try {
      const res = await fetch(`${BASE_URL}/updateBlog/${blogId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type for FormData
        body: form,
      });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(json?.message || "Update failed");
      toast.success("Blog updated");
      navigate("/admin/blog-posts", { state: { projectId } });
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    }
  };

  if (!blogId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
        <p className="text-red-600">No blog id provided.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Blog Post</h1>
          {projectId && <p className="text-sm text-muted-foreground mt-1">Project: {projectId}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={handleUpdate}><Save className="h-4 w-4 mr-2" /> Save</Button>
          <Button
            variant="outline"
            onClick={() => window.open(`/post/${blogId}`, "_blank")}
            title="View public post"
          >
            <ExternalLink className="h-4 w-4 mr-2" /> View
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Title + Type + Author */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v)} disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {BLOG_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="author">Author Name</Label>
              <Input
                id="author"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Author"
                disabled={loading}
              />
            </div>
          </div>

          {/* Information */}
          <div>
            <Label htmlFor="info">Information (short intro)</Label>
            <Textarea
              id="info"
              rows={3}
              value={information}
              onChange={(e) => setInformation(e.target.value)}
              placeholder="Short summary"
              disabled={loading}
            />
          </div>

          {/* Cover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="coverAlt">Cover Alt Text</Label>
              <Input
                id="coverAlt"
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                placeholder="Cover alt"
                disabled={loading}
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label>Cover Image</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUploadCover(f);
                    }}
                    disabled={loading}
                  />
                  <Button type="button" variant="outline" disabled><Upload className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </div>
          {coverUrl && (
            <div className="mt-2">
              <img src={coverUrl} alt={coverAlt || ""} className="max-h-48 rounded-md border" />
              <p className="text-xs text-muted-foreground mt-1 break-all">{coverUrl}</p>
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor value={content} onChange={setContent} uploadUrl={UPLOAD_URL} height={420} />
          </div>

          {/* Meta + Generate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <div className="flex gap-2">
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Meta title"
                  disabled={loading}
                />
                <Button type="button" variant="outline" onClick={doGenerateMetaTitle} disabled={loading}>
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="metaDesc">Meta Description</Label>
              <div className="flex gap-2">
                <Input
                  id="metaDesc"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Meta description"
                  disabled={loading}
                />
                <Button type="button" variant="outline" onClick={doGenerateMetaDescription} disabled={loading}>
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="metaKeys">Meta Keywords (comma separated)</Label>
            <div className="flex gap-2">
              <Input
                id="metaKeys"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder='keyword1, keyword2'
                disabled={loading}
              />
              <Button type="button" variant="outline" onClick={doGenerateMetaKeywords} disabled={loading}>
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status + Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={String(status)} onValueChange={(v) => setStatus(Number(v) as 0 | 1 | 2)} disabled={loading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Draft</SelectItem>
                  <SelectItem value="1">Published</SelectItem>
                  <SelectItem value="2">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="sch"
                  checked={isSchedule}
                  onCheckedChange={(v) => {
                    setIsSchedule(v);
                    if (!v) setScheduleLocal("");
                  }}
                  disabled={loading}
                />
                <Label htmlFor="sch">Schedule</Label>
              </div>
              {isSchedule && (
                <Input
                  type="datetime-local"
                  value={scheduleLocal}
                  onChange={(e) => setScheduleLocal(e.target.value)}
                  className="max-w-[220px]"
                  disabled={loading}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
