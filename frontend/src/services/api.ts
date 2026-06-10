import { API_BASE } from "@/lib/constants";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  // Auto-refresh if 401
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const rr = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (rr.ok) {
        const { accessToken } = await rr.json();
        localStorage.setItem("accessToken", accessToken);
        // Retry original request
        return fetch(`${API_BASE}${path}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...(options.headers || {}),
          },
        });
      }
    }
    localStorage.clear();
    window.location.href = "/login";
  }

  return res;
}

export const api = {
  auth: {
    register: (data: object) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: object) =>
      request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    logout: (refreshToken: string) =>
      request("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }),
  },
  projects: {
    list: (page = 1, limit = 10) => request(`/projects?page=${page}&limit=${limit}`),
    get: (id: number) => request(`/projects/${id}`),
    create: (data: object) =>
      request("/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: object) =>
      request(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/projects/${id}`, { method: "DELETE" }),
  },
};