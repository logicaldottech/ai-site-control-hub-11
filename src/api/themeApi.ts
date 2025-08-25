// src/api/themeApi.ts
import { http } from "@/config";

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
  supportThemeSubColor: string;  // "true"/"false"
  supportSecondaryColor: string; // "true"/"false"
  themeDemoUrl: string;
  themeImageUrl: string;
  isActive: string;              // "true"/"false"
}

export interface UpdateThemeData extends CreateThemeData {
  themeId: string;               // sent in body
}

const bool = (v: string | boolean) =>
  typeof v === "boolean" ? v : v === "true";

export const themeApi = {
  createTheme: async (data: CreateThemeData): Promise<Theme> => {
    const payload = {
      themeName: data.themeName,
      supportThemeSubColor: bool(data.supportThemeSubColor),
      supportSecondaryColor: bool(data.supportSecondaryColor),
      themeDemoUrl: data.themeDemoUrl,
      themeImageUrl: data.themeImageUrl,
      isActive: bool(data.isActive),
    };
    const res = await http.post("/create_theme", payload); // JSON, not FormData
    return res.data?.theme ?? res.data;
  },

  updateTheme: async (data: UpdateThemeData): Promise<Theme> => {
    const payload = {
      themeId: data.themeId, // in body
      themeName: data.themeName,
      supportThemeSubColor: bool(data.supportThemeSubColor),
      supportSecondaryColor: bool(data.supportSecondaryColor),
      themeDemoUrl: data.themeDemoUrl,
      themeImageUrl: data.themeImageUrl,
      // isActive optional here; don’t send unless UI changes it
    };
    const res = await http.post("/update_theme", payload); // POST per your routes
    return res.data?.theme ?? res.data;
  },

  listThemes: async (): Promise<Theme[]> => {
    const res = await http.get("/list_themes");
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.themes)) return res.data.themes;
    if (Array.isArray(res.data?.data)) return res.data.data;
    return [];
  },

  changeThemeStatus: async (themeId: string, isActive: boolean): Promise<Theme> => {
    const res = await http.post("/change_theme_status", { themeId, isActive });
    return res.data?.theme ?? res.data;
  },
};
