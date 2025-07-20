"use client";

import type React from "react";
import { createContext, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { loginUser, signupUser, logoutUser } from "@/app/auth/actions";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller" | "customer";
};

type AuthContextType = {
  user: User | null;
  login: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  signup: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  token: string | null;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
  loading: true,
  token: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/session", {
          credentials: "include", // Automatically send cookies
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(data.token);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error("Session fetch failed", err);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = await loginUser(formData);

      if (result.success && result.token && result.user) {
        setUser({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        });
        setToken(result.token);

        if (result.user.role === "admin") {
          router.push("/admin/dashboard");
        } else if (result.user.role === "seller") {
          router.push("/seller/dashboard");
        } else {
          router.push("/customer/dashboard");
        }

        return { success: true };
      } else {
        return { success: false, error: result.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = await signupUser(formData);

      if (result.success) {
        if (result.token && result.user) {
          setUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
          });
          setToken(result.token);

          if (result.user.role === "admin") {
            router.push("/admin/dashboard");
          } else if (result.user.role === "customer") {
            router.push("/customer/dashboard");
          }
        } else {
          router.push("/auth/application-submitted");
        }

        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error || "Signup failed" };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await logoutUser();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const contextValue = useMemo(
    () => ({ user, login, signup, logout, loading, token }),
    [user, token, loading]
  );

  console.log("AuthProvider context value:", contextValue);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}