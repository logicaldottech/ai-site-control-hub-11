
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function PostTagsManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  
  // Mock data for tags
  const [tags, setTags] = useState([
    { id: "1", name: "AI", slug: "ai", description: "Artificial Intelligence", count: 1 },
    { id: "2", name: "Tutorial", slug: "tutorial", description: "Tutorials and guides", count: 1 },
    { id: "3", name: "Beginner", slug: "beginner", description: "For beginners", count: 1 },
    { id: "4", name: "Templates", slug: "templates", description: "Website templates", count: 1 },
    { id: "5", name: "Customization", slug: "customization", description: "Website customization", count: 1 },
    { id: "6", name: "News", slug: "news", description: "Latest news", count: 1 },
    { id: "7", name: "Features", slug: "features", description: "Platform features", count: 1 },
    { id: "8", name: "Performance", slug: "performance", description: "Performance optimization", count: 1 },
    { id: "9", name: "Optimization", slug: "optimization", description: "Site optimization", count: 1 },
  ]);

  const filteredData = tags.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    
    // Create slug if not provided
    const slugToUse = newSlug.trim() ? newSlug : newName.toLowerCase().replace(/\s+/g, '-');
    
    // Create new item
    const newItem = {
      id: (tags.length + 1).toString(),
      name: newName,
      slug: slugToUse,
      description: newDescription,
      count: 0
    };
    
    // Add to data
    setTags([...tags, newItem]);
    toast.success("Tag created successfully!");
    
    // Reset form and close dialog
    resetForm();
    setShowAddDialog(false);
  };

  const handleEdit = (id: string) => {
    // Find the item
    const itemToEdit = tags.find(item => item.id === id);
    if (!itemToEdit) return;

    // Set form values
    setNewName(itemToEdit.name);
    setNewSlug(itemToEdit.slug);
    setNewDescription(itemToEdit.description || "");
    setCurrentId(id);

    // Open edit dialog
    setShowEditDialog(true);
  };

  const saveEditedItem = () => {
    if (!newName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    // Update item
    const updatedItems = tags.map(item => {
      if (item.id === currentId) {
        return {
          ...item,
          name: newName,
          slug: newSlug || newName.toLowerCase().replace(/\s+/g, '-'),
          description: newDescription
        };
      }
      return item;
    });

    setTags(updatedItems);
    toast.success("Tag updated successfully!");
    
    // Reset form and close dialog
    resetForm();
    setShowEditDialog(false);
  };

  const confirmDelete = (id: string) => {
    setCurrentId(id);
    setShowDeleteConfirm(true);
  };

  const deleteItem = () => {
    // Remove item
    setTags(tags.filter(item => item.id !== currentId));
    toast.success("Tag deleted successfully!");
    setShowDeleteConfirm(false);
  };

  const resetForm = () => {
    setNewName("");
    setNewSlug("");
    setNewDescription("");
    setCurrentId("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          className="mr-4"
          onClick={() => navigate("/posts")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Posts
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Post Tags</h1>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search tags..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>
                Add a new tag for organizing your posts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter tag name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input
                  id="slug"
                  placeholder="enter-slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                />
                <p className="text-xs text-gray-500">Leave empty to auto-generate from name</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter tag description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setShowAddDialog(false);
              }}>Cancel</Button>
              <Button onClick={handleAdd}>Create Tag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
              <DialogDescription>
                Make changes to the tag.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter tag name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  placeholder="enter-slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter tag description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setShowEditDialog(false);
              }}>Cancel</Button>
              <Button onClick={saveEditedItem}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this tag? Posts with this tag will not be deleted, but the tag will be removed from them.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={deleteItem}>Delete Tag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>
            Manage tags for organizing your blog posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {filteredData.slice(0, 10).map(tag => (
              <Badge key={tag.id} variant="outline" className="text-sm py-1.5">
                {tag.name} ({tag.count})
              </Badge>
            ))}
            {filteredData.length > 10 && (
              <Badge variant="outline" className="text-sm py-1.5">
                +{filteredData.length - 10} more
              </Badge>
            )}
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.slug}</TableCell>
                    <TableCell>{item.description || "—"}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(item.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => confirmDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No tags found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
