
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, FileText, Globe } from "lucide-react";
import { CredentialManager } from "./CredentialManager";
import { FileManager } from "./FileManager";
import { HostingCredential } from "@/utils/credentialManager";

export function HostingDashboard() {
  const [activeTab, setActiveTab] = useState("credentials");
  const [selectedCredential, setSelectedCredential] = useState<HostingCredential | null>(null);

  const handleFileManagerOpen = (credential: HostingCredential) => {
    setSelectedCredential(credential);
    setActiveTab("filemanager");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hosting Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your hosting credentials and files
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Credentials
          </TabsTrigger>
          <TabsTrigger 
            value="filemanager" 
            className="flex items-center gap-2"
            disabled={!selectedCredential}
          >
            <FileText className="h-4 w-4" />
            File Manager
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Domains
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-4">
          <CredentialManager onFileManagerOpen={handleFileManagerOpen} />
        </TabsContent>

        <TabsContent value="filemanager" className="space-y-4">
          {selectedCredential ? (
            <FileManager credential={selectedCredential} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No hosting account selected</h3>
                  <p className="text-gray-500">
                    Please select a hosting account from the Credentials tab to access the file manager.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Domain Management</CardTitle>
              <CardDescription>
                Manage your domains and DNS settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Domain management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
