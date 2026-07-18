import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getBackendSession,
  loginWithBackend,
  logoutBackend,
  verifyBackendPhoneOtp,
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
      } catch {
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const auth = await loginWithBackend(email, password);
    setSession(auth.session);
    setUser(auth.user);
    return auth;
  }, []);

  const signUp = useCallback(async (payload) => {
    const auth = await signupWithBackend(payload);
    setSession(auth.session);
    setUser(auth.user);
    return auth;
  }, []);

  const signInWithPhone = useCallback(async (payload) => {
    const auth = await verifyBackendPhoneOtp(payload);
    setSession(auth.session);
    setUser(auth.user);
    return auth;
  }, []);

  const signOut = useCallback(async () => {
    await logoutBackend();
    setSession(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      isAuthenticated: Boolean(user),
      signIn,
      signUp,
      signInWithPhone,
      signOut,
    }),
    [session, user, loading, signIn, signUp, signInWithPhone, signOut]
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
