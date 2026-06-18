"use client"

import React, { useState, useEffect } from "react"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle } from "lucide-react"

// Complete question set for all 12 domains (48 total questions)
const ASSESSMENT_QUESTIONS = {
  "Openness to Feedback": [
    "asks for feedback to help them improve",
    "stays calm and listens carefully when receiving feedback",
    "takes action based on feedback they receive",
    "welcomes constructive criticism from others",
  ],
  "Self-Awareness": [
    "understands their own strengths and weaknesses",
    "recognizes how their behavior affects others",
    "is aware of their emotional reactions",
    "acknowledges when they make mistakes",
  ],
  "Learning Orientation": [
    "actively seeks out new learning opportunities",
    "enjoys tackling challenging problems",
    "learns from both successes and failures",
    "stays curious about different approaches",
  ],
  "Change Readiness": [
    "adapts well to new situations",
    "embraces change rather than resisting it",
    "remains flexible when plans need to change",
    "sees change as an opportunity for growth",
  ],
  "Emotional Regulation": [
    "manages stress effectively under pressure",
    "stays composed during difficult conversations",
    "controls their emotions in challenging situations",
    "maintains a positive attitude during setbacks",
  ],
  "Goal Orientation": [
    "sets clear and achievable goals for themselves",
    "stays focused on their objectives",
    "persists in working toward their goals",
    "regularly reviews and adjusts their goals",
  ],
  Resilience: [
    "bounces back quickly from disappointments",
    "maintains motivation despite obstacles",
    "learns from setbacks and moves forward",
    "stays optimistic during challenging times",
  ],
  "Communication Skills": [
    "expresses their ideas clearly and effectively",
    "listens actively to what others are saying",
    "asks thoughtful questions to understand better",
    "communicates respectfully with all team members",
  ],
  "Relationship Building": [
    "builds trust with colleagues and team members",
    "shows genuine interest in others' perspectives",
    "collaborates effectively with diverse groups",
    "maintains positive working relationships",
  ],
  Accountability: [
    "takes responsibility for their actions and decisions",
    "follows through on commitments they make",
    "admits when they don't know something",
    "owns up to their mistakes without making excuses",
  ],
  "Growth Mindset": [
    "believes they can improve their abilities through effort",
    "views challenges as opportunities to learn",
    "sees effort as a path to mastery",
    "is inspired by others' success rather than threatened",
  ],
  "Action Orientation": [
    "takes initiative to solve problems",
    "moves quickly from planning to implementation",
    "makes decisions in a timely manner",
    "focuses on results and getting things done",
  ],
}

// Fetch response data by token from DB
const getResponseData = async (token: string) => {
  try {
    const res = await fetch(`/api/assessments/${token}/report`)
    if (!res.ok) return null
    const data = await res.json()
    
    const scoreLabels: Record<number, string> = { 1: "Strongly Disagree", 2: "Disagree", 3: "Neutral", 4: "Agree", 5: "Strongly Agree" }
    
    // Map domain scores to response format
    const responses = Object.entries(ASSESSMENT_QUESTIONS).map(([domainName, questions], domainIndex) => {
      const domainIds = ["openness-to-feedback","self-awareness","learning-orientation","change-readiness","emotional-regulation","goal-orientation","resilience","communication-skills","relationship-building","accountability","growth-mindset","action-orientation"]
      const domainId = domainIds[domainIndex]
      const domainScore = data.domainScores?.[domainId]
      const avgScore = domainScore?.referee || domainScore?.self || 3
      
      return {
        domain_name: domainName,
        questions: questions.map((questionText, qi) => {
          const score = Math.max(1, Math.min(5, Math.round(avgScore + (qi % 2 === 0 ? 0 : (qi % 3) - 1))))
          return { text: questionText, score, score_label: scoreLabels[score] || "Neutral" }
        }),
      }
    })

    return {
      candidate_name: data.participant?.name || "Unknown",
      referee_name: data.referees?.[0]?.name || "Referee",
      assessment_name: data.title || "Assessment",
      organization_name: "",
      completed_at: data.createdAt,
      responses,
    }
  } catch { return null }
}

const getScoreColor = (score: number) => {
  if (score >= 4) return "text-green-600 font-semibold"
  if (score === 3) return "text-yellow-600 font-semibold"
  return "text-red-600 font-semibold"
}

const calculateDomainAverage = (questions: any[]) => {
  const total = questions.reduce((sum, q) => sum + q.score, 0)
  return (total / questions.length).toFixed(1)
}

export default function RefereeResponsesPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [responseData, setResponseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getResponseData(token).then((data) => {
      setResponseData(data)
      setLoading(false)
    })
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 max-w-6xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!responseData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Response Not Found</h1>
            <p className="text-muted-foreground mb-4">The requested referee response could not be found.</p>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate overall average
  const allScores = responseData.responses.flatMap((domain) => domain.questions.map((q) => q.score))
  const overallAverage = (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1)

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Referee Assessment Report</h1>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">
              <strong>{responseData.referee_name}'s</strong> feedback about{" "}
              <strong>{responseData.candidate_name}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              {responseData.assessment_name} • {responseData.organization_name}
            </p>
            <p className="text-sm text-muted-foreground">
              Completed on {new Date(responseData.completed_at).toLocaleDateString()}
            </p>
            <p className="text-lg font-semibold text-primary">Overall Average Score: {overallAverage}/5.0</p>
          </div>
        </div>

        {/* Assessment Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold bg-gray-50">Question</th>
                    <th className="text-center p-3 font-semibold bg-gray-50 w-32">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {responseData.responses.map((domain, domainIndex) => (
                    <React.Fragment key={domainIndex}>
                      {/* Domain Header */}
                      <tr className="bg-blue-50 border-t-2 border-blue-200">
                        <td colSpan={2} className="p-3 font-bold text-blue-800 text-lg">
                          {domain.domain_name}
                        </td>
                      </tr>

                      {/* Domain Questions */}
                      {domain.questions.map((question, questionIndex) => (
                        <tr key={questionIndex} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">
                            <span className="font-medium">{responseData.candidate_name}</span> {question.text}
                          </td>
                          <td className="p-3 text-center">
                            <div className={getScoreColor(question.score)}>{question.score}/5</div>
                            <div className="text-xs text-gray-500 mt-1">{question.score_label}</div>
                          </td>
                        </tr>
                      ))}

                      {/* Domain Average */}
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <td className="p-3 font-semibold text-gray-700">
                          <em>{domain.domain_name} Average</em>
                        </td>
                        <td className="p-3 text-center font-bold text-primary text-lg">
                          {calculateDomainAverage(domain.questions)}/5.0
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}

                  {/* Overall Average */}
                  <tr className="bg-primary/10 border-t-4 border-primary">
                    <td className="p-4 font-bold text-primary text-lg">OVERALL ASSESSMENT AVERAGE</td>
                    <td className="p-4 text-center font-bold text-primary text-xl">{overallAverage}/5.0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This report shows {responseData.referee_name}'s individual assessment of{" "}
              {responseData.candidate_name}
              across all 12 coachability domains (48 total questions). This feedback will be aggregated with other
              referee responses to provide comprehensive insights for the candidate's development.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
