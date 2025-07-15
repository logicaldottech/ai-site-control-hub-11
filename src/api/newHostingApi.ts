
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

export interface BrowseDirectoryResponse {
  message: string;
  data: {
    type: 'file' | 'directory';
    name: string;
    path: string;
  }[];
}

export interface LinkProjectRequest {
  hostingId: string;
  projectId: string;
  domainName: string;
  rootPath: string;
}

// Browse hosting directories (for FTP)
export const browseHostingDirectories = async (hostingId: string, path = ''): Promise<BrowseDirectoryResponse['data']> => {
  try {
    const formData = new FormData();
    formData.append('connectionType', 'ftp');
    
    const response = await http.get<BrowseDirectoryResponse>(`/browseHostingDirectories?hostingId=${hostingId}&path=${path}`, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to browse directories:', error);
    throw new Error(error.response?.data?.message || 'Failed to browse directories');
  }
};

// Link project to hosting
export const linkProjectToHosting = async (request: LinkProjectRequest): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('hostingId', request.hostingId);
    formData.append('projectId', request.projectId);
    formData.append('domainName', request.domainName);
    formData.append('rootPath', request.rootPath);

    await http.post('/linkProjectToHosting', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error: any) {
    console.error('Failed to link project to hosting:', error);
    throw new Error(error.response?.data?.message || 'Failed to link project to hosting');
  }
};
