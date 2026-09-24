import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }
    client
      .get("/auth/me/")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const { data } = await client.post("/auth/login/", { username, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    const me = await client.get("/auth/me/");
    setUser(me.data);
  }

  async function register(username, email, password, password2) {
    await client.post("/auth/register/", { username, email, password, password2 });
    await login(username, password);
  }

  async function logout() {
    const refresh = localStorage.getItem("refresh");
    try {
      if (refresh) {
        await client.post("/auth/logout/", { refresh });
      }
    } catch {
      // ignore, we're logging out either way
    }
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}