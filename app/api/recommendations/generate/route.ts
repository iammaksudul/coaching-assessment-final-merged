import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { domainScores, participantName } = await req.json()

    if (!domainScores || typeof domainScores !== "object") {
      return Response.json({ error: "domainScores required" }, { status: 400 })
    }

    // Compute combined scores and rank domains weakest-first
    const rankedDomains = Object.entries(domainScores)
      .map(([domainId, scores]: [string, any]) => {
        const combined = ((scores.self || 0) + (scores.referee || 0)) / 2
        const gap = Math.abs((scores.self || 0) - (scores.referee || 0))
        return {
          domainId,
          domainName: domainId
            .split("-")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          selfScore: scores.self,
          refereeScore: scores.referee,
          combined: Math.round(combined * 10) / 10,
          gap: Math.round(gap * 10) / 10,
        }
      })
      .sort((a, b) => a.combined - b.combined)

    // Pick the 3 weakest domains for deep recommendations
    const weakestDomains = rankedDomains.slice(0, 3)
    // Also identify the 2 strongest for context
    const strongestDomains = rankedDomains.slice(-2).reverse()

    const prompt = `You are a professional executive coaching advisor with deep expertise in coachability assessment and personal development. A participant${participantName ? ` named ${participantName}` : ""} has completed a 12-domain coachability assessment. Each domain is scored 1-5 by self-assessment and by referees (external reviewers).

Here are their WEAKEST domains that need the most development:

${weakestDomains
  .map(
    (d, i) =>
      `${i + 1}. **${d.domainName}** — Self: ${d.selfScore}/5, Referee: ${d.refereeScore}/5 (Combined: ${d.combined}/5, Gap: ${d.gap})`
  )
  .join("\n")}

For context, their STRONGEST domains are:
${strongestDomains.map((d) => `- **${d.domainName}** — Combined: ${d.combined}/5`).join("\n")}

For each of the 3 weakest domains, provide:
1. A brief analysis (2-3 sentences) of what the score and self/referee gap suggests
2. Three specific, actionable recommendations the participant can implement within the next 30-90 days
3. One recommended resource (book, framework, or practice)

Format your response as JSON with this exact structure:
{
  "recommendations": [
    {
      "domain": "Domain Name",
      "priority": "High",
      "analysis": "Brief analysis of the score pattern...",
      "actions": [
        "First specific action...",
        "Second specific action...",
        "Third specific action..."
      ],
      "resource": "Recommended resource..."
    }
  ],
  "overallInsight": "A 2-3 sentence overall coaching insight that ties together the development areas and leverages the participant's strengths."
}

Be specific, practical, and encouraging. Avoid generic platitudes. The recommendations should be implementable without a coach, though having a coach would accelerate progress.`

    const { text, usage, finishReason } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      maxOutputTokens: 2000,
      temperature: 0.7,
    })

    // Parse the JSON from the response
    let parsed
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
    } catch {
      // If parsing fails, return the raw text so the UI can display it
      return Response.json({
        recommendations: null,
        rawText: text,
        usage,
        finishReason,
        source: "ai",
      })
    }

    return Response.json({
      ...parsed,
      usage,
      finishReason,
      source: "ai",
      weakestDomains: weakestDomains.map((d) => d.domainName),
    })
  } catch (error: any) {
    console.error("AI recommendation generation failed:", error)
    return Response.json(
      {
        error: "AI generation failed",
        message: error?.message || "Unknown error",
        source: "fallback",
      },
      { status: 503 }
    )
  }
}
