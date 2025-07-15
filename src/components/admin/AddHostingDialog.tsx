
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { addHosting } from "@/api/newHostingApi";
import { Plus } from "lucide-react";

interface AddHostingDialogProps {
  onHostingAdded: () => void;
}

type ConnectionType = 'ftp' | 'cpanel';

interface FtpConfig {
  host: string;
  username: string;
  password: string;
  port: number;
  secure: boolean;
}

interface CpanelConfig {
  username: string;
  token: string;
  testUrl: string;
}

export function AddHostingDialog({ onHostingAdded }: AddHostingDialogProps) {
  const [open, setOpen] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>('ftp');
  const [isLoading, setIsLoading] = useState(false);

  // FTP form fields
  const [ftpHost, setFtpHost] = useState('');
  const [ftpUsername, setFtpUsername] = useState('');
  const [ftpPassword, setFtpPassword] = useState('');
  const [ftpPort, setFtpPort] = useState('21');
  const [ftpSecure, setFtpSecure] = useState(false);

  // cPanel form fields
  const [cpanelUsername, setCpanelUsername] = useState('');
  const [cpanelToken, setCpanelToken] = useState('');
  const [cpanelTestUrl, setCpanelTestUrl] = useState('');

  const resetForm = () => {
    setFtpHost('');
    setFtpUsername('');
    setFtpPassword('');
    setFtpPort('21');
    setFtpSecure(false);
    setCpanelUsername('');
    setCpanelToken('');
    setCpanelTestUrl('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let connectionConfig: string;

      if (connectionType === 'ftp') {
        if (!ftpHost || !ftpUsername || !ftpPassword) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required FTP fields",
            variant: "destructive"
          });
          return;
        }

        const ftpConfig: FtpConfig = {
          host: ftpHost,
          username: ftpUsername,
          password: ftpPassword,
          port: parseInt(ftpPort),
          secure: ftpSecure
        };
        connectionConfig = JSON.stringify(ftpConfig);
      } else {
        if (!cpanelUsername || !cpanelToken || !cpanelTestUrl) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required cPanel fields",
            variant: "destructive"
          });
          return;
        }

        const cpanelConfig: CpanelConfig = {
          username: cpanelUsername,
          token: cpanelToken,
          testUrl: cpanelTestUrl
        };
        connectionConfig = JSON.stringify(cpanelConfig);
      }

      await addHosting({
        connectionType,
        connectionConfig
      });

      toast({
        title: "Success",
        description: "Hosting connection added successfully"
      });

      setOpen(false);
      resetForm();
      onHostingAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add hosting connection: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add New Hosting
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Hosting Connection</DialogTitle>
            <DialogDescription>
              Configure your hosting connection details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="connectionType">Connection Type</Label>
              <Select value={connectionType} onValueChange={(value: ConnectionType) => setConnectionType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ftp">FTP</SelectItem>
                  <SelectItem value="cpanel">cPanel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {connectionType === 'ftp' && (
              <>
                <div>
                  <Label htmlFor="ftpHost">Host *</Label>
                  <Input
                    id="ftpHost"
                    value={ftpHost}
                    onChange={(e) => setFtpHost(e.target.value)}
                    placeholder="ftp.example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="ftpUsername">Username *</Label>
                  <Input
                    id="ftpUsername"
                    value={ftpUsername}
                    onChange={(e) => setFtpUsername(e.target.value)}
                    placeholder="your-username"
                  />
                </div>
                <div>
                  <Label htmlFor="ftpPassword">Password *</Label>
                  <Input
                    id="ftpPassword"
                    type="password"
                    value={ftpPassword}
                    onChange={(e) => setFtpPassword(e.target.value)}
                    placeholder="your-password"
                  />
                </div>
                <div>
                  <Label htmlFor="ftpPort">Port</Label>
                  <Input
                    id="ftpPort"
                    type="number"
                    value={ftpPort}
                    onChange={(e) => setFtpPort(e.target.value)}
                    placeholder="21"
                  />
                </div>
              </>
            )}

            {connectionType === 'cpanel' && (
              <>
                <div>
                  <Label htmlFor="cpanelUsername">Username *</Label>
                  <Input
                    id="cpanelUsername"
                    value={cpanelUsername}
                    onChange={(e) => setCpanelUsername(e.target.value)}
                    placeholder="cpanel-username"
                  />
                </div>
                <div>
                  <Label htmlFor="cpanelToken">API Token *</Label>
                  <Input
                    id="cpanelToken"
                    value={cpanelToken}
                    onChange={(e) => setCpanelToken(e.target.value)}
                    placeholder="API-TOKEN-HERE"
                  />
                </div>
                <div>
                  <Label htmlFor="cpanelTestUrl">Test URL *</Label>
                  <Input
                    id="cpanelTestUrl"
                    value={cpanelTestUrl}
                    onChange={(e) => setCpanelTestUrl(e.target.value)}
                    placeholder="https://domain.com:2083/execute/Version/get"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Hosting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
