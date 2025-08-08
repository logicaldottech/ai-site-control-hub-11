import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { themeApi, Theme, UpdateThemeData } from "@/api/themeApi";
import { Loader2 } from "lucide-react";

interface EditThemeDialogProps {
  theme: Theme | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThemeUpdated: () => void;
}

export function EditThemeDialog({ theme, open, onOpenChange, onThemeUpdated }: EditThemeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateThemeData>({
    themeId: "",
    themeName: "",
    supportThemeSubColor: "false",
    supportSecondaryColor: "false",
    themeDemoUrl: "",
    themeImageUrl: "",
    isActive: "false"
  });
  const { toast } = useToast();

  useEffect(() => {
    if (theme) {
      setFormData({
        themeId: theme._id || "",
        themeName: theme.themeName,
        supportThemeSubColor: theme.supportThemeSubColor.toString(),
        supportSecondaryColor: theme.supportSecondaryColor.toString(),
        themeDemoUrl: theme.themeDemoUrl,
        themeImageUrl: theme.themeImageUrl,
        isActive: theme.isActive.toString()
      });
    }
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.themeName || !formData.themeDemoUrl || !formData.themeImageUrl) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await themeApi.updateTheme(formData);
      toast({
        title: "Success",
        description: "Theme updated successfully"
      });
      onOpenChange(false);
      onThemeUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Theme</DialogTitle>
          <DialogDescription>
            Update theme details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="themeName">Theme Name *</Label>
            <Input
              id="themeName"
              value={formData.themeName}
              onChange={(e) => setFormData(prev => ({ ...prev, themeName: e.target.value }))}
              placeholder="Enter theme name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="themeDemoUrl">Demo URL *</Label>
            <Input
              id="themeDemoUrl"
              value={formData.themeDemoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, themeDemoUrl: e.target.value }))}
              placeholder="https://example.com/demo"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="themeImageUrl">Image URL *</Label>
            <Input
              id="themeImageUrl"
              value={formData.themeImageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, themeImageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="supportThemeSubColor"
                checked={formData.supportThemeSubColor === "true"}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, supportThemeSubColor: checked.toString() }))
                }
              />
              <Label htmlFor="supportThemeSubColor" className="text-sm">Support Sub Color</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="supportSecondaryColor"
                checked={formData.supportSecondaryColor === "true"}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, supportSecondaryColor: checked.toString() }))
                }
              />
              <Label htmlFor="supportSecondaryColor" className="text-sm">Support Secondary Color</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive === "true"}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isActive: checked.toString() }))
              }
            />
            <Label htmlFor="isActive" className="text-sm">Make Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Theme
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}