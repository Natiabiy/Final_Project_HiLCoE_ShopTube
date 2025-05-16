"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
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
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("shoptube-token")
        if (storedToken) {
          // Verify and decode the token
          const decoded = jwtDecode<any>(storedToken)

          // Check if token is expired
          const currentTime = Date.now() / 1000
          if (decoded.exp && decoded.exp < currentTime) {
            // Token is expired
            localStorage.removeItem("shoptube-token")
            setUser(null)
            setToken(null)
          } else {
            // Token is valid
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
        // Store token in localStorage for client-side auth
        localStorage.setItem("shoptube-token", result.token)

        // Set user and token in state
        setUser({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        })
        setToken(result.token)

        // Redirect based on user role
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
        // Only store token and set user if not a seller application
        if (result.token && result.user) {
          // Store token in localStorage for client-side auth
          localStorage.setItem("shoptube-token", result.token)

          // Set user and token in state
          setUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
          })
          setToken(result.token)

          // Redirect based on user role
          if (result.user.role === "admin") {
            router.push("/admin/dashboard")
          } else if (result.user.role === "customer") {
            router.push("/customer/dashboard")
          }
        } else {
          // For seller applications, redirect to a thank you page
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

      // Call the server action to clear the cookie
      await logoutUser()

      // Handle the redirect on the client side
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, loading, token }}>{children}</AuthContext.Provider>
}
