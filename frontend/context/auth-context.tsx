"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, UserOut } from "@/lib/api";

interface AuthContextValue {
  user: UserOut | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("eh_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  async function signIn(email: string, password: string) {
    const { access_token, user } = await apiLogin(email, password);
    localStorage.setItem("eh_token", access_token);
    localStorage.setItem("eh_user", JSON.stringify(user));
    setUser(user);
    router.push("/dashboard");
  }

  function signOut() {
    localStorage.removeItem("eh_token");
    localStorage.removeItem("eh_user");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
