
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { DeploymentStatus as DeploymentStatusType } from "@/utils/realHostingService";

interface DeploymentStatusProps {
  deploymentId?: string;
  onClose?: () => void;
}

export function DeploymentStatus({ deploymentId, onClose }: DeploymentStatusProps) {
  const [status, setStatus] = useState<DeploymentStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    if (!deploymentId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/deployment-status/${deploymentId}`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch deployment status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deploymentId) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [deploymentId]);

  if (!status) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'success':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'failed':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case 'uploading':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            Deployment Status
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        <CardDescription>
          Deployment ID: {status.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor()}>
            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
          </Badge>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{status.progress}%</span>
          </div>
          <Progress value={status.progress} className="w-full" />
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {status.message}
        </div>
        
        <div className="text-xs text-gray-500">
          Started: {status.startTime.toLocaleString()}
          {status.endTime && (
            <div>Completed: {status.endTime.toLocaleString()}</div>
          )}
        </div>
        
        {status.status === 'failed' && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              Deployment failed. Please check your hosting credentials and try again.
            </div>
          </div>
        )}
        
        {status.status !== 'uploading' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStatus}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
