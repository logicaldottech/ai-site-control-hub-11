
import { useState, useEffect, useCallback } from 'react';
import { getDeploymentStatus } from '@/api/hostingApi';

export interface DeploymentStatus {
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'failed';
  progress: number;
  message: string;
  startTime: Date;
  endTime?: Date;
  domain?: string;
  credentialId?: string;
}

export function useDeploymentMonitor(deploymentId: string | null) {
  const [status, setStatus] = useState<DeploymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!deploymentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getDeploymentStatus(deploymentId);
      setStatus({
        ...data,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : undefined
      });
    } catch (err) {
      console.error('Failed to fetch deployment status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [deploymentId]);

  useEffect(() => {
    if (!deploymentId) {
      setStatus(null);
      return;
    }

    fetchStatus();

    // Poll for updates every 2 seconds while deployment is in progress
    const interval = setInterval(() => {
      if (status?.status === 'uploading' || status?.status === 'pending') {
        fetchStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [deploymentId, fetchStatus, status?.status]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
