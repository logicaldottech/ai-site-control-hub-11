
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, Save, Sparkles, Image, Calendar as CalendarIcon, Link, Bold,
  Italic, Underline, Code, ListOrdered, List, FileText, AlignLeft, AlignCenter,
  AlignRight, Youtube, FilePlus, Table2, Hash, Undo, Redo, Search, Type,
  Heading1, Heading2, Heading3, StrikethroughIcon, Quote, PaintBucket,
  Edit, Eye, Terminal, MessageSquare, BarChart4, Smile
} from "lucide-react";

interface EditorToolbarProps {
  editorView: "visual" | "code";
  handleCodeTabChange: (view: "visual" | "code") => void;
  wordCount: number;
  readTime: number;
  onAction: (action: string, value?: any) => void;
  isUploading: boolean;
  showEmojiPicker: boolean;
  showColorPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  setShowColorPicker: (show: boolean) => void;
  showFindReplace: boolean;
  setShowFindReplace: (show: boolean) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedBgColor: string;
  setSelectedBgColor: (color: string) => void;
  findText: string;
  setFindText: (text: string) => void;
  replaceText: string;
  setReplaceText: (text: string) => void;
  caseSensitive: boolean;
  setCaseSensitive: (sensitive: boolean) => void;
  matchWholeWord: boolean;
  setMatchWholeWord: (match: boolean) => void;
  handleFindReplace: () => void;
  generateWithAI: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editorView,
  handleCodeTabChange,
  wordCount,
  readTime,
  onAction,
  isUploading,
  showEmojiPicker,
  showColorPicker,
  setShowEmojiPicker,
  setShowColorPicker,
  showFindReplace,
  setShowFindReplace,
  selectedColor,
  setSelectedColor,
  selectedBgColor,
  setSelectedBgColor,
  findText,
  setFindText,
  replaceText,
  setReplaceText,
  caseSensitive,
  setCaseSensitive,
  matchWholeWord,
  setMatchWholeWord,
  handleFindReplace,
  generateWithAI
}) => {
  // Mock icons for emoji picker
  const mockIcons = ["😊", "👍", "🚀", "💡", "⭐", "🔥", "💯", "👏", "🎉", "🎯", "💪", "🙌", "👀", "🧠", "💭"];

  // Mock shortcodes
  const shortcodes = [
    { name: "Contact Form", code: "[contact-form]" },
    { name: "Testimonial Slider", code: "[testimonial-slider]" },
    { name: "Recent Posts", code: "[recent-posts count=3]" },
    { name: "Gallery", code: "[gallery ids=1,2,3]" },
    { name: "Button", code: '[button text="Click Me" url="https://example.com"]' },
    { name: "Call to Action", code: '[cta title="Join Now" description="Sign up today!" button="Get Started"]' },
  ];

  // Mock chart templates
  const chartTemplates = [
    { 
      name: "Bar Chart", 
      data: { 
        type: "bar",
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
          {
            label: "Sales",
            data: [50, 60, 70, 180, 190]
          }
        ]
      } 
    },
    { 
      name: "Line Chart", 
      data: { 
        type: "line",
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
          {
            label: "Views",
            data: [100, 200, 150, 300, 250]
          }
        ]
      } 
    },
    { 
      name: "Pie Chart", 
      data: { 
        type: "pie",
        labels: ["Desktop", "Mobile", "Tablet"],
        datasets: [
          {
            data: [60, 30, 10]
          }
        ]
      } 
    }
  ];

  const handleInsertLink = () => {
    const url = prompt("Enter URL:", "https://");
    const text = prompt("Enter link text:", "Link Text");
    const newTab = confirm("Open in new tab?");
    
    if (url && text) {
      onAction("link", { url, text, newTab });
    }
  };

  const handleInsertImage = () => {
    // Mock image upload - in a real app, this would be an actual upload
    setTimeout(() => {
      const imageUrl = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=500&auto=format&fit=crop&q=60";
      const altText = prompt("Enter image alt text:", "Description of image");
      const alignment = prompt("Image alignment (left, center, right):", "center");
      
      onAction("image", { src: imageUrl, alt: altText || "", align: alignment || "center" });
      
      toast.success("Image added to content");
    }, 300);
  };

  const handleInsertVideo = () => {
    const videoUrl = prompt("Enter YouTube or Vimeo URL:");
    if (videoUrl) {
      // Basic transformation of YouTube/Vimeo URLs to embed format
      let embedUrl = videoUrl;
      
      if (videoUrl.includes('youtube.com/watch?v=')) {
        const videoId = videoUrl.split('v=')[1].split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes('vimeo.com/')) {
        const videoId = videoUrl.split('vimeo.com/')[1];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
      
      onAction("video", embedUrl);
      toast.success("Video embed added to content");
    }
  };

  const handleInsertTable = () => {
    const rows = parseInt(prompt("Number of rows:", "3") || "3");
    const columns = parseInt(prompt("Number of columns:", "3") || "3");
    
    onAction("table", { rows, cols: columns });
    toast.success("Table added to content");
  };

  const handleInsertEmoji = (emoji: string) => {
    onAction("emoji", emoji);
    setShowEmojiPicker(false);
  };

  const applyColorStyle = (type: 'text' | 'background') => {
    const color = type === 'text' ? selectedColor : selectedBgColor;
    onAction(type === 'text' ? 'color' : 'background', color);
    setShowColorPicker(false);
  };

  const insertHeading = (level: number) => {
    onAction(`h${level}`);
  };

  const insertShortcode = (code: string) => {
    onAction("shortcode", code);
    toast.success("Shortcode inserted");
  };
  
  const insertChart = (chart: any) => {
    // In real implementation, this would generate a chart
    const chartCode = `[chart type="${chart.data.type}" 
    labels="${chart.data.labels.join(',')}" 
    data="${chart.data.datasets[0].data.join(',')}"
    title="${chart.name}"]`;
    
    onAction("chart", chartCode);
    toast.success(`${chart.name} inserted`);
  };

  return (
    <>
      <div className="flex flex-wrap gap-1 mb-2">
        {/* Code/Visual toggle */}
        <div className="flex rounded-md overflow-hidden mr-2">
          <Button 
            size="sm" 
            variant={editorView === "visual" ? "default" : "outline"}
            onClick={() => handleCodeTabChange("visual")}
            className="rounded-r-none"
          >
            <Eye className="h-4 w-4 mr-1" />
            Visual
          </Button>
          <Button 
            size="sm" 
            variant={editorView === "code" ? "default" : "outline"}
            onClick={() => handleCodeTabChange("code")}
            className="rounded-l-none"
          >
            <Terminal className="h-4 w-4 mr-1" />
            Code
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-8 mx-2" />
        
        {/* History controls */}
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onAction("undo")}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onAction("redo")}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-8 mx-2" />
        
        {/* Headings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Type className="h-4 w-4 mr-1" />
              Heading
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => insertHeading(1)}>
              <Heading1 className="h-4 w-4 mr-2" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertHeading(2)}>
              <Heading2 className="h-4 w-4 mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertHeading(3)}>
              <Heading3 className="h-4 w-4 mr-2" /> Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Text format buttons */}
        <Button size="sm" variant="outline" onClick={() => onAction("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("underline")} title="Underline">
          <Underline className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("strikethrough")} title="Strikethrough">
          <StrikethroughIcon className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("blockquote")} title="Quote">
          <Quote className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-8 mx-2" />
        
        {/* Lists */}
        <Button size="sm" variant="outline" onClick={() => onAction("ordered-list")} title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("unordered-list")} title="Bullet List">
          <List className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-8 mx-2" />
        
        {/* Media */}
        <Button size="sm" variant="outline" onClick={handleInsertLink} title="Insert Link">
          <Link className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleInsertImage}
          disabled={isUploading}
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleInsertVideo} title="Insert Video">
          <Youtube className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onAction("file")}
          disabled={isUploading}
          title="Upload File"
        >
          <FilePlus className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-8 mx-2" />
        
        {/* Additional format tools */}
        <Button size="sm" variant="outline" onClick={() => onAction("code")} title="Insert Code Block">
          <Code className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleInsertTable} title="Insert Table">
          <Table2 className="h-4 w-4" />
        </Button>
        
        {/* Color picker */}
        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" title="Text Color & Background">
              <PaintBucket className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="grid gap-3">
              <div>
                <Label>Text Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-10 h-10 p-1"
                  />
                  <Input 
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={selectedBgColor}
                    onChange={(e) => setSelectedBgColor(e.target.value)}
                    className="w-10 h-10 p-1"
                  />
                  <Input 
                    type="text"
                    value={selectedBgColor}
                    onChange={(e) => setSelectedBgColor(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => applyColorStyle('text')}>Apply Text Color</Button>
                <Button onClick={() => applyColorStyle('background')}>Apply Background</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Find & Replace */}
        <Dialog open={showFindReplace} onOpenChange={setShowFindReplace}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" title="Find & Replace">
              <Search className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Find & Replace</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label>Find</Label>
                <Input
                  placeholder="Text to find"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Replace with</Label>
                <Input
                  placeholder="Replacement text (optional)"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="case-sensitive" 
                    checked={caseSensitive}
                    onCheckedChange={(checked) => setCaseSensitive(checked === true)}
                  />
                  <Label htmlFor="case-sensitive">Case sensitive</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="whole-word" 
                    checked={matchWholeWord}
                    onCheckedChange={(checked) => setMatchWholeWord(checked === true)}
                  />
                  <Label htmlFor="whole-word">Whole word</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleFindReplace}>
                  {replaceText ? 'Replace All' : 'Find All'}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Second row of controls */}
      <div className="flex flex-wrap gap-1">
        {/* Alignment controls */}
        <Button size="sm" variant="outline" onClick={() => onAction("align-left")} title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("align-center")} title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("align-right")} title="Align Right">
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-8 mx-2" />
        
        {/* Advanced features */}
        {/* Emoji picker */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" title="Insert Emoji">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <ScrollArea className="h-56">
              <div className="grid grid-cols-8 gap-1 p-1">
                {mockIcons.map((emoji, index) => (
                  <Button 
                    key={index} 
                    variant="ghost" 
                    className="w-8 h-8 p-0" 
                    onClick={() => handleInsertEmoji(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        
        {/* Shortcodes */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" title="Insert Shortcode">
              <Hash className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {shortcodes.map(shortcode => (
              <DropdownMenuItem 
                key={shortcode.name}
                onClick={() => insertShortcode(shortcode.code)}
              >
                {shortcode.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Chart inserter */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" title="Insert Chart">
              <BarChart4 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Chart</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              {chartTemplates.map(chart => (
                <div 
                  key={chart.name} 
                  className="p-3 cursor-pointer hover:bg-slate-50 border rounded-md" 
                  onClick={() => insertChart(chart)}
                >
                  <div className="font-medium">{chart.name}</div>
                  <div className="text-sm text-gray-500">
                    {chart.data.type.charAt(0).toUpperCase() + chart.data.type.slice(1)} chart with {chart.data.labels.length} labels
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        
        {/* AI assistant */}
        <Button 
          size="sm" 
          variant="outline" 
          className="ml-auto"
          onClick={generateWithAI}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          AI Suggestions
        </Button>
        
        {/* Content statistics */}
        <Button size="sm" variant="outline" className="ml-2">
          <MessageSquare className="h-4 w-4 mr-1" />
          {wordCount} words | {readTime} min read
        </Button>
      </div>
    </>
  );
};

export default EditorToolbar;
