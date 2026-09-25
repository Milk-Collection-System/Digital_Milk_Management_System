const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("dmm_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  farmers: () => request("/farmers"),
  createFarmer: (payload) => request("/farmers", { method: "POST", body: JSON.stringify(payload) }),
  collections: () => request("/collections"),
  createCollection: (payload) => request("/collections", { method: "POST", body: JSON.stringify(payload) })
};