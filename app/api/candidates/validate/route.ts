import { NextResponse } from "next/server"
import { getUserByEmail, getAssessmentsByUserId } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id")
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { candidates } = await req.json()
    if (!Array.isArray(candidates)) return NextResponse.json({ error: "Invalid candidates data" }, { status: 400 })

    const validations = await Promise.all(
      candidates.map(async (candidate: any) => {
        try {
          const existingUser = await getUserByEmail(candidate.email)
          if (existingUser) {
            const assessments = await getAssessmentsByUserId(existingUser.id)
            return {
              email: candidate.email,
              name: candidate.name || existingUser.name,
              exists: true,
              existingAssessments: assessments || [],
            }
          }
          return { email: candidate.email, name: candidate.name, exists: false, existingAssessments: [] }
        } catch (error) {
          console.error(`Error validating candidate ${candidate.email}:`, error)
          return { email: candidate.email, name: candidate.name, exists: false, existingAssessments: [] }
        }
      }),
    )

    return NextResponse.json({ validations })
  } catch (error) {
    console.error("Error validating candidates:", error)
    return NextResponse.json({ error: "Validation failed" }, { status: 500 })
  }
}
