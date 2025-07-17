
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

type ConnectionType = 'ftp' | 'cpanel' | 'ssh' | 'vps';

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

interface VpsConfig {
  host: string;
  username: string;
  password: string;
  port: number;
  secure: boolean;
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

  // VPS/SSH form fields
  const [vpsHost, setVpsHost] = useState('');
  const [vpsUsername, setVpsUsername] = useState('');
  const [vpsPassword, setVpsPassword] = useState('');
  const [vpsPort, setVpsPort] = useState('22');

  const resetForm = () => {
    setFtpHost('');
    setFtpUsername('');
    setFtpPassword('');
    setFtpPort('21');
    setFtpSecure(false);
    setCpanelUsername('');
    setCpanelToken('');
    setCpanelTestUrl('');
    setVpsHost('');
    setVpsUsername('');
    setVpsPassword('');
    setVpsPort('22');
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
      } else if (connectionType === 'cpanel') {
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
      } else if (connectionType === 'ssh' || connectionType === 'vps') {
        if (!vpsHost || !vpsUsername || !vpsPassword) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required VPS/SSH fields",
            variant: "destructive"
          });
          return;
        }

        const vpsConfig: VpsConfig = {
          host: vpsHost,
          username: vpsUsername,
          password: vpsPassword,
          port: parseInt(vpsPort),
          secure: false
        };
        connectionConfig = JSON.stringify(vpsConfig);
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
                  <SelectItem value="ssh">SSH</SelectItem>
                  <SelectItem value="vps">VPS</SelectItem>
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

            {(connectionType === 'ssh' || connectionType === 'vps') && (
              <>
                <div>
                  <Label htmlFor="vpsHost">Host *</Label>
                  <Input
                    id="vpsHost"
                    value={vpsHost}
                    onChange={(e) => setVpsHost(e.target.value)}
                    placeholder="82.25.110.201"
                  />
                </div>
                <div>
                  <Label htmlFor="vpsUsername">Username *</Label>
                  <Input
                    id="vpsUsername"
                    value={vpsUsername}
                    onChange={(e) => setVpsUsername(e.target.value)}
                    placeholder="root"
                  />
                </div>
                <div>
                  <Label htmlFor="vpsPassword">Password *</Label>
                  <Input
                    id="vpsPassword"
                    type="password"
                    value={vpsPassword}
                    onChange={(e) => setVpsPassword(e.target.value)}
                    placeholder="your-password"
                  />
                </div>
                <div>
                  <Label htmlFor="vpsPort">Port</Label>
                  <Input
                    id="vpsPort"
                    type="number"
                    value={vpsPort}
                    onChange={(e) => setVpsPort(e.target.value)}
                    placeholder="22"
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
