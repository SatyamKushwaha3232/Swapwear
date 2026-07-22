import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  // A slow initial session restore must never overwrite a newer login/logout.
  const authActionVersion = useRef(0);

  useEffect(() => {
    let mounted = true;
    const restoreVersion = authActionVersion.current;

    async function initAuth() {
      try {
        const backendSession = await getBackendSession();

        if (!mounted || restoreVersion !== authActionVersion.current) return;

        setSession(backendSession.session);
        setUser(backendSession.user);
      } catch {
        if (!mounted || restoreVersion !== authActionVersion.current) return;
        setSession(null);
        setUser(null);
      } finally {
        // Even when a login supersedes this restore, protected routes must
        // stop waiting for the obsolete startup request.
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    authActionVersion.current += 1;
    const auth = await loginWithBackend(email, password);
    setSession(auth.session);
    setUser(auth.user);
    return auth;
  }, []);

  const signUp = useCallback(async (payload) => {
    authActionVersion.current += 1;
    const auth = await signupWithBackend(payload);
    setSession(auth.session);
    setUser(auth.user);
    return auth;
  }, []);

  const signInWithPhone = useCallback(async (payload) => {
    authActionVersion.current += 1;
    const auth = await verifyBackendPhoneOtp(payload);
    setSession(auth.session);
    setUser(auth.user);
    return auth;
  }, []);

  const signOut = useCallback(async () => {
    authActionVersion.current += 1;
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
