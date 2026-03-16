import { NextResponse } from "next/server"
import { createAssessment } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // Read user ID from the custom header set by the client-side auth
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let name: string | undefined
    try {
      const body = await request.json()
      name = body.name
    } catch {
      // Body may be empty for simple creation requests
    }

    const assessment = await createAssessment(userId, name)

    return NextResponse.json({
      assessment,
      message: "Assessment created successfully",
    })
  } catch (error) {
    console.error("Error creating assessment:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
