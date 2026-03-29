"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

// FIXED: The 12 domains that never change
const COACHABILITY_DOMAINS = [
  {
    id: "openness-to-feedback",
    name: "Openness to Feedback",
    description: "Your ability to receive and act on feedback from others.",
  },
  {
    id: "self-awareness",
    name: "Self-Awareness",
    description: "Your understanding of your own strengths, weaknesses, and impact on others.",
  },
  {
    id: "learning-orientation",
    name: "Learning Orientation",
    description: "Your enthusiasm for acquiring new skills and knowledge.",
  },
  {
    id: "change-readiness",
    name: "Change Readiness",
    description: "Your ability to adapt to new situations and approaches.",
  },
  {
    id: "emotional-regulation",
    name: "Emotional Regulation",
    description: "Your ability to manage emotions effectively, especially in challenging situations.",
  },
  {
    id: "goal-orientation",
    name: "Goal Orientation",
    description: "Your focus on setting and achieving meaningful objectives.",
  },
  {
    id: "resilience",
    name: "Resilience",
    description: "Your ability to bounce back from setbacks and maintain performance under pressure.",
  },
  {
    id: "communication-skills",
    name: "Communication Skills",
    description: "Your effectiveness in expressing ideas and listening to others.",
  },
  {
    id: "relationship-building",
    name: "Relationship Building",
    description: "Your ability to develop and maintain positive working relationships.",
  },
  {
    id: "accountability",
    name: "Accountability",
    description: "Your willingness to take ownership of your actions and commitments.",
  },
  {
    id: "growth-mindset",
    name: "Growth Mindset",
    description: "Your belief that abilities can be developed through dedication and hard work.",
  },
  {
    id: "action-orientation",
    name: "Action Orientation",
    description: "Your tendency to take initiative and follow through on commitments.",
  },
]

export default function ReportPreview() {
  const [currentPage, setCurrentPage] = useState(0)
  const domainsPerPage = 4
  const totalPages = Math.ceil(COACHABILITY_DOMAINS.length / domainsPerPage)

  // VARIABLE: This would come from API/database in real implementation
  const sampleReportData = {
    participant: {
      name: "Alex Johnson",
      email: "alex@example.com",
      assessmentDate: "May 20, 2023",
    },
    referees: [
      { name: "Jane Smith", relationship: "Manager" },
      { name: "John Doe", relationship: "Colleague" },
      { name: "Sarah Williams", relationship: "Mentor" },
    ],
    domainScores: {
      "openness-to-feedback": { self: 4.2, referee: 3.8 },
      "self-awareness": { self: 3.5, referee: 3.7 },
      "learning-orientation": { self: 4.5, referee: 4.3 },
      "change-readiness": { self: 3.8, referee: 3.5 },
      "emotional-regulation": { self: 3.2, referee: 3.0 },
      "goal-orientation": { self: 4.1, referee: 4.0 },
      resilience: { self: 3.7, referee: 3.9 },
      "communication-skills": { self: 3.9, referee: 3.6 },
      "relationship-building": { self: 4.0, referee: 4.2 },
      accountability: { self: 4.3, referee: 4.1 },
      "growth-mindset": { self: 4.4, referee: 4.2 },
      "action-orientation": { self: 3.6, referee: 3.4 },
    },
    overallScores: {
      self: 3.8,
      referee: 3.7,
      combined: 3.8,
    },
    coachFit: {
      directSupportive: 0.7,
      challengingReflective: 0.8,
      structuredFlexible: 0.6,
      taskRelationship: 0.5,
      preferredStyle:
        "You seem to prefer a coach who provides a balance of challenge and reflection, with moderate structure and equal focus on tasks and relationships.",
    },
    recommendations: [
      "Focus on improving emotional regulation through mindfulness practices or stress management techniques.",
      "Work on enhancing action orientation by setting smaller, more achievable milestones.",
      "Your strong learning orientation and growth mindset are significant assets for coaching success.",
      "Consider seeking more regular feedback to further develop your openness to feedback.",
      "Your communication skills could benefit from active listening practice in challenging conversations.",
      "Continue leveraging your accountability and goal orientation strengths in coaching relationships.",
    ],
  }

  // Get domains for current page
  const getCurrentPageDomains = () => {
    const startIndex = currentPage * domainsPerPage
    const endIndex = startIndex + domainsPerPage
    return COACHABILITY_DOMAINS.slice(startIndex, endIndex)
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coachability Assessment - May 2023</h1>
          <p className="text-muted-foreground">Generated on May 20, 2023</p>
        </div>
        <div className="flex gap-2"></div>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="domains">Domain Scores</TabsTrigger>
          <TabsTrigger value="coach-fit">Coach-Client Fit</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Participant</CardTitle>
                <CardDescription>Information about the assessment participant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{sampleReportData.participant.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{sampleReportData.participant.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Assessment Date:</span>
                    <span>{sampleReportData.participant.assessmentDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referees</CardTitle>
                <CardDescription>People who provided feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sampleReportData.referees.map((referee) => (
                    <div className="flex justify-between" key={referee.name}>
                      <span className="font-medium">{referee.name}</span>
                      <span>{referee.relationship}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Overall Coachability Score</CardTitle>
                <CardDescription>Average scores across all 12 domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex w-full max-w-md items-center justify-between rounded-lg bg-muted p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{sampleReportData.overallScores.self}</div>
                      <div className="text-sm text-muted-foreground">Self Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{sampleReportData.overallScores.referee}</div>
                      <div className="text-sm text-muted-foreground">Referee Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{sampleReportData.overallScores.combined}</div>
                      <div className="text-sm text-muted-foreground">Combined</div>
                    </div>
                  </div>
                  <p className="text-center text-muted-foreground">
                    Scores are on a scale of 1 (lowest) to 5 (highest)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Domain Scores</CardTitle>
                  <CardDescription>Detailed scores for each of the 12 coachability domains</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages} ({getCurrentPageDomains().length} domains)
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getCurrentPageDomains().map((domain) => {
                  const scores = sampleReportData.domainScores[domain.id as keyof typeof sampleReportData.domainScores]
                  return (
                    <div key={domain.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{domain.name}</h3>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <span>Self: {scores.self}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <span>Referees: {scores.referee}</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(scores.self / 5) * 100}%` }}
                        ></div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${(scores.referee / 5) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">{domain.description}</p>
                    </div>
                  )
                })}
              </div>

              {/* PAGINATION CONTROLS */}
              <div className="mt-8 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i)}
                      className="w-8 h-8 p-0"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* PROGRESS INDICATOR */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Showing domains {currentPage * domainsPerPage + 1}-
                {Math.min((currentPage + 1) * domainsPerPage, COACHABILITY_DOMAINS.length)} of{" "}
                {COACHABILITY_DOMAINS.length} total domains
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coach-fit">
          <Card>
            <CardHeader>
              <CardTitle>Coach-Client Fit Profile</CardTitle>
              <CardDescription>Your preferences for coaching style across multiple dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-medium">Direct vs. Supportive</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Supportive</span>
                      <div className="relative h-2 flex-1 rounded-full bg-muted">
                        <div
                          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary"
                          style={{ left: `${sampleReportData.coachFit.directSupportive * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">Direct</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Challenging vs. Reflective</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Reflective</span>
                      <div className="relative h-2 flex-1 rounded-full bg-muted">
                        <div
                          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary"
                          style={{ left: `${sampleReportData.coachFit.challengingReflective * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">Challenging</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Structured vs. Flexible</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Flexible</span>
                      <div className="relative h-2 flex-1 rounded-full bg-muted">
                        <div
                          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary"
                          style={{ left: `${sampleReportData.coachFit.structuredFlexible * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">Structured</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Task vs. Relationship Focus</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Relationship</span>
                      <div className="relative h-2 flex-1 rounded-full bg-muted">
                        <div
                          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary"
                          style={{ left: `${sampleReportData.coachFit.taskRelationship * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">Task</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="mb-2 font-medium">Preferred Coaching Style</h3>
                  <p>{sampleReportData.coachFit.preferredStyle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Personalized suggestions based on your 12-domain assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {sampleReportData.recommendations.map((recommendation, index) => (
                  <li className="flex gap-2" key={index}>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {index + 1}
                    </div>
                    <p>{recommendation}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
