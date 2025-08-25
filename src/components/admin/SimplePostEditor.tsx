import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, ArrowLeft, Image, Video, Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

interface SimplePostEditorProps {
  isAI?: boolean;
  aiTitle?: string;
}

export function SimplePostEditor({ isAI = false, aiTitle = "" }: SimplePostEditorProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState(aiTitle);
  const [introduction, setIntroduction] = useState("");
  const [content, setContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [activeTab, setActiveTab] = useState("visual");
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate AI content when component loads with AI mode
  useState(() => {
    if (isAI && aiTitle && !content) {
      generateAIContent();
    }
  });

  const generateAIContent = async () => {
    if (!title) return;
    
    setIsGenerating(true);
    
    // Simulate AI API call
    setTimeout(() => {
      const aiIntro = `Discover everything you need to know about ${title}. This comprehensive guide covers the essential aspects and provides valuable insights.`;
      
      const aiContent = `
        <h2>Introduction</h2>
        <p>Welcome to this comprehensive guide about ${title}. In this article, we'll explore the key concepts and practical applications.</p>
        
        <h2>Key Points</h2>
        <ul>
          <li>Understanding the fundamentals</li>
          <li>Best practices and approaches</li>
          <li>Real-world applications</li>
          <li>Future developments</li>
        </ul>
        
        <h2>Getting Started</h2>
        <p>To begin with ${title}, it's important to understand the core principles. This foundation will help you build more advanced skills over time.</p>
        
        <h2>Practical Tips</h2>
        <ol>
          <li>Start with the basics</li>
          <li>Practice regularly</li>
          <li>Learn from examples</li>
          <li>Apply knowledge in real projects</li>
        </ol>
        
        <h2>Conclusion</h2>
        <p>In conclusion, ${title} offers tremendous opportunities for growth and innovation. By following the guidelines outlined in this article, you'll be well-equipped to succeed.</p>
      `;
      
      setIntroduction(aiIntro);
      setContent(aiContent);
      setHtmlContent(aiContent);
      setIsGenerating(false);
      toast.success("AI content generated successfully!");
    }, 2000);
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    // Save logic here
    toast.success("Post saved successfully!");
    navigate("/posts");
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (contentRef.current) {
      const html = contentRef.current.innerHTML;
      setHtmlContent(html);
      setContent(html);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = `<img src="${e.target?.result}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
        document.execCommand('insertHTML', false, img);
        updateContent();
      };
      reader.readAsDataURL(file);
    }
  };

  const insertVideo = () => {
    const url = prompt("Enter video URL (YouTube, Vimeo, etc.):");
    if (url) {
      let embedCode = "";
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('/').pop() 
          : url.split('v=')[1]?.split('&')[0];
        embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
      } else {
        embedCode = `<video controls style="max-width: 100%;"><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video>`;
      }
      document.execCommand('insertHTML', false, embedCode);
      updateContent();
    }
  };

  const syncHtmlToVisual = () => {
    if (contentRef.current) {
      contentRef.current.innerHTML = htmlContent;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/posts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {id ? "Edit Post" : isAI ? "AI Generated Post" : "Create New Post"}
          </h1>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Post
        </Button>
      </div>

      {isGenerating && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>AI is generating your content...</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Introduction</label>
              <Textarea
                placeholder="Enter a brief introduction..."
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="visual">Visual</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="visual" className="space-y-4">
                <div className="flex gap-2 p-2 border rounded-md flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => formatText('bold')}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => formatText('italic')}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => formatText('underline')}>
                    <Underline className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => formatText('insertUnorderedList')}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => formatText('insertOrderedList')}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleImageUpload}>
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={insertVideo}>
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
                
                <div
                  ref={contentRef}
                  contentEditable
                  className="min-h-[400px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  onInput={updateContent}
                  style={{ whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </TabsContent>
              
              <TabsContent value="html">
                <Textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Enter HTML content..."
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={syncHtmlToVisual}
                  className="mt-2"
                >
                  Apply HTML to Visual Editor
                </Button>
              </TabsContent>
              
              <TabsContent value="preview">
                <div className="min-h-[400px] p-4 border rounded-md prose max-w-none">
                  <h1>{title}</h1>
                  <p className="text-muted-foreground">{introduction}</p>
                  <div dangerouslySetInnerHTML={{ __html: htmlContent || content }} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}