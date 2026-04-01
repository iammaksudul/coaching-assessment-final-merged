"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Building2,
  Home,
  Users,
  FileText,
  Settings,
  BarChart3,
  Menu,
  LogOut,
  Plus,
  ClipboardList,
  Search,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { EmployerDashboard } from "@/components/employer-dashboard"

const orgNavItems = [
  { href: "/organization-dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/commission", label: "Commission", icon: Plus },
  { href: "/dashboard/request-access", label: "Request Access", icon: Search },
  { href: "/dashboard/access-requests", label: "Access Requests", icon: Bell },
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
          ? "bg-purple-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

function OrgSidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">Coaching Digs</span>
        </Link>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-md">
          <Building2 className="h-3.5 w-3.5 text-purple-600" />
          <span className="text-xs font-semibold text-purple-700">Organization</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {orgNavItems.map((item) => {
          const isActive = item.href === "/organization-dashboard"
            ? pathname === "/organization-dashboard"
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

export default function OrganizationDashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 shadow-sm z-30">
        <OrgSidebarContent />
      </aside>

      {/* Mobile sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <OrgSidebarContent onItemClick={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSheetOpen(true)}
                className="lg:hidden h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
              <Link href="/" className="lg:hidden flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-900">Coaching Digs</span>
              </Link>
              <h1 className="hidden lg:block text-lg font-semibold text-slate-900">Organization Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 hidden md:block">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6">
          <EmployerDashboard />
        </main>
      </div>
    </div>
  )
}
