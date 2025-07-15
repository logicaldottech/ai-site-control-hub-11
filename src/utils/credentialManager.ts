
import { toast } from "@/hooks/use-toast";
import { testConnection as testConnectionAPI } from '@/api/testConnection';

// Types for credential storage
export type HostingCredential = {
  id: string;
  providerId: string;
  providerName: string;
  username: string;
  password?: string;
  apiKey?: string;
  server?: string;
  port?: number;
  createdAt: Date;
  lastTested?: Date;
  isValid?: boolean;
  protocol?: ConnectionProtocol;
};

export type ConnectionProtocol = 'ftp' | 'sftp' | 'api' | 'cpanel' | 'plesk' | 'directadmin';

// Enhanced encryption (in production, use a proper encryption library like crypto-js)
const encryptData = (data: string): string => {
  // Basic encryption - replace with proper encryption in production
  return btoa(data);
};

const decryptData = (encryptedData: string): string => {
  try {
    return atob(encryptedData);
  } catch {
    return encryptedData;
  }
};

// Real connection testing using the API
export const testConnection = async (credential: HostingCredential): Promise<boolean> => {
  try {
    toast({
      title: "Testing connection",
      description: `Connecting to ${credential.providerName}...`,
    });

    // Clean and format server URL for cPanel
    let serverUrl = credential.server || '';
    let port = credential.port || 21;
    
    if (credential.protocol === 'cpanel') {
      // Remove common prefixes and paths from cPanel URLs
      serverUrl = serverUrl
        .replace('http://', '')
        .replace('https://', '')
        .replace('/cpanel', '')
        .replace('/whm', '');
      
      // Use secure cPanel port by default
      port = credential.port || 2083;
    }

    console.log('Testing connection for credential:', {
      providerId: credential.providerId,
      protocol: credential.protocol,
      server: serverUrl,
      port: port,
      username: credential.username
    });

    const result = await testConnectionAPI({
      protocol: credential.protocol || 'ftp',
      server: serverUrl,
      port: port,
      username: credential.username,
      password: credential.password ? decryptData(credential.password) : undefined,
      apiKey: credential.apiKey ? decryptData(credential.apiKey) : undefined,
    });
    
    if (result.success) {
      updateCredential(credential.id, { 
        lastTested: new Date(),
        isValid: true
      });
      toast({
        title: "Connection successful",
        description: `Successfully connected to ${credential.providerName}${result.latency ? ` (${result.latency}ms)` : ''}`,
      });
      return true;
    } else {
      updateCredential(credential.id, { 
        lastTested: new Date(),
        isValid: false
      });
      toast({
        title: "Connection failed",
        description: result.message || "Failed to connect. Please check your credentials.",
        variant: "destructive"
      });
      return false;
    }
  } catch (error) {
    console.error("Connection test error:", error);
    updateCredential(credential.id, { 
      lastTested: new Date(),
      isValid: false
    });
    toast({
      title: "Connection error",
      description: `Network error: ${error}`,
      variant: "destructive"
    });
    return false;
  }
};

// Securely store credentials (mock implementation)
export const storeCredential = (credential: Omit<HostingCredential, 'id' | 'createdAt'>): HostingCredential => {
  // In a real app, this would securely store credentials in a backend
  const newCredential: HostingCredential = {
    id: Math.random().toString(36).substr(2, 9),
    ...credential,
    createdAt: new Date(),
    // In a real app, encrypt sensitive data like password and apiKey
    password: credential.password ? encryptData(credential.password) : undefined,
    apiKey: credential.apiKey ? encryptData(credential.apiKey) : undefined,
  };
  
  // In a real app, these would be stored in a secure database, not localStorage
  const storedCredentials = getCredentials();
  storedCredentials.push(newCredential);
  
  // For demo, we'll use localStorage, but in production never store credentials in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('hostedCredentials', JSON.stringify(storedCredentials));
  }
  
  return newCredential;
};

// Retrieve credentials
export const getCredentials = (): HostingCredential[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('hostedCredentials');
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return [];
};

// Get credential by ID
export const getCredentialById = (id: string): HostingCredential | undefined => {
  return getCredentials().find(cred => cred.id === id);
};

// Update credential
export const updateCredential = (id: string, updates: Partial<HostingCredential>): HostingCredential | undefined => {
  const credentials = getCredentials();
  const index = credentials.findIndex(cred => cred.id === id);
  
  if (index >= 0) {
    // Encrypt sensitive data if provided
    if (updates.password) {
      updates.password = encryptData(updates.password);
    }
    if (updates.apiKey) {
      updates.apiKey = encryptData(updates.apiKey);
    }
    
    credentials[index] = { ...credentials[index], ...updates };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('hostedCredentials', JSON.stringify(credentials));
    }
    
    return credentials[index];
  }
  
  return undefined;
};

// Delete credential
export const deleteCredential = (id: string): boolean => {
  const credentials = getCredentials();
  const filtered = credentials.filter(cred => cred.id !== id);
  
  if (filtered.length < credentials.length) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hostedCredentials', JSON.stringify(filtered));
    }
    return true;
  }
  
  return false;
};
