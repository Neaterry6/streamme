import apiClient from "./apiClient";

export const signup = async (username: string, password: string) => {
  const res = await apiClient.post("/auth/signup", { user: username, pass: password });
  return res.data;
};

export const login = async (username: string, password: string) => {
  const res = await apiClient.post("/auth/login", { user: username, pass: password });
  return res.data;
};