
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function PostSubcategoriesManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newParentId, setNewParentId] = useState("");
  
  // Mock data for categories
  const [categories, setCategories] = useState([
    { id: "1", name: "Tutorial", slug: "tutorial", description: "Helpful guides and tutorials", count: 1 },
    { id: "2", name: "Guide", slug: "guide", description: "In-depth guides for advanced users", count: 1 },
    { id: "3", name: "News", slug: "news", description: "Latest updates and announcements", count: 1 },
    { id: "4", name: "Performance", slug: "performance", description: "Tips for optimizing performance", count: 1 },
  ]);

  // Mock data for subcategories
  const [subcategories, setSubcategories] = useState([
    { id: "1", name: "Getting Started", slug: "getting-started", parentId: "1", description: "Beginner tutorials", count: 1 },
    { id: "2", name: "Advanced", slug: "advanced", parentId: "1", description: "Advanced tutorials", count: 0 },
    { id: "3", name: "Templates", slug: "templates", parentId: "2", description: "Template guides", count: 1 },
    { id: "4", name: "Updates", slug: "updates", parentId: "3", description: "Latest platform updates", count: 1 },
    { id: "5", name: "Optimization", slug: "optimization", parentId: "4", description: "Performance optimization tips", count: 0 },
  ]);

  const filteredData = subcategories.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getParentName(item.parentId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  function getParentName(parentId: string) {
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : "Unknown";
  }

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    
    if (!newParentId) {
      toast.error("Please select a parent category");
      return;
    }
    
    // Create slug if not provided
    const slugToUse = newSlug.trim() ? newSlug : newName.toLowerCase().replace(/\s+/g, '-');
    
    // Create new item
    const newItem = {
      id: (subcategories.length + 1).toString(),
      name: newName,
      slug: slugToUse,
      parentId: newParentId,
      description: newDescription,
      count: 0
    };
    
    // Add to data
    setSubcategories([...subcategories, newItem]);
    toast.success("Subcategory created successfully!");
    
    // Reset form and close dialog
    resetForm();
    setShowAddDialog(false);
  };

  const handleEdit = (id: string) => {
    // Find the item
    const itemToEdit = subcategories.find(item => item.id === id);
    if (!itemToEdit) return;

    // Set form values
    setNewName(itemToEdit.name);
    setNewSlug(itemToEdit.slug);
    setNewDescription(itemToEdit.description || "");
    setNewParentId(itemToEdit.parentId);
    setCurrentId(id);

    // Open edit dialog
    setShowEditDialog(true);
  };

  const saveEditedItem = () => {
    if (!newName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    if (!newParentId) {
      toast.error("Please select a parent category");
      return;
    }

    // Update item
    const updatedItems = subcategories.map(item => {
      if (item.id === currentId) {
        return {
          ...item,
          name: newName,
          slug: newSlug || newName.toLowerCase().replace(/\s+/g, '-'),
          description: newDescription,
          parentId: newParentId
        };
      }
      return item;
    });

    setSubcategories(updatedItems);
    toast.success("Subcategory updated successfully!");
    
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
    setSubcategories(subcategories.filter(item => item.id !== currentId));
    toast.success("Subcategory deleted successfully!");
    setShowDeleteConfirm(false);
  };

  const resetForm = () => {
    setNewName("");
    setNewSlug("");
    setNewDescription("");
    setNewParentId("");
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
        <h1 className="text-2xl font-bold tracking-tight">Post Subcategories</h1>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search subcategories..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Subcategory</DialogTitle>
              <DialogDescription>
                Add a new subcategory for organizing your posts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="parent">Parent Category</Label>
                <Select value={newParentId} onValueChange={setNewParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter subcategory name"
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
                  placeholder="Enter subcategory description"
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
              <Button onClick={handleAdd}>Create Subcategory</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Subcategory</DialogTitle>
              <DialogDescription>
                Make changes to the subcategory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-parent">Parent Category</Label>
                <Select value={newParentId} onValueChange={setNewParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter subcategory name"
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
                  placeholder="Enter subcategory description"
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
                Are you sure you want to delete this subcategory? Posts in this subcategory will not be deleted, but they will no longer be categorized.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={deleteItem}>Delete Subcategory</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subcategories</CardTitle>
          <CardDescription>
            Manage subcategories for further organizing your blog posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent</TableHead>
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
                    <TableCell>{getParentName(item.parentId)}</TableCell>
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
                  <TableCell colSpan={6} className="text-center py-4">
                    No subcategories found
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
