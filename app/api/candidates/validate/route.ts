import { NextResponse } from "next/server"
import { getUserByEmail, getAssessmentsByUserId } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { candidates } = await req.json()

    if (!Array.isArray(candidates)) {
      return NextResponse.json({ error: "Invalid candidates data" }, { status: 400 })
    }

    // Known preview accounts for demo
    const previewAccounts: Record<string, any> = {
      "alex.johnson@preview.com": {
        name: "Alex Johnson",
        existingAssessments: [
          {
            id: "alex-assessment-1",
            name: "Q1 Performance Review Assessment",
            status: "COMPLETED",
            created_at: "2024-01-10T10:00:00Z",
            completed_at: "2024-01-15T15:30:00Z",
            sponsored_by: null,
            type: "SELF_INITIATED",
          },
          {
            id: "alex-assessment-2",
            name: "Leadership Coachability Assessment",
            status: "IN_PROGRESS",
            created_at: "2024-02-01T09:00:00Z",
            completed_at: null,
            sponsored_by: null,
            type: "SELF_INITIATED",
          },
        ],
      },
      "sarah.wilson@preview.com": {
        name: "Sarah Wilson",
        existingAssessments: [
          {
            id: "sarah-assessment-1",
            name: "Coachability Assessment - Q4 2024",
            status: "COMPLETED",
            created_at: "2023-12-01T10:00:00Z",
            completed_at: "2023-12-15T12:00:00Z",
            sponsored_by: null,
            type: "SELF_INITIATED",
          },
        ],
      },
    }

    // Check preview accounts first (always available for demo)
    const previewValidations = candidates.map((candidate: any) => {
      const preview = previewAccounts[candidate.email?.toLowerCase()]
      if (preview) {
        return {
          email: candidate.email,
          name: preview.name,
          exists: true,
          existingAssessments: preview.existingAssessments,
        }
      }
      return null
    })

    // If all candidates resolved via preview, return immediately
    if (previewValidations.every((v: any) => v !== null)) {
      return NextResponse.json({ validations: previewValidations })
    }

    // Check if we're in preview mode (no DB)
    const isPreviewMode = !process.env.DATABASE_URL

    if (isPreviewMode) {
      const validations = previewValidations.map((v: any, index: number) => {
        if (v) return v
        return {
          email: candidates[index].email,
          name: candidates[index].name,
          exists: false,
          existingAssessments: [],
        }
      })
      return NextResponse.json({ validations })
    }

    // Real validation logic -- fall back to preview data if DB has no match
    const validations = await Promise.all(
      candidates.map(async (candidate: any, index: number) => {
        // Check preview data first
        if (previewValidations[index]) return previewValidations[index]

        try {
          const existingUser = await getUserByEmail(candidate.email)

          if (existingUser) {
            const assessments = await getAssessmentsByUserId(existingUser.id)
            return {
              email: candidate.email,
              name: candidate.name || existingUser.name,
              exists: true,
              existingAssessments: assessments,
            }
          }

          return {
            email: candidate.email,
            name: candidate.name,
            exists: false,
            existingAssessments: [],
          }
        } catch (error) {
          console.error(`Error validating candidate ${candidate.email}:`, error)
          return {
            email: candidate.email,
            name: candidate.name,
            exists: false,
            existingAssessments: [],
            error: "Validation failed",
          }
        }
      }),
    )

    return NextResponse.json({ validations })
  } catch (error) {
    console.error("Error validating candidates:", error)
    return NextResponse.json({ error: "Validation failed" }, { status: 500 })
  }
}
