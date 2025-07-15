
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Copy, Globe, FileText, Code, RefreshCw, Info, AlertCircle, Trash, Server, Upload, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CredentialManager } from "./CredentialManager";
import { HostingCredential, ConnectionProtocol } from "@/utils/credentialManager";
import { uploadVerificationFile } from "@/utils/hostingService";
import { Separator } from "@/components/ui/separator";

const domainSchema = z.object({
  domain: z.string().min(3, {
    message: "Domain must be at least 3 characters.",
  }).refine(val => /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(val), {
    message: "Please enter a valid domain name",
  }),
});

type Domain = {
  id: string;
  domain: string;
  status: "unverified" | "verified" | "active" | "failed";
  verificationMethod?: "dns" | "file" | "meta";
  createdAt: Date;
  hostingProvider?: string;
  hostingCredentialId?: string;
  dnsRecords?: DNSRecord[];
  verificationStatus?: {
    lastChecked: Date;
    attempts: number;
    message?: string;
  };
};

type DNSRecord = {
  type: "A" | "CNAME" | "TXT" | "MX" | "NS";
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
};

type HostingProvider = {
  id: string;
  name: string;
  logo: string;
  dnsInstructions: string;
};

export function DomainManagement() {
  const [domains, setDomains] = useState<Domain[]>([
    { 
      id: "1", 
      domain: "example.com", 
      status: "verified", 
      verificationMethod: "dns", 
      createdAt: new Date(),
      hostingProvider: "cloudflare"
    },
    { 
      id: "2", 
      domain: "mywebsite.org", 
      status: "unverified", 
      verificationMethod: "file", 
      createdAt: new Date(),
      verificationStatus: {
        lastChecked: new Date(),
        attempts: 2,
        message: "Verification file not found"
      }
    },
    {
      id: "3",
      domain: "business-site.com",
      status: "active",
      verificationMethod: "meta",
      createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
      hostingProvider: "aws",
      dnsRecords: [
        { type: "A", name: "@", value: "123.456.789.0" },
        { type: "CNAME", name: "www", value: "business-site.com" }
      ]
    },
    {
      id: "4",
      domain: "faileddomain.net",
      status: "failed",
      createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
      verificationStatus: {
        lastChecked: new Date(),
        attempts: 5,
        message: "DNS verification failed after multiple attempts"
      }
    }
  ]);
  
  const [activeDomain, setActiveDomain] = useState<Domain | null>(null);
  const [verificationTab, setVerificationTab] = useState<"dns" | "file" | "meta">("dns");
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<Domain | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCredentialManager, setShowCredentialManager] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<HostingCredential | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [fileUploadInProgress, setFileUploadInProgress] = useState(false);
  
  const hostingProviders: HostingProvider[] = [
    { id: "cloudflare", name: "Cloudflare", logo: "cloudflare.svg", dnsInstructions: "Log in to Cloudflare > Select your site > DNS > Add record" },
    { id: "aws", name: "Amazon Route 53", logo: "aws.svg", dnsInstructions: "Log in to AWS Console > Route 53 > Hosted zones > Select domain > Create record" },
    { id: "godaddy", name: "GoDaddy", logo: "godaddy.svg", dnsInstructions: "Log in to GoDaddy > My Products > Select Domain > DNS > Add record" },
    { id: "namecheap", name: "Namecheap", logo: "namecheap.svg", dnsInstructions: "Log in to Namecheap > Domain List > Select domain > Advanced DNS > Add record" },
    { id: "digitalocean", name: "DigitalOcean", logo: "digitalocean.svg", dnsInstructions: "Log in to DigitalOcean > Networking > Domains > Select domain > Add record" }
  ];
  
  const form = useForm<z.infer<typeof domainSchema>>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domain: "",
    },
  });

  const onSubmit = (values: z.infer<typeof domainSchema>) => {
    // Check if domain already exists
    if (domains.some(d => d.domain === values.domain)) {
      toast({
        title: "Domain already exists",
        description: "This domain has already been added to your account.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you'd add the domain to your database or service
    const newDomain: Domain = {
      id: Math.random().toString(36).substr(2, 9),
      domain: values.domain,
      status: "unverified",
      createdAt: new Date(),
      verificationStatus: {
        lastChecked: new Date(),
        attempts: 0
      }
    };

    setDomains([...domains, newDomain]);
    toast({
      title: "Domain added",
      description: "Your domain has been added. Please verify it to continue.",
    });
    form.reset();
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} has been copied to your clipboard.`,
    });
  };

  const verifyDomain = (domain: Domain) => {
    setVerificationInProgress(true);
    
    // Simulate verification process
    setTimeout(() => {
      setDomains(domains.map(d => 
        d.id === domain.id ? { 
          ...d, 
          status: "verified", 
          verificationMethod: verificationTab,
          verificationStatus: {
            lastChecked: new Date(),
            attempts: (d.verificationStatus?.attempts || 0) + 1,
            message: "Domain verified successfully"
          }
        } : d
      ));
      setVerificationInProgress(false);
      toast({
        title: "Domain verified",
        description: `${domain.domain} has been successfully verified!`,
      });
    }, 2000);
  };

  const handleSelectDomain = (domain: Domain) => {
    setActiveDomain(domain);
    // Set default verification method or use existing
    setVerificationTab(domain.verificationMethod || "dns");
    // Set hosting provider if exists
    setSelectedProvider(domain.hostingProvider);
    // Reset credential
    setSelectedCredential(null);
  };
  
  const handleDeleteDomain = (domain: Domain) => {
    setDomainToDelete(domain);
    setShowDeleteDialog(true);
  };
  
  const confirmDeleteDomain = () => {
    if (domainToDelete) {
      setDomains(domains.filter(d => d.id !== domainToDelete.id));
      toast({
        title: "Domain deleted",
        description: `${domainToDelete.domain} has been removed from your account.`,
      });
      
      // If the deleted domain was the active one, reset state
      if (activeDomain?.id === domainToDelete.id) {
        setActiveDomain(null);
      }
      
      setShowDeleteDialog(false);
      setDomainToDelete(null);
    }
  };
  
  const connectToProvider = () => {
    if (!selectedProvider || !activeDomain) return;
    
    // Simulate connection to hosting provider
    toast({
      title: "Connecting to provider",
      description: `Connecting ${activeDomain.domain} to ${hostingProviders.find(p => p.id === selectedProvider)?.name}...`,
    });
    
    // Update domain with hosting provider
    setTimeout(() => {
      setDomains(domains.map(d => 
        d.id === activeDomain.id ? { 
          ...d, 
          hostingProvider: selectedProvider,
          dnsRecords: [
            { type: "A", name: "@", value: "123.456.789.0" },
            { type: "CNAME", name: "www", value: activeDomain.domain }
          ]
        } : d
      ));
      
      toast({
        title: "Provider connected",
        description: `${activeDomain.domain} has been connected to ${hostingProviders.find(p => p.id === selectedProvider)?.name}.`,
      });
    }, 1500);
  };
  
  const activateDomain = (domain: Domain) => {
    // Simulate activation process
    toast({
      title: "Activating domain",
      description: `Setting up ${domain.domain} for your website...`,
    });
    
    setTimeout(() => {
      setDomains(domains.map(d => 
        d.id === domain.id ? { ...d, status: "active" } : d
      ));
      
      toast({
        title: "Domain activated",
        description: `${domain.domain} is now live and active!`,
      });
    }, 2000);
  };
  
  const refreshVerification = (domain: Domain) => {
    toast({
      title: "Checking verification",
      description: `Verifying ${domain.domain}...`,
    });
    
    setTimeout(() => {
      // 80% chance of success for demo purposes
      const success = Math.random() > 0.2;
      
      setDomains(domains.map(d => 
        d.id === domain.id ? { 
          ...d, 
          status: success ? "verified" : "failed",
          verificationStatus: {
            lastChecked: new Date(),
            attempts: (d.verificationStatus?.attempts || 0) + 1,
            message: success ? 
              "Domain verified successfully" : 
              "Verification failed. Please check your settings and try again."
          }
        } : d
      ));
      
      toast({
        title: success ? "Verification successful" : "Verification failed",
        description: success ? 
          `${domain.domain} has been verified!` : 
          `Could not verify ${domain.domain}. Please check verification settings.`,
        variant: success ? "default" : "destructive",
      });
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "unverified":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };
  
  // Filter domains by search query
  const filteredDomains = domains.filter(domain => 
    domain.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle credential selection
  const handleCredentialSelected = (credential: HostingCredential) => {
    setSelectedCredential(credential);
    
    if (activeDomain) {
      // Save credential ID to domain
      setDomains(domains.map(d => 
        d.id === activeDomain.id ? { 
          ...d, 
          hostingCredentialId: credential.id
        } : d
      ));
      
      toast({
        title: "Credentials connected",
        description: `${credential.providerName} credentials have been linked to ${activeDomain.domain}.`,
      });
    }
    
    // Close credential manager
    setShowCredentialManager(false);
  };
  
  // Handle file upload for verification
  const handleFileUpload = async () => {
    if (!activeDomain || !selectedCredential) return;
    
    setFileUploadInProgress(true);
    
    const success = await uploadVerificationFile(
      selectedCredential,
      activeDomain.domain,
      activeDomain.id,
      selectedCredential.providerId as ConnectionProtocol
    );
    
    if (success) {
      // After successful upload, trigger verification check
      refreshVerification(activeDomain);
    }
    
    setFileUploadInProgress(false);
  };
  
  // Deploy website
  const handleDeploy = () => {
    if (!activeDomain || !selectedCredential) return;
    
    setIsDeploying(true);
    
    toast({
      title: "Deploying website",
      description: `Deploying your website to ${activeDomain.domain}...`,
    });
    
    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false);
      
      toast({
        title: "Website deployed",
        description: `Your website has been successfully deployed to ${activeDomain.domain}.`,
      });
      
      // Activate domain if not already active
      if (activeDomain.status !== "active") {
        activateDomain(activeDomain);
      }
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Domain Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveDomain(null)}>
          Add New Domain
        </Button>
      </div>

      {activeDomain ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Domain Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {activeDomain.domain}
              </CardTitle>
              <CardDescription>
                Added on {activeDomain.createdAt.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</div>
                  <Badge className={getStatusColor(activeDomain.status)}>
                    {activeDomain.status.charAt(0).toUpperCase() + activeDomain.status.slice(1)}
                  </Badge>
                </div>
                
                {activeDomain.verificationStatus && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Checked</div>
                    <div className="text-sm">{activeDomain.verificationStatus.lastChecked.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {activeDomain.verificationStatus.attempts} verification {activeDomain.verificationStatus.attempts === 1 ? 'attempt' : 'attempts'}
                    </div>
                  </div>
                )}
                
                {activeDomain.hostingProvider && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Hosting Provider</div>
                    <div className="flex items-center mt-1">
                      <Server className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{hostingProviders.find(p => p.id === activeDomain.hostingProvider)?.name}</span>
                    </div>
                  </div>
                )}
                
                {selectedCredential && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Connected Credential</div>
                    <div className="flex items-center mt-1 text-sm">
                      <HardDrive className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{selectedCredential.providerName} - {selectedCredential.username}</span>
                    </div>
                  </div>
                )}
                
                {activeDomain.status === "verified" && (
                  <Alert className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Domain Verified</AlertTitle>
                    <AlertDescription>
                      Your domain has been verified successfully.
                    </AlertDescription>
                  </Alert>
                )}

                {activeDomain.status === "unverified" && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Verification Required</AlertTitle>
                    <AlertDescription>
                      Please verify your domain using one of the verification methods.
                    </AlertDescription>
                  </Alert>
                )}
                
                {activeDomain.status === "failed" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Verification Failed</AlertTitle>
                    <AlertDescription>
                      {activeDomain.verificationStatus?.message || "Domain verification failed. Please try again."}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex flex-col gap-2 pt-2">
                  {activeDomain.status === "verified" && (
                    <Button onClick={() => activateDomain(activeDomain)} className="w-full">
                      Activate Domain
                    </Button>
                  )}
                  
                  {(activeDomain.status === "unverified" || activeDomain.status === "failed") && (
                    <Button 
                      variant="outline" 
                      onClick={() => refreshVerification(activeDomain)}
                      className="w-full flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Check Verification
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteDomain(activeDomain)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Remove Domain
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domain Verification */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Domain Verification</CardTitle>
              <CardDescription>
                {activeDomain.status === "unverified" || activeDomain.status === "failed" 
                  ? "Choose a verification method to verify your domain ownership" 
                  : "Your domain has been verified successfully"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(activeDomain.status === "unverified" || activeDomain.status === "failed") ? (
                <Tabs value={verificationTab} onValueChange={(v) => setVerificationTab(v as "dns" | "file" | "meta")}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="dns" className="flex items-center gap-1">
                      <Globe className="h-4 w-4" /> DNS Record
                    </TabsTrigger>
                    <TabsTrigger value="file" className="flex items-center gap-1">
                      <FileText className="h-4 w-4" /> File Upload
                    </TabsTrigger>
                    <TabsTrigger value="meta" className="flex items-center gap-1">
                      <Code className="h-4 w-4" /> Meta Tag
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dns">
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-medium">TXT Record</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1"
                            onClick={() => copyToClipboard(`verify-${activeDomain.domain}-token`, "TXT Record")}
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-2 rounded border text-sm font-mono">
                          verify-{activeDomain.domain}-token
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Instructions:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Go to your domain provider's DNS settings</li>
                          <li>Add a new TXT record with the name <span className="font-mono">@</span> or <span className="font-mono">{activeDomain.domain}</span></li>
                          <li>Paste the verification token as the value</li>
                          <li>Save changes and wait for DNS to propagate (may take up to 24 hours)</li>
                          <li>Click verify below</li>
                        </ol>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="file">
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-medium">Verification File</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1"
                            onClick={() => copyToClipboard(`verification-${activeDomain.id}.txt`, "Filename")}
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-2 rounded border text-sm font-mono">
                          verification-{activeDomain.id}.txt
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-medium">File Contents</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1"
                            onClick={() => copyToClipboard(`domain-verify-${activeDomain.id}-token`, "File contents")}
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-2 rounded border text-sm font-mono">
                          domain-verify-{activeDomain.id}-token
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Instructions:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Create a text file with the name above</li>
                          <li>Copy the contents above into the file</li>
                          <li>Upload this file to your domain's root directory (public_html or www folder)</li>
                          <li>The file should be accessible at https://{activeDomain.domain}/verification-{activeDomain.id}.txt</li>
                          <li>Click verify below</li>
                        </ol>
                      </div>
                      
                      {/* Automated File Upload Option */}
                      <div className="mt-4 p-4 border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/30 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Automatic File Upload</h4>
                        <p className="text-sm mb-4">
                          You can automatically upload the verification file using your hosting credentials.
                        </p>
                        
                        {selectedCredential ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm p-2 bg-white dark:bg-gray-800 rounded border">
                              <Server className="h-4 w-4 text-gray-500" />
                              <span>Using {selectedCredential.providerName} ({selectedCredential.username})</span>
                            </div>
                            <Button
                              onClick={handleFileUpload}
                              disabled={fileUploadInProgress}
                              className="w-full"
                            >
                              {fileUploadInProgress ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Verification File
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Connect your hosting credentials to enable automatic file upload.
                            </p>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowCredentialManager(true)}
                              className="w-full"
                            >
                              Connect Hosting Credentials
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="meta">
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-medium">Meta Tag</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1"
                            onClick={() => copyToClipboard(`<meta name="domain-verification" content="verify-${activeDomain.id}-${activeDomain.domain}" />`, "Meta tag")}
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-2 rounded border text-sm font-mono break-all">
                          &lt;meta name="domain-verification" content="verify-{activeDomain.id}-{activeDomain.domain}" /&gt;
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Instructions:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Add the meta tag to the &lt;head&gt; section of your domain's homepage</li>
                          <li>The tag should be visible in the HTML source of your homepage</li>
                          <li>Click verify below</li>
                        </ol>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={() => verifyDomain(activeDomain)} 
                      disabled={verificationInProgress}
                      className="w-full"
                    >
                      {verificationInProgress ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>Verify Domain</>
                      )}
                    </Button>
                  </div>
                </Tabs>
              ) : (
                <div className="space-y-6">
                  <Alert className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Domain Verified</AlertTitle>
                    <AlertDescription>
                      Your domain has been verified using {activeDomain.verificationMethod} verification.
                    </AlertDescription>
                  </Alert>

                  {/* Hosting Integration Section */}
                  <Separator className="my-6" />
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Hosting Integration</h3>
                    
                    {!selectedCredential ? (
                      <div className="space-y-4">
                        <p className="text-sm">
                          Connect your hosting credentials to enable automatic website deployment
                          and file management for this domain.
                        </p>
                        <Button
                          onClick={() => setShowCredentialManager(true)}
                          className="w-full"
                        >
                          Connect Hosting Credentials
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Server className="h-5 w-5 text-blue-500" />
                              <div>
                                <div className="font-medium">{selectedCredential.providerName}</div>
                                <div className="text-sm text-gray-500">
                                  {selectedCredential.username} • {selectedCredential.server}:{selectedCredential.port}
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Connected</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Deployment Options</h4>
                          <Card>
                            <CardContent className="space-y-4 pt-6">
                              <div className="space-y-2">
                                <div className="text-sm font-medium">Deploy to Root Directory</div>
                                <p className="text-sm text-gray-500">
                                  Deploy your website files to the root directory of your domain.
                                </p>
                              </div>
                              <Button
                                onClick={handleDeploy}
                                disabled={isDeploying}
                                className="w-full"
                              >
                                {isDeploying ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Deploying...
                                  </>
                                ) : (
                                  <>Deploy Website</>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="space-y-4 pt-6">
                              <div className="space-y-2">
                                <div className="text-sm font-medium">Change Credentials</div>
                                <p className="text-sm text-gray-500">
                                  Switch to a different hosting provider or credential set.
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => setShowCredentialManager(true)}
                                className="w-full"
                              >
                                Manage Credentials
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">DNS Configuration</h3>
                    <Card>
                      <CardContent className="pt-6">
                        {activeDomain.hostingProvider && (
                          <div className="mb-4">
                            <Alert>
                              <Server className="h-4 w-4" />
                              <AlertTitle>Provider Connected</AlertTitle>
                              <AlertDescription>
                                Using {hostingProviders.find(p => p.id === activeDomain.hostingProvider)?.name} as your hosting provider.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      
                        <ol className="list-decimal list-inside space-y-4">
                          <li className="flex items-start">
                            <span className="mt-1">Configure your domain's DNS settings:</span>
                            <div className="ml-4 mt-2 w-full">
                              <div className="grid grid-cols-3 gap-4 text-sm font-medium mb-2">
                                <div>Type</div>
                                <div>Name</div>
                                <div>Value</div>
                              </div>
                              {activeDomain.dnsRecords ? (
                                activeDomain.dnsRecords.map((record, idx) => (
                                  <div key={idx} className="grid grid-cols-3 gap-4 text-sm py-2 border-t border-gray-100 dark:border-gray-800">
                                    <div>{record.type}</div>
                                    <div>{record.name}</div>
                                    <div className="flex items-center">
                                      {record.value}
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="ml-2 h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(record.value, `${record.type} record value`)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <>
                                  <div className="grid grid-cols-3 gap-4 text-sm py-2 border-t border-gray-100 dark:border-gray-800">
                                    <div>A</div>
                                    <div>@</div>
                                    <div className="flex items-center">
                                      123.456.789.0
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="ml-2 h-6 w-6 p-0"
                                        onClick={() => copyToClipboard("123.456.789.0", "A record value")}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 text-sm py-2 border-t border-gray-100 dark:border-gray-800">
                                    <div>CNAME</div>
                                    <div>www</div>
                                    <div className="flex items-center">
                                      {activeDomain.domain}
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="ml-2 h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(activeDomain.domain, "CNAME record value")}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </li>
                          <li>
                            Wait for DNS changes to propagate (may take up to 24 hours)
                          </li>
                          <li>
                            Once DNS is configured, your website will be accessible at https://{activeDomain.domain}
                          </li>
                        </ol>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : showCredentialManager ? (
        <CredentialManager 
          onCredentialSelected={handleCredentialSelected}
          selectedDomain={activeDomain?.domain}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Domain List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Domains</CardTitle>
              <CardDescription>
                Manage domains connected to your website builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {filteredDomains.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Domain</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Added On</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDomains.map((domain) => (
                        <tr key={domain.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900 dark:text-white">{domain.domain}</div>
                            {domain.hostingProvider && (
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <Server className="h-3 w-3 mr-1" />
                                {hostingProviders.find(p => p.id === domain.hostingProvider)?.name}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(domain.status)}>
                              {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {domain.createdAt.toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSelectDomain(domain)}
                              >
                                Manage
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleDeleteDomain(domain)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : searchQuery ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No matching domains</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No domains found matching "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No domains yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add your first domain to get started.
                  </p>
                </div>
              )}
            </CardContent>
            
            {/* Add new domain form */}
            <CardFooter className="flex flex-col">
              <div className="border-t border-gray-200 dark:border-gray-700 w-full pt-6">
                <h3 className="font-medium mb-4">Add New Domain</h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="domain"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="yourdomain.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Add Domain</Button>
                  </form>
                </Form>
              </div>
            </CardFooter>
          </Card>

          {/* Hosting Credentials Management */}
          <Card>
            <CardHeader>
              <CardTitle>Hosting Credentials</CardTitle>
              <CardDescription>
                Manage your hosting provider credentials for domain verification and website deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Server className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Manage Hosting Credentials</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Add and manage your hosting credentials for FTP/SFTP access, 
                cPanel, Plesk, or DirectAdmin integration.
              </p>
              <Button className="mt-4" onClick={() => setShowCredentialManager(true)}>
                Manage Credentials
              </Button>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle>How Domain Connection Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-700 dark:text-blue-400">Important Information</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        Before you begin, ensure you have access to manage DNS settings for your domain.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Steps to connect your domain:</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Add your domain in the form above</li>
                    <li>Verify domain ownership using one of the provided methods</li>
                    <li>Connect to your hosting provider</li>
                    <li>Configure DNS settings as instructed</li>
                    <li>Wait for DNS propagation (may take up to 24 hours)</li>
                    <li>Your website will be accessible at your domain</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Domain</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this domain? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {domainToDelete && (
            <div className="py-4">
              <div className="flex items-center space-x-2 p-2 border rounded">
                <Globe className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{domainToDelete.domain}</span>
                <Badge className={getStatusColor(domainToDelete.status)}>
                  {domainToDelete.status}
                </Badge>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteDomain}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
