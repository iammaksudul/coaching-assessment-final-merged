"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { PublicHeader } from "@/components/public-header"

const SUBSCRIPTION_TIERS = [
  { value: "FREE", label: "Free (1 assessment lifetime)", price: "Free" },
  { value: "TIER_1_5", label: "Starter (1-5 assessments/month)", price: "$39" },
  { value: "TIER_6_12", label: "Professional (6-12 assessments/month)", price: "$89" },
  { value: "TIER_13_20", label: "Business (13-20 assessments/month)", price: "$139" },
  { value: "TIER_21_40", label: "Enterprise (21-40 assessments/month)", price: "$239" },
  { value: "TIER_40_PLUS", label: "Enterprise Plus (40+ assessments/month)", price: "$389" },
]

export default function EmployerRegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Organization details
    organizationName: "",
    organizationDomain: "",
    billingEmail: "",
    subscriptionTier: "",

    // Account holder details
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    jobTitle: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-populate form with URL parameters
  useEffect(() => {
    const planFromUrl = searchParams.get("plan")
    const billingFromUrl = searchParams.get("billing")

    if (planFromUrl) {
      setFormData((prev) => ({ ...prev, subscriptionTier: planFromUrl }))
    }

    // store for later (doesn’t trigger re-renders)
    if (billingFromUrl) {
      localStorage.setItem("preferredBilling", billingFromUrl)
    }
    // empty dependency array ⇒ runs only once – prevents infinite update loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Organization validation (optional for free tier)
    if (formData.subscriptionTier !== "FREE") {
      if (!formData.organizationName.trim()) {
        newErrors.organizationName = "Organization name is required for paid plans"
      }
      if (!formData.billingEmail.trim()) {
        newErrors.billingEmail = "Billing email is required for paid plans"
      } else if (!/\S+@\S+\.\S+/.test(formData.billingEmail)) {
        newErrors.billingEmail = "Please enter a valid email address"
      }
    }

    if (!formData.subscriptionTier) {
      newErrors.subscriptionTier = "Please select a subscription tier"
    }

    // Account holder validation
    if (!formData.name.trim()) {
      newErrors.name = "Your name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Your email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/employer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Registration failed")
      }

      const { organization, user } = await response.json()

      toast({
        title: "Registration successful!",
        description:
          formData.subscriptionTier === "FREE"
            ? "Your free account has been created. You can now create your first assessment!"
            : "Your organization account has been created. You can now log in.",
      })

      // Redirect based on account type
      if (formData.subscriptionTier === "FREE") {
        router.push("/login?message=free-account-created")
      } else {
        router.push("/employer/login?message=registration-success")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const isFreeAccount = formData.subscriptionTier === "FREE"

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="mx-auto w-full max-w-[600px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isFreeAccount ? "Create Free Account" : "Create Organization Account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isFreeAccount
              ? "Start with a free coachability assessment and upgrade anytime"
              : "Set up your organization to start commissioning Coachability Assessments"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isFreeAccount ? "Account Information" : "Organization Information"}</CardTitle>
            <CardDescription>
              {isFreeAccount
                ? "Create your free account to get started with coachability assessments"
                : "Tell us about your organization and choose your subscription plan"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subscriptionTier">Plan Selection *</Label>
                <Select
                  value={formData.subscriptionTier}
                  onValueChange={(value) => handleInputChange("subscriptionTier", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBSCRIPTION_TIERS.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{tier.label}</span>
                          <span className="ml-2 font-semibold">
                            {tier.price}
                            {tier.value !== "FREE" ? "/month" : ""}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subscriptionTier && <p className="text-sm text-destructive">{errors.subscriptionTier}</p>}
              </div>

              {!isFreeAccount && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name *</Label>
                      <Input
                        id="organizationName"
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange("organizationName", e.target.value)}
                        placeholder="Acme Corporation"
                        disabled={isLoading}
                      />
                      {errors.organizationName && <p className="text-sm text-destructive">{errors.organizationName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationDomain">Email Domain (Optional)</Label>
                      <Input
                        id="organizationDomain"
                        value={formData.organizationDomain}
                        onChange={(e) => handleInputChange("organizationDomain", e.target.value)}
                        placeholder="acme.com"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">Used for automatic team member verification</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingEmail">Billing Email *</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      value={formData.billingEmail}
                      onChange={(e) => handleInputChange("billingEmail", e.target.value)}
                      placeholder="billing@acme.com"
                      disabled={isLoading}
                    />
                    {errors.billingEmail && <p className="text-sm text-destructive">{errors.billingEmail}</p>}
                  </div>

                  <hr className="my-6" />
                </>
              )}

              <div>
                <h3 className="text-lg font-medium mb-4">
                  {isFreeAccount ? "Your Information" : "Account Holder Information"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isFreeAccount
                    ? "This information will be used for your personal coachability assessments."
                    : "This person will be the primary account holder and can invite other team members."}
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="John Smith"
                      disabled={isLoading}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title (Optional)</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                      placeholder="HR Director"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@acme.com"
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                  {isFreeAccount
                    ? " You can upgrade to a paid plan anytime to unlock unlimited assessments."
                    : " You can cancel your subscription at any time."}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-4">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading
                    ? "Creating Account..."
                    : isFreeAccount
                      ? "Create Free Account"
                      : "Create Organization Account"}
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-sm text-muted-foreground hover:underline">
                    Already have an account? Sign in
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
