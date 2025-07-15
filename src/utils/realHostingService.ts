
import { HostingCredential, ConnectionProtocol } from './credentialManager';
import { uploadFiles } from '@/api/hostingApi';
import { testConnection } from '@/api/testConnection';
import { deploymentService, WebsiteFiles } from '@/services/deploymentService';
import { toast } from '@/hooks/use-toast';

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

// Real hosting service implementation
export const realHostingService = {
  async testCredentials(credential: HostingCredential): Promise<boolean> {
    try {
      const result = await testConnection({
        protocol: credential.protocol || 'ftp',
        server: credential.server || '',
        port: credential.port || 21,
        username: credential.username,
        password: credential.password,
        apiKey: credential.apiKey
      });
      
      return result.success;
    } catch (error) {
      console.error('Credential test failed:', error);
      return false;
    }
  },

  async deployWebsite(
    credential: HostingCredential,
    domain: string,
    websiteContent?: WebsiteFiles
  ): Promise<string> {
    try {
      // Generate sample website if no content provided
      const files = websiteContent || deploymentService.generateSampleWebsite(domain);
      
      const deployment = await deploymentService.deployToHosting(
        credential,
        domain,
        files
      );
      
      return deployment.deploymentId;
    } catch (error) {
      console.error('Website deployment failed:', error);
      throw error;
    }
  },

  async uploadVerificationFile(
    credential: HostingCredential,
    domain: string,
    verificationToken: string
  ): Promise<boolean> {
    try {
      const fileName = `verification-${verificationToken}.txt`;
      const fileContent = `domain-verify-${verificationToken}-token`;
      
      const success = await uploadFiles({
        credentialId: credential.id,
        files: [{
          path: fileName,
          content: fileContent,
          type: 'text'
        }],
        targetPath: 'public_html'
      });
      
      if (success) {
        toast({
          title: "Verification file uploaded",
          description: `File uploaded to https://${domain}/${fileName}`,
        });
      }
      
      return success;
    } catch (error) {
      console.error('Verification file upload failed:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload verification file: ${error}`,
        variant: "destructive"
      });
      return false;
    }
  }
};

// Export the function for backward compatibility
export const uploadVerificationFile = realHostingService.uploadVerificationFile;
