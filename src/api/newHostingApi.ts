
import { http } from '@/config';

export interface HostingConnection {
  _id: string;
  userId: string;
  connectionType: 'ftp' | 'cpanel';
  connectionConfig: string;
  status: 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface GetHostingsResponse {
  message: string;
  data: HostingConnection[];
}

export interface AddHostingRequest {
  connectionType: 'ftp' | 'cpanel';
  connectionConfig: string;
}

// Get user's hosting connections
export const getMyHostings = async (): Promise<HostingConnection[]> => {
  try {
    const response = await http.get<GetHostingsResponse>('/getMyHostings');
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch hostings:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch hosting connections');
  }
};

// Add new hosting connection
export const addHosting = async (request: AddHostingRequest): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('connectionType', request.connectionType);
    formData.append('connectionConfig', request.connectionConfig);

    await http.post('/addHosting', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error: any) {
    console.error('Failed to add hosting:', error);
    throw new Error(error.response?.data?.message || 'Failed to add hosting connection');
  }
};
