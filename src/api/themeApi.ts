import { httpFileData } from "@/config";

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
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await httpFileData.post('/create_theme', formData);
    return response.data;
  },

  // Update an existing theme
  updateTheme: async (data: UpdateThemeData): Promise<Theme> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await httpFileData.post('/update_theme', formData);
    return response.data;
  },

  // Get list of all themes
  listThemes: async (): Promise<Theme[]> => {
    const response = await httpFileData.get('/list_themes');
    return response.data;
  },

  // Change theme status (activate/deactivate)
  changeThemeStatus: async (themeId: string, isActive: boolean): Promise<Theme> => {
    const formData = new FormData();
    formData.append('themeId', themeId);
    formData.append('isActive', isActive.toString());

    const response = await httpFileData.post('/change_theme_status', formData);
    return response.data;
  }
};