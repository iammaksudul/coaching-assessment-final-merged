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

  // Test accounts for preview mode with DISTINCT data
  const testAccounts = {
    "alex.johnson@preview.com": {
      id: "alex-johnson-preview",
      email: "alex.johnson@preview.com",
      name: "Alex Johnson",
      role: "PARTICIPANT",
      accountType: "SELF_CREATED",
    },
    "employer@preview.com": {
      id: "employer-preview",
      email: "employer@preview.com",
      name: "John Smith",
      role: "EMPLOYER",
      accountType: "EMPLOYER",
    },
    "sarah.wilson@preview.com": {
      id: "sarah-wilson-preview",
      email: "sarah.wilson@preview.com",
      name: "Sarah Wilson",
      role: "REFEREE", // Sarah is a referee who also has personal assessments
      accountType: "REFEREE_PARTICIPANT",
    },
    "mike.chen@preview.com": {
      id: "mike-chen-preview",
      email: "mike.chen@preview.com",
      name: "Mike Chen",
      role: "ADMIN",
      accountType: "ADMIN",
    },
  }

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
            const stored = localStorage.getItem("preview-user")
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
        const storedUser = localStorage.getItem("preview-user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("Restored user session:", parsedUser)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("Error restoring session:", error)
        localStorage.removeItem("preview-user")
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Check test accounts first (preview mode)
    const testAccount = testAccounts[email as keyof typeof testAccounts]
    if (testAccount && password === "password123") {
      setUser(testAccount)
      localStorage.setItem("preview-user", JSON.stringify(testAccount))
      setIsLoading(false)
      return true
    }

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
          localStorage.setItem("preview-user", JSON.stringify(data.user))
          setIsLoading(false)
          return true
        }
      }
    } catch {}

    // Fallback: create mock user for demo
    if (email && password) {
      const mockUser = {
        id: `user-${Date.now()}`,
        email: email,
        name: email
          .split("@")[0]
          .replace(".", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        role: "PARTICIPANT",
        accountType: "SELF_CREATED",
      }
      setUser(mockUser)
      localStorage.setItem("preview-user", JSON.stringify(mockUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const signOut = () => {
    console.log("User signed out:", user)
    setUser(null)
    localStorage.removeItem("preview-user")

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
