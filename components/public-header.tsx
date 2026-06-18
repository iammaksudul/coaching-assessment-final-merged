"use client"

import Link from "next/link"
import { BarChart3 } from "lucide-react"

export function PublicHeader() {
  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Coaching Digs</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-gray-600 hover:text-gray-900 hidden sm:inline">Home</Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 hidden sm:inline">Pricing</Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900 hidden sm:inline">Contact</Link>
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">Sign In</Link>
          <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">Register</Link>
        </nav>
      </div>
    </header>
  )
}
