import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FolderOpen, ChevronRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMyHostings, browseHostingDirectories, linkProjectToHosting, HostingConnection, setCurrentHostingForProject } from "@/api/newHostingApi";
import { httpFile } from "@/config";

interface DeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  preSelectedHostingId?: string;
}

interface DirectoryItem {
  name: string;
  fullPath: string;
}

export function DeploymentDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  preSelectedHostingId
}: DeploymentDialogProps) {
  const [hostings, setHostings] = useState<HostingConnection[]>([]);
  const [selectedHosting, setSelectedHosting] = useState<HostingConnection | null>(null);
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [domainName, setDomainName] = useState("");
  const [rootPath, setRootPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchHostings();
      setStep(1);
    }
  }, [open]);

  useEffect(() => {
    if (hostings.length > 0 && preSelectedHostingId) {
      const preSelected = hostings.find(h => h._id === preSelectedHostingId);
      if (preSelected) {
        setSelectedHosting(preSelected);
        setStep(2);
        if (preSelected.connectionType === 'ftp' || preSelected.connectionType === 'ssh' || preSelected.connectionType === 'vps') {
          browseDirectories(preSelected._id, '');
        } else {
          setRootPath('/public_html');
        }
      }
    }
  }, [hostings, preSelectedHostingId]);
  const fetchCurrentHostingForProject = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await httpFile.post('/getCurrentHostingForProject', { projectId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data.data.hostingId;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };


  const fetchHostings = async () => {
    try {
      setIsLoading(true);
      const hostingList = await getMyHostings();
      setHostings(hostingList);

      // Fetch the current hosting for the project
      const currentHostingId = await fetchCurrentHostingForProject();
      if (currentHostingId) {
        const currentHosting = hostingList.find(h => h._id === currentHostingId);
        if (currentHosting) {
          setSelectedHosting(currentHosting);
          setStep(2);
          if (currentHosting.connectionType === 'ftp' || currentHosting.connectionType === 'ssh' || currentHosting.connectionType === 'vps') {
            browseDirectories(currentHosting._id, '');
          } else {
            setRootPath('/public_html');
          }
        }
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

 const handleHostingSelect = async (hosting: HostingConnection) => {
  setSelectedHosting(hosting);
  setStep(2);
  
  // Set hosting for project before continuing to directory browsing
  try {
    await setCurrentHostingForProject({
      projectId,
      hostingId: hosting._id
    });
    toast({
      title: "Success",
      description: "Hosting linked to the project successfully.",
    });
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    return;
  }
  
  if (hosting.connectionType === 'ftp' || hosting.connectionType === 'ssh' || hosting.connectionType === 'vps') {
    browseDirectories(hosting._id, '');
  } else {
    setRootPath('/public_html');
  }
};


  const browseDirectories = async (hostingId: string, path: string) => {
    try {
      setIsLoading(true);
      const dirs = await browseHostingDirectories(hostingId, path);
      setDirectories(dirs);
      setCurrentPath(path);

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
    browseDirectories(selectedHosting!._id, dir.fullPath);
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
    setRootPath(currentPath || '/');
  };

  const uploadToHostingFromBuild = async (projectDeploymentId: string) => {
    // grab token
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");

    // build form data
    const formData = new FormData();
    formData.append("projectDeploymentId", projectDeploymentId);
    formData.append("projectId", projectId);

    try {
      await httpFile.post(
        "/uploadToHostingFromBuild",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error: any) {
      // bubble up a clear message
      throw new Error(error.response?.data?.message || "Failed to upload to hosting");
    }
  };

  const handleDeploy = async () => {
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
      setStep(3);

      await linkProjectToHosting({
        hostingId: selectedHosting._id,
        projectId,
        domainName,
        rootPath,
      });

      // Automatically trigger upload
      await uploadToHostingFromBuild("68777f41481d1f3d166aff23");

      toast({
        title: "Success",
        description: "Project deployed successfully",
      });

      setTimeout(() => {
        onOpenChange(false);
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Deployment Error",
        description: error.message,
        variant: "destructive",
      });
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setStep(1);
    setSelectedHosting(null);
    setDirectories([]);
    setCurrentPath("");
    setBreadcrumbs([]);
    setDomainName("");
    setRootPath("");
  };

  const goToStep = (targetStep: 1 | 2 | 3) => {
    if (targetStep < step) {
      setStep(targetStep);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetDialog();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deploy {projectName}</DialogTitle>

          {/* Step indicator */}
          <div className="flex items-center justify-center space-x-4 py-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer ${step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                    }`}
                  onClick={() => goToStep(stepNumber as 1 | 2 | 3)}
                >
                  {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Step 1: Select Hosting */}
        {step === 1 && (
          <div className="space-y-4">
            <Label>Select Hosting Server</Label>
            {isLoading ? (
              <div className="text-center py-8">Loading hostings...</div>
            ) : (
              <div className="space-y-2">
                {hostings.map((hosting) => {
                  const config = JSON.parse(hosting.connectionConfig);
                  const isSelected = selectedHosting?._id === hosting._id;
                  return (
                    <div
                      key={hosting._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      onClick={() => handleHostingSelect(hosting)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{config.host}</h4>
                          <p className="text-sm text-gray-500">
                            Type: {hosting.connectionType.toUpperCase()} | User: {config.username}
                          </p>
                          {isSelected && (
                            <p className="text-xs text-blue-600 mt-1">✓ Already connected</p>
                          )}
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

        {/* Step 2: Configure Deployment */}
        {step === 2 && selectedHosting && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Configure Deployment</Label>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            {/* Directory browsing for supported types */}
            {(selectedHosting.connectionType === 'ftp' || selectedHosting.connectionType === 'ssh' || selectedHosting.connectionType === 'vps') && (
              <div className="space-y-3">
                <Label>Browse Directories</Label>

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
                <div className="border rounded-lg max-h-48 overflow-y-auto">
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
                          className="p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 flex items-center"
                          onClick={() => handleDirectoryClick(item)}
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          <span>{item.name}</span>
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <Button variant="outline" onClick={selectCurrentPath} size="sm">
                  Select Current Path
                </Button>
              </div>
            )}

            <Separator />

            {/* Domain and path configuration */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="domain">Domain Name *</Label>
                <Input
                  id="domain"
                  placeholder="www.example.com"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rootPath">Root Path *</Label>
                <Input
                  id="rootPath"
                  placeholder="/public_html"
                  value={rootPath}
                  onChange={(e) => setRootPath(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleDeploy}
                disabled={isLoading || !domainName || !rootPath}
                className="flex-1"
              >
                {isLoading ? "Deploying..." : "Deploy Project"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              ) : (
                <Check className="w-8 h-8 text-green-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {isLoading ? "Deploying..." : "Congratulations!"}
              </h3>
              <p className="text-gray-600 mt-2">
                {isLoading
                  ? "Your project is being deployed. Please wait..."
                  : "Your project has been successfully deployed to your hosting server."
                }
              </p>
            </div>
            {!isLoading && (
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

