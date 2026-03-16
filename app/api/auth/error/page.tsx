"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

const ERROR_MESSAGES = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessage =
    error && ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES]
      ? ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES]
      : ERROR_MESSAGES.Default

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>There was a problem signing you in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">Try Again</Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/">Go Home</Link>
              </Button>
            </div>

            {/* Preview mode notice */}
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <p className="font-medium">Preview Mode</p>
              <p>If you're seeing this error, the application is running in preview mode with limited functionality.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
