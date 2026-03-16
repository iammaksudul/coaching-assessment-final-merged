import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

export default function ReportPreview() {
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
    overallScores: {
      self: 3.8,
      referee: 3.7,
      combined: 3.8,
    },
    domainScores: [
      {
        domain: "Openness to Feedback",
        self: 4.2,
        referee: 3.8,
        description: "Your ability to receive and act on feedback from others.",
      },
      {
        domain: "Self-Awareness",
        self: 3.5,
        referee: 3.7,
        description: "Your understanding of your own strengths, weaknesses, and impact on others.",
      },
      {
        domain: "Emotional Regulation",
        self: 3.9,
        referee: 3.6,
        description: "Your capacity to manage and express your emotions effectively.",
      },
      {
        domain: "Learning Orientation",
        self: 4.5,
        referee: 4.3,
        description: "Your inclination to seek out new knowledge and experiences.",
      },
    ],
    coachFit: {
      directSupportive: 0.8,
      challengingReflective: 0.8,
      preferredStyle:
        "You seem to prefer a coach who gives you space to reflect while also providing direct guidance when needed.",
    },
    recommendations: [
      "Consider seeking more regular feedback from colleagues to improve your openness to feedback.",
      "Your emotional regulation could benefit from mindfulness practices or stress management techniques.",
      "Your strong learning orientation is a significant asset for coaching success.",
      "You might benefit most from a coach who balances reflective space with occasional direct challenges.",
    ],
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coachability Assessment - May 2023</h1>
          <p className="text-muted-foreground">Generated on May 20, 2023</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
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
                    <span>{mockReportData.participant.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{mockReportData.participant.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Assessment Date:</span>
                    <span>{mockReportData.participant.assessmentDate}</span>
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
                  {mockReportData.referees.map((referee) => (
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
                <CardDescription>Average scores across all domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex w-full max-w-md items-center justify-between rounded-lg bg-muted p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockReportData.overallScores.self}</div>
                      <div className="text-sm text-muted-foreground">Self Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockReportData.overallScores.referee}</div>
                      <div className="text-sm text-muted-foreground">Referee Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockReportData.overallScores.combined}</div>
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
              <CardTitle>Domain Scores</CardTitle>
              <CardDescription>Detailed scores for each coachability domain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockReportData.domainScores.map((domainScore) => (
                  <div className="space-y-2" key={domainScore.domain}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{domainScore.domain}</h3>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          <span>Self: {domainScore.self}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span>Referees: {domainScore.referee}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${domainScore.self * 20}%` }}
                      ></div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${domainScore.referee * 20}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">{domainScore.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coach-fit">
          <Card>
            <CardHeader>
              <CardTitle>Coach-Client Fit Profile</CardTitle>
              <CardDescription>Your preferences for coaching style</CardDescription>
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
                          style={{ left: `${mockReportData.coachFit.directSupportive * 100}%` }}
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
                          style={{ left: `${mockReportData.coachFit.challengingReflective * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">Challenging</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="mb-2 font-medium">Preferred Coaching Style</h3>
                  <p>{mockReportData.coachFit.preferredStyle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Suggestions to improve your coachability</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {mockReportData.recommendations.map((recommendation, index) => (
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
