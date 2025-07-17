
import { httpFile } from '@/config';
import { HostingCredential, ConnectionProtocol } from '@/utils/credentialManager';

export interface UploadRequest {
  credentialId: string;
  files: Array<{
    path: string;
    content: string;
    type: 'text' | 'binary';
  }>;
  targetPath: string;
}

export interface DeploymentRequest {
  credentialId: string;
  domain: string;
  projectFiles: Array<{
    path: string;
    content: string;
    type: 'text' | 'binary';
  }>;
  deploymentConfig?: {
    targetDirectory?: string;
    backupCurrent?: boolean;
    customCommands?: string[];
  };
}

export interface DeploymentResponse {
  deploymentId: string;
  status: 'pending' | 'uploading' | 'success' | 'failed';
  message: string;
  progress: number;
}

export const uploadFiles = async (request: UploadRequest): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");
    const response = await httpFile.post('upload', request, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.success;
  } catch (error: any) {
    console.error('File upload failed:', error);
    throw new Error(error.response?.data?.message || 'File upload failed');
  }
};

export const deployWebsite = async (request: DeploymentRequest): Promise<DeploymentResponse> => {
  try {
    const token = localStorage.getItem("token");
    const response = await httpFile.post('deploy', request, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    console.error('Deployment failed:', error);
    throw new Error(error.response?.data?.message || 'Deployment failed');
  }
};

export const getDeploymentStatus = async (deploymentId: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await httpFile.get(`deployment-status/${deploymentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to get deployment status:', error);
    throw new Error(error.response?.data?.message || 'Failed to get deployment status');
  }
};
