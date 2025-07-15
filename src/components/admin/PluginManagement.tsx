
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Settings, Download, Trash2, ExternalLink, Upload, FileText } from "lucide-react";
import { toast } from "sonner";

export function PluginManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPluginDialog, setShowAddPluginDialog] = useState(false);
  const [newPluginUrl, setNewPluginUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [installMethod, setInstallMethod] = useState<"url" | "upload">("url");
  const [installedPlugins, setInstalledPlugins] = useState([
    { 
      id: "seo-plugin", 
      name: "SEO Optimization", 
      description: "Automatically optimizes your website for search engines",
      version: "1.2.3", 
      status: "active", 
      author: "WebGen Team",
      lastUpdated: "2023-05-15",
    },
    { 
      id: "analytics-plugin", 
      name: "Advanced Analytics", 
      description: "Track and analyze user behavior on your website",
      version: "2.0.1", 
      status: "active", 
      author: "Data Insights Inc.",
      lastUpdated: "2023-06-22",
    },
    { 
      id: "security-plugin", 
      name: "Security Guard", 
      description: "Protect your website from common security threats",
      version: "3.1.0", 
      status: "inactive", 
      author: "SecureWeb Solutions",
      lastUpdated: "2023-04-10",
    },
    { 
      id: "backup-plugin", 
      name: "Auto Backup", 
      description: "Automatically backup your website data on schedule",
      version: "1.0.5", 
      status: "inactive", 
      author: "SafeData Ltd.",
      lastUpdated: "2023-07-03",
    },
    { 
      id: "website-generator-plugin", 
      name: "Website Generator", 
      description: "Generate websites quickly using AI and templates. Adds Pages, Posts, and Website Generator items to your sidebar.",
      version: "1.0.0", 
      status: localStorage.getItem("website-generator-plugin-active") === "true" ? "active" : "inactive", 
      author: "AI WebGen Team",
      lastUpdated: "2023-05-23",
    },
  ]);

  // Check plugin status on component mount
  useEffect(() => {
    const websiteGeneratorStatus = localStorage.getItem("website-generator-plugin-active") === "true" ? "active" : "inactive";
    setInstalledPlugins(prev => 
      prev.map(plugin => 
        plugin.id === "website-generator-plugin" 
          ? { ...plugin, status: websiteGeneratorStatus } 
          : plugin
      )
    );
  }, []);

  // Mock data for marketplace plugins
  const marketplacePlugins = [
    { 
      id: "social-media", 
      name: "Social Media Integration", 
      description: "Connect your website to all major social media platforms",
      version: "2.3.0", 
      rating: 4.7, 
      author: "Connect Labs",
      price: "Free",
      downloads: "5.2k"
    },
    { 
      id: "cache-optimizer", 
      name: "Cache Optimizer", 
      description: "Speed up your website with intelligent caching",
      version: "1.5.2", 
      rating: 4.9, 
      author: "SpeedTech",
      price: "$19.99",
      downloads: "3.8k"
    },
    { 
      id: "contact-form", 
      name: "Advanced Contact Form", 
      description: "Feature-rich contact form with spam protection",
      version: "3.0.1", 
      rating: 4.5, 
      author: "FormWizards Inc.",
      price: "Free",
      downloads: "10.4k"
    },
    { 
      id: "multilingual", 
      name: "Multilingual Support", 
      description: "Add multiple languages to your website with ease",
      version: "2.2.0", 
      rating: 4.8, 
      author: "Global Web Solutions",
      price: "$29.99",
      downloads: "7.1k"
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleInstallPlugin = () => {
    // In a real app, this would handle the plugin installation
    console.log("Installing plugin via:", installMethod);
    if (installMethod === "url") {
      console.log("Plugin URL:", newPluginUrl);
    } else {
      console.log("Plugin file:", uploadedFile?.name);
    }
    
    // Close dialog and reset form
    setShowAddPluginDialog(false);
    setNewPluginUrl("");
    setUploadedFile(null);
  };

  const handleTogglePluginStatus = (pluginId: string) => {
    console.log("Toggling plugin status:", pluginId);
    // Special handling for the Website Generator plugin
    if (pluginId === "website-generator-plugin") {
      const updatedPlugins = installedPlugins.map(plugin => {
        if (plugin.id === pluginId) {
          const newStatus = plugin.status === "active" ? "inactive" : "active";
          // Update localStorage
          localStorage.setItem("website-generator-plugin-active", newStatus === "active" ? "true" : "false");
          
          // Dispatch a storage event to notify other components
          window.dispatchEvent(new StorageEvent("storage", {
            key: "website-generator-plugin-active",
            newValue: newStatus === "active" ? "true" : "false",
          }));
          
          // Show toast notification
          if (newStatus === "active") {
            toast.success("Website Generator Plugin activated");
          } else {
            toast.info("Website Generator Plugin deactivated");
          }
          
          return { ...plugin, status: newStatus };
        }
        return plugin;
      });
      
      setInstalledPlugins(updatedPlugins);
    }
    // In a real app, this would toggle other plugins' active/inactive status
  };

  const handleDeletePlugin = (pluginId: string) => {
    console.log("Deleting plugin:", pluginId);
    // In a real app, this would delete/uninstall the plugin
  };

  const handleDownloadFromMarketplace = (pluginId: string) => {
    console.log("Downloading plugin from marketplace:", pluginId);
    // In a real app, this would download and install the plugin
  };

  const filteredInstalledPlugins = installedPlugins.filter(plugin => 
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMarketplacePlugins = marketplacePlugins.filter(plugin => 
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Plugins Management</h1>
        <Dialog open={showAddPluginDialog} onOpenChange={setShowAddPluginDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Plugin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Plugin</DialogTitle>
              <DialogDescription>
                Install a new plugin by providing a URL or uploading a plugin file.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Tabs defaultValue="url" onValueChange={(value) => setInstallMethod(value as "url" | "upload")}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="url">Install from URL</TabsTrigger>
                  <TabsTrigger value="upload">Upload Plugin</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plugin-url">Plugin URL</Label>
                    <Input
                      id="plugin-url"
                      placeholder="https://example.com/plugin.zip"
                      value={newPluginUrl}
                      onChange={(e) => setNewPluginUrl(e.target.value)}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="upload" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plugin-file">Upload Plugin File</Label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="plugin-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Plugin file (ZIP or JS)</p>
                        </div>
                        <input 
                          id="plugin-file" 
                          type="file" 
                          className="hidden" 
                          accept=".zip,.js"
                          onChange={handleFileChange} 
                        />
                      </label>
                    </div>
                    {uploadedFile && (
                      <p className="text-sm text-green-500">File selected: {uploadedFile.name}</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddPluginDialog(false)}>Cancel</Button>
              <Button onClick={handleInstallPlugin}>Install Plugin</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search plugins..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="installed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="installed">Installed Plugins</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>
        <TabsContent value="installed">
          {filteredInstalledPlugins.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plugin</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstalledPlugins.map((plugin) => (
                  <TableRow key={plugin.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{plugin.name}</p>
                        <p className="text-sm text-gray-500">{plugin.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{plugin.version}</TableCell>
                    <TableCell>{plugin.author}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={plugin.status === "active"} 
                          onCheckedChange={() => handleTogglePluginStatus(plugin.id)} 
                        />
                        <Badge 
                          variant={plugin.status === "active" ? "default" : "outline"}
                          className={plugin.status === "active" ? "bg-green-500" : ""}
                        >
                          {plugin.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{plugin.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeletePlugin(plugin.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-gray-500 mb-4">
                  {searchQuery ? "No plugins match your search" : "No plugins installed yet"}
                </p>
                <Button onClick={() => setShowAddPluginDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Plugin
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="marketplace">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredMarketplacePlugins.map((plugin) => (
              <Card key={plugin.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {plugin.name}
                    <Badge className="ml-2">{plugin.price}</Badge>
                  </CardTitle>
                  <CardDescription>
                    By {plugin.author} | {plugin.rating}/5 ⭐ | {plugin.downloads} downloads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{plugin.description}</p>
                  <p className="text-sm text-gray-500 mt-2">Version: {plugin.version}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  <Button size="sm" onClick={() => handleDownloadFromMarketplace(plugin.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Install
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {filteredMarketplacePlugins.length === 0 && (
              <Card className="col-span-2 mt-4">
                <CardContent className="flex items-center justify-center py-10">
                  <p className="text-center text-gray-500">No plugins match your search</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
