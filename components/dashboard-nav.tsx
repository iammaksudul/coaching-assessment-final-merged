"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  FileText,
  Settings,
  CreditCard,
  AlertTriangle,
  Shield,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

// Participant/Referee navigation items
const participantNavItems = [
  { href: "/dashboard", label: "Dashboard Home", icon: Home },
  { href: "/dashboard/referees", label: "Referees", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

// System Admin navigation items
const adminNavItems = [
  { href: "/dashboard", label: "Admin Dashboard", icon: Shield },
  { href: "/admin/subscriptions", label: "Manage Subscriptions", icon: CreditCard },
  { href: "/admin/payments", label: "Payment Issues", icon: AlertTriangle },
  { href: "/pricing", label: "Pricing Plans", icon: Building2 },
  { href: "/dashboard/settings", label: "System Settings", icon: Settings },
]

export function DashboardNav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()

  // Determine which nav items to show based on user role
  const isSystemAdmin = user?.role === "ADMIN" || user?.accountType === "ADMIN"
  const navItems = isSystemAdmin ? adminNavItems : participantNavItems

  return (
    <nav className="p-4">
      {/* Role indicator for system admins */}
      {isSystemAdmin && (
        <div className="mb-4 pb-3 border-b">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-md">
            <Shield className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">System Admin</span>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
export default DashboardNav
