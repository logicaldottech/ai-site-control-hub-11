
import { toast } from "@/hooks/use-toast";
import { HostingCredential, ConnectionProtocol } from "./credentialManager";
import { httpHosting } from '@/config';

// Types for file operations
export type FileTransferOptions = {
  localPath?: string;
  remotePath: string;
  content?: string; // For direct content upload
  type: 'file' | 'directory';
};

export type FileListItem = {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'directory';
  lastModified: Date;
  permissions?: string;
};

// Real API calls for file operations
export const listFiles = async (
  credential: HostingCredential,
  path: string = "/",
  protocol: ConnectionProtocol = 'ftp'
): Promise<FileListItem[]> => {
  try {
    console.log(`Listing files in ${path} using ${protocol} for ${credential.providerName}`);
    
    // Show loading toast
    toast({
      title: "Loading files",
      description: `Connecting to ${credential.providerName}...`
    });

    let response;

    // Make real API calls based on protocol
    switch (protocol) {
      case 'cpanel':
        response = await httpHosting.post('/cpanel/list-files', {
          host: credential.server?.replace(/\/+$/, ''), // Remove trailing slashes
          username: credential.username,
          password: credential.password,
          path: path,
          port: credential.port || 2083
        });
        break;
      case 'ftp':
      case 'sftp':
        response = await httpHosting.post('/ftp/list-files', {
          host: credential.server,
          port: credential.port || (protocol === 'sftp' ? 22 : 21),
          username: credential.username,
          password: credential.password,
          protocol: protocol,
          path: path
        });
        break;
      case 'plesk':
        response = await httpHosting.post('/plesk/list-files', {
          host: credential.server,
          username: credential.username,
          password: credential.password,
          path: path
        });
        break;
      case 'directadmin':
        response = await httpHosting.post('/directadmin/list-files', {
          host: credential.server,
          username: credential.username,
          password: credential.password,
          path: path
        });
        break;
      default:
        throw new Error(`Unsupported protocol: ${protocol}`);
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to list files');
    }

    const files: FileListItem[] = (response.data.files || []).map((item: any) => ({
      name: item.name,
      path: item.path,
      size: item.size || 0,
      type: item.type,
      lastModified: new Date(item.lastModified || Date.now()),
      permissions: item.permissions
    }));

    toast({
      title: "Files loaded",
      description: `Found ${files.length} items in ${path}`
    });

    return files;
    
  } catch (error: any) {
    console.error("File listing error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Could not connect to your hosting provider";
    
    if (error.response?.status === 401) {
      errorMessage = "Authentication failed. Please check your credentials.";
    } else if (error.response?.status === 404) {
      errorMessage = "Server not found. Please check your server URL.";
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = "Cannot reach server. Please check your server URL.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast({
      title: "Failed to load files",
      description: errorMessage,
      variant: "destructive"
    });
    
    // Return mock data for demo purposes when API fails
    console.log("Falling back to demo data due to API failure");
    return getMockFiles(path, protocol);
  }
};

// Mock data fallback for demo purposes
const getMockFiles = (path: string, protocol: ConnectionProtocol): FileListItem[] => {
  const mockFiles: FileListItem[] = [
    {
      name: '..',
      path: path === '/' ? '/' : path.split('/').slice(0, -1).join('/') || '/',
      size: 0,
      type: 'directory',
      lastModified: new Date()
    }
  ];

  // Add some realistic mock files based on the path
  if (path === '/' || path === '') {
    mockFiles.push(
      { name: 'public_html', path: '/public_html', size: 0, type: 'directory', lastModified: new Date() },
      { name: 'logs', path: '/logs', size: 0, type: 'directory', lastModified: new Date() },
      { name: 'mail', path: '/mail', size: 0, type: 'directory', lastModified: new Date() },
      { name: 'tmp', path: '/tmp', size: 0, type: 'directory', lastModified: new Date() }
    );
  } else if (path === '/public_html') {
    mockFiles.push(
      { name: 'index.html', path: '/public_html/index.html', size: 2048, type: 'file', lastModified: new Date() },
      { name: 'css', path: '/public_html/css', size: 0, type: 'directory', lastModified: new Date() },
      { name: 'js', path: '/public_html/js', size: 0, type: 'directory', lastModified: new Date() },
      { name: 'images', path: '/public_html/images', size: 0, type: 'directory', lastModified: new Date() }
    );
  } else {
    // For other directories, show some generic files
    mockFiles.push(
      { name: 'file1.txt', path: `${path}/file1.txt`, size: 1024, type: 'file', lastModified: new Date() },
      { name: 'file2.txt', path: `${path}/file2.txt`, size: 512, type: 'file', lastModified: new Date() }
    );
  }

  return mockFiles;
};

// Upload file with real API
export const uploadFile = async (
  credential: HostingCredential,
  remotePath: string,
  content: string,
  protocol: ConnectionProtocol = 'ftp'
): Promise<boolean> => {
  try {
    console.log(`Uploading file to ${remotePath} using ${protocol}`);
    
    toast({
      title: "Uploading file",
      description: `Uploading to ${credential.providerName}...`
    });

    let response;
    
    switch (protocol) {
      case 'cpanel':
        response = await httpHosting.post('/cpanel/upload-file', {
          host: credential.server?.replace(/\/+$/, ''),
          username: credential.username,
          password: credential.password,
          remotePath,
          content,
          port: credential.port || 2083
        });
        break;
      case 'ftp':
      case 'sftp':
        response = await httpHosting.post('/ftp/upload-file', {
          host: credential.server,
          port: credential.port || (protocol === 'sftp' ? 22 : 21),
          username: credential.username,
          password: credential.password,
          protocol,
          remotePath,
          content
        });
        break;
      default:
        throw new Error(`Upload not supported for protocol: ${protocol}`);
    }
    
    if (response.data.success) {
      toast({
        title: "File uploaded",
        description: `Successfully uploaded to ${remotePath}`
      });
      return true;
    } else {
      throw new Error(response.data.message || 'Upload failed');
    }
    
  } catch (error: any) {
    console.error("File upload error:", error);
    toast({
      title: "Upload failed",
      description: `Failed to upload file: ${error.message || error}`,
      variant: "destructive"
    });
    return false;
  }
};

// Delete file with real API
export const deleteFile = async (
  credential: HostingCredential,
  path: string,
  protocol: ConnectionProtocol = 'ftp'
): Promise<boolean> => {
  try {
    console.log(`Deleting file ${path} using ${protocol}`);
    
    let response;
    
    switch (protocol) {
      case 'cpanel':
        response = await httpHosting.post('/cpanel/delete-file', {
          host: credential.server?.replace(/\/+$/, ''),
          username: credential.username,
          password: credential.password,
          path,
          port: credential.port || 2083
        });
        break;
      case 'ftp':
      case 'sftp':
        response = await httpHosting.post('/ftp/delete-file', {
          host: credential.server,
          port: credential.port || (protocol === 'sftp' ? 22 : 21),
          username: credential.username,
          password: credential.password,
          protocol,
          path
        });
        break;
      default:
        throw new Error(`Delete not supported for protocol: ${protocol}`);
    }
    
    if (response.data.success) {
      toast({
        title: "File deleted",
        description: `Successfully deleted ${path.split('/').pop()}`
      });
      return true;
    } else {
      throw new Error(response.data.message || 'Delete failed');
    }
    
  } catch (error: any) {
    console.error("File deletion error:", error);
    toast({
      title: "Delete failed",
      description: `Failed to delete file: ${error.message || error}`,
      variant: "destructive"
    });
    return false;
  }
};

// Check credential validity
const validateCredential = (credential: HostingCredential): boolean => {
  if (!credential.server) {
    toast({
      title: "Invalid credentials",
      description: "Server information is missing",
      variant: "destructive"
    });
    return false;
  }
  
  if (!credential.username && !credential.apiKey) {
    toast({
      title: "Invalid credentials",
      description: "Username or API key is required",
      variant: "destructive"
    });
    return false;
  }
  
  return true;
};

// Upload verification file
export const uploadVerificationFile = async (
  credential: HostingCredential,
  domain: string,
  verificationId: string,
  protocol: ConnectionProtocol = 'ftp'
): Promise<boolean> => {
  if (!validateCredential(credential)) return false;

  try {
    const verificationContent = `domain-verify-${verificationId}-token`;
    const remoteFilePath = `/public_html/verification-${verificationId}.txt`;
    
    toast({
      title: "Uploading verification file",
      description: `Uploading to ${domain} via ${protocol.toUpperCase()}`
    });
    
    const result = await uploadFile(credential, remoteFilePath, verificationContent, protocol);
    
    if (result) {
      toast({
        title: "File uploaded successfully",
        description: `Verification file has been uploaded to ${domain}`
      });
      return true;
    } else {
      toast({
        title: "Upload failed",
        description: "Failed to upload verification file",
        variant: "destructive"
      });
      return false;
    }
  } catch (error) {
    console.error("File upload error:", error);
    toast({
      title: "Upload error",
      description: `An error occurred during file upload: ${error}`,
      variant: "destructive"
    });
    return false;
  }
};

// Deploy website files
export const deployWebsite = async (
  credential: HostingCredential,
  domain: string,
  files: { path: string, content: string }[],
  protocol: ConnectionProtocol = 'ftp'
): Promise<boolean> => {
  if (!validateCredential(credential)) return false;
  
  try {
    let allUploaded = true;
    
    toast({
      title: "Deploying website",
      description: `Deploying files to ${domain}`
    });
    
    for (const file of files) {
      const result = await uploadFile(credential, file.path, file.content, protocol);
      
      if (!result) {
        allUploaded = false;
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.path}`,
          variant: "destructive"
        });
      }
    }
    
    if (allUploaded) {
      toast({
        title: "Deployment successful",
        description: `Website has been deployed to ${domain}`
      });
      return true;
    } else {
      toast({
        title: "Deployment incomplete",
        description: "Some files failed to upload",
        variant: "destructive"
      });
      return false;
    }
  } catch (error) {
    console.error("Deployment error:", error);
    toast({
      title: "Deployment error",
      description: `Failed to deploy website: ${error}`,
      variant: "destructive"
    });
    return false;
  }
};
