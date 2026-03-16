"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Printer, ChevronLeft, ChevronRight } from "lucide-react"
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

export default function TestReportPagination() {
  const [currentPage, setCurrentPage] = useState(0)
  const domainsPerPage = 4
  const totalPages = Math.ceil(COACHABILITY_DOMAINS.length / domainsPerPage)

  // VARIABLE: This would come from API/database in real implementation
  const mockReportData = {
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
          <h1 className="text-3xl font-bold">TEST: Coachability Assessment - All 12 Domains</h1>
          <p className="text-muted-foreground">This is a test page to verify pagination works</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Tabs defaultValue="domains">
        <TabsList className="mb-4">
          <TabsTrigger value="domains">Domain Scores (TEST)</TabsTrigger>
        </TabsList>

        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Domain Scores - ALL 12 DOMAINS</CardTitle>
                  <CardDescription>Testing pagination for all 12 coachability domains</CardDescription>
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
                  const scores = mockReportData.domainScores[domain.id as keyof typeof mockReportData.domainScores]
                  return (
                    <div key={domain.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-lg">{domain.name}</h3>
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
      </Tabs>
    </div>
  )
}
