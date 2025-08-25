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
import socket from "@/socket"; // adjust path if needed

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
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // Added step 0 for deployment method
  const { toast } = useToast();
  const [projectDeploymentId, setProjectDeploymentId] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>("Waiting for update...");
  const [showDomainDialog, setShowDomainDialog] = useState(false); // For our hosting domain input
  // NEW: marks the “our hosting” flow so UI behaves differently
  const [isOurHostingFlow, setIsOurHostingFlow] = useState(false);

  const fetchDomainRootFromOurHosting = async (projectId: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");

    const { data } = await httpFile.post(
      "/getOurHostedDetails",
      { id: projectId }, // <= per your API contract
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // API returns { domain, root }
    return { domain: data?.domain ?? "", root: data?.root ?? "" };
  };

  const fetchDeployInfo = async (projectId: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");

    const { data } = await httpFile.post(
      "/getDeployInfo",
      { projectId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // API returns { projectId, domainName, rootPath, connectionType, isOur, ... }
    return {
      domainName: data?.domainName ?? "",
      rootPath: data?.rootPath ?? "",
      isOur: data?.isOur ?? false,
    };
  };

  const checkDomainAvailability = async (domain: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");

    // Remove "www." if present to match API requirement
    const cleanDomain = domain.replace(/^www\./i, "").trim();

    const { data, status } = await httpFile.post(
      "/checkDomain",
      { domainName: cleanDomain },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (status === 200 && data.message === "This domain is available to use") {
      return { isAvailable: true, message: data.message };
    } else if (status === 404 && data.error) {
      return { isAvailable: false, message: data.error };
    } else {
      throw new Error(data.error || "Failed to check domain availability");
    }
  };

  useEffect(() => {
    const shouldFetchForOurHosting = isOurHostingFlow || selectedHosting?.isOur === true;

    if (step === 2 && shouldFetchForOurHosting) {
      (async () => {
        try {
          // If already present, skip fetch to avoid flicker
          if (!domainName || !rootPath) {
            const { domain, root } = await fetchDomainRootFromOurHosting(projectId);
            if (domain) setDomainName(domain);
            if (root) setRootPath(root);
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error?.message || "Failed to fetch domain/root",
            variant: "destructive",
          });
        }
      })();
    }

    if (step === 3) {
      (async () => {
        try {
          const { domainName: fetchedDomain, rootPath: fetchedRoot, isOur } = await fetchDeployInfo(projectId);
          if (isOur) {
            if (fetchedDomain) setDomainName(fetchedDomain);
            if (fetchedRoot) setRootPath(fetchedRoot);
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error?.message || "Failed to fetch deployment info",
            variant: "destructive",
          });
        }
      })();
    }
  }, [step, isOurHostingFlow, selectedHosting, projectId]);

  useEffect(() => {
    if (open) {
      fetchHostings();
      setStep(0); // Start at deployment method selection
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

        // Prefill config if exists
        fetchProjectDeploymentConfig(projectId, preSelected._id).then(config => {
          if (config) {
            setDomainName(config.domainName || "");
            setRootPath(config.rootPath || "");
            setProjectDeploymentId(config.projectDeploymentId || null);
          } else {
            setDomainName("");
            setRootPath("");
            setProjectDeploymentId(null);
          }
        });
      }
    }
  }, [hostings, preSelectedHostingId]);

  useEffect(() => {
    if (step === 3) {
      socket.emit("joinProject", projectId); // Join project room

      socket.on("projectStatusUpdate", ({ projectId: updatedId, status }) => {
        if (updatedId === projectId) {
          setLiveStatus(status);
        }
      });

      return () => {
        socket.emit("leaveProject", projectId); // Leave project room
        socket.off("projectStatusUpdate");
      };
    }
  }, [step, projectId]);

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

    // Prefill values from existing deployment if present
    const config = await fetchProjectDeploymentConfig(projectId, hosting._id);
    if (config) {
      setDomainName(config.domainName || "");
      setRootPath(config.rootPath || "");
      setProjectDeploymentId(config.projectDeploymentId || null);
    } else {
      setDomainName("");
      setRootPath("");
      setProjectDeploymentId(null);
    }

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
    const chosen = currentPath || "/";
    setRootPath(chosen);
    toast({ title: "Path Selected", description: `Root path set to: ${chosen}` });
  };

  const fetchProjectDeploymentConfig = async (projectId: string, hostingId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await httpFile.post(
        "/getProjectDeploymentId",
        { projectId, hostingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data; // { projectDeploymentId, domainName, rootPath, ... }
    } catch (error: any) {
      // ignore error if not found, just return null
      return null;
    }
  };

 const uploadToHostingFromBuild = async (projectDeploymentId: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  const formData = new FormData(); // Fixed: Initialize formData correctly
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
    throw new Error(error.response?.data?.message || "Failed to upload to hosting");
  }
};

  const updateProjectDomain = async (domainName: string, projectId: string) => {
   
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");

    const formData = new FormData();
    formData.append("domainName", domainName);
    formData.append("projectId", projectId);

    try {
      await httpFile.post(
        "/updateProjectDomain",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update project domain");
    }
  };

  const generateSitemap = async (projectId: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");

    const formData = new FormData();
    formData.append("projectId", projectId);

    try {
      const response = await httpFile.post(
        "/generateSitemap",
        formData,
        {
          
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // contains { message, slugs, sitemap }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to generate sitemap");
    }
  };

  const handleOurHosting = async () => {
    setIsOurHostingFlow(true);
    setShowDomainDialog(true);
    // ensure Step 2 doesn’t require a selectedHosting
    setSelectedHosting(null);
    setRootPath("");
    setDomainName("");
  };

  const handleDomainSubmit = async () => {
    if (!domainName) {
      toast({
        title: "Missing Information",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Validate domain availability
      const { isAvailable, message } = await checkDomainAvailability(domainName);
      if (!isAvailable) {
        toast({
          title: "Domain Unavailable",
          description: message,
          variant: "destructive",
        });
        return;
      }

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("projectId", projectId); // actual project id
      formData.append("domainName", domainName.replace(/^www\./i, "").trim());

      const { data: res } = await httpFile.post("/connectDomain", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // API returns { message, domain, webroot }
      setDomainName(res.domain || domainName.replace(/^www\./i, "").trim());
      setRootPath(res.webroot || "");

      // Try to pick our hosting automatically so Step 2 can render + deploy works
      await fetchHostings();
      const our = (h: HostingConnection) =>
        (h as any).isOur === true || h.connectionType === "vps";
      const found = hostings.find(our);

      if (found) {
        setSelectedHosting(found);
        // Optional: store current hosting for this project
        try {
          await setCurrentHostingForProject({ projectId, hostingId: found._id });
        } catch { }
      } else {
        // We can still continue because Step 2 will render with isOurHostingFlow
        setSelectedHosting(null);
      }

      toast({
        title: "Domain connected",
        description: res.message || `Connected ${res.domain}`,
      });

      setShowDomainDialog(false);
      setStep(2); // go to Configure step (inputs will be disabled in our hosting flow)
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to connect domain";

      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    try {
      setIsLoading(true);

      // Detect "our hosting" context
      const isOur = isOurHostingFlow || selectedHosting?.isOur === true;

      // If not our hosting, validate domain availability
      if (!isOur) {
        const { isAvailable, message } = await checkDomainAvailability(domainName);
        if (!isAvailable) {
          setIsLoading(false);
          toast({
            title: "Domain Unavailable",
            description: message,
            variant: "destructive",
          });
          return;
        }
      }

      // If our hosting and domain/root are empty, fetch them via API
      if (isOur && (!domainName || !rootPath)) {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const { data } = await httpFile.post(
          "/getOurHostedDetails",
          { id: projectId }, // <-- send projectId as "id" in body
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const fetchedDomain = data?.domain ?? "";
        const fetchedRoot = data?.root ?? "";

        if (fetchedDomain) setDomainName(fetchedDomain);
        if (fetchedRoot) setRootPath(fetchedRoot);
      }

      // Validate: require hosting only if NOT our-hosting flow
      if ((!isOur && !selectedHosting) || !domainName || !rootPath) {
        setIsLoading(false);
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      setStep(3);

      let deploymentId = projectDeploymentId;

      // Link project to hosting if we actually have a selected hosting
      if (!deploymentId && selectedHosting?._id) {
        const response = await linkProjectToHosting({
          hostingId: selectedHosting._id,
          projectId,
          domainName: domainName.replace(/^www\./i, "").trim(),
          rootPath,
        });
        deploymentId = response?.data?._id || deploymentId;
      }

      // Fallback: try to read a previously created deployment config (needs hostingId)
      if (!deploymentId && selectedHosting?._id) {
        const config = await fetchProjectDeploymentConfig(projectId, selectedHosting._id);
        deploymentId = config?.projectDeploymentId;
      }

      if (!deploymentId) {
        throw new Error("Could not determine ProjectDeploymentId!");
      }

      await uploadToHostingFromBuild(deploymentId);
      await updateProjectDomain(domainName.replace(/^www\./i, "").trim(), projectId);
      await generateSitemap(projectId);

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
    setStep(0); // Reset to step 0
    setSelectedHosting(null);
    setDirectories([]);
    setCurrentPath("");
    setBreadcrumbs([]);
    setDomainName("");
    setRootPath("");
    setShowDomainDialog(false);
  };

  const goToStep = (targetStep: 0 | 1 | 2 | 3) => {
    if (targetStep < step) {
      setStep(targetStep);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => {
        if (!open) resetDialog();
        onOpenChange(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deploy {projectName}</DialogTitle>

            {/* Step indicator */}
            <div className="flex items-center justify-center space-x-4 py-4">
              {[0, 1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer ${step >= stepNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-aczy'
                      }`}
                    onClick={() => goToStep(stepNumber as 0 | 1 | 2 | 3)}
                  >
                    {step > stepNumber ? <Check className="w禁止
                    w-4 h-4" /> : stepNumber + 1}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-12 h-0.5 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </DialogHeader>

          {/* Step 0: Select Deployment Method */}
          {step === 0 && (
            <div className="space-y-4">
              <Label>Select Deployment Method</Label>
              <div className="space-y-2">
                <div
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={handleOurHosting}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Use Our Hosting Servers</h4>
                      <p className="text-sm text-gray-500">Deploy to our managed hosting servers</p>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
                <div
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setStep(1)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Use Your Own Hosting</h4>
                      <p className="text-sm text-gray-500">Deploy to your own hosting server</p>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Select Hosting */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select Hosting Server</Label>
                <Button variant="outline" size="sm" onClick={() => setStep(0)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
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
          {step === 2 && (selectedHosting || isOurHostingFlow) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Configure Deployment</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(isOurHostingFlow ? 0 : (selectedHosting?.isOur ? 0 : 1))}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>

              {/* Directory browsing: hidden for our hosting */}
              {!isOurHostingFlow && selectedHosting?.isOur !== true && (
                <>
                  <div className="space-y-2">
                    <Label>Directory</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goBack}
                        disabled={currentPath === '' || isLoading}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectCurrentPath}
                        disabled={isLoading}
                      >
                        Select Current Path
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Path:</span>
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={() => browseDirectories(selectedHosting!._id, '')}
                      >
                        /
                      </span>
                      {breadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center">
                          <ChevronRight className="h-4 w-4" />
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() => navigateToPath(index)}
                          >
                            {crumb}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                      {isLoading ? (
                        <div className="text-center py-4">Loading directories...</div>
                      ) : directories.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No directories found
                        </div>
                      ) : (
                        directories.map((dir) => (
                          <div
                            key={dir.fullPath}
                            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded"
                            onClick={() => handleDirectoryClick(dir)}
                          >
                            <FolderOpen className="h-4 w-4 mr-2" />
                            <span>{dir.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Domain and path configuration */}
              <div className="space-y-4">
                {(() => {
                  const disableFields = isOurHostingFlow || selectedHosting?.isOur === true;
                  return (
                    <>
                      <div>
                        <Label htmlFor="domain">Domain Name *</Label>
                        <Input
                          id="domain"
                          placeholder="www.example.com"
                          value={domainName}
                          onChange={(e) => setDomainName(e.target.value)}
                          disabled={disableFields}
                        />
                      </div>
                      <div>
                        <Label htmlFor="rootPath">Root Path *</Label>
                        <Input
                          id="rootPath"
                          placeholder="/public_html"
                          value={rootPath}
                          onChange={(e) => setRootPath(e.target.value)}
                          disabled={disableFields}
                        />
                      </div>
                    </>
                  );
                })()}
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
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${liveStatus === 'success' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                {liveStatus === 'success' ? (
                  <Check className="w-8 h-8 text-green-600" />
                ) : (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {liveStatus === "building" && "Building Project"}
                  {liveStatus === "uploading" && "Uploading to Server"}
                  {liveStatus === "success" && "✅ Deployment Completed"}
                  {liveStatus === "build_failed" && "❌ Build Failed"}
                  {liveStatus === "upload_failed" && "❌ Upload Failed"}
                  {liveStatus === "Waiting for update..." && "Deployment Started"}
                  {!["building", "uploading", "success", "build_failed", "upload_failed", "Waiting for update..."].includes(liveStatus) && "Deploying..."}
                </h3>

                <p className="text-gray-600 mt-2">
                  {liveStatus === "building" && "Your project is currently being built. Please wait..."}
                  {liveStatus === "uploading" && "Build complete. Uploading to your hosting server..."}
                  {liveStatus === "success" && "Congratulations! Your project was deployed successfully."}
                  {liveStatus === "build_failed" && "Build process failed. Please check logs or try again."}
                  {liveStatus === "upload_failed" && "Uploading to the server failed. Please verify connection."}
                  {liveStatus === "Waiting for update..." && "Your deployment process has started. Waiting for build to begin..."}
                  {!["building", "uploading", "success", "build_failed", "upload_failed", "Waiting for update..."].includes(liveStatus) &&
                    "Your deployment is in progress. Please wait..."}
                </p>
              </div>

              <div className="text-sm text-gray-700 bg-gray-50 border rounded p-3 w-full max-w-md mx-auto">
                <span className="font-medium">Live Status:</span> {liveStatus}
              </div>

              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Domain Input Dialog for Our Hosting */}
      <Dialog open={showDomainDialog} onOpenChange={setShowDomainDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Domain Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="domainInput">Domain Name *</Label>
              <Input
                id="domainInput"
                placeholder="www.example.com"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDomainSubmit}
                disabled={isLoading || !domainName}
                className="flex-1"
              >
                {isLoading ? "Connecting..." : "Connect Domain"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDomainDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
