
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileText, Layout, Newspaper, Settings } from "lucide-react";
import { toast } from "sonner";

export function WebsiteGeneratorPlugin() {
  const [isPluginActive, setIsPluginActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const togglePlugin = () => {
    const newState = !isPluginActive;
    setIsPluginActive(newState);
    
    // In a real application, this would save to a database or local storage
    localStorage.setItem("website-generator-plugin-active", newState ? "true" : "false");
    
    // Show toast notification
    if (newState) {
      toast.success("Website Generator Plugin activated");
    } else {
      toast.info("Website Generator Plugin deactivated");
    }
  };
  
  const handleGenerateWebsite = () => {
    setIsGenerating(true);
    
    // Simulate website generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Website generated successfully!");
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Website Generator Plugin</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Website Generator</CardTitle>
          <CardDescription>
            Generate websites quickly using AI and templates. This plugin adds Pages, Posts, and Website Generator items to your sidebar when activated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div>
              <Label htmlFor="plugin-active">Plugin Status</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch 
                  id="plugin-active" 
                  checked={isPluginActive} 
                  onCheckedChange={togglePlugin} 
                />
                <span className={isPluginActive ? "text-green-500" : "text-gray-500"}>
                  {isPluginActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Plugin Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-base">Pages</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-500">Create and manage website pages</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-base">Posts</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-500">Create and manage blog posts</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-base">Website Generator</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-500">Generate complete websites using AI</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateWebsite} 
            disabled={!isPluginActive || isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Website"}
          </Button>
        </CardFooter>
      </Card>
      
      {isPluginActive && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Adjust settings for your website generator</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="site-name">Site Name</Label>
                <input 
                  id="site-name" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  placeholder="My Awesome Website" 
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="template">Template</Label>
                <select 
                  id="template" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="business">Business</option>
                  <option value="blog">Blog</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="ecommerce">E-commerce</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Reset</Button>
            <Button>Save Settings</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
