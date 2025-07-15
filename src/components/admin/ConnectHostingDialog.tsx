import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FolderOpen, ChevronRight, ArrowLeft, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMyHostings, browseHostingDirectories, linkProjectToHosting, HostingConnection } from "@/api/newHostingApi";

interface ConnectHostingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

interface DirectoryItem {
  type: 'file' | 'directory';
  name: string;
  path: string;
}

export function ConnectHostingDialog({ open, onOpenChange, projectId, projectName }: ConnectHostingDialogProps) {
  const [hostings, setHostings] = useState<HostingConnection[]>([]);
  const [selectedHosting, setSelectedHosting] = useState<HostingConnection | null>(null);
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [domainName, setDomainName] = useState("");
  const [rootPath, setRootPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'select-hosting' | 'browse-directories' | 'manual-path'>('select-hosting');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchHostings();
    }
  }, [open]);

  const fetchHostings = async () => {
    try {
      setIsLoading(true);
      const hostingList = await getMyHostings();
      setHostings(hostingList);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHostingSelect = (hosting: HostingConnection) => {
    setSelectedHosting(hosting);
    
    if (hosting.connectionType === 'ftp') {
      setStep('browse-directories');
      browseDirectories(hosting._id, '');
    } else {
      setStep('manual-path');
      setRootPath('/public_html'); // Default for cPanel
    }
  };

  const browseDirectories = async (hostingId: string, path: string) => {
    try {
      setIsLoading(true);
      const dirs = await browseHostingDirectories(hostingId, path);
      setDirectories(dirs);
      setCurrentPath(path);
      
      // Update breadcrumbs
      if (path === '') {
        setBreadcrumbs([]);
      } else {
        const pathParts = path.split('/').filter(part => part !== '');
        setBreadcrumbs(pathParts);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectoryClick = (dir: DirectoryItem) => {
    if (dir.type === 'directory') {
      browseDirectories(selectedHosting!._id, dir.path);
    }
  };

  const navigateToPath = (pathIndex: number) => {
    const newPath = breadcrumbs.slice(0, pathIndex + 1).join('/');
    browseDirectories(selectedHosting!._id, newPath);
  };

  const goBack = () => {
    const parentPath = breadcrumbs.slice(0, -1).join('/');
    browseDirectories(selectedHosting!._id, parentPath);
  };

  const selectCurrentPath = () => {
    setRootPath(currentPath ? `/${currentPath}` : '/');
  };

  const handleConnect = async () => {
    if (!selectedHosting || !domainName || !rootPath) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await linkProjectToHosting({
        hostingId: selectedHosting._id,
        projectId,
        domainName,
        rootPath,
      });

      toast({
        title: "Success",
        description: "Project connected to hosting successfully",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setStep('select-hosting');
    setSelectedHosting(null);
    setDirectories([]);
    setCurrentPath("");
    setBreadcrumbs([]);
    setDomainName("");
    setRootPath("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetDialog();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect {projectName} to Hosting</DialogTitle>
        </DialogHeader>

        {step === 'select-hosting' && (
          <div className="space-y-4">
            <Label>Select Hosting Connection</Label>
            {isLoading ? (
              <div className="text-center py-8">Loading hostings...</div>
            ) : (
              <div className="space-y-2">
                {hostings.map((hosting) => {
                  const config = JSON.parse(hosting.connectionConfig);
                  return (
                    <div
                      key={hosting._id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleHostingSelect(hosting)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{config.host}</h4>
                          <p className="text-sm text-gray-500">
                            Type: {hosting.connectionType.toUpperCase()} | User: {config.username}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  );
                })}
                {hostings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hosting connections found. Please add a hosting connection first.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'browse-directories' && selectedHosting && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Browse Directories</Label>
              <Button variant="outline" size="sm" onClick={() => setStep('select-hosting')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Hosting
              </Button>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <FolderOpen className="h-4 w-4" />
              <span className="cursor-pointer" onClick={() => browseDirectories(selectedHosting._id, '')}>
                Root
              </span>
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <ChevronRight className="h-3 w-3" />
                  <span 
                    className="cursor-pointer hover:underline"
                    onClick={() => navigateToPath(index)}
                  >
                    {crumb}
                  </span>
                </div>
              ))}
            </div>

            {/* Directory listing */}
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">Loading directories...</div>
              ) : (
                <>
                  {breadcrumbs.length > 0 && (
                    <div
                      className="p-3 border-b cursor-pointer hover:bg-gray-50 flex items-center"
                      onClick={goBack}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      <span>.. (Go Back)</span>
                    </div>
                  )}
                  {directories.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 flex items-center ${
                        item.type === 'directory' ? '' : 'opacity-50'
                      }`}
                      onClick={() => item.type === 'directory' && handleDirectoryClick(item)}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      <span>{item.name}</span>
                      {item.type === 'directory' && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={selectCurrentPath}>
                Select Current Path
              </Button>
              <Button variant="outline" onClick={() => setStep('manual-path')}>
                Enter Path Manually
              </Button>
            </div>
          </div>
        )}

        {(step === 'manual-path' || (step === 'browse-directories' && rootPath)) && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-4">
              <div>
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="www.example.com"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rootPath">Root Path</Label>
                <Input
                  id="rootPath"
                  placeholder="/public_html"
                  value={rootPath}
                  onChange={(e) => setRootPath(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleConnect} 
                  disabled={isLoading || !domainName || !rootPath}
                  className="flex-1"
                >
                  {isLoading ? "Connecting..." : "Connect Project"}
                </Button>
                <Button variant="outline" onClick={() => setStep('select-hosting')}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}