import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Save, Eye, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/editor/RichTextEditor";

const BASE_URL = import.meta.env.REACT_APP_API_URL || "https://aibackend.todaystrends.site/admin/v1";
const UPLOAD_URL = `${BASE_URL.replace(/\/$/, "")}/uploadFile`;
// Replace your BLOG_TYPES with this:

const BLOG_TYPES = [
  { id: "how", label: "How-To", note: "Step-by-step guides" },
  { id: "best", label: "Best", note: "Telling about best" },
  { id: "comparison", label: "VS / Comparison", note: "A vs B breakdown" },
  { id: "what", label: "What", note: "What is the reason or use of…" },
] as const;

type BlogTypeId = (typeof BLOG_TYPES)[number]["id"];

// Update your state to store the `id`



export default function CreateBlogPost() {
    const navigate = useNavigate();
    const location = useLocation();
    const projectId = (location.state as any)?.projectId || "";

    // Basic fields
    const [title, setTitle] = useState("");
    const [information, setInformation] = useState(""); // maps to "information" in API
    const [content, setContent] = useState("<p>Start writing…</p>");
    const [type, setType] = useState<BlogTypeId>(BLOG_TYPES[0].id);

    const [authorName, setAuthorName] = useState("");

    // Meta
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeywords, setMetaKeywords] = useState<string>(""); // comma-separated UI

    // Cover image
    const [coverUrl, setCoverUrl] = useState("");
    const [coverAlt, setCoverAlt] = useState("");

    // Status / schedule
    const [status, setStatus] = useState<0 | 1 | 2>(0); // 0 draft, 1 published, 2 archived
    const [isSchedule, setIsSchedule] = useState(false);
    const [scheduleLocal, setScheduleLocal] = useState<string>(""); // input datetime-local

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (!projectId) {
            // optional: warn when not coming from project context
            // toast.message("No project selected — you can still create a blog, but projectId will be empty.");
        }
    }, [projectId]);

    const authHeaders = () => ({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    });

    /** Upload cover image; set URL */
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

    /** Generate helpers */
    const doGenerateMetaTitle = async () => {
        if (!title.trim()) return toast.error("Enter the blog title first");
        try {
            const res = await fetch(`${BASE_URL}/blog/meta-title`, {
                method: "POST",
                headers: authHeaders(),
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
                headers: authHeaders(),
                body: JSON.stringify({ title, type, count: 8 }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.message || "Failed");
            const arr: string[] = json.data || [];
            setMetaKeywords(arr.join(", "));
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
                headers: authHeaders(),
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

    /** Build payload & save (wire to your create endpoint) */
    const handleSave = async () => {
        if (!title.trim()) return toast.error("Please enter a title");
        if (!token) return toast.error("Missing auth token");

        // schedule ms (if provided)
        let scheduleTime: number | undefined;
        if (isSchedule && scheduleLocal) {
            const ms = new Date(scheduleLocal).getTime();
            if (!isNaN(ms)) scheduleTime = ms;
        }

        // split comma-separated keywords -> JSON string
        const keywordsArray = metaKeywords
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);

        const form = new FormData();
        form.append("title", title.trim());
        form.append("information", information.trim());
        form.append("content", content); // HTML from the editor
        form.append("type", type);
        if (projectId) form.append("projectId", projectId);
        if (authorName.trim()) form.append("authorName", authorName.trim());
        if (metaTitle.trim()) form.append("meta_title", metaTitle.trim());
        if (metaDescription.trim()) form.append("meta_description", metaDescription.trim());
        form.append("meta_keywords", JSON.stringify(keywordsArray));
        if (coverUrl) form.append("coverImage.url", coverUrl);
        if (coverAlt) form.append("coverImage.alt", coverAlt);
        form.append("status", String(status)); // "0" | "1" | "2"

        // Append scheduling fields ONLY when enabled.
        // Many backends treat the string "false" as truthy.
        if (isSchedule) {
            form.append("isSchedule", "true");
            if (scheduleTime !== undefined) {
                form.append("scheduleTime", String(scheduleTime));
            }
        }

        try {
            const res = await fetch(`${BASE_URL}/createBlog`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }, // DON'T set Content-Type for FormData
                body: form,
            });
            const json = await res.json().catch(() => ({} as any));
            if (!res.ok) throw new Error(json?.message || "Create failed");
            toast.success("Blog created successfully");
            navigate("/admin/blog-posts", { state: { projectId } });
        } catch (e: any) {
            toast.error(e?.message || "Create failed");
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
                    <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                    <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Save</Button>
                </div>
            </div>

            {/* Details */}
            <Card>
                <CardHeader><CardTitle>Details</CardTitle></CardHeader>
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
                            <Label htmlFor="author">Author Name</Label>
                            <Input id="author" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Ankit" />
                        </div>
                    </div>

                    {/* Information */}
                    <div>
                        <Label htmlFor="info">Information (short intro)</Label>
                        <Textarea id="info" rows={3} value={information} onChange={(e) => setInformation(e.target.value)} placeholder="Quick overview of the API structure" />
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

                    {/* Content (Rich Text Editor) */}
                    <div className="space-y-2">
                        <Label>Content</Label>
                        <RichTextEditor value={content} onChange={setContent} uploadUrl={UPLOAD_URL} height={420} />
                    </div>

                    {/* Meta with Generate buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="metaTitle">Meta Title</Label>
                            <div className="flex gap-2">
                                <Input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Blog API with Node and MongoDB" />
                                <Button type="button" variant="outline" onClick={doGenerateMetaTitle}>
                                    <Sparkles className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="metaDesc">Meta Description</Label>
                            <div className="flex gap-2">
                                <Input id="metaDesc" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Learn to build a production-ready blog API…" />
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
                                placeholder='nodejs, mongodb, express'
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
                                        if (!v) setScheduleLocal(""); // clear previously picked datetime
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
