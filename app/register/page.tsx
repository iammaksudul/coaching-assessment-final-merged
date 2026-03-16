"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    privacyConsent: z.boolean().refine((val) => val === true, {
      message: "You must agree to the privacy terms to continue",
    }),
    termsConsent: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms and Conditions to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Registration failed")
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully. Redirecting to login...",
      })

      // Redirect to login page with success message
      // The user will sign in from the login page
      router.push("/login?registered=true")
    } catch (error: any) {
      console.error("[v0] Registration error:", error)
      setError(error.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      // Google OAuth is not configured in preview mode
      // Show a helpful message instead
      toast({
        title: "Google Sign-In",
        description: "Google authentication is available in production. Please use email registration for now.",
      })
    } catch (error) {
      console.error("Google sign in error:", error)
      setError("Google sign in failed. Please try again.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CD</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Coaching Digs</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground mt-2">Enter your information to create an account</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 max-w-md mx-auto">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Account Details */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-medium mb-4">Account Details</h2>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      disabled={isLoading || isGoogleLoading}
                      {...register("name")}
                    />
                    {errors?.name && <p className="px-1 text-xs text-red-600">{errors.name.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading || isGoogleLoading}
                      {...register("email")}
                    />
                    {errors?.email && <p className="px-1 text-xs text-red-600">{errors.email.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="new-password"
                      disabled={isLoading || isGoogleLoading}
                      {...register("password")}
                    />
                    {errors?.password && <p className="px-1 text-xs text-red-600">{errors.password.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="new-password"
                      disabled={isLoading || isGoogleLoading}
                      {...register("confirmPassword")}
                    />
                    {errors?.confirmPassword && (
                      <p className="px-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Consents */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-medium mb-4">Terms & Privacy</h2>
                <div className="space-y-4">
                  {/* Privacy Consent */}
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-700 mb-3">
                      If you share your Coaching Digs report with an employer or prospective employer, 
                      their representatives will have access to scores (yours, and those of referees) 
                      across 12 coachability domains. They will not see individual raw comments from 
                      your Referees, nor recommendations generated by Coaching Digs.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="privacyConsent"
                        disabled={isLoading || isGoogleLoading}
                        onCheckedChange={(checked) => {
                          const event = {
                            target: {
                              name: "privacyConsent",
                              value: checked === true,
                            },
                          }
                          register("privacyConsent").onChange(event)
                        }}
                      />
                      <Label
                        htmlFor="privacyConsent"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        I Agree
                      </Label>
                    </div>
                    {errors?.privacyConsent && (
                      <p className="px-1 text-xs text-red-600 mt-2">{errors.privacyConsent.message}</p>
                    )}
                  </div>

                  {/* Terms and Conditions Consent */}
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="termsConsent"
                        disabled={isLoading || isGoogleLoading}
                        onCheckedChange={(checked) => {
                          const event = {
                            target: {
                              name: "termsConsent",
                              value: checked === true,
                            },
                          }
                          register("termsConsent").onChange(event)
                        }}
                      />
                      <Label
                        htmlFor="termsConsent"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        I agree to the{" "}
                        <Link 
                          href="/terms" 
                          className="text-blue-600 hover:underline"
                          target="_blank"
                        >
                          Terms and Conditions
                        </Link>
                        {" "}for Coaching Digs.
                      </Label>
                    </div>
                    {errors?.termsConsent && (
                      <p className="px-1 text-xs text-red-600 mt-2">{errors.termsConsent.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons Section */}
            <div className="mt-6 max-w-md mx-auto space-y-4">
              <Button className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50 px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                type="button" 
                className="w-full"
                disabled={isLoading || isGoogleLoading} 
                onClick={handleGoogleSignIn}
              >
                {isGoogleLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.google className="mr-2 h-4 w-4" />
                )}{" "}
                Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="hover:text-brand underline underline-offset-4">
                  Already have an account? Sign In
                </Link>
              </p>

              {/* Preview mode notice */}
              <div className="rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <p className="font-medium">Preview Mode</p>
                <p>Registration will work for demonstration purposes.</p>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
