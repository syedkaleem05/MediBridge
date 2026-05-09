import { createContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.js";

export const AuthContext = createContext(null);

const LS_TOKEN = "medibridge_token";
const LS_USER = "medibridge_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(LS_TOKEN) || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(LS_USER);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem(LS_TOKEN, token);
    else localStorage.removeItem(LS_TOKEN);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    else localStorage.removeItem(LS_USER);
  }, [user]);

  async function login({ email, password }) {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const res = await authService.register(payload);
      setToken(res.token);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, setUser, setToken }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

