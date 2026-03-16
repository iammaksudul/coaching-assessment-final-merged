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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if it's a test account
    const testAccount = testAccounts[email as keyof typeof testAccounts]
    if (testAccount && password === "password123") {
      setUser(testAccount)
      localStorage.setItem("preview-user", JSON.stringify(testAccount))
      console.log("User signed in:", testAccount)
      setIsLoading(false)
      return true
    }

    // For any other email, create a mock user (for demo purposes)
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
      console.log("Mock user created:", mockUser)
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
