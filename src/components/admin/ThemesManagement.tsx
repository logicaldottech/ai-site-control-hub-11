
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { themeApi, Theme } from "@/api/themeApi";
import { CreateThemeDialog } from "./CreateThemeDialog";
import { EditThemeDialog } from "./EditThemeDialog";
import { Palette, SwatchBook, Search, Edit, Eye, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

export function ThemesManagement() {
  const [activeTab, setActiveTab] = useState<string>("available");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      setLoading(true);
      console.log('Loading themes...');
      const themeData = await themeApi.listThemes();
      console.log('Themes loaded successfully:', themeData);
      setThemes(themeData);
    } catch (error: any) {
      console.error('Error loading themes:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to load themes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (themeId: string, currentStatus: boolean) => {
    try {
      console.log('Toggling theme status:', { themeId, currentStatus });
      await themeApi.changeThemeStatus(themeId, !currentStatus);
      toast({
        title: "Success",
        description: `Theme ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
      loadThemes();
    } catch (error: any) {
      console.error('Error toggling theme status:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to update theme status",
        variant: "destructive"
      });
    }
  };

  const handleEditTheme = (theme: Theme) => {
    setEditingTheme(theme);
    setEditDialogOpen(true);
  };

  const filteredThemes = searchTerm 
    ? themes.filter(theme => 
        theme.themeName.toLowerCase().includes(searchTerm.toLowerCase()))
    : themes;

  const activeThemes = filteredThemes.filter(theme => theme.isActive);
  const availableThemes = filteredThemes;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Themes Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and customize website themes</p>
        </div>
        <CreateThemeDialog onThemeCreated={loadThemes} />
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
              {/* <TabsTrigger value="custom" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Custom Themes
              </TabsTrigger> */}
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
              {availableThemes.map((theme) => (
                <Card key={theme._id} className="overflow-hidden hover:shadow-md transition-all">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {theme.themeImageUrl ? (
                      <img 
                        src={theme.themeImageUrl} 
                        alt={theme.themeName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <Palette className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{theme.themeName}</CardTitle>
                    <CardDescription>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {theme.supportSecondaryColor && (
                          <Badge variant="secondary" className="text-xs">Secondary Color</Badge>
                        )}
                        {theme.supportThemeSubColor && (
                          <Badge variant="secondary" className="text-xs">Sub Color</Badge>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={theme.isActive ? "default" : "secondary"}>
                        {theme.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto"
                      onClick={() => window.open(theme.themeDemoUrl, '_blank')}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditTheme(theme)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(theme._id!, theme.isActive)}
                      >
                        {theme.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {availableThemes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No themes match your search criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Themes</CardTitle>
                <CardDescription>
                  Themes that are currently active and available for use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left align-middle font-medium">Theme</th>
                        <th className="h-12 px-4 text-left align-middle font-medium hidden sm:table-cell">Features</th>
                        <th className="h-12 px-4 text-left align-middle font-medium hidden md:table-cell">Created</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeThemes.map((theme) => (
                        <tr key={theme._id} className="border-b">
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                                {theme.themeImageUrl ? (
                                  <img 
                                    src={theme.themeImageUrl} 
                                    alt={theme.themeName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Palette className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{theme.themeName}</div>
                                <div className="text-sm text-muted-foreground sm:hidden">
                                  {theme.supportSecondaryColor && "Secondary Color"} 
                                  {theme.supportThemeSubColor && theme.supportSecondaryColor && ", "}
                                  {theme.supportThemeSubColor && "Sub Color"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle hidden sm:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {theme.supportSecondaryColor && (
                                <Badge variant="secondary" className="text-xs">Secondary Color</Badge>
                              )}
                              {theme.supportThemeSubColor && (
                                <Badge variant="secondary" className="text-xs">Sub Color</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-middle text-muted-foreground hidden md:table-cell">
                            {theme.createdAt ? new Date(theme.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(theme.themeDemoUrl, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditTheme(theme)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleToggleStatus(theme._id!, theme.isActive)}
                              >
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {activeThemes.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No active themes found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Themes</CardTitle>
                <CardDescription>Manage all themes in your system</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredThemes.map((theme) => (
                    <Card key={theme._id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {theme.themeImageUrl ? (
                          <img 
                            src={theme.themeImageUrl} 
                            alt={theme.themeName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <Palette className="h-8 w-8" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge variant={theme.isActive ? "default" : "secondary"}>
                            {theme.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{theme.themeName}</CardTitle>
                        <CardDescription className="text-sm">
                          <div className="flex flex-wrap gap-1 mt-1">
                            {theme.supportSecondaryColor && (
                              <Badge variant="outline" className="text-xs">Secondary</Badge>
                            )}
                            {theme.supportThemeSubColor && (
                              <Badge variant="outline" className="text-xs">Sub Color</Badge>
                            )}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <div className="flex gap-2 w-full">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => window.open(theme.themeDemoUrl, '_blank')}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Preview
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTheme(theme)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleStatus(theme._id!, theme.isActive)}
                          >
                            {theme.isActive ? (
                              <ToggleRight className="h-3 w-3 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-3 w-3 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {filteredThemes.length === 0 && (
                  <div className="text-center py-12">
                    <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Themes Found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                      {searchTerm ? "No themes match your search criteria" : "Create your first theme to get started"}
                    </p>
                    <CreateThemeDialog onThemeCreated={loadThemes} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EditThemeDialog 
        theme={editingTheme}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onThemeUpdated={loadThemes}
      />
    </div>
  );
}
