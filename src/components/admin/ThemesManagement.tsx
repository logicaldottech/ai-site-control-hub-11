
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, SwatchBook, Check, Plus, Search, Trash2, Edit, Eye } from "lucide-react";

export function ThemesManagement() {
  const [activeTab, setActiveTab] = useState<string>("available");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Sample theme data - in a real app, these would come from an API
  const availableThemes = [
    { id: 1, name: "Modern Light", category: "Business", popularity: "High", status: "active", preview: "/themes/modern-light.jpg" },
    { id: 2, name: "Dark Corporate", category: "Business", popularity: "Medium", status: "active", preview: "/themes/dark-corporate.jpg" },
    { id: 3, name: "E-Commerce Pro", category: "E-Commerce", popularity: "High", status: "active", preview: "/themes/ecommerce-pro.jpg" },
    { id: 4, name: "Portfolio Minimal", category: "Portfolio", popularity: "Medium", status: "active", preview: "/themes/portfolio-minimal.jpg" },
    { id: 5, name: "Blog Standard", category: "Blog", popularity: "Low", status: "active", preview: "/themes/blog-standard.jpg" },
    { id: 6, name: "Restaurant Special", category: "Food", popularity: "Medium", status: "active", preview: "/themes/restaurant.jpg" },
    { id: 7, name: "Creative Agency", category: "Agency", popularity: "High", status: "active", preview: "/themes/creative-agency.jpg" },
    { id: 8, name: "Real Estate Pro", category: "Real Estate", popularity: "Medium", status: "active", preview: "/themes/real-estate.jpg" },
  ];

  const activeThemes = [
    { id: 1, name: "Modern Light", projectCount: 12, lastUsed: "2023-05-15", category: "Business" },
    { id: 3, name: "E-Commerce Pro", projectCount: 8, lastUsed: "2023-05-10", category: "E-Commerce" },
    { id: 7, name: "Creative Agency", projectCount: 5, lastUsed: "2023-05-05", category: "Agency" },
  ];

  const filteredAvailableThemes = searchTerm 
    ? availableThemes.filter(theme => 
        theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        theme.category.toLowerCase().includes(searchTerm.toLowerCase()))
    : availableThemes;

  const filteredActiveThemes = searchTerm
    ? activeThemes.filter(theme => 
        theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        theme.category.toLowerCase().includes(searchTerm.toLowerCase()))
    : activeThemes;

  const getPopularityBadge = (popularity: string) => {
    switch (popularity) {
      case "High":
        return <Badge className="bg-green-100 text-green-800">High</Badge>;
      case "Medium":
        return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
      case "Low":
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Themes Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and customize website themes</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add Custom Theme
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="available" className="flex items-center">
                <Palette className="mr-2 h-4 w-4" />
                Available Themes
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center">
                <SwatchBook className="mr-2 h-4 w-4" />
                Active Themes
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Custom Themes
              </TabsTrigger>
            </TabsList>

            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search themes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="available" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAvailableThemes.map((theme) => (
                <Card key={theme.id} className="overflow-hidden hover:shadow-md transition-all">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <Palette className="h-12 w-12" />
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                    <CardDescription>{theme.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <span>Popularity:</span>
                      {getPopularityBadge(theme.popularity)}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button size="sm">Activate</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {filteredAvailableThemes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No themes match your search criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Themes</CardTitle>
                <CardDescription>
                  Themes that are currently in use across your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left align-middle font-medium">Theme</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Category</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Projects</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Last Used</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActiveThemes.map((theme) => (
                        <tr key={theme.id} className="border-b">
                          <td className="p-4 align-middle">{theme.name}</td>
                          <td className="p-4 align-middle">{theme.category}</td>
                          <td className="p-4 align-middle">{theme.projectCount}</td>
                          <td className="p-4 align-middle">{theme.lastUsed}</td>
                          <td className="p-4 align-middle">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredActiveThemes.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No active themes match your search criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Themes</CardTitle>
                <CardDescription>Your custom designed themes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Palette className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Custom Themes Yet</h3>
                  <p className="text-gray-500 max-w-sm mb-6">
                    Create your own custom themes with our theme builder or upload custom theme packages
                  </p>
                  <div className="flex gap-4">
                    <Button>Create Theme</Button>
                    <Button variant="outline">Upload Theme</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
