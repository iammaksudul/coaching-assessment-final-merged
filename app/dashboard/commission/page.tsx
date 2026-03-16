"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft, Send, Upload } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CommissionAssessmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    assessmentName: "",
    message: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/assessments/commission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateName: formData.candidateName,
          candidateEmail: formData.candidateEmail,
          assessmentName: formData.assessmentName || `Coachability Assessment for ${formData.candidateName}`,
          message: formData.message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to commission assessment")
      }

      const result = await response.json()

      toast({
        title: "Assessment Commissioned Successfully",
        description: `Invitation sent to ${formData.candidateEmail}`,
      })

      // Reset form
      setFormData({
        candidateName: "",
        candidateEmail: "",
        assessmentName: "",
        message: "",
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Error commissioning assessment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to commission assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.candidateName.trim() && formData.candidateEmail.trim()

  return (
    <div className="container max-w-2xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Commission Assessment</h1>
        <p className="text-muted-foreground mt-2">Invite a candidate to complete a coachability assessment</p>
      </div>

      {/* Preview Mode Notice */}
      <Alert className="mb-6">
        <AlertDescription>
          <strong>Preview Mode:</strong> In the full system, this would create a real user account and send an actual
          email invitation.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Candidate Information
          </CardTitle>
          <CardDescription>Enter the candidate's details to commission their coachability assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Candidate Name */}
            <div className="space-y-2">
              <Label htmlFor="candidateName">Candidate Name *</Label>
              <Input
                id="candidateName"
                type="text"
                placeholder="John Smith"
                value={formData.candidateName}
                onChange={(e) => handleInputChange("candidateName", e.target.value)}
                required
              />
            </div>

            {/* Candidate Email */}
            <div className="space-y-2">
              <Label htmlFor="candidateEmail">Candidate Email *</Label>
              <Input
                id="candidateEmail"
                type="email"
                placeholder="john.smith@company.com"
                value={formData.candidateEmail}
                onChange={(e) => handleInputChange("candidateEmail", e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                If this email doesn't exist in our system, we'll create an account for the candidate
              </p>
            </div>

            {/* Assessment Name (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="assessmentName">Assessment Name (Optional)</Label>
              <Input
                id="assessmentName"
                type="text"
                placeholder="Q1 Leadership Assessment"
                value={formData.assessmentName}
                onChange={(e) => handleInputChange("assessmentName", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Leave blank to use default name</p>
            </div>

            {/* Personal Message (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Hi John, we'd like you to complete this coachability assessment as part of our development program..."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">This message will be included in the invitation email</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={!isFormValid || isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Commission Assessment
                  </>
                )}
              </Button>
              <Link href="/dashboard/commission/bulk">
                <Button type="button" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">What happens next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
              1
            </div>
            <p className="text-sm">The candidate receives an email invitation with login instructions</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
              2
            </div>
            <p className="text-sm">They complete the 12-domain coachability self-assessment</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
              3
            </div>
            <p className="text-sm">They nominate referees who provide additional feedback</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
              4
            </div>
            <p className="text-sm">You receive access to the completed assessment report</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
