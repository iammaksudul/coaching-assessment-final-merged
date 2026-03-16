"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { RefereeManagementSystem } from "@/components/referee-management-system"

interface Assessment {
  id: string
  name: string
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "CLOSED"
  self_assessment_completed: boolean
  created_at: string
  can_close_manually: boolean
  closure_requirements: {
    self_assessment: boolean
    minimum_referees: number
    completed_referees: number
  }
}

interface RefereeInvitation {
  id: string
  referee_name: string
  referee_email: string
  relationship: string
  status: "PENDING" | "COMPLETED" | "EXPIRED" | "DECLINED"
  invited_at: string
  expires_at: string
  completed_at?: string
  last_reminder_sent?: string
  reminder_count: number
  survey_token: string
  responses_summary?: {
    total_questions: number
    completed_questions: number
    overall_score: number
  }
}

export default function RefereeManagementPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.assessmentId as string

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [invitations, setInvitations] = useState<RefereeInvitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssessmentData()
  }, [assessmentId])

  const fetchAssessmentData = async () => {
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/referees`)
      if (res.ok) {
        const data = await res.json()
        setAssessment(data.assessment)
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error("Error fetching assessment data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitationUpdate = (updatedInvitations: RefereeInvitation[]) => {
    setInvitations(updatedInvitations)
  }

  const handleAssessmentUpdate = (updatedAssessment: Assessment) => {
    setAssessment(updatedAssessment)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading referee management...</p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Assessment not found.</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    )
  }

  // 👇 NEW – transform invitations into the shape RefereeManagementSystem expects
  const referees = invitations.map((inv) => ({
    id: inv.id,
    name: inv.referee_name,
    email: inv.referee_email,
    relationship: inv.relationship,
    status: inv.status,
    invited_at: inv.invited_at,
    completed_at: inv.completed_at,
    expires_at: inv.expires_at,
    survey_token: inv.survey_token,
  }))

  return (
    <div className="container max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referee Management</h1>
          <p className="text-muted-foreground">Manage referee responses for your assessment</p>
        </div>
      </div>

      {/* Referee Management System */}
      <RefereeManagementSystem
        assessmentId={assessment.id}
        assessmentName={assessment.name}
        candidateName="Alex Johnson"
        referees={referees}
        onRefereeUpdate={() => fetchAssessmentData()}
      />
    </div>
  )
}
