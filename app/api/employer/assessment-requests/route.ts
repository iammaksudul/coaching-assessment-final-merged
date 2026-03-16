import { NextResponse } from "next/server"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
interface SponsoredAssessment {
  id: string
  assessment_id: string
  candidate_email: string
  candidate_name: string
  status: string
  assessment_name: string
  assessment_status: string
  organization_name: string
  sponsored_by_name: string
  created_at: string
  expires_at: string
  responded_at: string | null
  decline_message: string | null
}

interface AccessRequest {
  id: string
  assessment_id: string
  candidate_email: string
  candidate_name: string
  assessment_name: string
  status: string
  requested_by_name: string
  organization_name: string
  requested_at: string
  expires_at: string
}

interface AssessmentRequestsResponse {
  sponsoredAssessments: SponsoredAssessment[]
  accessRequests: AccessRequest[]
}

/* -------------------------------------------------------------------------- */
/*  GET /api/employer/assessment-requests                                     */
/*  – In preview we return static mock data                                   */
/*  – In production you’ll replace the TODO with DB / auth logic              */
/* -------------------------------------------------------------------------- */
export async function GET() {
  try {
    /* ---------- TODO: replace with real DB & auth logic ---------- */
    const now = Date.now()

    const mockData: AssessmentRequestsResponse = {
      sponsoredAssessments: [
        {
          id: "mock-sa-1",
          assessment_id: "mock-assmnt-1",
          candidate_email: "alex.candidate@example.com",
          candidate_name: "Alex Candidate",
          status: "PENDING",
          assessment_name: "Leadership Potential",
          assessment_status: "IN_PROGRESS",
          organization_name: "Preview Org",
          sponsored_by_name: "John Smith",
          created_at: new Date(now - 86_400_000).toISOString(), // 1 day ago
          expires_at: new Date(now + 1_209_600_000).toISOString(), // +14 days
          responded_at: null,
          decline_message: null,
        },
      ],
      accessRequests: [
        {
          id: "mock-ar-1",
          assessment_id: "mock-assmnt-2",
          candidate_email: "jane.doe@example.com",
          candidate_name: "Jane Doe",
          assessment_name: "360 Feedback",
          status: "APPROVED",
          requested_by_name: "Hiring Manager",
          organization_name: "Preview Org",
          requested_at: new Date(now - 604_800_000).toISOString(), // 7 days ago
          expires_at: new Date(now + 2_592_000_000).toISOString(), // +30 days
        },
      ],
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("assessment-requests route failed → fallback to empty arrays", error)

    const empty: AssessmentRequestsResponse = {
      sponsoredAssessments: [],
      accessRequests: [],
    }
    return NextResponse.json(empty)
  }
}
