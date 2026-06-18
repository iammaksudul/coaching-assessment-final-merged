"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  BarChart3,
  FileText,
  Users,
  Settings,
  Plus,
  Home,
  Menu,
  CreditCard,
  AlertTriangle,
  Shield,
  Building2,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"

// Participant navigation items
const participantNavItems = [
  { title: "Overview", href: "/dashboard", icon: Home },
  { title: "Referees", href: "/dashboard/referees", icon: Users },
  { title: "Reports", href: "/dashboard?tab=reports", icon: BarChart3 },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

// System Admin navigation items
const adminNavItems = [
  { title: "Admin Dashboard", href: "/dashboard", icon: Shield },
  { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { title: "Payment Issues", href: "/admin/payments", icon: AlertTriangle },
  { title: "Pricing Plans", href: "/pricing", icon: Building2 },
  { title: "System Settings", href: "/dashboard/settings", icon: Settings },
]

interface CollapsibleSidebarProps {
  children: React.ReactNode
}

export function CollapsibleSidebar({ children }: CollapsibleSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Determine which nav items to show based on user role
  const isSystemAdmin = user?.role === "ADMIN" || user?.accountType === "ADMIN"
  const navigationItems = isSystemAdmin ? adminNavItems : participantNavItems

  const SidebarContent = () => (
    <nav className="flex flex-col gap-2 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold px-3 py-2">
          {isSystemAdmin ? "Admin Navigation" : "Navigation"}
        </h2>
        {isSystemAdmin && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-md mx-3">
            <Shield className="h-3 w-3 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">System Admin</span>
          </div>
        )}
      </div>

      {navigationItems.map((item, index) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href)

        return (
          <Link key={index} href={item.href} onClick={() => setIsOpen(false)}>
            <span
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                isActive ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span>{item.title}</span>
            </span>
          </Link>
        )
      })}

      {/* Only show "New Assessment" for participants, not system admins */}
      {!isSystemAdmin && (
        <div className="mt-6 pt-4 border-t">
          <Link href="/dashboard/assessments/new" onClick={() => setIsOpen(false)}>
            <span className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-blue-600 transition-colors">
              <Plus className="mr-3 h-4 w-4" />
              <span>New Assessment</span>
            </span>
          </Link>
        </div>
      )}
    </nav>
  )

  return (
    <div className="flex h-full">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-background">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-20 left-4 z-50 bg-background border shadow-md"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
          </div>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
