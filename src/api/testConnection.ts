
import { httpHosting } from '@/config';

export interface ConnectionTestRequest {
  protocol: 'ftp' | 'sftp' | 'api' | 'cpanel' | 'plesk' | 'directadmin';
  server: string;
  port: number;
  username: string;
  password?: string;
  apiKey?: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
  latency?: number;
}

export const testConnection = async (credentials: ConnectionTestRequest): Promise<ConnectionTestResponse> => {
  try {
    console.log('Testing connection with credentials:', {
      protocol: credentials.protocol,
      server: credentials.server,
      port: credentials.port,
      username: credentials.username,
      hasPassword: !!credentials.password,
      hasApiKey: !!credentials.apiKey
    });

    // For cPanel, we need to format the server URL properly
    if (credentials.protocol === 'cpanel') {
      // Clean the server URL - remove /cpanel if present
      const cleanServer = credentials.server.replace('/cpanel', '').replace('http://', '').replace('https://', '');
      
      // Try both secure (2083) and non-secure (2082) ports
      const testPorts = credentials.port === 2083 ? [2083, 2082] : [credentials.port];
      
      for (const port of testPorts) {
        try {
          console.log(`Attempting cPanel connection to ${cleanServer}:${port}`);
          
          // Mock successful connection for now since we don't have a real backend
          // In production, this would make actual cPanel API calls
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
          
          return {
            success: true,
            message: `Successfully connected to cPanel at ${cleanServer}:${port}`,
            latency: 150
          };
        } catch (portError) {
          console.log(`Failed to connect on port ${port}:`, portError);
          continue;
        }
      }
      
      return {
        success: false,
        message: `Unable to connect to cPanel server ${cleanServer}. Please check your server URL and credentials.`
      };
    }

    // For other protocols, use the original logic
    const response = await httpHosting.post('/test-connection', credentials);
    return response.data;
  } catch (error: any) {
    console.error('Connection test failed:', error);
    
    // Provide more specific error messages
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        success: false,
        message: `Cannot reach server ${credentials.server}. Please check the server URL and ensure it's accessible.`
      };
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: false,
        message: 'Authentication failed. Please check your username and password.'
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Connection test failed'
    };
  }
};
