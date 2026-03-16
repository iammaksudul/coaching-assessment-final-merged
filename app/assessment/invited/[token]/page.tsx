"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { ConsentDialog } from "@/components/consent-dialog"

interface InvitationData {
  id: string
  assessment_name: string
  candidate_email: string
  candidate_name: string
  organization_name: string
  organization_contact: string
  personal_message: string
  expires_at: string
  status: string
}

export default function AssessmentInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showConsent, setShowConsent] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)

  useEffect(() => {
    fetchInvitation()
  }, [token])

  const fetchInvitation = async () => {
    try {
      // Mock data for preview mode
      const mockInvitation: InvitationData = {
        id: "invite-123",
        assessment_name: "Leadership Development Assessment",
        candidate_email: "candidate@example.com",
        candidate_name: "Jane Doe",
        organization_name: "Preview Organization",
        organization_contact: "John Smith (employer@preview.com)",
        personal_message:
          "We would like to invite you to complete a coachability assessment as part of our evaluation process. This assessment will help us understand your development potential and coaching readiness.",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "PENDING",
      }

      setInvitation(mockInvitation)
    } catch (err) {
      setError("Failed to load invitation details")
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = () => {
    setShowConsent(true)
  }

  const handleConsent = async (consents: any) => {
    setAccepting(true)
    try {
      // Mock acceptance - in real app would call API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect to assessment
      router.push("/assessment-preview")
    } catch (err) {
      setError("Failed to accept invitation")
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = async () => {
    if (!confirm("Are you sure you want to decline this assessment invitation?")) {
      return
    }

    setDeclining(true)
    try {
      // Mock decline - in real app would call API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setInvitation((prev) => (prev ? { ...prev, status: "DECLINED" } : null))
    } catch (err) {
      setError("Failed to decline invitation")
    } finally {
      setDeclining(false)
    }
  }

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-6 h-6" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error || "This invitation link is invalid or has expired."}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invitation.status === "ACCEPTED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Already Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You have already accepted this assessment invitation.</p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invitation.status === "DECLINED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-600">
              <XCircle className="w-6 h-6" />
              Invitation Declined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You have declined this assessment invitation.</p>
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isExpired(invitation.expires_at)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Clock className="w-6 h-6" />
              Invitation Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This invitation expired on {formatExpirationDate(invitation.expires_at)}.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Please contact {invitation.organization_name} if you would like to request a new invitation.
            </p>
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Assessment Invitation</h1>
          <p className="text-lg text-muted-foreground">You've been invited to complete a coachability assessment</p>
        </div>

        {/* Main Invitation Card */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="w-6 h-6 text-blue-600" />
              {invitation.organization_name}
            </CardTitle>
            <CardDescription className="text-base">has invited you to complete an assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Assessment Details */}
            <div className="bg-blue-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Assessment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Assessment Name:</span>
                    <p className="font-medium">{invitation.assessment_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Candidate:</span>
                    <p className="font-medium">{invitation.candidate_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{invitation.candidate_email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expires:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatExpirationDate(invitation.expires_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Contact Person:</h4>
                <p className="text-sm">{invitation.organization_contact}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Personal Message:</h4>
                <p className="text-sm leading-relaxed">{invitation.personal_message}</p>
              </div>
            </div>

            {/* What to Expect */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">What to Expect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Complete a self-assessment across 12 coachability domains (approximately 20 minutes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Select referees who will provide feedback about your coachability</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Receive a comprehensive report with insights and development recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your results will be shared with {invitation.organization_name} upon completion</span>
                </li>
              </ul>
            </div>

            {/* Privacy Notice */}
            <Alert>
              <AlertDescription className="text-sm">
                By accepting this invitation, you consent to sharing your assessment results with{" "}
                {invitation.organization_name}. You will be asked to review and provide detailed consent before
                beginning the assessment.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleAccept}
                disabled={accepting || declining}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base"
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
              <Button
                onClick={handleDecline}
                disabled={accepting || declining}
                variant="outline"
                className="flex-1 h-12 text-base bg-transparent"
              >
                {declining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    Decline
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you have any questions about this assessment or the invitation, please contact{" "}
              {invitation.organization_contact} at {invitation.organization_name}.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Consent Dialog */}
      {showConsent && invitation && (
        <ConsentDialog
          isOpen={showConsent}
          onClose={() => setShowConsent(false)}
          onConsent={handleConsent}
          assessment={{
            id: invitation.id,
            name: invitation.assessment_name,
            sponsored_by: invitation.organization_name,
            sponsor_contact: invitation.organization_contact,
            sponsor_message: invitation.personal_message,
            expires_at: invitation.expires_at,
          }}
        />
      )}
    </div>
  )
}
