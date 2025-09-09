import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Edit, Trash2, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { httpFile } from "../../config.js";

type Author = {
  _id: string;
  name: string;
  jobTitle: string;
  bio: string;
  image: string;
  links: {label: string, url: string}[];
};

export function AuthorsManagement() {
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const navigate = useNavigate();

  // Form state for adding/editing author
  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    bio: "",
  });
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    instagram: "",
    facebook: "",
    youtube: "",
  });
  const [otherLinks, setOtherLinks] = useState<{label: string, url: string}[]>([{label: "", url: ""}]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch Authors from API
  const fetchAuthors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await httpFile.get("/fetch_authors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        toast({
          title: "Error",
          description: "Invalid token",
          variant: "destructive",
        });
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const authorsData = response.data.data || [];
      setAuthors(authorsData);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({
          title: "Error",
          description: "Token is not valid",
          variant: "destructive",
        });
        localStorage.removeItem("token");
        localStorage.clear();
        navigate("/login");
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch authors data",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    fetchAuthors();
    // eslint-disable-next-line
  }, []);

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle links input (comma separated)
  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleOtherLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    setOtherLinks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addOtherLink = () => {
    setOtherLinks(prev => [...prev, { label: "", url: "" }]);
  };

  const removeOtherLink = (index: number) => {
    if (otherLinks.length > 1) {
      setOtherLinks(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Submit new author to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Author name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('jobTitle', formData.jobTitle);
      formDataToSend.append('about', formData.bio);
      
      // Combine social links and other links into the expected format
      const allLinks = [];
      
      // Add social media links
      if (socialLinks.linkedin) allLinks.push({ label: 'LinkedIn', url: socialLinks.linkedin });
      if (socialLinks.instagram) allLinks.push({ label: 'Instagram', url: socialLinks.instagram });
      if (socialLinks.facebook) allLinks.push({ label: 'Facebook', url: socialLinks.facebook });
      if (socialLinks.youtube) allLinks.push({ label: 'YouTube', url: socialLinks.youtube });
      
      // Add other links
      otherLinks.forEach(link => {
        if (link.label && link.url) {
          allLinks.push({ label: link.label, url: link.url });
        }
      });
      
      formDataToSend.append('links', JSON.stringify(allLinks));
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const endpoint = view === "edit" && selectedAuthor 
        ? `/edit_author/${selectedAuthor._id}` 
        : "/create_author";

      const res = await httpFile.post(endpoint, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 401) {
        toast({
          title: "Error",
          description: "Invalid token",
          variant: "destructive",
        });
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (res.status === 200 || res.status === 201) {
        toast({
          title: "Success",
          description: `Author ${view === "edit" ? "updated" : "created"} successfully!`,
        });
        setView("list");
        setFormData({ name: "", jobTitle: "", bio: "" });
        setSocialLinks({ linkedin: "", instagram: "", facebook: "", youtube: "" });
        setOtherLinks([{label: "", url: ""}]);
        setImageFile(null);
        setImagePreview("");
        setSelectedAuthor(null);
        fetchAuthors();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "An error occurred!";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
  };

  // Delete author
  const handleDelete = async (authorId: string) => {
    if (!confirm("Are you sure you want to delete this author?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await httpFile.post(`/delete_author/${authorId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        toast({
          title: "Success",
          description: "Author deleted successfully!",
        });
        fetchAuthors();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete author";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
  };

  // Edit author
  const handleEdit = (author: Author) => {
    setSelectedAuthor(author);
    setFormData({
      name: author.name,
      jobTitle: author.jobTitle,
      bio: author.bio,
    });
    
    // Parse author links into social links and other links
    const socialLinksData = { linkedin: "", instagram: "", facebook: "", youtube: "" };
    const otherLinksData: {label: string, url: string}[] = [];
    
    if (author.links && author.links.length > 0) {
      author.links.forEach(link => {
        const label = link.label.toLowerCase();
        if (label === 'linkedin') {
          socialLinksData.linkedin = link.url;
        } else if (label === 'instagram') {
          socialLinksData.instagram = link.url;
        } else if (label === 'facebook') {
          socialLinksData.facebook = link.url;
        } else if (label === 'youtube') {
          socialLinksData.youtube = link.url;
        } else {
          otherLinksData.push(link);
        }
      });
    }
    
    setSocialLinks(socialLinksData);
    setOtherLinks(otherLinksData.length > 0 ? otherLinksData : [{label: "", url: ""}]);
    setImagePreview(author.image ? `${author.image}` : "");
    setView("edit");
  };

  // Filter for search
  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === "add" || view === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {view === "edit" ? "Edit Author" : "Add Author"}
          </h1>
          <Button variant="outline" onClick={() => {
            setView("list");
            setFormData({ name: "", jobTitle: "", bio: "" });
            setSocialLinks({ linkedin: "", instagram: "", facebook: "", youtube: "" });
            setOtherLinks([{label: "", url: ""}]);
            setImageFile(null);
            setImagePreview("");
            setSelectedAuthor(null);
          }}>
            Back to List
          </Button>
        </div>

        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a
                href="#"
                onClick={() => setView("list")}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Home
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <a
                  href="#"
                  onClick={() => setView("list")}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Blog Authors
                </a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">
                  {view === "edit" ? "Edit Author" : "Add Author"}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">
            {view === "edit" ? "Edit Author" : "Add Author"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Author Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter author name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium">
                  Job Title
                </label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="Enter job title"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium">
                  Bio/About
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Enter author bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-4">
                  Social Media Links
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium mb-1">
                      LinkedIn
                    </label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      placeholder="https://linkedin.com/in/username"
                      value={socialLinks.linkedin}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium mb-1">
                      Instagram
                    </label>
                    <Input
                      id="instagram"
                      name="instagram"
                      placeholder="https://instagram.com/username"
                      value={socialLinks.instagram}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium mb-1">
                      Facebook
                    </label>
                    <Input
                      id="facebook"
                      name="facebook"
                      placeholder="https://facebook.com/username"
                      value={socialLinks.facebook}
                      onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="youtube" className="block text-sm font-medium mb-1">
                      YouTube
                    </label>
                    <Input
                      id="youtube"
                      name="youtube"
                      placeholder="https://youtube.com/c/username"
                      value={socialLinks.youtube}
                      onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Other Links
                </label>
                {otherLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Label (e.g., Website, Portfolio)"
                      value={link.label}
                      onChange={(e) => handleOtherLinkChange(index, 'label', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => handleOtherLinkChange(index, 'url', e.target.value)}
                      className="flex-1"
                    />
                    {otherLinks.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOtherLink(index)}
                        className="px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOtherLink}
                  className="mt-2"
                >
                  Add Another Link
                </Button>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="image" className="block text-sm font-medium mb-2">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {imagePreview && (
                    <div className="w-16 h-16 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => {
                  setView("list");
                  setFormData({ name: "", jobTitle: "", bio: "" });
                  setSocialLinks({ linkedin: "", instagram: "", facebook: "", youtube: "" });
                  setOtherLinks([{label: "", url: ""}]);
                  setImageFile(null);
                  setImagePreview("");
                  setSelectedAuthor(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {view === "edit" ? "Update" : "Create"} Author
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Authors</h1>
        <Button onClick={() => setView("add")}>Add Author</Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Authors Listing</h2>
          <div className="relative">
            <Input
              placeholder="Search authors..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Sr No</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Links</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuthors.length > 0 ? (
                filteredAuthors.map((author, idx) => (
                  <TableRow key={author._id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      {author.image ? (
                        <img
                          src={author.image}
                          alt={author.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {author.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{author.name}</TableCell>
                    <TableCell>{author.jobTitle || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {author.bio || "-"}
                    </TableCell>
                    <TableCell>
                      {author.links && author.links.length > 0 ? (
                        <span className="text-sm text-blue-600">
                          {author.links.length} link(s)
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(author)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(author._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No authors found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}