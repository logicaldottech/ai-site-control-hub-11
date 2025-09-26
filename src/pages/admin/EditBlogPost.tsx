// pages/admin/EditBlogPost.tsx
import { useEffect, useMemo, useRef, useState } from "react";
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
import { httpFile } from "../../config.js";

const BASE_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:1111/admin/v1";
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
const VALID_TYPE_IDS = new Set(BLOG_TYPES.map(t => t.id));
type AuthorItem = { _id: string; name: string };

function toLocalDatetimeInput(dateLike?: string | number | null): string {
  if (!dateLike) return "";
  const d = new Date(dateLike); // handles ISO or ms
  if (isNaN(d.getTime())) return "";
  const pad = (x: number) => `${x}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}


/* ---------- helpers to guarantee saving FULL HTML ---------- */
const looksFullDoc = (html: string) => /<!doctype|<html\b/i.test(html);

const splitDoc = (fullHtml: string) => {
  try {
    const p = new DOMParser();
    const d = p.parseFromString(fullHtml || "", "text/html");
    const doctype = d.doctype ? `<!doctype ${d.doctype.name}>` : "<!doctype html>";
    const htmlAttrs =
      d.documentElement?.getAttributeNames?.()
        ?.map(n => `${n}="${d.documentElement.getAttribute(n) ?? ""}"`)
        .join(" ") || 'lang="en"';
    return { doctype, htmlAttrs, head: d.head?.innerHTML ?? "", body: d.body?.innerHTML ?? "" };
  } catch {
    const head = (fullHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1]) || "";
    const body = (fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]) || fullHtml || "";
    const doctype = (fullHtml.match(/<!doctype[^>]*>/i)?.[0]) || "<!doctype html>";
    const htmlAttrs = (fullHtml.match(/<html([^>]*)>/i)?.[1] || ' lang="en"').trim() || 'lang="en"';
    return { doctype, htmlAttrs, head, body };
  }
};

const joinDoc = (doctype: string, htmlAttrs: string, head: string, body: string) =>
  `${doctype || "<!doctype html>"}\n<html ${htmlAttrs || 'lang="en"'}>\n<head>\n${head || ""}\n</head>\n<body>\n${body || ""}\n</body>\n</html>`;

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
  const [type, setType] = useState<BlogTypeId>(BLOG_TYPES[0].id);

  // Authors
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [authorId, setAuthorId] = useState<string>("");

  // Remember blog's saved author id.
  const [blogAuthorId, setBlogAuthorId] = useState<string | null | undefined>(undefined);

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

  // Keep the original full HTML we loaded (to reuse its head/doctype if content becomes body-only)
  const originalFullRef = useRef<string>("");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // Load authors
  useEffect(() => {
    (async () => {
      try {
        const res = await httpFile.get<{ data: AuthorItem[] }>("/fetch_authors", {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setAuthors(list);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Failed to load authors";
        toast.error(msg);
        if (e?.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    })();
  }, [navigate, token]);

  // Load blog
  useEffect(() => {
    const run = async () => {
      if (!blogId) {
        toast.error("Missing blog id");
        setLoading(false);
        return;
      }
      try {
        const res = await httpFile.get("/getBlog", {
          headers: { Authorization: `Bearer ${token || ""}` },
          params: { id: blogId },
        });
        const json = res.data;
        const b = json?.data || {};

        setProjectId(b.projectId || "");
        setTitle(b.title || "");
        setInformation(b.information || "");
        setContent(b.content || "<p></p>");
        if (typeof b.content === "string") {
          originalFullRef.current = b.content; // keep what server returned
        }
        setType(VALID_TYPE_IDS.has(b.type) ? (b.type as BlogTypeId) : BLOG_TYPES[0].id);

        // capture blog's saved author id (string, null, or undefined)
        setBlogAuthorId(b.authorId ? String(b.authorId) : null);

        // Meta
        const sm = b.seoMeta || {};
        setMetaTitle(sm.metaTitle || "");
        setMetaDescription(sm.metaDescription || "");
        setMetaKeywords(Array.isArray(sm.keywords) ? sm.keywords.join(", ") : "");

        // Cover
        const ci = b.coverImage || {};
        setCoverUrl(makeAbsUrl(ci.url || ""));
        setCoverAlt(ci.alt || "");

        // Status + Schedule
        setStatus(Number(b.status ?? 0) as 0 | 1 | 2);
        const sch = !!b.isSchedule;
        setIsSchedule(sch);
        setScheduleLocal(sch ? toLocalDatetimeInput(b.scheduleTime) : "");
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Could not load blog";
        toast.error(msg);
        if (e?.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [blogId, token, navigate]);

  // Reconcile author selection once both authors and blogAuthorId are known
  useEffect(() => {
    if (!authors.length) return;
    if (blogAuthorId === undefined) return; // wait for blog fetch to finish

    const blogIdInList = blogAuthorId
      ? authors.some(a => String(a._id) === String(blogAuthorId))
      : false;

    if (blogIdInList) {
      setAuthorId(String(blogAuthorId));
    } else if (!authorId) {
      setAuthorId(String(authors[0]._id));
    }
  }, [authors, blogAuthorId]); // do not depend on authorId to avoid loops

  // Upload cover
  const onUploadCover = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await httpFile.post("/uploadFile", fd, {
        headers: { Authorization: `Bearer ${token || ""}` },
      });

      const data = res.data;
      let url: string =
        (data?.data && (typeof data.data === "string" ? data.data : data.data?.url)) ||
        data?.url || data?.filePath || data?.path || "";
      if (!url) throw new Error("No URL in response");

      setCoverUrl(makeAbsUrl(url));
      toast.success("Cover image uploaded");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Cover upload failed");
    }
  };

  // Meta generators
  const doGenerateMetaTitle = async () => {
    if (!title.trim()) return toast.error("Enter the blog title first");
    try {
      const res = await httpFile.post(
        "/blog/meta-title",
        { title, type },
        { headers: authHeaders }
      );
      const json = res.data;
      setMetaTitle(json.data || "");
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
        { headers: authHeaders }
      );
      const json = res.data;
      setMetaKeywords((json.data || []).join(", "));
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
        { headers: authHeaders }
      );
      const json = res.data;
      setMetaDescription(json.data || "");
      toast.success("Meta description generated");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Generation failed");
    }
  };

  // Save
 const handleUpdate = async () => {
  if (!blogId) return toast.error("Missing blog id");
  if (!title.trim()) return toast.error("Please enter a title");
  if (!authorId) return toast.error("Please select an author");
  if (!token) return toast.error("Missing auth token");

  // ✅ send ISO string if scheduled
  let scheduleISO: string | undefined;
  if (isSchedule && scheduleLocal) {
    const d = new Date(scheduleLocal);
    if (!isNaN(d.getTime())) {
      scheduleISO = d.toISOString(); // <-- ISO instead of epoch
    }
  }

  const keywordsArray = metaKeywords
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const authorName = authors.find(a => String(a._id) === String(authorId))?.name || "";

  let contentToSave = content;
  if (!looksFullDoc(contentToSave)) {
    const orig = originalFullRef.current || "";
    const { doctype, htmlAttrs, head } = splitDoc(looksFullDoc(orig) ? orig : "");
    contentToSave = joinDoc(doctype, htmlAttrs, head, contentToSave);
  }

  const form = new FormData();
  form.append("title", title.trim());
  form.append("information", information.trim());
  form.append("content", contentToSave);
  form.append("type", type);
  if (projectId) form.append("projectId", projectId);

  if (authorId) form.append("authorId", authorId);
  if (authorName) form.append("authorName", authorName);

  if (metaTitle.trim()) form.append("meta_title", metaTitle.trim());
  if (metaDescription.trim()) form.append("meta_description", metaDescription.trim());
  form.append("meta_keywords", JSON.stringify(keywordsArray));

  if (coverUrl) form.append("coverImage.url", coverUrl);
  if (coverAlt) form.append("coverImage.alt", coverAlt);

  form.append("status", String(status));

  if (isSchedule) {
    form.append("isSchedule", "true");
    if (scheduleISO) form.append("scheduleTime", scheduleISO); // <-- send ISO
  }

  try {
    await httpFile.post(`/updateBlog/${blogId}`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Blog updated");
    navigate("/admin/blog-posts", { state: { projectId } });
  } catch (e: any) {
    toast.error(e?.response?.data?.message || e?.message || "Update failed");
    if (e?.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }
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
              <Select value={type} onValueChange={(v) => setType(v as BlogTypeId)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_TYPES.map(t => (
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
              <Select value={authorId} onValueChange={setAuthorId} disabled={loading || !authors.length}>
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

          {/* Preview */}
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
                placeholder="keyword1, keyword2"
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
