export interface User {
  id: number;
  name: string;
  email: string;
  role: "dev" | "lead" | "admin";
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  status: "active" | "inactive";
  created_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}