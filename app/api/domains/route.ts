import { type NextRequest, NextResponse } from "next/server"
import { getAllQuestionsWithDomains } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeQuestions = searchParams.get("includeQuestions") === "true"

    if (includeQuestions) {
      // Get all questions with their domains
      const questionsWithDomains = await getAllQuestionsWithDomains()

      // Group questions by domain
      const domainsMap = new Map()

      questionsWithDomains.forEach((item: any) => {
        if (!domainsMap.has(item.domain_id)) {
          domainsMap.set(item.domain_id, {
            id: item.domain_id,
            name: item.domain_name,
            description: item.domain_description,
            order: item.domain_order,
            questions: [],
          })
        }

        domainsMap.get(item.domain_id).questions.push({
          id: item.id,
          text: item.text,
          order: item.question_order,
          type: item.question_type,
          forType: item.for_type,
        })
      })

      // Convert map to array and sort by domain order
      const domains = Array.from(domainsMap.values()).sort((a, b) => a.order - b.order)

      // Sort questions within each domain
      domains.forEach((domain) => {
        domain.questions.sort((a: any, b: any) => a.order - b.order)
      })

      return NextResponse.json({ domains })
    }

    // If not including questions, return just domains (this was the original functionality)
    return NextResponse.json({ domains: [] })
  } catch (error) {
    console.error("Error fetching domains:", error)
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 })
  }
}
