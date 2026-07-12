import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { createProfile } from "../lib/profile";
import { backendAuthEnabled } from "../lib/backendApi";
import { getBackendSession, logoutBackend } from "../services/backendAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function safeCreateProfile(currentUser) {
    try {
      if (!currentUser?.id) return;
      await createProfile(currentUser);
    } catch (error) {
      console.error("Profile sync failed:", error);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (backendAuthEnabled) {
          const backendSession = await getBackendSession();

          if (!mounted) return;

          setSession(backendSession.session);
          setUser(backendSession.user);
          return;
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth session error:", error.message);
        }

        const currentSession = data?.session || null;
        const currentUser = currentSession?.user || null;

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
          safeCreateProfile(currentUser);
        }
      } catch (error) {
        console.error("Auth init failed:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    if (backendAuthEnabled) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUser = nextSession?.user || null;

      setSession(nextSession || null);
      setUser(nextUser);
      setLoading(false);

      if (nextUser) {
        safeCreateProfile(nextUser);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      isAuthenticated: Boolean(user),
      signOut: backendAuthEnabled ? logoutBackend : () => supabase.auth.signOut(),
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
