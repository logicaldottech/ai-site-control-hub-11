
import { httpFile } from '@/config';

export interface VerificationRequest {
  domain: string;
  method: 'dns' | 'file' | 'meta';
  token: string;
}

export interface DNSCheckRequest {
  domain: string;
  recordType: string;
  expectedValue: string;
}

export interface FileCheckRequest {
  domain: string;
  fileName: string;
  expectedContent: string;
}

export interface MetaCheckRequest {
  domain: string;
  expectedContent: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  details?: any;
}

export const verifyDomain = async (request: VerificationRequest): Promise<VerificationResponse> => {
  try {
    const token = localStorage.getItem("token");
    const response = await httpFile.post('domain-verification/verify', request, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    console.error('Domain verification failed:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Domain verification failed'
    };
  }
};

export const checkDNSRecord = async (request: DNSCheckRequest): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");
    const response = await httpFile.post('domain-verification/check-dns', request, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.found;
  } catch (error: any) {
    console.error('DNS check failed:', error);
    return false;
  }
};

export const checkVerificationFile = async (request: FileCheckRequest): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");
    const response = await httpFile.post('domain-verification/check-file', request, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.found;
  } catch (error: any) {
    console.error('File check failed:', error);
    return false;
  }
};

export const checkMetaTag = async (request: MetaCheckRequest): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");
    const response = await httpFile.post('domain-verification/check-meta', request, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.found;
  } catch (error: any) {
    console.error('Meta tag check failed:', error);
    return false;
  }
};
