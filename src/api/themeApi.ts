import { httpFileData, http } from "@/config";

export interface Theme {
  _id?: string;
  themeName: string;
  supportThemeSubColor: boolean;
  supportSecondaryColor: boolean;
  themeDemoUrl: string;
  themeImageUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateThemeData {
  themeName: string;
  supportThemeSubColor: string;
  supportSecondaryColor: string;
  themeDemoUrl: string;
  themeImageUrl: string;
  isActive: string;
}

export interface UpdateThemeData extends CreateThemeData {
  themeId: string;
}

export const themeApi = {
  // Create a new theme
  createTheme: async (data: CreateThemeData): Promise<Theme> => {
    try {
      console.log('Creating theme with data:', data);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await httpFileData.post('/create_theme', formData);
      console.log('Create theme response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error;
    }
  },

  // Update an existing theme
  updateTheme: async (data: UpdateThemeData): Promise<Theme> => {
    try {
      console.log('Updating theme with data:', data);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await httpFileData.post('/update_theme', formData);
      console.log('Update theme response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  },

  // Get list of all themes
  listThemes: async (): Promise<Theme[]> => {
    try {
      console.log('Fetching themes from API...');
      const response = await http.get('/list_themes');
      console.log('List themes response:', response.data);
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.themes && Array.isArray(response.data.themes)) {
        return response.data.themes;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
      throw error;
    }
  },

  // Change theme status (activate/deactivate)
  changeThemeStatus: async (themeId: string, isActive: boolean): Promise<Theme> => {
    try {
      console.log('Changing theme status:', { themeId, isActive });
      const formData = new FormData();
      formData.append('themeId', themeId);
      formData.append('isActive', isActive.toString());

      const response = await httpFileData.post('/change_theme_status', formData);
      console.log('Change theme status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error changing theme status:', error);
      throw error;
    }
  }
};