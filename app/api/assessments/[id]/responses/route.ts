import { NextResponse } from "next/server"
import { saveResponse, getAssessmentById, updateAssessmentStatus } from "@/lib/db"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assessmentId = params.id
    const { responses } = await req.json()

    // Verify the assessment exists (and optionally belongs to the user)
    const assessment = await getAssessmentById(assessmentId)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // Save all responses
    const savedResponses = []
    for (const response of responses) {
      const savedResponse = await saveResponse({
        assessmentId,
        questionId: response.questionId,
        value: response.value,
        responseType: "SELF",
      })
      savedResponses.push(savedResponse)
    }

    // Update assessment status — self-assessment done, now awaiting referees
    await updateAssessmentStatus(assessmentId, "COMPLETED")

    return NextResponse.json(
      {
        message: "Responses saved successfully",
        responses: savedResponses,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error saving responses:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
