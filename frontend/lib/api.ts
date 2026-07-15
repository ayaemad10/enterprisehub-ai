import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("eh_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("eh_token");
      localStorage.removeItem("eh_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---- Types ----
export type UserRole = "admin" | "hr" | "finance" | "legal" | "employee";

export interface UserOut {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  role: UserRole;
  is_active: boolean;
}

export interface FolderOut {
  id: string;
  name: string;
  parent_id: string | null;
  owner_id: string;
  department: string | null;
  created_at: string;
}

export interface FileOut {
  id: string;
  name: string;
  folder_id: string | null;
  owner_id: string;
  mime_type: string | null;
  size_bytes: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DriveListing {
  folders: FolderOut[];
  files: FileOut[];
  current_folder: FolderOut | null;
}

export interface DashboardStats {
  total_files: number;
  total_folders: number;
  total_licenses: number;
  expired_licenses: number;
  expiring_soon_licenses: number;
  storage_used_bytes: number;
  files_uploaded_today: number;
  active_users: number;
}

// ---- Auth ----
export async function login(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data as { access_token: string; token_type: string; user: UserOut };
}

export async function register(payload: {
  full_name: string;
  email: string;
  password: string;
  department?: string;
}) {
  const { data } = await api.post("/api/auth/register", payload);
  return data as UserOut;
}

// ---- Drive ----
export async function fetchDrive(folderId?: string) {
  const { data } = await api.get("/api/drive", { params: folderId ? { folder_id: folderId } : {} });
  return data as DriveListing;
}

export async function createFolder(name: string, parentId?: string) {
  const { data } = await api.post("/api/drive/folders", { name, parent_id: parentId ?? null });
  return data as FolderOut;
}

export async function deleteFolder(folderId: string) {
  await api.delete(`/api/drive/folders/${folderId}`);
}

export async function uploadFile(file: globalThis.File, folderId?: string) {
  const formData = new FormData();
  formData.append("upload", file);
  const { data } = await api.post("/api/drive/files", formData, {
    params: folderId ? { folder_id: folderId } : {},
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as FileOut;
}

export function downloadFileUrl(fileId: string) {
  return `${API_BASE_URL}/api/drive/files/${fileId}/download`;
}

export async function deleteFile(fileId: string) {
  await api.delete(`/api/drive/files/${fileId}`);
}

// ---- Dashboard ----
export async function fetchDashboard() {
  const { data } = await api.get("/api/dashboard");
  return data as DashboardStats;
}
