import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getBackendSession,
  loginWithBackend,
  logoutBackend,
  signupWithBackend,
} from "../services/backendAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const backendSession = await getBackendSession();

        if (!mounted) return;

        setSession(backendSession.session);
        setUser(backendSession.user);
      } catch (error) {
        console.error("Auth init failed:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  async function signIn(email, password) {
    const auth = await loginWithBackend(email, password);
    setSession(auth.session);
    setUser(auth.user);
    return auth;
  }

  async function signUp(payload) {
    const auth = await signupWithBackend(payload);
    setSession(auth.session);
    setUser(auth.user);
    return auth;
  }

  async function signOut() {
    await logoutBackend();
    setSession(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      isAuthenticated: Boolean(user),
      signIn,
      signUp,
      signOut,
    }),
    [session, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
