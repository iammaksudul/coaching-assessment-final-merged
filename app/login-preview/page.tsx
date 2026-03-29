"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPreview() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const testAccounts = [
    {
      id: "alex-johnson-preview",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      role: "PARTICIPANT",
      description: "Candidate with multiple assessments",
    },
    {
      id: "employer-preview",
      name: "John Smith",
      email: "employer@example.com",
      role: "EMPLOYER",
      description: "Employer account with organization access",
    },
    {
      id: "sarah-williams-preview",
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      role: "PARTICIPANT",
      description: "Candidate with pending assessments",
    },
    {
      id: "admin-preview",
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
      description: "Administrator account",
    },
  ]

  const handleLogin = (userId: string) => {
    setLoading(userId)

    // In a real implementation, this would authenticate the user
    // For preview, we'll just redirect to the dashboard
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight"> Login</h1>
          <p className="text-sm text-muted-foreground">Select a test account to explore the application</p>
        </div>

        <div className="grid gap-4">
          {testAccounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-2">
                <CardTitle>{account.name}</CardTitle>
                <CardDescription>{account.email}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm">
                  <span className="font-medium">Role:</span> {account.role}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{account.description}</div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleLogin(account.id)} disabled={loading === account.id}>
                  {loading === account.id ? "Signing in..." : `Sign in as ${account.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
