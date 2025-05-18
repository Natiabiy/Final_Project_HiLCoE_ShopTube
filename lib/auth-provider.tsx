"use client"

import type React from "react"
import { createContext, useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { loginUser, signupUser, logoutUser } from "@/app/auth/actions"

type User = {
  id: string
  name: string
  email: string
  role: "admin" | "seller" | "customer"
}

type AuthContextType = {
  user: User | null
  login: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  signup: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  loading: boolean
  token: string | null
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
  loading: true,
  token: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("shoptube-token")
        if (storedToken) {
          const decoded = jwtDecode<any>(storedToken)
          const currentTime = Date.now() / 1000
          if (decoded.exp && decoded.exp < currentTime) {
            localStorage.removeItem("shoptube-token")
            setUser(null)
            setToken(null)
          } else {
            setUser({
              id: decoded.sub,
              name: decoded.name,
              email: decoded.email,
              role: decoded.role,
            })
            setToken(storedToken)
          }
        }
      } catch (error) {
        console.error("Authentication error:", error)
        localStorage.removeItem("shoptube-token")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (formData: FormData) => {
    setLoading(true)
    try {
      const result = await loginUser(formData)

      if (result.success && result.token && result.user) {
        localStorage.setItem("shoptube-token", result.token)
        setUser({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        })
        setToken(result.token)

        if (result.user.role === "admin") {
          router.push("/admin/dashboard")
        } else if (result.user.role === "seller") {
          router.push("/seller/dashboard")
        } else {
          router.push("/customer/dashboard")
        }

        return { success: true }
      } else {
        return { success: false, error: result.error || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (formData: FormData) => {
    setLoading(true)
    try {
      const result = await signupUser(formData)

      if (result.success) {
        if (result.token && result.user) {
          localStorage.setItem("shoptube-token", result.token)
          setUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
          })
          setToken(result.token)

          if (result.user.role === "admin") {
            router.push("/admin/dashboard")
          } else if (result.user.role === "customer") {
            router.push("/customer/dashboard")
          }
        } else {
          router.push("/auth/application-submitted")
        }

        return { success: true, message: result.message }
      } else {
        return { success: false, error: result.error || "Signup failed" }
      }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      localStorage.removeItem("shoptube-token")
      setUser(null)
      setToken(null)
      await logoutUser()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Memoize the context value
  const contextValue = useMemo(
    () => ({ user, login, signup, logout, loading, token }),
    [user, token, loading] // Only re-compute when these change
  )

  console.log("AuthProvider context value:", contextValue)

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}