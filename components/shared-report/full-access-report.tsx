"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface SharedReportData {
  overallScores: {
    self: number
    referee: number
    combined: number
  }
  domainScores: Record<string, { self: number; referee: number }>
  recommendations?: string[]
  coachFit?: {
    directSupportive: number
    challengingReflective: number
    structuredFlexible: number
    taskRelationship: number
    preferredStyle: string
  }
}

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

interface FullAccessReportProps {
  reportData: SharedReportData
}

export function FullAccessReport({ reportData }: FullAccessReportProps) {
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="domains">Domain Scores</TabsTrigger>
        <TabsTrigger value="coach-fit">Coach-Client Fit</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Coachability Score</CardTitle>
            <CardDescription>Combined assessment from self-evaluation and referee feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{reportData.overallScores.self}</div>
                <div className="text-sm text-muted-foreground">Self Assessment</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{reportData.overallScores.referee}</div>
                <div className="text-sm text-muted-foreground">Referee Average</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{reportData.overallScores.combined}</div>
                <div className="text-sm text-muted-foreground">Combined Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                <ul className="space-y-1 text-sm">
                  <li>Strong learning orientation and growth mindset</li>
                  <li>High accountability and goal orientation</li>
                  <li>Good relationship building skills</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-700 mb-2">Development Areas</h4>
                <ul className="space-y-1 text-sm">
                  <li>Emotional regulation under pressure</li>
                  <li>Action orientation and follow-through</li>
                  <li>Openness to challenging feedback</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="domains" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Domain Scores Breakdown</CardTitle>
            <CardDescription>Detailed scores across all 12 coachability domains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {COACHABILITY_DOMAINS.map((domain) => {
                const scores = reportData.domainScores[domain.id]
                if (!scores) return null
                return (
                  <div key={domain.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{domain.name}</h4>
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-600">Self: {scores.self}</span>
                        <span className="text-green-600">Refs: {scores.referee}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={(scores.self / 5) * 100} className="h-2 [&>div]:bg-blue-500" />
                      <Progress value={(scores.referee / 5) * 100} className="h-2 [&>div]:bg-green-500" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="coach-fit" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Coach-Client Fit Profile</CardTitle>
            <CardDescription>Your readiness and preferences for coaching relationships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Coach-Client Fit</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span>Self: 3.9</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Referees: 3.6</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600 w-12">Self:</span>
                    <div className="h-3 flex-1 rounded-full bg-muted">
                      <div className="h-3 rounded-full bg-blue-500" style={{ width: "78%" }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 w-12">Refs:</span>
                    <div className="h-3 flex-1 rounded-full bg-muted">
                      <div className="h-3 rounded-full bg-green-500" style={{ width: "72%" }}></div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Your readiness to work effectively with a coach and benefit from coaching relationships.</p>
                </div>

                <div className="space-y-4 border-l-4 border-blue-200 pl-4 ml-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Individual Question Scores
                  </h4>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">I am open to receiving direct feedback about my performance</p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span>Self: <strong>4.0</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Referees: <strong>3.7</strong></span>
                        </div>
                        <span className="text-red-600 font-medium">Gap: -0.3</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">I am willing to try new approaches suggested by a coach</p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span>Self: <strong>4.2</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Referees: <strong>3.8</strong></span>
                        </div>
                        <span className="text-red-600 font-medium">Gap: -0.4</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">I prefer a coach who challenges me to think differently</p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span>Self: <strong>3.5</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Referees: <strong>3.3</strong></span>
                        </div>
                        <span className="text-red-600 font-medium">Gap: -0.2</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">I work best with a coach who provides structured guidance</p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span>Self: <strong>3.8</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Referees: <strong>3.7</strong></span>
                        </div>
                        <span className="text-red-600 font-medium">Gap: -0.1</span>
                      </div>
                    </div>
                  </div>
                </div>

                {reportData.coachFit && (
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="mb-2 font-medium">Coaching Style Analysis</h3>
                    <p>{reportData.coachFit.preferredStyle}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recommendations" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Development Recommendations</CardTitle>
            <CardDescription>Personalized suggestions for coaching and development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.recommendations?.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
