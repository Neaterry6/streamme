import { useState } from "react";
import jwtDecode from "jwt-decode";

export const useAuth = () => {
  const [user, setUser] = useState<any>(() => {
    const token = localStorage.getItem("token");
    return token ? jwtDecode(token) : null;
  });

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setUser(jwtDecode(token));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return { user, login, logout };
};