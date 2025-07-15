
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export function PagesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPageDialog, setShowAddPageDialog] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageContent, setNewPageContent] = useState("");

  // Mock data for pages
  const pages = [
    {
      id: "1",
      title: "Home",
      status: "published",
      author: "Admin",
      created: "2023-05-10",
      lastModified: "2023-05-15"
    },
    {
      id: "2",
      title: "About Us",
      status: "published",
      author: "Admin",
      created: "2023-05-12",
      lastModified: "2023-05-12"
    },
    {
      id: "3",
      title: "Services",
      status: "draft",
      author: "Editor",
      created: "2023-05-14",
      lastModified: "2023-05-14"
    },
    {
      id: "4",
      title: "Contact Us",
      status: "published",
      author: "Admin",
      created: "2023-05-16",
      lastModified: "2023-05-18"
    }
  ];

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPage = () => {
    if (!newPageTitle.trim()) {
      toast.error("Please enter a page title");
      return;
    }
    
    // In a real app, this would add the page to the database
    console.log("New page:", { title: newPageTitle, content: newPageContent });
    toast.success("Page created successfully!");
    
    // Reset form and close dialog
    setNewPageTitle("");
    setNewPageContent("");
    setShowAddPageDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Pages Management</h1>
        <Dialog open={showAddPageDialog} onOpenChange={setShowAddPageDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>
                Add a new page to your website. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="page-title">Page Title</Label>
                <Input
                  id="page-title"
                  placeholder="Enter page title"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="page-content">Content</Label>
                <Textarea
                  id="page-content"
                  placeholder="Enter page content"
                  rows={10}
                  value={newPageContent}
                  onChange={(e) => setNewPageContent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddPageDialog(false)}>Cancel</Button>
              <Button onClick={handleAddPage}>Create Page</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search pages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Website Pages</CardTitle>
          <CardDescription>
            Manage your website pages. You can create, edit, and delete pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.length > 0 ? (
                filteredPages.map(page => (
                  <TableRow key={page.id}>
                    <TableCell>{page.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={page.status === "published" ? "default" : "secondary"}
                        className={page.status === "published" ? "bg-green-500" : ""}
                      >
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{page.author}</TableCell>
                    <TableCell>{page.created}</TableCell>
                    <TableCell>{page.lastModified}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No pages found
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
