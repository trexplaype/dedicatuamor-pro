import { createContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser || storedUser === "undefined" || storedUser === "null") {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("apiToken"));
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token && user);

  async function refreshUser() {
    if (!token) return null;

    try {
      const data = await api.me();

      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);

      return data;
    } catch (error) {
      console.error("Error actualizando usuario:", error);

      localStorage.removeItem("apiToken");
      localStorage.removeItem("user");

      setToken(null);
      setUser(null);

      return null;
    }
  }

  async function login(credentials) {
    setLoading(true);

    try {
      const data = await api.login(credentials);

      localStorage.setItem("apiToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return data;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);

    try {
      const data = await api.register(payload);

      localStorage.setItem("apiToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return data;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("apiToken");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    navigate("/");
  }

  useEffect(() => {
    if (!token) return;

    refreshUser();
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
