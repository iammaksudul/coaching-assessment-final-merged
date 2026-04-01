"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession, useAuth } from "@/components/auth-provider"
import { useRouter, usePathname } from "next/navigation"
import { UserAccountNav } from "@/components/user-account-nav"
import { AccessRequestNotifications } from "@/components/access-request-notifications"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Home,
  Users,
  FileText,
  Settings,
  CreditCard,
  AlertTriangle,
  Shield,
  Building2,
  Plus,
  BarChart3,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const participantNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/referees", label: "Referees", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

const adminNavItems = [
  { href: "/dashboard", label: "Admin Dashboard", icon: Shield },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/payments", label: "Payment Issues", icon: AlertTriangle },
  { href: "/pricing", label: "Pricing Plans", icon: Building2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

function NavLink({ href, label, icon: Icon, isActive, onClick }: {
  href: string; label: string; icon: React.ElementType; isActive: boolean; onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const isAdmin = user?.role === "ADMIN" || user?.accountType === "ADMIN"
  const navItems = isAdmin ? adminNavItems : participantNavItems

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">Coaching Digs</span>
        </Link>
      </div>

      {/* Role badge */}
      {isAdmin && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-md">
            <Shield className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">System Admin</span>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)
          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              onClick={onItemClick}
            />
          )
        })}

        {/* New Assessment button for participants */}
        {!isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-200">
            <Link
              href="/dashboard/assessments/new"
              onClick={onItemClick}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-all"
            >
              <Plus className="h-4 w-4 shrink-0" />
              New Assessment
            </Link>
          </div>
        )}
      </nav>

      {/* User info + sign out at bottom */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { onItemClick?.(); signOut() }}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const currentUser = session?.user || { id: "", name: "", email: "", image: null, role: "PARTICIPANT" }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 shadow-sm z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sheet sidebar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent onItemClick={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSheetOpen(true)}
                className="lg:hidden h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
              {/* Mobile logo */}
              <Link href="/" className="lg:hidden flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                  <BarChart3 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-900">Coaching Digs</span>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <AccessRequestNotifications />
              <UserAccountNav user={currentUser} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
