import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);

  const login = (userData: any) => setUser(userData);
  const logout = () => setUser(null);

  return { user, login, logout };
}
