
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  Folder, 
  File, 
  Upload, 
  Download, 
  Trash2, 
  Home, 
  ArrowLeft, 
  RefreshCw,
  Plus,
  Eye
} from "lucide-react";
import { HostingCredential } from "@/utils/credentialManager";
import { listFiles, uploadFile, deleteFile, FileListItem } from "@/utils/hostingService";

interface FileManagerProps {
  credential: HostingCredential;
}

export function FileManager({ credential }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState("/");
  const [files, setFiles] = useState<FileListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadContent, setUploadContent] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileListItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load files for current directory
  const loadFiles = async (path: string = currentPath) => {
    setIsLoading(true);
    try {
      const fileList = await listFiles(credential, path, credential.protocol);
      setFiles(fileList);
    } catch (error) {
      console.error("Failed to load files:", error);
      toast({
        title: "Error loading files",
        description: "Failed to load directory contents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  // Navigate to directory
  const navigateToDirectory = (dirPath: string) => {
    setCurrentPath(dirPath);
  };

  // Go back to parent directory
  const goBack = () => {
    if (currentPath !== "/") {
      const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
      setCurrentPath(parentPath);
    }
  };

  // Go to home directory
  const goHome = () => {
    setCurrentPath("/");
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFileName || !uploadContent) {
      toast({
        title: "Upload failed",
        description: "Please provide both filename and content",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await uploadFile(
        credential,
        `${currentPath}/${uploadFileName}`,
        uploadContent,
        credential.protocol
      );

      if (success) {
        toast({
          title: "File uploaded",
          description: `${uploadFileName} has been uploaded successfully`
        });
        setShowUploadDialog(false);
        setUploadFileName("");
        setUploadContent("");
        loadFiles(); // Refresh file list
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: `Failed to upload ${uploadFileName}`,
        variant: "destructive"
      });
    }
  };

  // Handle file deletion
  const handleDelete = async () => {
    if (!selectedFile) return;

    try {
      const success = await deleteFile(credential, selectedFile.path, credential.protocol);
      
      if (success) {
        toast({
          title: "File deleted",
          description: `${selectedFile.name} has been deleted`
        });
        setShowDeleteDialog(false);
        setSelectedFile(null);
        loadFiles(); // Refresh file list
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: `Failed to delete ${selectedFile.name}`,
        variant: "destructive"
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            File Manager - {credential.providerName}
          </CardTitle>
          <CardDescription>
            Browse and manage files on your hosting account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={goHome}
                disabled={currentPath === "/"}
              >
                <Home className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={goBack}
                disabled={currentPath === "/"}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="font-mono">
                {currentPath}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadFiles()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                onClick={() => setShowUploadDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New File
              </Button>
            </div>
          </div>

          {/* File List */}
          <div className="border rounded-lg">
            {isLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Folder className="h-8 w-8 mx-auto mb-2" />
                <p>This directory is empty</p>
              </div>
            ) : (
              <div className="divide-y">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {file.type === 'directory' ? (
                        <Folder className="h-5 w-5 text-blue-500" />
                      ) : (
                        <File className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {file.type === 'file' ? formatFileSize(file.size) : 'Directory'} • 
                          {file.lastModified.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {file.type === 'directory' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigateToDirectory(file.path)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // In a real implementation, this would download the file
                            toast({
                              title: "Download",
                              description: "File download would start here",
                            });
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => {
                          setSelectedFile(file);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload New File</DialogTitle>
            <DialogDescription>
              Create a new file in {currentPath}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">File Name</label>
              <Input
                placeholder="e.g., index.html"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">File Content</label>
              <textarea
                className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                placeholder="Enter file content here..."
                value={uploadContent}
                onChange={(e) => setUploadContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedFile?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
