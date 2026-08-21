import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "../api/trpc";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: () => {},
});

const API_URL = "http://localhost:3000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedToken = await SecureStore.getItemAsync("auth_token");
      if (storedToken) {
        setToken(storedToken);
        setAuthToken(storedToken);
        await fetchSession(storedToken);
      }
      setIsLoading(false);
    })();
  }, []);

  async function fetchSession(sessionToken: string) {
    try {
      const res = await fetch(`${API_URL}/api/auth/session`, {
        headers: { Cookie: `authjs.session-token=${sessionToken}` },
      });
      const session = await res.json();
      if (session?.user) {
        setUser(session.user);
      } else {
        await SecureStore.deleteItemAsync("auth_token");
        setToken(null);
        setAuthToken(null);
        setUser(null);
      }
    } catch {
      // Offline or server down — keep stored token
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const csrfRes = await fetch(`${API_URL}/api/auth/csrf`);
      const { csrfToken } = await csrfRes.json();
      const csrfCookie = csrfRes.headers.getSetCookie?.()?.map(c => c.split(";")[0]).join("; ") ?? "";

      const res = await fetch(`${API_URL}/api/auth/callback/credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: csrfCookie,
        },
        body: new URLSearchParams({ email, password, csrfToken, json: "true" }),
        redirect: "manual",
      });

      const setCookies = res.headers.getSetCookie?.() ?? [];
      const sessionCookie = setCookies
        .find(c => c.startsWith("authjs.session-token="))
        ?.split(";")[0]
        ?.replace("authjs.session-token=", "");

      if (sessionCookie) {
        await SecureStore.setItemAsync("auth_token", sessionCookie);
        setToken(sessionCookie);
        setAuthToken(sessionCookie);
        await fetchSession(sessionCookie);
        return {};
      }
      return { error: "Invalid credentials" };
    } catch {
      return { error: "Network error" };
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      const csrfRes = await fetch(`${API_URL}/api/auth/csrf`);
      const { csrfToken } = await csrfRes.json();
      const csrfCookie = csrfRes.headers.getSetCookie?.()?.map(c => c.split(";")[0]).join("; ") ?? "";

      const res = await fetch(`${API_URL}/api/auth/callback/credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: csrfCookie,
        },
        body: new URLSearchParams({ email, password, name, isSignUp: "true", csrfToken, json: "true" }),
        redirect: "manual",
      });

      const setCookies = res.headers.getSetCookie?.() ?? [];
      const sessionCookie = setCookies
        .find(c => c.startsWith("authjs.session-token="))
        ?.split(";")[0]
        ?.replace("authjs.session-token=", "");

      if (sessionCookie) {
        await SecureStore.setItemAsync("auth_token", sessionCookie);
        setToken(sessionCookie);
        setAuthToken(sessionCookie);
        await fetchSession(sessionCookie);
        return {};
      }
      return { error: "Email already in use" };
    } catch {
      return { error: "Network error" };
    }
  }

  async function signOut() {
    await SecureStore.deleteItemAsync("auth_token");
    setToken(null);
    setAuthToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
