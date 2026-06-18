"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Simple auth context without NextAuth
interface AuthContextType {
  user: any | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start with loading true

  // Check for existing session on mount
  // Patch fetch to auto-add x-user-id for API calls
  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
      if (url.startsWith("/api/")) {
        const headers = new Headers(init?.headers)
        if (!headers.has("x-user-id")) {
          try {
            const stored = localStorage.getItem("auth-user")
            if (stored) {
              const u = JSON.parse(stored)
              if (u?.id) headers.set("x-user-id", u.id)
            }
          } catch {}
        }
        return originalFetch(input, { ...init, headers })
      }
      return originalFetch(input, init)
    }
    return () => { window.fetch = originalFetch }
  }, [])

  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const storedUser = localStorage.getItem("auth-user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("Restored user session:", parsedUser)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("Error restoring session:", error)
        localStorage.removeItem("auth-user")
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Try real DB login
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          localStorage.setItem("auth-user", JSON.stringify(data.user))
          setIsLoading(false)
          return true
        }
      }
    } catch (err) {
      console.error("Login request failed:", err)
    }

    setIsLoading(false)
    return false
  }

  const signOut = () => {
    console.log("User signed out:", user)
    setUser(null)
    localStorage.removeItem("auth-user")

    // Graceful redirect to home page
    router.push("/")
  }

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export for compatibility with existing code
export const useSession = () => {
  const { user, isLoading } = useAuth()
  return {
    data: user ? { user } : null,
    status: isLoading ? "loading" : user ? "authenticated" : "unauthenticated",
  }
}
