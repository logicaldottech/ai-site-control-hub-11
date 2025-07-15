import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, Key, Lock, RefreshCw, Server, Trash, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HostingCredential, ConnectionProtocol, storeCredential, getCredentials, testConnection, updateCredential, deleteCredential } from "@/utils/credentialManager";

// Schema for credential form validation
const credentialSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  providerName: z.string().min(1, "Provider name is required"),
  protocol: z.enum(['ftp', 'sftp', 'api', 'cpanel', 'plesk', 'directadmin'] as const),
  server: z.string().min(1, "Server address is required"),
  port: z.number().optional(),
  username: z.string().min(1, "Username is required"),
  password: z.string().optional(),
  apiKey: z.string().optional(),
}).refine(
  data => data.password || data.apiKey,
  {
    message: "Either password or API key is required",
    path: ["password"],
  }
);

type CredentialFormValues = z.infer<typeof credentialSchema>;

// Available hosting providers
const hostingProviders = [
  { id: "cpanel", name: "cPanel", protocols: ["cpanel", "ftp", "sftp"] },
  { id: "plesk", name: "Plesk", protocols: ["plesk", "ftp", "sftp"] },
  { id: "directadmin", name: "DirectAdmin", protocols: ["directadmin", "ftp"] },
  { id: "godaddy", name: "GoDaddy", protocols: ["api", "ftp"] },
  { id: "hostgator", name: "HostGator", protocols: ["cpanel", "ftp"] },
  { id: "bluehost", name: "Bluehost", protocols: ["cpanel", "ftp"] },
  { id: "digitalocean", name: "DigitalOcean", protocols: ["sftp", "api"] },
  { id: "aws", name: "Amazon AWS", protocols: ["sftp", "api"] },
  { id: "custom", name: "Custom Provider", protocols: ["ftp", "sftp"] },
];

// Port defaults by protocol
const defaultPorts: Record<ConnectionProtocol, number> = {
  ftp: 21,
  sftp: 22,
  cpanel: 2083,
  plesk: 8443,
  directadmin: 2222,
  api: 443
};

interface CredentialManagerProps {
  onCredentialSelected?: (credential: HostingCredential) => void;
  selectedDomain?: string;
  onFileManagerOpen?: (credential: HostingCredential) => void;
}

export function CredentialManager({ onCredentialSelected, selectedDomain, onFileManagerOpen }: CredentialManagerProps) {
  const [credentials, setCredentials] = useState<HostingCredential[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState<HostingCredential | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<HostingCredential | null>(null);

  // Load credentials from storage
  useEffect(() => {
    setCredentials(getCredentials());
  }, []);

  const form = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      providerId: "",
      providerName: "",
      protocol: "ftp",
      server: "",
      port: 21,
      username: "",
      password: "",
      apiKey: "",
    }
  });

  // Update form when editing credential
  useEffect(() => {
    if (editingCredential) {
      form.reset({
        providerId: editingCredential.providerId,
        providerName: editingCredential.providerName,
        protocol: editingCredential.providerId as ConnectionProtocol,
        server: editingCredential.server || "",
        port: editingCredential.port,
        username: editingCredential.username,
        password: "", // Don't populate password for security
        apiKey: "", // Don't populate API key for security
      });
    }
  }, [editingCredential, form]);

  // Handle provider selection
  const handleProviderChange = (providerId: string) => {
    const provider = hostingProviders.find(p => p.id === providerId);
    if (provider) {
      form.setValue("providerId", providerId);
      form.setValue("providerName", provider.name);
      // Set default protocol for this provider
      const defaultProtocol = provider.protocols[0] as ConnectionProtocol;
      form.setValue("protocol", defaultProtocol);
      // Set default port for protocol
      form.setValue("port", defaultPorts[defaultProtocol]);
      
      // Pre-fill server field with guidance for cPanel
      if (providerId === "cpanel") {
        form.setValue("server", "your-domain.com");
      }
    }
  };

  // Handle protocol selection
  const handleProtocolChange = (protocol: ConnectionProtocol) => {
    form.setValue("protocol", protocol);
    form.setValue("port", defaultPorts[protocol]);
  };

  // Submit handler for new/edit credential form
  const onSubmit = (values: CredentialFormValues) => {
    if (editingCredential) {
      // Update existing credential
      const updated = updateCredential(editingCredential.id, {
        ...values,
        // Only update password/apiKey if provided
        password: values.password || undefined,
        apiKey: values.apiKey || undefined,
      });

      if (updated) {
        toast({
          title: "Credential updated",
          description: `${values.providerName} credentials have been updated.`
        });
        setCredentials(getCredentials());
        setEditingCredential(null);
        form.reset();
      }
    } else {
      // Create new credential - ensure all required fields are present
      const credentialData = {
        providerId: values.providerId,
        providerName: values.providerName,
        username: values.username,
        server: values.server,
        port: values.port,
        password: values.password,
        apiKey: values.apiKey,
      };
      
      const newCredential = storeCredential(credentialData);
      
      toast({
        title: "Credential added",
        description: `${values.providerName} credentials have been saved.`
      });
      
      setCredentials([...credentials, newCredential]);
      setShowNewForm(false);
      form.reset();
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowNewForm(false);
    setEditingCredential(null);
    form.reset();
  };

  // Test connection
  const handleTestConnection = async (credential: HostingCredential) => {
    setIsTestingConnection(true);
    await testConnection(credential);
    setIsTestingConnection(false);
    setCredentials(getCredentials()); // Refresh to get updated status
  };

  // Select credential
  const handleSelectCredential = (credential: HostingCredential) => {
    if (onCredentialSelected) {
      onCredentialSelected(credential);
    }
  };

  // Delete credential
  const handleDeleteCredential = (credential: HostingCredential) => {
    setCredentialToDelete(credential);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDeleteCredential = () => {
    if (credentialToDelete) {
      const success = deleteCredential(credentialToDelete.id);
      
      if (success) {
        toast({
          title: "Credential deleted",
          description: `${credentialToDelete.providerName} credentials have been removed.`
        });
        
        setCredentials(getCredentials());
      }
      
      setShowDeleteDialog(false);
      setCredentialToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hosting Credentials</h2>
        {!showNewForm && !editingCredential && (
          <Button onClick={() => setShowNewForm(true)}>
            Add New Credentials
          </Button>
        )}
      </div>

      {/* New/Edit Credential Form */}
      {(showNewForm || editingCredential) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCredential ? "Edit Credentials" : "Add New Credentials"}</CardTitle>
            <CardDescription>
              {editingCredential 
                ? `Update connection details for ${editingCredential.providerName}`
                : "Enter your hosting provider credentials"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Provider Selection */}
                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hosting Provider</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => handleProviderChange(value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a hosting provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hostingProviders.map(provider => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Connection Protocol */}
                {form.watch("providerId") && (
                  <FormField
                    control={form.control}
                    name="protocol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Connection Protocol</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => handleProtocolChange(value as ConnectionProtocol)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select protocol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {hostingProviders
                              .find(p => p.id === form.watch("providerId"))
                              ?.protocols.map(protocol => (
                                <SelectItem key={protocol} value={protocol}>
                                  {protocol.toUpperCase()}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {form.watch("providerId") === "cpanel" && form.watch("protocol") === "cpanel" 
                            ? "cPanel API connection (recommended for full control)"
                            : "Select how you want to connect to your hosting"
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Server Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="server"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Server</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={
                                form.watch("providerId") === "cpanel" 
                                  ? "rs3-va.serverhostgroup.com" 
                                  : "e.g. ftp.example.com"
                              } 
                              {...field} 
                            />
                          </FormControl>
                          {form.watch("providerId") === "cpanel" && (
                            <FormDescription>
                              Enter your domain or cPanel server URL (without /cpanel)
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        {form.watch("protocol") === "cpanel" && (
                          <FormDescription>
                            2083 (secure) or 2082 (non-secure)
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Authentication Details */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={editingCredential ? "Leave blank to keep existing password" : "Password"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={editingCredential ? "Leave blank to keep existing API key" : "API Key"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        For API-based connections, provide your API key instead of a password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCredential ? "Update" : "Save"} Credentials
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Credentials List */}
      {!showNewForm && !editingCredential && (
        <>
          {credentials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {credentials.map(credential => (
                <Card key={credential.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {credential.providerName}
                    </CardTitle>
                    <CardDescription>
                      {credential.server}:{credential.port}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{credential.username}</span>
                        </div>
                        {credential.isValid !== undefined && (
                          <Badge className={credential.isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {credential.isValid ? "Valid" : "Invalid"}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Key className="h-4 w-4" />
                        {credential.password ? "Password saved" : ""}
                        {credential.apiKey ? (credential.password ? " • " : "") + "API Key saved" : ""}
                      </div>
                      
                      {credential.lastTested && (
                        <div className="text-xs text-gray-500">
                          Last tested: {credential.lastTested.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingCredential(credential)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600"
                        onClick={() => handleDeleteCredential(credential)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection(credential)}
                        disabled={isTestingConnection}
                      >
                        {isTestingConnection ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Testing
                          </>
                        ) : (
                          "Test"
                        )}
                      </Button>
                      {credential.isValid && onFileManagerOpen && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onFileManagerOpen(credential)}
                        >
                          Browse Files
                        </Button>
                      )}
                      {onCredentialSelected && selectedDomain && (
                        <Button
                          size="sm"
                          onClick={() => handleSelectCredential(credential)}
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No credentials yet</h3>
                  <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                    Add your hosting provider credentials to enable domain verification 
                    and website deployment.
                  </p>
                  <Button className="mt-4" onClick={() => setShowNewForm(true)}>
                    Add Credentials
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {credentials.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Security Information</AlertTitle>
              <AlertDescription>
                In this demo, credentials are stored in your browser's local storage.
                In a production environment, these would be encrypted and stored securely on the server.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Credential</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete these credentials? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {credentialToDelete && (
            <div className="py-4">
              <div className="flex items-center space-x-2 p-2 border rounded">
                <Server className="h-5 w-5 text-gray-500" />
                <span className="font-medium">
                  {credentialToDelete.providerName} - {credentialToDelete.server}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteCredential}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
