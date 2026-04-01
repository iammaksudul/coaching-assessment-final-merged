"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession, useAuth } from "@/components/auth-provider"
import { useRouter, usePathname } from "next/navigation"
import { UserAccountNav } from "@/components/user-account-nav"
import { AccessRequestNotifications } from "@/components/access-request-notifications"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
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
  ClipboardList,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const participantNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/assessments/new", label: "New Assessment", icon: Plus },
  { href: "/dashboard/referees", label: "Referees", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

const employerNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/commission", label: "Commission", icon: ClipboardList },
  { href: "/dashboard/request-access", label: "Request Access", icon: FileText },
  { href: "/dashboard/access-requests", label: "Access Requests", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

const adminNavItems = [
  { href: "/dashboard", label: "Admin Dashboard", icon: Shield },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/payments", label: "Payment Issues", icon: AlertTriangle },
  { href: "/admin/pricing", label: "Manage Pricing", icon: Building2 },
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
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
  const isEmployer = user?.role === "EMPLOYER" || user?.accountType === "EMPLOYER"
  const navItems = isAdmin ? adminNavItems : isEmployer ? employerNavItems : participantNavItems
  const roleLabel = isAdmin ? "System Admin" : isEmployer ? "Employer" : null

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Logo */}
      <div className="px-4 py-5 border-b">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Coaching Digs</span>
        </Link>
      </div>

      {/* Role badge */}
      {roleLabel && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">{roleLabel}</span>
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
      </nav>

      {/* Theme toggle */}
      <div className="px-4 pb-2">
        <ThemeToggle />
      </div>

      {/* User info + sign out */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { onItemClick?.(); signOut() }}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const currentUser = session?.user || { id: "", name: "", email: "", image: null, role: "PARTICIPANT" }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r shadow-sm z-30">
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
        <header className="sticky top-0 z-20 bg-card border-b shadow-sm">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSheetOpen(true)}
                className="lg:hidden h-9 w-9"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
              <Link href="/" className="lg:hidden flex items-center gap-2">
                <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                  <BarChart3 className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Coaching Digs</span>
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
