
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HostingConnection } from "@/api/newHostingApi";
import { Server, Wifi, WifiOff } from "lucide-react";

interface HostingListProps {
  hostings: HostingConnection[];
}

export function HostingList({ hostings }: HostingListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'success' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const parseConnectionConfig = (config: string, type: string) => {
    try {
      const parsed = JSON.parse(config);
      if (type === 'ftp') {
        return `${parsed.username}@${parsed.host}:${parsed.port}`;
      } else if (type === 'cpanel') {
        return `${parsed.username} (${parsed.testUrl})`;
      }
      return 'N/A';
    } catch {
      return 'Invalid config';
    }
  };

  if (hostings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Server className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No hosting connections</h3>
            <p className="text-gray-500">
              You haven't added any hosting connections yet. Click "Add New Hosting" to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Hosting Connections ({hostings.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Connection Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hostings.map((hosting) => (
              <TableRow key={hosting._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {hosting.connectionType === 'ftp' ? (
                      <Wifi className="h-4 w-4" />
                    ) : (
                      <Server className="h-4 w-4" />
                    )}
                    <span className="font-medium uppercase">
                      {hosting.connectionType}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {parseConnectionConfig(hosting.connectionConfig, hosting.connectionType)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(hosting.status)}>
                    {hosting.status === 'success' ? (
                      <Wifi className="h-3 w-3 mr-1" />
                    ) : (
                      <WifiOff className="h-3 w-3 mr-1" />
                    )}
                    {hosting.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(hosting.createdAt)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(hosting.updatedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
