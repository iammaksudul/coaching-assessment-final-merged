"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Building2,
  FileText,
  User,
  Calendar,
  TrendingUp,
  Star,
  AlertTriangle,
  Download,
} from "lucide-react"
import Link from "next/link"

const COACHABILITY_DOMAINS = [
  { id: "openness-to-feedback", name: "Openness to Feedback" },
  { id: "self-awareness", name: "Self-Awareness" },
  { id: "learning-orientation", name: "Learning Orientation" },
  { id: "change-readiness", name: "Change Readiness" },
  { id: "emotional-regulation", name: "Emotional Regulation" },
  { id: "goal-orientation", name: "Goal Orientation" },
  { id: "resilience", name: "Resilience" },
  { id: "communication-skills", name: "Communication Skills" },
  { id: "relationship-building", name: "Relationship Building" },
  { id: "accountability", name: "Accountability" },
  { id: "growth-mindset", name: "Growth Mindset" },
  { id: "action-orientation", name: "Action Orientation" },
]

function generateMockScores() {
  return COACHABILITY_DOMAINS.map((domain) => {
    const selfScore = Math.round((3 + Math.random() * 2) * 10) / 10
    const refereeScore = Math.round((3 + Math.random() * 2) * 10) / 10
    const composite = Math.round(((selfScore + refereeScore) / 2) * 10) / 10
    return {
      ...domain,
      selfScore,
      refereeScore,
      composite,
    }
  })
}

function OrganizationReportContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const candidateId = searchParams.get("candidateId")

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    // Simulate loading report data
    const timer = setTimeout(() => {
      const scores = generateMockScores()
      const overallScore = Math.round((scores.reduce((sum, s) => sum + s.composite, 0) / scores.length) * 10) / 10

      // Use candidateId to determine which mock report to show
      const isRobert = candidateId === "rpt-1"
      setReport({
        candidate: {
          name: isRobert ? "Robert Kim" : "Sarah Wilson",
          email: isRobert ? "robert.kim@company.com" : "sarah.wilson@preview.com",
        },
        assessment: {
          name: isRobert ? "Manager Development Assessment" : "Coachability Assessment - Q4 2024",
          completedAt: isRobert ? "2024-01-20T16:00:00Z" : "2023-12-15T12:00:00Z",
          source: isRobert ? "Commissioned" : "Shared (Access Granted)",
          refereesCompleted: isRobert ? 4 : 3,
          refereesInvited: isRobert ? 5 : 3,
        },
        overallScore,
        scores,
        strengths: scores.sort((a, b) => b.composite - a.composite).slice(0, 3),
        developmentAreas: scores.sort((a, b) => a.composite - b.composite).slice(0, 3),
      })
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [candidateId])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-700 bg-green-100"
    if (score >= 3.5) return "text-blue-700 bg-blue-100"
    if (score >= 2.5) return "text-amber-700 bg-amber-100"
    return "text-red-700 bg-red-100"
  }

  const getBarColor = (score: number) => {
    if (score >= 4.5) return "bg-green-500"
    if (score >= 3.5) return "bg-blue-500"
    if (score >= 2.5) return "bg-amber-500"
    return "bg-red-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment report...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Report Not Found</h2>
            <p className="text-sm text-muted-foreground mb-4">This report may not be available or may have been removed.</p>
            <Link href="/organization-dashboard">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/organization-dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Report Header Card */}
        <Card className="border-purple-200 mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <User className="h-7 w-7 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{report.candidate.name}</h1>
                  <p className="text-muted-foreground">{report.candidate.email}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <Badge variant="outline" className="border-purple-200 text-purple-700">
                      <Building2 className="w-3 h-3 mr-1" />
                      {report.assessment.source}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Completed {formatDate(report.assessment.completedAt)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {report.assessment.refereesCompleted} of {report.assessment.refereesInvited} referees responded
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200 shrink-0">
                <p className="text-sm font-medium text-purple-700">Overall Score</p>
                <p className="text-4xl font-bold text-purple-900">{report.overallScore}</p>
                <p className="text-xs text-purple-600">out of 5.0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Star className="h-5 w-5 text-green-600" />
                Top Strengths
              </CardTitle>
              <CardDescription>Highest scoring coachability domains</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.strengths.map((s: any, i: number) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-700">{i + 1}.</span>
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-300">{s.composite}/5.0</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Development Opportunities
              </CardTitle>
              <CardDescription>Areas with the most growth potential</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.developmentAreas.map((s: any, i: number) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-700">{i + 1}.</span>
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300">{s.composite}/5.0</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Domain Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Domain Scores Breakdown
            </CardTitle>
            <CardDescription>
              Composite scores combining self-assessment and referee feedback across all 12 coachability domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.scores
                .sort((a: any, b: any) => b.composite - a.composite)
                .map((score: any) => (
                  <div key={score.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{score.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Self: {score.selfScore}</span>
                        <span className="text-xs text-muted-foreground">Referees: {score.refereeScore}</span>
                        <Badge className={`${getScoreColor(score.composite)} text-xs`}>
                          {score.composite}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getBarColor(score.composite)}`}
                          style={{ width: `${(score.composite / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t">
              <span className="text-xs text-muted-foreground">Score legend:</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Excellent (4.5+)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">Good (3.5-4.4)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">Developing (2.5-3.4)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Needs Attention (&lt;2.5)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900">Employer Access Notice</p>
                <p className="text-sm text-purple-700 mt-1 leading-relaxed">
                  This report is available to Global Tech Solutions under the terms agreed to by the candidate. Individual
                  referee comments are anonymized and aggregated. Please respect the confidentiality of this assessment
                  data in accordance with your data processing agreement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function OrganizationReport() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading report...</p>
          </div>
        </div>
      }
    >
      <OrganizationReportContent />
    </Suspense>
  )
}
