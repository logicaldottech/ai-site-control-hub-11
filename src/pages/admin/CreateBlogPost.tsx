// pages/admin/CreateBlogPost.tsx
import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Save, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { httpFile } from "../../config.js";

const BASE_URL = import.meta.env.REACT_APP_API_URL || "https://aibackend.todaystrends.site/admin/v1";
const UPLOAD_URL = `${BASE_URL.replace(/\/$/, "")}/uploadFile`;

const IMG_BASE =
  import.meta.env.VITE_IMAGES_BASE_URL ||
  import.meta.env.REACT_APP_IMAGES_BASE_URL ||
  "https://aibackend.todaystrends.site";

function makeAbsUrl(url?: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${IMG_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

const BLOG_TYPES = [
  { id: "how", label: "How-To", note: "Step-by-step guides" },
  { id: "best", label: "Best", note: "Telling about best" },
  { id: "comparison", label: "VS / Comparison", note: "A vs B breakdown" },
  { id: "what", label: "What", note: "What is the reason or use of…" },
] as const;

type BlogTypeId = (typeof BLOG_TYPES)[number]["id"];
type AuthorItem = { _id: string; name: string };

export default function CreateBlogPost() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = (location.state as any)?.projectId || "";

  // Basic fields
  const [title, setTitle] = useState("");
  const [information, setInformation] = useState("");
  const [content, setContent] = useState("<p>Start writing…</p>");
  const [type, setType] = useState<BlogTypeId>(BLOG_TYPES[0].id);

  // Authors
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [authorId, setAuthorId] = useState<string | undefined>(undefined);

  // Meta
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState<string>("");

  // Cover image
  const [coverUrl, setCoverUrl] = useState("");
  const [coverAlt, setCoverAlt] = useState("");

  // Status / schedule
  const [status, setStatus] = useState<0 | 1 | 2>(0);
  const [isSchedule, setIsSchedule] = useState(false);
  const [scheduleLocal, setScheduleLocal] = useState<string>("");

  // Auth headers for JSON requests
  const jsonHeaders = useMemo(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    };
  }, []);

  // Load authors (httpFile.get)
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await httpFile.get<{ data: AuthorItem[] }>("/fetch_authors", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(res, "res of the authors list")


        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setAuthors(list);
        if (list.length) setAuthorId(String(list[0]._id)); // default selected
      } catch (error: any) {
        console.error("Failed to load authors:", error);
        if (error?.response?.status === 401) {
          toast.error("Session expired. Please login.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error(error?.response?.data?.message || "Failed to load authors");
        }
      }
    })();
  }, [navigate]);

  /** Upload cover image (httpFile.post); set URL */
  const onUploadCover = async (file: File) => {
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("file", file);

      const res = await httpFile.post("/uploadFile", fd, {
        headers: { Authorization: `Bearer ${token || ""}` },
      });

      const data = res.data;
      let url: string =
        (data?.data && (typeof data.data === "string" ? data.data : data.data?.url)) ||
        data?.url ||
        data?.filePath ||
        data?.path ||
        "";
      if (!url) throw new Error("No URL in response");

      setCoverUrl(makeAbsUrl(url));
      toast.success("Cover image uploaded");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Cover upload failed");
    }
  };

  /** Generate helpers (httpFile.post JSON) */
  const doGenerateMetaTitle = async () => {
    if (!title.trim()) return toast.error("Enter the blog title first");
    try {
      const res = await httpFile.post(
        "/blog/meta-title",
        { title, type },
        { headers: jsonHeaders }
      );
      setMetaTitle(res.data?.data || "");
      toast.success("Meta title generated");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Generation failed");
    }
  };

  const doGenerateMetaKeywords = async () => {
    if (!title.trim()) return toast.error("Enter the blog title first");
    try {
      const res = await httpFile.post(
        "/blog/meta-keywords",
        { title, type, count: 8 },
        { headers: jsonHeaders }
      );
      const arr: string[] = res.data?.data || [];
      setMetaKeywords(arr.join(", "));
      toast.success("Meta keywords generated");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Generation failed");
    }
  };

  const doGenerateMetaDescription = async () => {
    if (!title.trim()) return toast.error("Enter the blog title first");
    try {
      const res = await httpFile.post(
        "/blog/meta-description",
        { title, type },
        { headers: jsonHeaders }
      );
      setMetaDescription(res.data?.data || "");
      toast.success("Meta description generated");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Generation failed");
    }
  };

  /** Build payload & save (httpFile.post form-data) */
const handleSave = async () => {
  const token = localStorage.getItem("token");
  if (!title.trim()) return toast.error("Please enter a title");
  if (!authorId) return toast.error("Please select an author");
  if (!token) return toast.error("Missing auth token");

  // ✅ send ISO 8601 string (UTC) if scheduled; else send nothing
  let scheduleISO: string | undefined;
  if (isSchedule && scheduleLocal) {
    const d = new Date(scheduleLocal); // scheduleLocal is local time from <input type="datetime-local">
    const ms = d.getTime();
    if (isNaN(ms)) return toast.error("Invalid schedule date/time");
    scheduleISO = d.toISOString(); // <-- send this
  }

  const keywordsArray = metaKeywords
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const form = new FormData();
  form.append("title", title.trim());
  form.append("information", information.trim());
  form.append("content", content);
  form.append("type", type);
  if (projectId) form.append("projectId", projectId);
  form.append("authorId", authorId);
  if (metaTitle.trim()) form.append("meta_title", metaTitle.trim());
  if (metaDescription.trim()) form.append("meta_description", metaDescription.trim());
  form.append("meta_keywords", JSON.stringify(keywordsArray));
  if (coverUrl) form.append("coverImage.url", coverUrl);
  if (coverAlt) form.append("coverImage.alt", coverAlt);
  form.append("status", String(status));

  if (isSchedule) {
    form.append("isSchedule", "true");
    if (scheduleISO) form.append("scheduleTime", scheduleISO); // <-- ISO instead of epoch
  }

  try {
    await httpFile.post("/createBlog", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Blog created successfully");
    navigate("/admin/blog-posts", { state: { projectId } });
  } catch (e: any) {
    toast.error(e?.response?.data?.message || e?.message || "Create failed");
    if (e?.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }
};


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Blog Post</h1>
          {projectId && <p className="text-sm text-muted-foreground mt-1">Project: {projectId}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title + Type + Author */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Build a Blog API" />
            </div>

            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as BlogTypeId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{t.label}</span>
                        <span className="text-xs text-muted-foreground">{t.note}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="author">Author</Label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  {authors.length > 0 ? (
                    authors
                      .filter(a => a && a._id && a.name)
                      .map(a => (
                        <SelectItem key={a._id} value={String(a._id)}>
                          {a.name}
                        </SelectItem>
                      ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No authors found</div>
                  )}
                </SelectContent>
              </Select>
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
              placeholder="Quick overview of the API structure"
            />
          </div>

          {/* Cover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="coverAlt">Cover Alt Text</Label>
              <Input id="coverAlt" value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} placeholder="Blog cover" />
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
                  />
                  <Button type="button" variant="outline" disabled>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {coverUrl && (
            <div className="mt-2">
              {/* ✅ will work for absolute or relative URLs */}
              <img src={coverUrl} alt={coverAlt || ""} className="max-h-48 rounded-md border" />
              <p className="text-xs text-muted-foreground mt-1 break-all">{coverUrl}</p>
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor value={content} onChange={setContent} uploadUrl={UPLOAD_URL} height={420} />
          </div>

          {/* Meta with Generate buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <div className="flex gap-2">
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Blog API with Node and MongoDB"
                />
                <Button type="button" variant="outline" onClick={doGenerateMetaTitle}>
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
                  placeholder="Learn to build a production-ready blog API…"
                />
                <Button type="button" variant="outline" onClick={doGenerateMetaDescription}>
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
                placeholder="nodejs, mongodb, express"
              />
              <Button type="button" variant="outline" onClick={doGenerateMetaKeywords}>
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status + Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={String(status)} onValueChange={(v) => setStatus(Number(v) as 0 | 1 | 2)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                />
                <Label htmlFor="sch">Schedule</Label>
              </div>
              {isSchedule && (
                <Input
                  type="datetime-local"
                  value={scheduleLocal}
                  onChange={(e) => setScheduleLocal(e.target.value)}
                  className="max-w-[220px]"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
