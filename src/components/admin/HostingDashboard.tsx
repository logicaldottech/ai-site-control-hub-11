
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Server } from "lucide-react";
import { HostingConnection, getMyHostings } from "@/api/newHostingApi";
import { HostingList } from "./HostingList";
import { AddHostingDialog } from "./AddHostingDialog";

export function HostingDashboard() {
  const [hostings, setHostings] = useState<HostingConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHostings = async () => {
    setIsLoading(true);
    try {
      const data = await getMyHostings();
      setHostings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to fetch hosting connections: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHostings();
  }, []);

  const handleHostingAdded = () => {
    fetchHostings();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hosting Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your hosting connections and credentials
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchHostings}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <AddHostingDialog onHostingAdded={handleHostingAdded} />
        </div>
      </div>

      <HostingList hostings={hostings} />
    </div>
  );
}
