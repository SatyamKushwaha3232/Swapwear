import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getBackendSession, logoutBackend } from "../services/backendAuth";

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

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      isAuthenticated: Boolean(user),
      signOut: logoutBackend,
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
