// components/editor/RichTextEditor.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Unlink, Undo2, Redo2, Eraser,
  Image as ImageIcon, Heading1, Heading2, Heading3,
  Minus, Eye, Palette, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";

export type RteTab = "visual" | "html" | "preview";

export type RichTextEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  initialHTML?: string;
  uploadUrl?: string;
  disabled?: boolean;
  height?: number;
};

const DEFAULT_UPLOAD_URL = "https://aibackend.todaystrends.site/admin/v1/uploadFile";

/* ---------- helpers (exactly as before) ---------- */
function styleFromImgClass(cls: string): string {
  const tokens = (cls || "").split(/\s+/).filter(Boolean);
  const has = (t: string) => tokens.includes(t);
  let style = "height:auto;";
  if (has("img-float-left")) style += "float:left;margin:0.25rem 0.85rem 0.5rem 0;display:block;";
  else if (has("img-float-right")) style += "float:right;margin:0.25rem 0 0.5rem 0.85rem;display:block;";
  else if (has("img-center")) style += "float:none;display:block;margin:.75rem auto;";
  else style += "float:none;display:block;margin:.75rem 0;";
  const sizeToken = tokens.find(t => /^img-(25|33|50|66|75|100)$/.test(t)) || "img-100";
  const pct = sizeToken.split("-")[1];
  style += `width:${pct}%;max-width:${pct}%;`;
  return style;
}

const FloatableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (el) => el.getAttribute("class"),
        renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
      },
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute("style"),
        renderHTML: (attrs) => (attrs.style ? { style: attrs.style } : {}),
      },
    };
  },
});

async function uploadImageToUrl(file: File, uploadUrl: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(uploadUrl, { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.text().catch(() => "")) || "Upload failed");
  const data = await res.json().catch(() => ({} as any));
  let url: string =
    (data?.data && (typeof data.data === "string" ? data.data : data.data?.url)) ||
    data?.url || data?.filePath || data?.path || "";
  if (!url) throw new Error("No URL returned from upload API");
  if (!/^https?:\/\//i.test(url)) url = `https://aibackend.todaystrends.site${url.startsWith("/") ? "" : "/"}${url}`;
  return url;
}

/* ---------- component ---------- */
export function RichTextEditor({
  value,
  onChange,
  initialHTML,
  uploadUrl = DEFAULT_UPLOAD_URL,
  disabled = false,
  height = 420,
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<RteTab>("visual");
  const [htmlContent, setHtmlContent] = useState<string>(value ?? initialHTML ?? "<p>Start writing…</p>");
  const [textColor, setTextColor] = useState("#000000");
  const [isUploading, setIsUploading] = useState(false);

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPushedRef = useRef<string | null>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .tiptap, .post-preview { min-height: ${height}px; }
      .tiptap h1, .post-preview h1 { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; margin: 1rem 0 .5rem; }
      .tiptap h2, .post-preview h2 { font-size: 1.5rem; line-height: 2rem; font-weight: 700; margin: .875rem 0 .5rem; }
      .tiptap h3, .post-preview h3 { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; margin: .75rem 0 .5rem; }
      .tiptap ul, .post-preview ul { list-style: disc; padding-left: 1.5rem; }
      .tiptap ol, .post-preview ol { list-style: decimal; padding-left: 1.5rem; }
      .tiptap::after, .post-preview::after { content:""; display:block; clear:both; }

      /* ensure links are visibly styled in editor + preview */
      .tiptap a, .post-preview a { text-decoration: underline; color: #2563eb; cursor: pointer; }
      .tiptap a:hover, .post-preview a:hover { text-decoration: underline; }
      .tiptap a:visited, .post-preview a:visited { color: #7c3aed; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, [height]);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bulletList: { keepMarks: true }, orderedList: { keepMarks: true } }),
      Underline,
      FloatableImage.configure({ inline: false }),
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: htmlContent,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      onChange?.(html);
    },
  });

  // keep toolbar state in sync
  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      const current = (editor.getAttributes("textStyle")?.color as string) || "#000000";
      setTextColor(current);
    };
    editor.on("selectionUpdate", sync);
    editor.on("transaction", sync);
    return () => {
      editor.off("selectionUpdate", sync);
      editor.off("transaction", sync);
    };
  }, [editor]);

  // accept external value
  useEffect(() => {
    if (!editor) return;
    if (typeof value !== "string") return;
    if (value === lastPushedRef.current) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, false);

      setHtmlContent(value);
      lastPushedRef.current = value;
    }
  }, [value, editor]);

  const imageSelected = !!editor?.isActive("image");

  const cmd = useMemo(() => ({
    h1: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    h2: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    h3: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    bold: () => editor?.chain().focus().toggleBold().run(),
    italic: () => editor?.chain().focus().toggleItalic().run(),
    underline: () => editor?.chain().focus().toggleUnderline().run(),
    bullet: () => editor?.chain().focus().toggleBulletList().run(),
    ordered: () => editor?.chain().focus().toggleOrderedList().run(),
    indent: () => editor?.chain().focus().sinkListItem("listItem").run(),
    outdent: () => editor?.chain().focus().liftListItem("listItem").run(),
    quote: () => editor?.chain().focus().toggleBlockquote().run(),
    hr: () => editor?.chain().focus().setHorizontalRule().run(),
    alignLeft: () => editor?.chain().focus().setTextAlign("left").run(),
    alignCenter: () => editor?.chain().focus().setTextAlign("center").run(),
    alignRight: () => editor?.chain().focus().setTextAlign("right").run(),
    alignJustify: () => editor?.chain().focus().setTextAlign("justify").run(),
    unlink: () => editor?.chain().focus().unsetLink().run(),
    setColor: (c: string) => editor?.chain().focus().setColor(c).run(),
    clear: () => editor?.chain().focus().unsetAllMarks().clearNodes().run(),
    undo: () => editor?.chain().focus().undo().run(),
    redo: () => editor?.chain().focus().redo().run(),
    openLinkBox: () => {
      if (!editor) return;
      const existing = editor.getAttributes("link")?.href as string | undefined;
      setLinkUrl(existing || "https://");
      setShowLinkInput(true);
      editor.chain().focus().run();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [editor]);

  // --- image attribute helpers (alignment + sizing) ---
  const setImgAttrs = (cls: string) => {
    if (!imageSelected) return toast.message("Select an image first.");
    editor?.chain().focus().updateAttributes("image", { class: cls, style: styleFromImgClass(cls) }).run();
  };
  const setImgSize = (sizeClass: string) => {
    if (!imageSelected) return toast.message("Select an image first.");
    const attrs = editor?.getAttributes("image") || {};
    const base = (attrs.class || "")
      .split(/\s+/)
      .filter((c: string) => c && !/^img-(25|33|50|66|75|100)$/.test(c))
      .join(" ")
      .trim();
    const cls = [base, sizeClass].filter(Boolean).join(" ").trim();
    setImgAttrs(cls);
  };

  // upload
  const onUploadClick = () => fileInputRef.current?.click();
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image");
    try {
      setIsUploading(true);
      const url = await uploadImageToUrl(file, uploadUrl);
      const cls = "img-block img-100";
      editor
        .chain()
        .focus()
        .setImage({ src: url, alt: file.name })
        .updateAttributes("image", { class: cls, style: styleFromImgClass(cls) })
        .run();
      toast.success("Image added");
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // paste images
  const onPaste = async (event: React.ClipboardEvent) => {
    if (!editor) return;
    const items = event.clipboardData?.items || [];
    const images = Array.from(items).filter((it) => it.type.startsWith("image/"));
    if (!images.length) return;
    event.preventDefault();
    for (const it of images) {
      const f = it.getAsFile();
      if (!f) continue;
      try {
        setIsUploading(true);
        const url = await uploadImageToUrl(f, uploadUrl);
        const cls = "img-block img-100";
        editor
          .chain()
          .focus()
          .setImage({ src: url, alt: f.name })
          .updateAttributes("image", { class: cls, style: styleFromImgClass(cls) })
          .run();
      } catch (e: any) {
        toast.error(e?.message || "Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // drag-drop images
  const onDrop = async (event: React.DragEvent) => {
    if (!editor) return;
    const files = Array.from(event.dataTransfer?.files || []);
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    event.preventDefault();
    for (const img of images) {
      try {
        setIsUploading(true);
        const url = await uploadImageToUrl(img, uploadUrl);
        const cls = "img-block img-100";
        editor
          .chain()
          .focus()
          .setImage({ src: url, alt: img.name })
          .updateAttributes("image", { class: cls, style: styleFromImgClass(cls) })
          .run();
      } catch (e: any) {
        toast.error(e?.message || "Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const is = {
    h1: !!editor?.isActive("heading", { level: 1 }),
    h2: !!editor?.isActive("heading", { level: 2 }),
    h3: !!editor?.isActive("heading", { level: 3 }),
    bold: !!editor?.isActive("bold"),
    italic: !!editor?.isActive("italic"),
    underline: !!editor?.isActive("underline"),
    bullet: !!editor?.isActive("bulletList"),
    ordered: !!editor?.isActive("orderedList"),
    quote: !!editor?.isActive("blockquote"),
    link: !!editor?.isActive("link"),
  };
  const currentAlign =
    (editor?.getAttributes("paragraph")?.textAlign as string) ||
    (editor?.getAttributes("heading")?.textAlign as string) ||
    "left";

  const previewHTML = activeTab === "html" ? htmlContent : (editor?.getHTML() || "");

  // link box actions
  const applyLink = () => {
    if (!editor) return;
    const url = (linkUrl || "").trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url, target: "_blank" })
        .run();
    }
    setShowLinkInput(false);
  };
  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
    setShowLinkInput(false);
  };

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-2">
        <Button size="sm" variant={activeTab === "visual" ? "default" : "outline"} onClick={() => setActiveTab("visual")}>Visual</Button>
        <Button size="sm" variant={activeTab === "html" ? "default" : "outline"} onClick={() => setActiveTab("html")}>HTML</Button>
        <Button size="sm" variant={activeTab === "preview" ? "default" : "outline"} onClick={() => setActiveTab("preview")}>
          <Eye className="h-4 w-4 mr-1" /> Preview
        </Button>
      </div>

      {/* Visual */}
      {activeTab === "visual" && (
        <div className="space-y-2">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 p-2 border rounded-md items-center">
            <Button size="sm" variant={is.h1 ? "default" : "outline"} onClick={cmd.h1} aria-pressed={is.h1}><Heading1 className="h-4 w-4" /></Button>
            <Button size="sm" variant={is.h2 ? "default" : "outline"} onClick={cmd.h2} aria-pressed={is.h2}><Heading2 className="h-4 w-4" /></Button>
            <Button size="sm" variant={is.h3 ? "default" : "outline"} onClick={cmd.h3} aria-pressed={is.h3}><Heading3 className="h-4 w-4" /></Button>

            <Button size="sm" variant={is.bold ? "default" : "outline"} onClick={cmd.bold} aria-pressed={is.bold}><Bold className="h-4 w-4" /></Button>
            <Button size="sm" variant={is.italic ? "default" : "outline"} onClick={cmd.italic} aria-pressed={is.italic}><Italic className="h-4 w-4" /></Button>
            <Button size="sm" variant={is.underline ? "default" : "outline"} onClick={cmd.underline} aria-pressed={is.underline}><UnderlineIcon className="h-4 w-4" /></Button>

            <Button size="sm" variant={is.bullet ? "default" : "outline"} onClick={cmd.bullet} aria-pressed={is.bullet}><List className="h-4 w-4" /></Button>
            <Button size="sm" variant={is.ordered ? "default" : "outline"} onClick={cmd.ordered} aria-pressed={is.ordered}><ListOrdered className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" onClick={cmd.indent} title="Indent"><ChevronRight className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" onClick={cmd.outdent} title="Outdent"><ChevronLeft className="h-4 w-4" /></Button>

            <Button size="sm" variant={is.quote ? "default" : "outline"} onClick={cmd.quote} aria-pressed={is.quote}><Quote className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" onClick={cmd.hr}><Minus className="h-4 w-4" /></Button>

            <Button size="sm" variant={currentAlign === "left" ? "default" : "outline"} onClick={cmd.alignLeft}><AlignLeft className="h-4 w-4" /></Button>
            <Button size="sm" variant={currentAlign === "center" ? "default" : "outline"} onClick={cmd.alignCenter}><AlignCenter className="h-4 w-4" /></Button>
            <Button size="sm" variant={currentAlign === "right" ? "default" : "outline"} onClick={cmd.alignRight}><AlignRight className="h-4 w-4" /></Button>
            <Button size="sm" variant={currentAlign === "justify" ? "default" : "outline"} onClick={cmd.alignJustify}><AlignJustify className="h-4 w-4" /></Button>

            <Button size="sm" variant={is.link ? "default" : "outline"} onClick={cmd.openLinkBox} aria-pressed={is.link}>
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={cmd.unlink}><Unlink className="h-4 w-4" /></Button>

            <label className="flex items-center gap-1 text-sm px-2 py-1 rounded border">
              <Palette className="h-4 w-4" />
              <input
                type="color"
                value={textColor}
                onChange={(e) => { setTextColor(e.target.value); cmd.setColor(e.target.value); }}
                title="Text color"
                style={{ width: 24, height: 18, padding: 0, border: "none", background: "transparent" }}
              />
            </label>

            <Button size="sm" variant="outline" onClick={cmd.undo}><Undo2 className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" onClick={cmd.redo}><Redo2 className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" onClick={cmd.clear}><Eraser className="h-4 w-4" /></Button>

            <Button size="sm" variant="outline" onClick={onUploadClick} disabled={isUploading || disabled}>
              <ImageIcon className="h-4 w-4" />
              <span className="ml-1">{isUploading ? "Uploading…" : "Image"}</span>
            </Button>

            {/* ---------- Image controls (alignment + size) ---------- */}
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-muted-foreground">Image:</span>
              <Button size="sm" variant="outline" title="Float Left (wrap)" onClick={() => setImgAttrs("img-float-left img-50")} disabled={!imageSelected}>L</Button>
              <Button size="sm" variant="outline" title="Float Right (wrap)" onClick={() => setImgAttrs("img-float-right img-50")} disabled={!imageSelected}>R</Button>
              <Button size="sm" variant="outline" title="Center" onClick={() => setImgAttrs("img-center img-50")} disabled={!imageSelected}>C</Button>
              <Button size="sm" variant="outline" title="Block / Full" onClick={() => setImgAttrs("img-block img-100")} disabled={!imageSelected}>Full</Button>
              <select
                className="border rounded px-1 py-[2px] text-xs"
                onChange={(e) => setImgSize(e.target.value)}
                defaultValue=""
                title="Image width"
                disabled={!imageSelected}
              >
                <option value="" disabled>Size</option>
                <option value="img-25">25%</option>
                <option value="img-33">33%</option>
                <option value="img-50">50%</option>
                <option value="img-66">66%</option>
                <option value="img-75">75%</option>
                <option value="img-100">100%</option>
              </select>
            </div>
          </div>

          {/* Inline "Insert Link" box */}
          {showLinkInput && (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 h-9 px-3 rounded-md border bg-background"
              />
              <Button size="sm" onClick={applyLink}>Apply</Button>
              <Button size="sm" variant="outline" onClick={removeLink}>Remove</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(false)}>Close</Button>
            </div>
          )}

          {/* Editor */}
          <div onPaste={onPaste} onDrop={onDrop}>
            <EditorContent
              editor={editor}
              className="tiptap p-4 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {/* HTML */}
      {activeTab === "html" && (
        <div className="space-y-2">
          <Textarea
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              onChange?.(e.target.value);
            }}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Edit raw HTML here…"
          />
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                if (!editor) return;
                editor.commands.setContent(htmlContent || "<p></p>", true);

                toast.success("Applied HTML to editor");
                setActiveTab("visual");
              }}
            >
              Apply HTML to Visual
            </Button>
          </div>
        </div>
      )}

      {/* Preview */}
      {activeTab === "preview" && (
        <div className="post-preview p-4 border rounded-md bg-white text-left">
          <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
    </div>
  );
}
