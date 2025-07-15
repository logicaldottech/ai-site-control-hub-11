import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ArrowLeft, Save, Sparkles, Image as ImageIcon } from "lucide-react";
import { useEditorState } from "@/hooks/use-editor-state";
import EditorToolbar from "./EditorToolbar";

interface PostEditorProps {
  postId?: string;
}

export function PostEditor({ postId }: PostEditorProps) {
  const navigate = useNavigate();
  const params = useParams();
  const currentPostId = postId || params.postId;
  const isEditMode = !!currentPostId;
  
  const [editorTab, setEditorTab] = useState("write");
  const [editorView, setEditorView] = useState<"visual" | "code">("visual");
  const [postTitle, setPostTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postHtmlContent, setPostHtmlContent] = useState("");
  const [postCategory, setPostCategory] = useState<string[]>([]);
  const [postStatus, setPostStatus] = useState("draft");
  const [postFeaturedImage, setPostFeaturedImage] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [postTags, setPostTags] = useState<string[]>([]);
  const [postAuthor, setPostAuthor] = useState("");
  const [publishDate, setPublishDate] = useState<Date | undefined>(new Date());
  const [lastSaved, setLastSaved] = useState<string>("");
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [ogImage, setOgImage] = useState("");

  // Editor state and toolbar state variables
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedBgColor, setSelectedBgColor] = useState("");
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { 
    state: editorState, 
    editorRef,
    updateContent, 
    updateHtmlContent,
    applyFormat,
    insertHTML,
    insertImage,
    insertVideo,
    insertTable,
    insertLink,
    undo,
    redo
  } = useEditorState(postHtmlContent);

  useEffect(() => {
    if (!isEditMode && postTitle && !postSlug) {
      setPostSlug(postTitle.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-'));
    }
  }, [postTitle, isEditMode, postSlug]);

  useEffect(() => {
    if (postContent) {
      const cleanText = postContent.replace(/<[^>]*>/g, ' ');
      const words = cleanText.split(/\s+/).filter(word => word.length > 0);
      
      setWordCount(words.length);
      setReadTime(Math.ceil(words.length / 200));
    } else {
      setWordCount(0);
      setReadTime(0);
    }
  }, [postContent]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (postTitle || postContent) {
        setLastSaved(new Date().toLocaleTimeString());
        toast.info("Post auto-saved", { duration: 2000 });
      }
    }, 30000);
    
    return () => window.clearInterval(interval);
  }, [postTitle, postContent]);

  // Mock data
  const categories = [
    { id: "1", name: "Tutorial", slug: "tutorial" },
    { id: "2", name: "Guide", slug: "guide" },
    { id: "3", name: "News", slug: "news" },
    { id: "4", name: "Performance", slug: "performance" },
    { id: "5", name: "Technology", slug: "technology" },
  ];

  const authors = [
    { id: "1", name: "Admin" },
    { id: "2", name: "Editor" },
    { id: "3", name: "Contributor" }
  ];

  const posts = [
    {
      id: "1",
      title: "Getting Started with AI WebGen",
      category: ["Tutorial"],
      status: "published",
      author: "Admin",
      date: "2023-05-15",
      content: "This is a comprehensive guide to getting started with AI WebGen.",
      featuredImage: "https://images.unsplash.com/photo-1677442135145-40703ad880fa?w=500&auto=format&fit=crop&q=60",
      featuredImageAlt: "AI generated abstract image",
      tags: ["AI", "Tutorial", "Beginner"],
      slug: "getting-started-with-ai-webgen",
      metaTitle: "Getting Started with AI WebGen - Complete Tutorial",
      metaDescription: "Learn how to create your first AI-powered website in minutes with our comprehensive guide to AI WebGen.",
      focusKeyword: "AI WebGen tutorial",
      canonicalUrl: "https://example.com/getting-started-with-ai-webgen",
      ogImage: "https://images.unsplash.com/photo-1677442135145-40703ad880fa?w=1200&auto=format&fit=crop&q=80"
    },
  ];

  const handleSave = () => {
    if (!postTitle.trim()) {
      toast.error("Please enter a post title");
      return;
    }

    toast.success(isEditMode ? "Post updated successfully!" : "Post created successfully!");
    setLastSaved(new Date().toLocaleTimeString());
    navigate('/posts');
  };

  const generateWithAI = () => {
    toast.info("Generating content with AI...");
    
    setTimeout(() => {
      const generatedHtml = `
        <h1>Generated AI Content for ${postTitle}</h1>
        <p>This is an AI-generated blog post about ${postTitle}.</p>
        <h2>Introduction</h2>
        <p>AI-powered content generation can help you create engaging blog posts quickly and efficiently.</p>
        <h3>Key Points</h3>
        <ol>
          <li>First important point about the topic</li>
          <li>Second important point with more details</li>
          <li>Third important point to consider</li>
        </ol>
        <h2>Conclusion</h2>
        <p>In conclusion, this AI-generated post provides a starting point that you can expand upon.</p>
      `;
      
      if (editorRef.current) {
        editorRef.current.innerHTML = generatedHtml;
        updateHtmlContent(generatedHtml);
        setPostHtmlContent(generatedHtml);
      }
      toast.success("AI content generated! Edit as needed.");
    }, 1500);
  };

  const calculateSEOScore = () => {
    let score = 0;
    
    if (postTitle && postTitle.length >= 10 && postTitle.length <= 60) score += 20;
    if (metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160) score += 20;
    if (focusKeyword && postContent.includes(focusKeyword)) score += 20;
    if (postContent && postContent.length >= 300) score += 20;
    if (postFeaturedImage) score += 20;
    
    return score;
  };

  const handleFindReplace = () => {
    if (!editorRef.current || !findText) return;
    
    console.log("Find and replace:", findText, "->", replaceText);
    
    const content = editorRef.current.innerHTML;
    let searchText = findText;
    
    if (!caseSensitive) {
      searchText = findText.toLowerCase();
    }
    
    let updatedContent = content;
    
    if (matchWholeWord) {
      const regex = new RegExp(`\\b${findText}\\b`, caseSensitive ? 'g' : 'gi');
      updatedContent = content.replace(regex, replaceText);
    } else {
      const regex = new RegExp(findText, caseSensitive ? 'g' : 'gi');
      updatedContent = content.replace(regex, replaceText);
    }
    
    if (updatedContent !== content) {
      editorRef.current.innerHTML = updatedContent;
      updateHtmlContent(updatedContent);
      toast.success("Text replaced successfully");
    } else {
      toast.info("No matches found");
    }
  };

  const seoScore = calculateSEOScore();
  
  const handleEditorAction = (action: string, value?: any) => {
    console.log("Editor action:", action, value);
    
    switch (action) {
      case "undo":
        undo();
        break;
      case "redo":
        redo();
        break;
      case "bold":
      case "italic":
      case "underline":
      case "strikethrough":
      case "blockquote":
      case "code":
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
      case "align-left":
      case "align-center":
      case "align-right":
      case "ordered-list":
      case "unordered-list":
        applyFormat(action);
        break;
      case "color":
      case "background":
        applyFormat(action, value);
        break;
      case "link":
        insertLink(value.url, value.text, value.newTab);
        break;
      case "image":
        insertImage(value.src, value.alt, value.align);
        break;
      case "video":
        insertVideo(value);
        break;
      case "table":
        insertTable(value.rows, value.cols);
        break;
      case "emoji":
      case "shortcode":
      case "chart":
        insertHTML(value);
        break;
      case "file":
        setIsUploading(true);
        setTimeout(() => {
          const fileName = prompt("Enter file name:", "document.pdf");
          const fileUrl = "https://example.com/" + (fileName || "document.pdf");
          
          const fileHtml = `<a href="${fileUrl}" download class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Download ${fileName}
          </a>`;
          
          insertHTML(fileHtml);
          setIsUploading(false);
          toast.success("File upload link added");
        }, 1000);
        break;
    }
  };

  const handleCodeTabChange = (view: "visual" | "code") => {
    console.log("Switching to view:", view);
    setEditorView(view);
    
    if (view === "code" && editorRef.current) {
      // Convert HTML to plain text for code view
      const htmlContent = editorRef.current.innerHTML;
      const textContent = htmlContent
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>/g, '');
      
      setPostContent(textContent);
    }
  };
  
  const handleContentChange = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      console.log("Content changed in visual editor:", newHtml);
      updateHtmlContent(newHtml);
      setPostHtmlContent(newHtml);
      
      // Update plain text content too
      const textContent = newHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      setPostContent(textContent);
    }
  };
  
  const handleContentPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    
    setTimeout(() => {
      if (editorRef.current) {
        updateHtmlContent(editorRef.current.innerHTML);
        handleContentChange();
      }
    }, 10);
  };

  const handleCodeContentChange = (newContent: string) => {
    console.log("Code content changed:", newContent);
    setPostContent(newContent);
    
    // Convert markdown-like content to HTML
    let htmlContent = newContent
      .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
      .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
      .replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    if (!htmlContent.startsWith('<')) {
      htmlContent = '<p>' + htmlContent + '</p>';
    }
    
    updateHtmlContent(htmlContent);
    setPostHtmlContent(htmlContent);
    
    // Update visual editor
    if (editorRef.current && editorView === "code") {
      editorRef.current.innerHTML = htmlContent;
    }
  };

  // Sync editor state with component state
  useEffect(() => {
    if (editorState.htmlContent !== postHtmlContent) {
      setPostHtmlContent(editorState.htmlContent);
      setPostContent(editorState.content);
    }
  }, [editorState.htmlContent, editorState.content]);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = '<p>Start writing your content here...</p>';
    }
  }, []);

  // Load post data in edit mode
  useEffect(() => {
    if (isEditMode) {
      const post = posts.find(p => p.id === currentPostId);
      if (post) {
        setPostTitle(post.title);
        const initialHtml = `<p>${post.content}</p>`;
        setPostHtmlContent(initialHtml);
        updateHtmlContent(initialHtml);
        
        if (editorRef.current) {
          editorRef.current.innerHTML = initialHtml;
        }
        
        setPostCategory(post.category || []);
        setPostStatus(post.status);
        setPostFeaturedImage(post.featuredImage);
        setFeaturedImageAlt(post.featuredImageAlt || "");
        setPostTags(post.tags || []);
        setPostAuthor(post.author);
        setPublishDate(post.date ? new Date(post.date) : new Date());
        setPostSlug(post.slug || "");
        setMetaTitle(post.metaTitle || post.title);
        setMetaDescription(post.metaDescription || "");
        setFocusKeyword(post.focusKeyword || "");
        setCanonicalUrl(post.canonicalUrl || "");
        setOgImage(post.ogImage || post.featuredImage);
      } else {
        toast.error("Post not found");
        navigate('/posts');
      }
    }
  }, [currentPostId, isEditMode, navigate, updateHtmlContent]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/posts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Post" : "Create New Post"}</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={generateWithAI}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save {isEditMode ? "Changes" : "Post"}
          </Button>
        </div>
      </div>

      {lastSaved && (
        <div className="text-sm text-muted-foreground">
          Last saved at: {lastSaved}
        </div>
      )}

      <div className="grid gap-6">
        <div>
          <Label htmlFor="post-title">Post Title</Label>
          <Input
            id="post-title"
            placeholder="Enter post title"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="post-slug">URL Slug</Label>
            <Input
              id="post-slug"
              placeholder="post-url-slug"
              value={postSlug}
              onChange={(e) => setPostSlug(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="post-author">Author</Label>
            <Select value={postAuthor} onValueChange={setPostAuthor}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select an author" />
              </SelectTrigger>
              <SelectContent>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={author.name}>
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="post-category">Category</Label>
            <div className="mt-1.5 grid gap-2 border rounded-md p-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={`category-${category.id}`}
                    checked={postCategory.includes(category.name)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPostCategory([...postCategory, category.name]);
                      } else {
                        setPostCategory(postCategory.filter(c => c !== category.name));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="post-status">Status</Label>
            <Select value={postStatus} onValueChange={setPostStatus}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            
            {postStatus === "scheduled" && (
              <div className="mt-2">
                <Label htmlFor="publish-date">Publish Date & Time</Label>
                <div className="flex gap-2 mt-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Calendar className="mr-2 h-4 w-4" />
                        {publishDate ? format(publishDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={publishDate}
                        onSelect={setPublishDate}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Input
                    type="time"
                    value={publishDate ? format(publishDate, "HH:mm") : ""}
                    onChange={(e) => {
                      if (publishDate && e.target.value) {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(publishDate);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setPublishDate(newDate);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          <Tabs value={editorTab} onValueChange={setEditorTab} className="w-full">
            <TabsList>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="write" className="min-h-[500px]">
              <div className="grid gap-4">
                <Card className="p-2">
                  <EditorToolbar 
                    editorView={editorView}
                    handleCodeTabChange={handleCodeTabChange}
                    wordCount={wordCount}
                    readTime={readTime}
                    onAction={handleEditorAction}
                    isUploading={isUploading}
                    showEmojiPicker={showEmojiPicker}
                    showColorPicker={showColorPicker}
                    setShowEmojiPicker={setShowEmojiPicker}
                    setShowColorPicker={setShowColorPicker}
                    showFindReplace={showFindReplace}
                    setShowFindReplace={setShowFindReplace}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    selectedBgColor={selectedBgColor}
                    setSelectedBgColor={setSelectedBgColor}
                    findText={findText}
                    setFindText={setFindText}
                    replaceText={replaceText}
                    setReplaceText={setReplaceText}
                    caseSensitive={caseSensitive}
                    setCaseSensitive={setCaseSensitive}
                    matchWholeWord={matchWholeWord}
                    setMatchWholeWord={setMatchWholeWord}
                    handleFindReplace={handleFindReplace}
                    generateWithAI={generateWithAI}
                  />
                </Card>
                
                {editorView === "code" ? (
                  <Textarea
                    placeholder="Write your content here. Use # for H1, ## for H2, ### for H3, **bold**, *italic*"
                    rows={16}
                    className="min-h-[450px] font-mono"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                    value={postContent}
                    onChange={(e) => handleCodeContentChange(e.target.value)}
                  />
                ) : (
                  <div className="border rounded-md p-4 min-h-[450px]">
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning={true}
                      className="outline-none min-h-[440px] prose prose-sm max-w-none focus:ring-0 focus:outline-none"
                      style={{ 
                        direction: 'ltr',
                        textAlign: 'left',
                        unicodeBidi: 'normal',
                        writingMode: 'horizontal-tb'
                      }}
                      onInput={handleContentChange}
                      onPaste={handleContentPaste}
                      onKeyDown={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          switch (e.key.toLowerCase()) {
                            case 'b':
                              e.preventDefault();
                              applyFormat('bold');
                              break;
                            case 'i':
                              e.preventDefault();
                              applyFormat('italic');
                              break;
                            case 'u':
                              e.preventDefault();
                              applyFormat('underline');
                              break;
                            case 'z':
                              e.preventDefault();
                              if (e.shiftKey) {
                                redo();
                              } else {
                                undo();
                              }
                              break;
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="min-h-[500px]">
              <Card className="p-6">
                <h1 className="text-3xl font-bold mb-4">{postTitle || "Post Title"}</h1>
                {postFeaturedImage && (
                  <figure className="mb-4">
                    <img 
                      src={postFeaturedImage} 
                      alt={featuredImageAlt || "Featured image"} 
                      className="w-full h-auto rounded-md max-h-[300px] object-cover" 
                    />
                    {featuredImageAlt && (
                      <figcaption className="text-sm text-gray-500 mt-1">{featuredImageAlt}</figcaption>
                    )}
                  </figure>
                )}
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-h6:text-sm" 
                  dangerouslySetInnerHTML={{ __html: editorState.htmlContent || '<p>No content yet. Start writing in the Write tab.</p>' }}
                />
              </Card>
            </TabsContent>
            
            <TabsContent value="seo" className="min-h-[500px]">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="meta-title">Meta Title</Label>
                  <Input
                    id="meta-title"
                    placeholder="SEO Title (max 60 characters)"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    maxLength={60}
                  />
                  <div className="text-xs text-right text-muted-foreground">
                    {metaTitle.length}/60 characters
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="meta-description">Meta Description</Label>
                  <Textarea
                    id="meta-description"
                    placeholder="SEO Description (max 160 characters)"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    maxLength={160}
                    rows={3}
                  />
                  <div className="text-xs text-right text-muted-foreground">
                    {metaDescription.length}/160 characters
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="focus-keyword">Focus Keyword</Label>
                  <Input
                    id="focus-keyword"
                    placeholder="Main keyword for this post"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="canonical-url">Canonical URL</Label>
                  <Input
                    id="canonical-url"
                    placeholder="https://example.com/original-post"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="og-image">OG Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="og-image"
                      placeholder="https://example.com/image.jpg"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {ogImage && (
                    <div className="mt-2 aspect-video relative rounded overflow-hidden border">
                      <img 
                        src={ogImage} 
                        alt="OG Image preview" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">SEO Score</h3>
                    <div className={`text-lg font-bold ${
                      seoScore >= 80 ? "text-green-500" : 
                      seoScore >= 50 ? "text-amber-500" : 
                      "text-red-500"
                    }`}>
                      {seoScore}/100
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Meta Title</span>
                      <Badge 
                        variant={metaTitle && metaTitle.length >= 10 && metaTitle.length <= 60 ? "default" : "outline"}
                        className={metaTitle && metaTitle.length >= 10 && metaTitle.length <= 60 ? "bg-green-500" : ""}
                      >
                        {metaTitle && metaTitle.length >= 10 && metaTitle.length <= 60 ? "Good" : "Needs Improvement"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Meta Description</span>
                      <Badge 
                        variant={metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160 ? "default" : "outline"}
                        className={metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160 ? "bg-green-500" : ""}
                      >
                        {metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160 ? "Good" : "Needs Improvement"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Focus Keyword Usage</span>
                      <Badge 
                        variant={focusKeyword && postContent.includes(focusKeyword) ? "default" : "outline"}
                        className={focusKeyword && postContent.includes(focusKeyword) ? "bg-green-500" : ""}
                      >
                        {focusKeyword && postContent.includes(focusKeyword) ? "Good" : "Not Found in Content"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Content Length</span>
                      <Badge 
                        variant={postContent.length >= 300 ? "default" : "outline"}
                        className={postContent.length >= 300 ? "bg-green-500" : ""}
                      >
                        {postContent.length >= 300 ? "Good" : "Too Short"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Featured Image</span>
                      <Badge 
                        variant={postFeaturedImage ? "default" : "outline"}
                        className={postFeaturedImage ? "bg-green-500" : ""}
                      >
                        {postFeaturedImage ? "Present" : "Missing"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="featured-image">Featured Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="featured-image"
                      placeholder="https://example.com/image.jpg"
                      value={postFeaturedImage}
                      onChange={(e) => setPostFeaturedImage(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {postFeaturedImage && (
                    <div className="mt-2">
                      <div className="aspect-video relative rounded overflow-hidden border">
                        <img 
                          src={postFeaturedImage} 
                          alt="Featured preview" 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <Input
                        className="mt-2"
                        placeholder="Image alt text"
                        value={featuredImageAlt}
                        onChange={(e) => setFeaturedImageAlt(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="post-tags">Tags</Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {postTags.map((tag, index) => (
                      <Badge key={index} className="px-2 py-1">
                        {tag}
                        <button 
                          className="ml-2 text-xs" 
                          onClick={() => setPostTags(postTags.filter((_, i) => i !== index))}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    <Input
                      className="flex-grow min-w-[150px]"
                      placeholder="Add a tag and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const inputEl = e.target as HTMLInputElement;
                          const newTag = inputEl.value.trim();
                          if (newTag && !postTags.includes(newTag)) {
                            setPostTags([...postTags, newTag]);
                            inputEl.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="allow-comments" defaultChecked />
                    <Label htmlFor="allow-comments">Allow Comments</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
