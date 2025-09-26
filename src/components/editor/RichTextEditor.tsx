// components/editor/RichTextEditor.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Unlink, Undo2, Redo2, Eraser,
  Image as ImageIcon, Heading1, Heading2, Heading3,
  Minus, Palette, ChevronLeft, ChevronRight, Replace as ReplaceIcon
} from "lucide-react";
import { toast } from "sonner";

export type RteTab = "visual" | "html";

export type RichTextEditorProps = {
  /** Full HTML doc: <!doctype ...><html ...><head>...</head><body>...</body></html> */
  value?: string;
  onChange?: (fullHtml: string) => void;
  initialHTML?: string;
  uploadUrl?: string;
  disabled?: boolean;
  height?: number;
};

const DEFAULT_UPLOAD_URL =
  (import.meta as any).env?.VITE_UPLOAD_URL ||
  "https://aibackend.todaystrends.site/admin/v1/uploadFile";

// Build absolute URL using env VITE_IMAGES_BASE_URL
const IMG_BASE: string =
  (import.meta as any).env?.VITE_IMAGES_BASE_URL ||
  "https://aibackend.todaystrends.site";

function toAbs(url?: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const join = (base: string, path: string) =>
    base.replace(/\/+$/, "") + "/" + String(path).replace(/^\/+/, "");
  return join(IMG_BASE, url);
}

/* ---------------------- Full-doc helpers ---------------------- */
function splitHeadBody(fullHtml: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(fullHtml || "", "text/html");
    const head = doc.head?.innerHTML ?? "";
    const body = doc.body?.innerHTML ?? "";
    const doctype = doc.doctype ? `<!doctype ${doc.doctype.name}>` : "<!doctype html>";
    const htmlAttrs =
      doc.documentElement?.getAttributeNames?.()
        ?.map((n) => `${n}="${doc.documentElement.getAttribute(n) ?? ""}"`)
        .join(" ") || 'lang="en"';
    return { doctype, htmlAttrs, headHtml: head, bodyHtml: body };
  } catch {
    const headMatch = fullHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const doctypeMatch = fullHtml.match(/<!doctype[^>]*>/i);
    const htmlAttrsMatch = fullHtml.match(/<html([^>]*)>/i);
    return {
      doctype: doctypeMatch?.[0] || "<!doctype html>",
      htmlAttrs: (htmlAttrsMatch?.[1] || ' lang="en"').trim() || 'lang="en"',
      headHtml: headMatch?.[1] || "",
      bodyHtml: bodyMatch?.[1] || fullHtml || "",
    };
  }
}
function joinHeadBody(doctype: string, htmlAttrs: string, headHtml: string, bodyHtml: string) {
  return `${doctype || "<!doctype html>"}\n<html ${htmlAttrs || 'lang="en"'}>\n<head>\n${headHtml || ""}\n</head>\n<body>\n${bodyHtml || ""}\n</body>\n</html>`;
}

/* ---------------------- Image class / style helpers ---------------------- */
type AlignToken = "img-float-left" | "img-float-right" | "img-center" | "img-block";
type SizeToken = "img-25" | "img-33" | "img-50" | "img-66" | "img-75" | "img-100";

const SIZE_ORDER: SizeToken[] = ["img-25", "img-33", "img-50", "img-66", "img-75", "img-100"];
const ALIGN_DEFAULT: AlignToken = "img-block";
const SIZE_DEFAULT: SizeToken = "img-100";

function parseTokens(cls: string) {
  const parts = (cls || "").split(/\s+/).filter(Boolean);
  const align = (parts.find(p => /^img-(float-left|float-right|center|block)$/.test(p)) || ALIGN_DEFAULT) as AlignToken;
  const size = (parts.find(p => /^img-(25|33|50|66|75|100)$/.test(p)) || SIZE_DEFAULT) as SizeToken;
  return { align, size };
}

function buildClass(align: AlignToken, size: SizeToken) {
  return `${align} ${size}`.trim();
}

function styleFromTokens(align: AlignToken, size: SizeToken): string {
  let style = "height:auto;";
  if (align === "img-float-left") style += "float:left;margin:0.25rem 0.85rem 0.5rem 0;display:block;clear:none;";
  else if (align === "img-float-right") style += "float:right;margin:0.25rem 0 0.5rem 0.85rem;display:block;clear:none;";
  else if (align === "img-center") style += "float:none;display:block;margin:.75rem auto;clear:none;";
  else style += "float:none;display:block;margin:.75rem 0;clear:none;";

  const pct = size.split("-")[1];
  style += `width:${pct}%;max-width:${pct}%;`;
  return style;
}

function ensureImageTokensAndStyle(el: HTMLImageElement) {
  const { align, size } = parseTokens(el.className || "");
  const cls = buildClass(align, size);
  el.className = cls;
  
  // Always apply the full style from tokens to ensure consistency
  el.style.cssText = styleFromTokens(align, size);
}

/* ---------------------- Upload helper (uses your API shape) ---------------------- */
async function uploadImageToUrl(file: File, uploadUrl: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(uploadUrl, { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.text().catch(() => "")) || "Upload failed");

  const data = await res.json().catch(() => ({} as any));
  // Your response sample:
  // { "message": "File uploaded successfully!!", "data": { "url": "/files/xxxx.webp" } }
  const rel =
    data?.data?.url ||
    data?.url ||
    data?.filePath ||
    data?.path ||
    "";

  if (!rel) throw new Error("No URL returned from upload API");
  return toAbs(rel);
}

function rgbToHex(color: string): string {
  if (color?.startsWith("#")) return color;
  const match = color?.match?.(/\d+/g);
  if (!match) return "#000000";
  const [r, g, b] = match.map(Number);
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function uid() {
  return "tmp-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}









function applyFinalImageUrl(img: HTMLImageElement, newUrl: string) {
  // Update the <img> itself
  img.src = newUrl;
  img.setAttribute("srcset", newUrl);      // single candidate keeps it simple
  // keep existing sizes or default if missing
  if (!img.getAttribute("sizes")) img.setAttribute("sizes", "100vw");

  // If inside <picture>, update all <source> candidates too
  const pic =
    img.parentElement?.tagName === "PICTURE"
      ? (img.parentElement as HTMLPictureElement)
      : null;

  if (pic) {
    const sources = Array.from(pic.querySelectorAll("source"));
    sources.forEach((s) => {
      s.setAttribute("srcset", newUrl);
      if (!s.getAttribute("sizes")) s.setAttribute("sizes", "100vw");
    });
  }
}

// Re-apply our layout as !important so it beats outside CSS
function applyImportantLayout(img: HTMLImageElement) {
  const { align, size } = parseTokens(img.className || "");
  // derive float/margin/display/clear
  let floatVal = "none";
  let marginVal = ".75rem 0";
  let displayVal = "block";
  let clearVal = "none";
  if (align === "img-float-left") {
    floatVal = "left";
    marginVal = "0.25rem 0.85rem 0.5rem 0";
  } else if (align === "img-float-right") {
    floatVal = "right";
    marginVal = "0.25rem 0 0.5rem 0.85rem";
  } else if (align === "img-center") {
    floatVal = "none";
    marginVal = ".75rem auto";
  }
  const pct = size.split("-")[1] || "100";

  // apply with !important
  img.style.setProperty("height", "auto", "important");
  img.style.setProperty("float", floatVal, "important");
  img.style.setProperty("margin", marginVal, "important");
  img.style.setProperty("display", displayVal, "important");
  img.style.setProperty("clear", clearVal, "important");
  img.style.setProperty("width", `${pct}%`, "important");
  img.style.setProperty("max-width", `${pct}%`, "important");
}


/* ---------------------- Component ---------------------- */
export function RichTextEditor({
  value,
  onChange,
  initialHTML,
  uploadUrl = DEFAULT_UPLOAD_URL,
  disabled = false,
  height = 420,
}: RichTextEditorProps) {
  // Split incoming full document
  const initialFull =
    value ??
    initialHTML ??
    '<!doctype html><html lang="en"><head></head><body><p>Start writing…</p></body></html>';
  const init = splitHeadBody(initialFull);

  const [doctype, setDoctype] = useState(init.doctype);
  const [htmlAttrs, setHtmlAttrs] = useState(init.htmlAttrs);
  const [headHtml, setHeadHtml] = useState(init.headHtml);
  const [bodyHtml, setBodyHtml] = useState(init.bodyHtml);

  // Track last full we emitted to avoid echo loops
  const lastPushedRef = useRef<string | null>(null);

  // Live edit shield (ignore external value updates while actively editing)
  const [isLiveEditing, setIsLiveEditing] = useState(false);
  const liveEditTimerRef = useRef<number | null>(null);
  const bumpLiveEditing = () => {
    setIsLiveEditing(true);
    if (liveEditTimerRef.current) window.clearTimeout(liveEditTimerRef.current);
    liveEditTimerRef.current = window.setTimeout(() => setIsLiveEditing(false), 900);
  };

  // If parent updates `value`, accept only when not live-editing (in visual)
  const [activeTab, setActiveTab] = useState<RteTab>("visual");
  useEffect(() => {
    if (typeof value !== "string") return;
    if (isLiveEditing && activeTab === "visual") return; // shield
    const currentFull = joinHeadBody(doctype, htmlAttrs, headHtml, bodyHtml);
    if (value === lastPushedRef.current || value === currentFull) return;
    const s = splitHeadBody(value);
    setDoctype(s.doctype);
    setHtmlAttrs(s.htmlAttrs);
    setHeadHtml(s.headHtml);
    setBodyHtml(s.bodyHtml);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // UI state
  const [textColor, setTextColor] = useState("#000000");
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Toolbar states
  const [currentFormat, setCurrentFormat] = useState("p");
  const [currentAlign, setCurrentAlign] = useState("left");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isBullet, setIsBullet] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [imageNode, setImageNode] = useState<HTMLImageElement | null>(null);

  // HTML tab draft buffer (controlled)
  const [htmlDraft, setHtmlDraft] = useState<string>(
    joinHeadBody(doctype, htmlAttrs, headHtml, bodyHtml)
  );

  // While editing in HTML tab, live-emit the draft so parent can save it
  useEffect(() => {
    if (activeTab !== "html") return;
    const full = htmlDraft;
    lastPushedRef.current = full;
    onChange?.(full);
  }, [htmlDraft, activeTab, onChange]);

  // Keep draft in sync when parts change, except while actively typing in HTML tab
  useEffect(() => {
    if (activeTab === "html") return;
    setHtmlDraft(joinHeadBody(doctype, htmlAttrs, headHtml, bodyHtml));
  }, [doctype, htmlAttrs, headHtml, bodyHtml, activeTab]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const changeOriginRef = useRef<"visual" | "html" | null>(null);

  const getIdoc = () => iframeRef.current?.contentDocument || null;
  const getRoot = () => getIdoc()?.getElementById("root") || null;

  const emitFull = (body: string) => {
    const full = joinHeadBody(doctype, htmlAttrs, headHtml, body);
    if (full !== lastPushedRef.current) {
      lastPushedRef.current = full;
      onChange?.(full);
    }
  };

  const commitFromIframe = () => {
    const root = getRoot();
    if (!root) return;
    const html = root.innerHTML;
    setBodyHtml((prev) => (prev === html ? prev : html));
    emitFull(html);
  };

  // Helper to get currently selected image
  const getSelectedImage = (): HTMLImageElement | null => {
    const idoc = getIdoc();
    if (!idoc) return null;
    
    const sel = idoc.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    
    const range = sel.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    
    // If text node, get parent element
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }
    
    const element = node as HTMLElement;
    
    // Check if the node itself is an image
    if (element?.tagName === 'IMG') {
      return element as HTMLImageElement;
    }
    
    // Check if an image is selected within the range
    if (range.startContainer === range.endContainer && range.startOffset === range.endOffset - 1) {
      const selectedNode = range.startContainer.childNodes[range.startOffset];
      if (selectedNode?.nodeType === Node.ELEMENT_NODE && (selectedNode as HTMLElement).tagName === 'IMG') {
        return selectedNode as HTMLImageElement;
      }
    }
    
    // Look for selected image in the range
    const images = element?.querySelectorAll?.('img') || [];
    for (const img of images) {
      if (range.intersectsNode(img)) {
        return img as HTMLImageElement;
      }
    }
    
    return null;
  };

  // Write iframe document
  const writeIframeDoc = (head: string, body: string) => {
    const typographyStyle = `
      body:after { content:""; display:block; clear:both; }
      h1 { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; margin: 1rem 0 .5rem; }
      h2 { font-size: 1.5rem; line-height: 2rem; font-weight: 700; margin: .875rem 0 .5rem; }
      h3 { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; margin: .75rem 0 .5rem; }
      ul { list-style: disc; padding-left: 1.5rem; }
      ol { list-style: decimal; padding-left: 1.5rem; }
      a { text-decoration: underline; cursor: pointer; }
      img { max-width: 100%; height: auto; display: block; }
      img:focus, img.selected { outline: 2px solid #60a5fa; }
    `;
    const docHtml = `${doctype || "<!doctype html>"}
<html ${htmlAttrs || 'lang="en"'}>
<head>
<meta charset="utf-8">
${head || ""}
<style>body{padding:1rem;font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;}</style>
<style>${typographyStyle}</style>
</head>
<body>
  <main id="root" contenteditable="${!disabled}">${body || ""}</main>
  <script>
    (function(){
      const root = document.getElementById('root');
      const send = () => parent.postMessage({ type: 'RTE_BODY_HTML', html: root.innerHTML }, '*');
      root.addEventListener('input', send);
      root.addEventListener('blur', send, true); // commit on blur

      const ping = () => parent.postMessage({ type: 'RTE_PING_EDIT' }, '*');
      ['focusin','keydown','input','paste','drop','mouseup','click'].forEach(ev => {
        root.addEventListener(ev, ping);
      });

      // Enhanced image selection handling
      root.addEventListener('click', (e) => {
        const t = e.target;
        if (t && t.tagName === 'IMG') {
          try {
            // Clear any existing selection classes
            root.querySelectorAll('img.selected').forEach(img => img.classList.remove('selected'));
            
            // Add selected class to clicked image
            t.classList.add('selected');
            
            const sel = window.getSelection();
            const r = document.createRange();
            r.selectNode(t);
            sel.removeAllRanges();
            sel.addRange(r);
            
            // Notify parent about image selection
            parent.postMessage({ type: 'RTE_IMAGE_SELECTED', img: t }, '*');
          } catch(err) {
            console.log('Selection error:', err);
          }
        } else {
          // Clear image selection if clicking elsewhere
          root.querySelectorAll('img.selected').forEach(img => img.classList.remove('selected'));
          parent.postMessage({ type: 'RTE_IMAGE_DESELECTED' }, '*');
        }
      });

      // Right-click replace image
      root.addEventListener('contextmenu', (e) => {
        const t = e.target;
        if (t && t.tagName === 'IMG') {
          e.preventDefault();
          parent.postMessage({ type: 'RTE_REQ_REPLACE', img: t }, '*');
        }
      });
      
      // Update selection on any change
      ['selectionchange', 'keyup', 'mouseup'].forEach(ev => {
        document.addEventListener(ev, () => {
          parent.postMessage({ type: 'RTE_SELECTION_CHANGE' }, '*');
        });
      });
    })();
  </script>
</body>
</html>`;
    const iframe = iframeRef.current;
    if (!iframe) return;
    const idoc = iframe.contentDocument;
    if (!idoc) return;
    idoc.open();
    idoc.write(docHtml);
    idoc.close();
  };

  // Rebuild iframe only when switching to visual or structure changes (NOT bodyHtml)
  useEffect(() => {
    if (activeTab !== "visual") return;
    writeIframeDoc(headHtml, bodyHtml);
  }, [activeTab, headHtml, htmlAttrs, disabled, doctype]); // bodyHtml intentionally excluded

  // Patch body without rewriting doc when body changes externally
  useEffect(() => {
    if (activeTab !== "visual") return;
    if (changeOriginRef.current === "visual") return;
    const root = getRoot();
    if (root && root.innerHTML !== bodyHtml) {
      root.innerHTML = bodyHtml;
    }
  }, [bodyHtml, activeTab]);

  // Receive edits & pings & replace requests from iframe
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e?.data?.type === "RTE_PING_EDIT") {
        bumpLiveEditing();
        return;
      }
      if (e?.data?.type === "RTE_BODY_HTML") {
        bumpLiveEditing();
        changeOriginRef.current = "visual";
        const html = String(e.data.html || "");
        setBodyHtml((prev) => (prev === html ? prev : html));
        emitFull(html);
        requestAnimationFrame(() => {
          changeOriginRef.current = null;
        });
      }
      if (e?.data?.type === "RTE_REQ_REPLACE") {
        // Right-click replace request -> open picker
        if (imageNode) {
          replaceInputRef.current?.click();
        } else {
          toast.message("Select an image first.");
        }
      }
      if (e?.data?.type === "RTE_IMAGE_SELECTED") {
        // Image was selected in iframe
        const imgElement = getSelectedImage();
        if (imgElement) {
          ensureImageTokensAndStyle(imgElement);
          setImageNode(imgElement);
        }
      }
      if (e?.data?.type === "RTE_IMAGE_DESELECTED") {
        // Image was deselected
        setImageNode(null);
      }
      if (e?.data?.type === "RTE_SELECTION_CHANGE") {
        // Selection changed - update image node
        const imgElement = getSelectedImage();
        if (imgElement) {
          ensureImageTokensAndStyle(imgElement);
        }
        setImageNode(imgElement);
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, [doctype, htmlAttrs, headHtml, onChange, imageNode]);

  // Update toolbar states on selection change etc.
  useEffect(() => {
    if (activeTab !== "visual") return;
    const idoc = getIdoc();
    if (!idoc) return;

    const updateToolbar = () => {
      const doc = idoc as Document;
      setIsBold(doc.queryCommandState("bold"));
      setIsItalic(doc.queryCommandState("italic"));
      setIsUnderline(doc.queryCommandState("underline"));
      setIsBullet(doc.queryCommandState("insertUnorderedList"));
      setIsOrdered(doc.queryCommandState("insertOrderedList"));
      const format = (doc.queryCommandValue("formatBlock") || "p").toLowerCase();
      setCurrentFormat(format);
      if (doc.queryCommandState("justifyCenter")) setCurrentAlign("center");
      else if (doc.queryCommandState("justifyRight")) setCurrentAlign("right");
      else if (doc.queryCommandState("justifyFull")) setCurrentAlign("justify");
      else setCurrentAlign("left");
      const color = doc.queryCommandValue("foreColor") as string;
      setTextColor(rgbToHex(color));
      const linkHref = doc.queryCommandValue("createLink") as string;
      setIsLink(!!linkHref);

      // Update image selection
      const imgElement = getSelectedImage();
      if (imgElement) {
        ensureImageTokensAndStyle(imgElement);
      }
      setImageNode(imgElement);
    };

    idoc.addEventListener("selectionchange", updateToolbar);
    idoc.addEventListener("keyup", updateToolbar);
    idoc.addEventListener("mouseup", updateToolbar);
    idoc.addEventListener("input", updateToolbar);
    idoc.addEventListener("click", updateToolbar);
    // Initial update
    updateToolbar();
    return () => {
      idoc.removeEventListener("selectionchange", updateToolbar);
      idoc.removeEventListener("keyup", updateToolbar);
      idoc.removeEventListener("mouseup", updateToolbar);
      idoc.removeEventListener("input", updateToolbar);
      idoc.removeEventListener("click", updateToolbar);
    };
  }, [activeTab]);

  // ---- Image insertion helpers (show temp preview, then swap to uploaded URL) ----
  const insertTempImage = (file: File) => {
    const idoc = getIdoc();
    if (!idoc) return null;
    const tempUrl = URL.createObjectURL(file);
    const tempId = uid();
    const align: AlignToken = ALIGN_DEFAULT;
    const size: SizeToken = SIZE_DEFAULT;
    const cls = buildClass(align, size);
    const style = styleFromTokens(align, size);
    const imgHtml = `<img src="${tempUrl}" data-temp-id="${tempId}" alt="${file.name}" class="${cls}" style="${style}">`;
    idoc.execCommand("insertHTML", false, imgHtml);
    commitFromIframe(); // sync right away
    return { tempUrl, tempId };
  };

  const replaceTempImage = (tempId: string, finalUrl: string, revokeUrl?: string) => {
    const root = getRoot();
    if (!root) return;
    const el = root.querySelector(`img[data-temp-id="${tempId}"]`) as HTMLImageElement | null;
    if (el) {
      const prevStyle = el.style.cssText; // preserve dimensions
      const prevClass = el.className;
      el.src = finalUrl;
      el.removeAttribute("data-temp-id");
      el.className = prevClass;
      el.style.cssText = prevStyle;
    }
    if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    commitFromIframe(); // emit after replacement
  };

 const replaceExistingImage = async (file: File) => {
  const idoc = getIdoc();
  if (!idoc || !imageNode) return;

  // Remember current tokens/class to preserve layout intent
  const prevClass = imageNode.className || "";

  // Temp preview
  const tempUrl = URL.createObjectURL(file);
  const tempId = uid();
  imageNode.setAttribute("data-temp-id", tempId);
  imageNode.src = tempUrl;
  commitFromIframe();

  try {
    setIsUploading(true);
    const url = await uploadImageToUrl(file, uploadUrl);

    // Find the temp-tagged image again (DOM may have reflowed)
    const root = getRoot();
    const currentImg = root?.querySelector(`img[data-temp-id="${tempId}"]`) as HTMLImageElement | null;
    if (currentImg) {
      // 1) Point ALL responsive candidates to the new file
      applyFinalImageUrl(currentImg, url);

      // 2) Restore our class/tokens and re-assert layout with !important
      currentImg.removeAttribute("data-temp-id");
      currentImg.className = prevClass;
      applyImportantLayout(currentImg);   // <- critical: beats external CSS
      ensureImageTokensAndStyle(currentImg); // keep tokens sane (no-ops if already good)

      // 3) Keep reference/selection
      setImageNode(currentImg);
      const sel = idoc.getSelection();
      if (sel) {
        const range = idoc.createRange();
        range.selectNode(currentImg);
        sel.removeAllRanges();
        sel.addRange(range);
        currentImg.classList.add("selected");
      }
    }

    toast.success("Image replaced successfully");
  } catch (err: any) {
    toast.error(err?.message || "Replace failed");
  } finally {
    setIsUploading(false);
    URL.revokeObjectURL(tempUrl);
    commitFromIframe();
  }
};


  // Handle paste and drop for images
  useEffect(() => {
    if (activeTab !== "visual") return;
    const idoc = getIdoc();
    if (!idoc) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageItems = Array.from(items).filter((item) => item.type.startsWith("image/"));
      if (!imageItems.length) return;
      e.preventDefault();
      bumpLiveEditing();

      for (const item of imageItems) {
        const file = item.getAsFile();
        if (!file) continue;
        const temp = insertTempImage(file);
        try {
          setIsUploading(true);
          const url = await uploadImageToUrl(file, uploadUrl);
          if (temp) replaceTempImage(temp.tempId, url, temp.tempUrl);
          toast.success("Image added");
        } catch (err: any) {
          toast.error(err?.message || "Upload failed");
        } finally {
          setIsUploading(false);
        }
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      bumpLiveEditing();
      const files = Array.from(e.dataTransfer?.files || []);
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (!images.length) return;
      for (const file of images) {
        const temp = insertTempImage(file);
        try {
          setIsUploading(true);
          const url = await uploadImageToUrl(file, uploadUrl);
          if (temp) replaceTempImage(temp.tempId, url, temp.tempUrl);
          toast.success("Image added");
        } catch (err: any) {
          toast.error(err?.message || "Upload failed");
        } finally {
          setIsUploading(false);
        }
      }
    };

    const handleDragOver = (e: DragEvent) => e.preventDefault();

    idoc.addEventListener("paste", handlePaste);
    idoc.addEventListener("drop", handleDrop);
    idoc.addEventListener("dragover", handleDragOver);

    return () => {
      idoc.removeEventListener("paste", handlePaste);
      idoc.removeEventListener("drop", handleDrop);
      idoc.removeEventListener("dragover", handleDragOver);
    };
  }, [activeTab, uploadUrl]);

  // Commands
  const cmd = useMemo(
    () => ({
      h1: () => {
        const idoc = getIdoc();
        idoc?.execCommand("formatBlock", false, currentFormat === "h1" ? "p" : "h1");
      },
      h2: () => {
        const idoc = getIdoc();
        idoc?.execCommand("formatBlock", false, currentFormat === "h2" ? "p" : "h2");
      },
      h3: () => {
        const idoc = getIdoc();
        idoc?.execCommand("formatBlock", false, currentFormat === "h3" ? "p" : "h3");
      },
      bold: () => {
        const idoc = getIdoc();
        idoc?.execCommand("bold");
      },
      italic: () => {
        const idoc = getIdoc();
        idoc?.execCommand("italic");
      },
      underline: () => {
        const idoc = getIdoc();
        idoc?.execCommand("underline");
      },
      bullet: () => {
        const idoc = getIdoc();
        idoc?.execCommand("insertUnorderedList");
      },
      ordered: () => {
        const idoc = getIdoc();
        idoc?.execCommand("insertOrderedList");
      },
      indent: () => {
        const idoc = getIdoc();
        idoc?.execCommand("indent");
      },
      outdent: () => {
        const idoc = getIdoc();
        idoc?.execCommand("outdent");
      },
      quote: () => {
        const idoc = getIdoc();
        idoc?.execCommand("formatBlock", false, currentFormat === "blockquote" ? "p" : "blockquote");
      },
      hr: () => {
        const idoc = getIdoc();
        idoc?.execCommand("insertHorizontalRule");
      },
      alignLeft: () => {
        const idoc = getIdoc();
        idoc?.execCommand("justifyLeft");
        commitFromIframe();
      },
      alignCenter: () => {
        const idoc = getIdoc();
        idoc?.execCommand("justifyCenter");
        commitFromIframe();
      },
      alignRight: () => {
        const idoc = getIdoc();
        idoc?.execCommand("justifyRight");
        commitFromIframe();
      },
      alignJustify: () => {
        const idoc = getIdoc();
        idoc?.execCommand("justifyFull");
        commitFromIframe();
      },
      unlink: () => {
        const idoc = getIdoc();
        idoc?.execCommand("unlink");
        commitFromIframe();
      },
      setColor: (c: string) => {
        const idoc = getIdoc();
        idoc?.execCommand("foreColor", false, c);
        commitFromIframe();
      },
      clear: () => {
        const idoc = getIdoc();
        idoc?.execCommand("removeFormat");
        commitFromIframe();
      },
      undo: () => {
        const idoc = getIdoc();
        idoc?.execCommand("undo");
        commitFromIframe();
      },
      redo: () => {
        const idoc = getIdoc();
        idoc?.execCommand("redo");
        commitFromIframe();
      },
      openLinkBox: () => {
        const idoc = getIdoc();
        if (!idoc) return;
        const href = idoc.queryCommandValue("createLink") as string;
        setLinkUrl(href || "https://");
        setShowLinkInput(true);
      },
    }),
    [currentFormat]
  );

  // Image helpers (align & size) — commit after changes so state & UI update
  const setImgAttrs = (align: AlignToken, size: SizeToken) => {
    if (!imageNode) {
      toast.message("Select an image first.");
      return;
    }
    
    const cls = buildClass(align, size);
    imageNode.className = cls;
    applyImportantLayout(imageNode);
    imageNode.style.cssText = styleFromTokens(align, size);
    
    // Keep the image selected and focused
    imageNode.focus();
    imageNode.classList.add('selected');
    
    // Maintain selection
    const idoc = getIdoc();
    if (idoc) {
      const sel = idoc.getSelection();
      if (sel) {
        const range = idoc.createRange();
        range.selectNode(imageNode);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    
    commitFromIframe();
  };

  const setImgSize = (sizeClass: string) => {
    if (!imageNode) {
      toast.message("Select an image first.");
      return;
    }
    const { align } = parseTokens(imageNode.className || "");
    const wanted = (SIZE_ORDER.find(s => s === sizeClass) || SIZE_DEFAULT) as SizeToken;
    setImgAttrs(align, wanted);
  };

  const setImgAlign = (alignClass: string) => {
    if (!imageNode) {
      toast.message("Select an image first.");
      return;
    }
    const { size } = parseTokens(imageNode.className || "");
    const wanted = alignClass as AlignToken;
    setImgAttrs(wanted, size);
  };

  // Upload
  const onUploadClick = () => fileInputRef.current?.click();
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image");

    bumpLiveEditing();
    const temp = insertTempImage(file);
    try {
      setIsUploading(true);
      const url = await uploadImageToUrl(file, uploadUrl);
      if (temp) replaceTempImage(temp.tempId, url, temp.tempUrl);
      toast.success("Image added");
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onReplacePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image");
    if (!imageNode) return toast.message("Select an image first.");
    bumpLiveEditing();
    await replaceExistingImage(file);
  };

  // HTML tab apply
  const applyFullHtml = () => {
    changeOriginRef.current = "html";
    setIsLiveEditing(false);
    const s = splitHeadBody(htmlDraft);
    setDoctype(s.doctype);
    setHtmlAttrs(s.htmlAttrs);
    setHeadHtml(s.headHtml);
    setBodyHtml(s.bodyHtml);
    const rejoined = joinHeadBody(s.doctype, s.htmlAttrs, s.headHtml, s.bodyHtml);
    lastPushedRef.current = rejoined;
    onChange?.(rejoined);
    toast.success("Applied full HTML");
    setActiveTab("visual");
    requestAnimationFrame(() => {
      changeOriginRef.current = null;
    });
  };

  const is = {
    h1: currentFormat === "h1",
    h2: currentFormat === "h2",
    h3: currentFormat === "h3",
    bold: isBold,
    italic: isItalic,
    underline: isUnderline,
    bullet: isBullet,
    ordered: isOrdered,
    quote: currentFormat === "blockquote",
    link: isLink,
  };
  const imageSelected = !!imageNode;

  // Get current image alignment and size for UI
  const currentImageAlign = imageSelected ? parseTokens(imageNode!.className || "").align : ALIGN_DEFAULT;
  const currentImageSize = imageSelected ? parseTokens(imageNode!.className || "").size : SIZE_DEFAULT;

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-2">
        <Button size="sm" variant={activeTab === "visual" ? "default" : "outline"} onClick={() => setActiveTab("visual")}>Visual</Button>
        <Button size="sm" variant={activeTab === "html" ? "default" : "outline"} onClick={() => setActiveTab("html")}>HTML</Button>
      </div>

      {/* Visual (iframe editor) */}
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

            {/* Image controls */}
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-muted-foreground">Image:</span>
              <Button 
                size="sm" 
                variant={currentImageAlign === "img-float-left" ? "default" : "outline"} 
                title="Float Left (wrap)" 
                onClick={() => setImgAlign("img-float-left")} 
                disabled={!imageSelected}
              >
                L
              </Button>
              <Button 
                size="sm" 
                variant={currentImageAlign === "img-float-right" ? "default" : "outline"} 
                title="Float Right (wrap)" 
                onClick={() => setImgAlign("img-float-right")} 
                disabled={!imageSelected}
              >
                R
              </Button>
              <Button 
                size="sm" 
                variant={currentImageAlign === "img-center" ? "default" : "outline"} 
                title="Center" 
                onClick={() => setImgAlign("img-center")} 
                disabled={!imageSelected}
              >
                C
              </Button>
              <Button 
                size="sm" 
                variant={currentImageAlign === "img-block" ? "default" : "outline"} 
                title="Block / Full" 
                onClick={() => setImgAlign("img-block")} 
                disabled={!imageSelected}
              >
                Full
              </Button>
              <select
                className="border rounded px-1 py-[2px] text-xs"
                onChange={(e) => setImgSize(e.target.value)}
                value={imageSelected ? currentImageSize : ""}
                title="Image width"
                disabled={!imageSelected}
              >
                <option value="">Size</option>
                <option value="img-25">25%</option>
                <option value="img-33">33%</option>
                <option value="img-50">50%</option>
                <option value="img-66">66%</option>
                <option value="img-75">75%</option>
                <option value="img-100">100%</option>
              </select>

              {/* Replace button shows when an image is selected */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => replaceInputRef.current?.click()}
                disabled={!imageSelected || isUploading}
                title="Replace selected image"
                className="ml-1"
              >
                <ReplaceIcon className="h-4 w-4" />
                <span className="ml-1">Replace</span>
              </Button>
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
              <Button size="sm" onClick={() => {
                const idoc = getIdoc();
                if (!idoc) return;
                const url = (linkUrl || "").trim();
                if (!url) idoc.execCommand("unlink");
                else idoc.execCommand("createLink", false, url);
                setShowLinkInput(false);
                commitFromIframe();
              }}>Apply</Button>
              <Button size="sm" variant="outline" onClick={() => { cmd.unlink(); setShowLinkInput(false); }}>Remove</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(false)}>Close</Button>
            </div>
          )}

          {/* Iframe */}
          <iframe
            ref={iframeRef}
            className="w-full border rounded-md bg-white"
            style={{ height: `${height}px` }}
            title="Visual Editor"
          />
        </div>
      )}

      {/* HTML (full document) */}
      {activeTab === "html" && (
        <div className="space-y-2">
          <Textarea
            value={htmlDraft}
            onChange={(e) => setHtmlDraft(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Edit full HTML (head + body)…"
          />
          <div className="flex justify-end">
            <Button variant="outline" onClick={applyFullHtml}>
              Apply to Visual
            </Button>
          </div>
        </div>
      )}

      {/* Hidden pickers */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      <input ref={replaceInputRef} type="file" accept="image/*" className="hidden" onChange={onReplacePick} />
    </div>
  );
}