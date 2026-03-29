"use client"

import type React from "react"
import { useState } from "react"
import { useSession } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserAccountNav } from "@/components/user-account-nav"
import { AccessRequestNotifications } from "@/components/access-request-notifications"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const currentUser = session?.user || { id: "", name: "", email: "", image: null, role: "PARTICIPANT" }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/"><span className="text-xl font-bold cursor-pointer">Coaching Digs</span></Link>
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <AccessRequestNotifications />
            <UserAccountNav user={currentUser} />
          </div>
        </div>

        {/* Dropdown Navigation Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 bg-background border-b shadow-lg">
            <div className="px-6 py-4">
              <DashboardNav onItemClick={() => setIsMenuOpen(false)} />
            </div>
          </div>
        )}
      </header>

      {/* Main Content - Full Width */}
      <main className="flex-1 w-full">
        <div className="w-full px-6 py-6">{children}</div>
      </main>

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setIsMenuOpen(false)} />}
    </div>
  )
}
