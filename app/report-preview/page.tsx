"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { ShareReportDialog } from "@/components/share-report-dialog"

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

// User-specific comprehensive assessment data
const getUserAssessmentData = (userEmail: string) => {
  console.log("Getting assessment data for user:", userEmail)

  const userDataMap: Record<string, any> = {
    "sarah.wilson@example.com": {
      participant: {
        name: "Sarah Wilson",
        email: "sarah.wilson@example.com",
        assessmentDate: "January 15, 2024",
      },
      referees: [
        { name: "Michael Chen", relationship: "Direct Manager" },
        { name: "Lisa Rodriguez", relationship: "Peer Colleague" },
        { name: "David Kim", relationship: "Team Lead" },
      ],
      overallScores: {
        self: 4.3,
        referee: 4.1,
        combined: 4.2,
      },
      domainScores: {
        "openness-to-feedback": { self: 4.5, referee: 4.2 },
        "self-awareness": { self: 4.8, referee: 4.5 },
        "learning-orientation": { self: 4.6, referee: 4.3 },
        "change-readiness": { self: 4.0, referee: 3.8 },
        "emotional-regulation": { self: 4.2, referee: 4.0 },
        "goal-orientation": { self: 4.4, referee: 4.2 },
        resilience: { self: 4.1, referee: 4.3 },
        "communication-skills": { self: 4.7, referee: 4.4 },
        "relationship-building": { self: 4.8, referee: 4.6 },
        accountability: { self: 4.3, referee: 4.1 },
        "growth-mindset": { self: 4.5, referee: 4.2 },
        "action-orientation": { self: 3.9, referee: 3.7 },
      },
      coachFit: {
        self: 4.4,
        referee: 4.2,
        description: "Your readiness and preferences for coaching relationships",
        preferredStyle:
          "You demonstrate exceptional openness to coaching feedback and show strong self-reflection skills. You're highly ready to engage actively in coaching conversations and implement suggested changes. Your collaborative approach and growth mindset make you an ideal coaching candidate.",
      },
      recommendations: [
        {
          text: "Continue leveraging your exceptional relationship-building skills as a foundation for coaching success.",
          domain: "Relationship Building",
          relatedQuestions: [
            {
              id: "q33",
              text: "I build rapport easily with others.",
              selfScore: 4.8,
              refereeScore: 4.6,
              gap: -0.2,
            },
            {
              id: "q35",
              text: "I show genuine interest in others.",
              selfScore: 4.9,
              refereeScore: 4.7,
              gap: -0.2,
            },
          ],
          priority: "Low",
        },
        {
          text: "Your strong self-awareness is a significant asset - use this insight to guide your development priorities.",
          domain: "Self-Awareness",
          relatedQuestions: [
            {
              id: "q5",
              text: "I have a realistic understanding of my strengths.",
              selfScore: 4.7,
              refereeScore: 4.5,
              gap: -0.2,
            },
            {
              id: "q7",
              text: "I reflect on my behavior and its impact on others.",
              selfScore: 4.9,
              refereeScore: 4.6,
              gap: -0.3,
            },
          ],
          priority: "Low",
        },
        {
          text: "Focus on enhancing action orientation by setting more aggressive timelines and accountability measures.",
          domain: "Action Orientation",
          relatedQuestions: [
            {
              id: "q45",
              text: "I take initiative to get things done.",
              selfScore: 4.0,
              refereeScore: 3.8,
              gap: -0.2,
            },
            {
              id: "q46",
              text: "I act decisively when needed.",
              selfScore: 3.8,
              refereeScore: 3.6,
              gap: -0.2,
            },
          ],
          priority: "Medium",
        },
        {
          text: "Work on building greater comfort with ambiguous and rapidly changing situations.",
          domain: "Change Readiness",
          relatedQuestions: [
            {
              id: "q13",
              text: "I adapt well to changing circumstances.",
              selfScore: 4.1,
              refereeScore: 3.9,
              gap: -0.2,
            },
            {
              id: "q15",
              text: "I remain positive during periods of change.",
              selfScore: 3.9,
              refereeScore: 3.7,
              gap: -0.2,
            },
          ],
          priority: "Medium",
        },
      ],
    },
    "alex.johnson@example.com": {
      participant: {
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
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
      coachFit: {
        self: 3.9,
        referee: 3.6,
        description: "Your readiness to work effectively with a coach and benefit from coaching relationships.",
        preferredStyle:
          "Based on your responses, you show strong openness to coaching feedback and demonstrate good self-reflection skills. You appear ready to engage actively in coaching conversations and implement suggested changes.",
      },
      recommendations: [
        {
          text: "Consider seeking more regular feedback from colleagues to improve your openness to feedback.",
          domain: "Openness to Feedback",
          relatedQuestions: [
            {
              id: "q1",
              text: "I ask for feedback to help me improve.",
              selfScore: 4.0,
              refereeScore: 3.7,
              gap: -0.3,
            },
            {
              id: "q3",
              text: "I take action based on feedback I receive.",
              selfScore: 4.0,
              refereeScore: 3.7,
              gap: -0.3,
            },
          ],
          priority: "High",
        },
        {
          text: "Your emotional regulation could benefit from mindfulness practices or stress management techniques.",
          domain: "Emotional Regulation",
          relatedQuestions: [
            {
              id: "q17",
              text: "I stay calm under pressure.",
              selfScore: 3.0,
              refereeScore: 2.7,
              gap: -0.3,
            },
            {
              id: "q19",
              text: "I recover quickly from setbacks.",
              selfScore: 3.0,
              refereeScore: 3.0,
              gap: 0.0,
            },
          ],
          priority: "High",
        },
        {
          text: "Work on improving self-awareness, particularly in understanding how your behavior affects others.",
          domain: "Self-Awareness",
          relatedQuestions: [
            {
              id: "q7",
              text: "I reflect on my behavior and its impact on others.",
              selfScore: 3.5,
              refereeScore: 4.0,
              gap: 0.5,
            },
            {
              id: "q5",
              text: "I have a realistic understanding of my strengths.",
              selfScore: 3.0,
              refereeScore: 3.3,
              gap: 0.3,
            },
          ],
          priority: "Medium",
        },
        {
          text: "Your strong learning orientation is a significant asset for coaching success - continue to leverage this strength.",
          domain: "Learning Orientation",
          relatedQuestions: [
            {
              id: "q9",
              text: "I actively seek out learning opportunities.",
              selfScore: 5.0,
              refereeScore: 4.7,
              gap: -0.3,
            },
            {
              id: "q12",
              text: "I enjoy tackling challenging learning experiences.",
              selfScore: 4.5,
              refereeScore: 4.3,
              gap: -0.2,
            },
          ],
          priority: "Low",
        },
      ],
    },
    // ADDED: John Smith (employer@example.com) assessment data
    "employer@example.com": {
      participant: {
        name: "John Smith",
        email: "employer@example.com",
        assessmentDate: "January 12, 2024",
      },
      referees: [
        { name: "Executive Coach", relationship: "External Coach" },
        { name: "HR Director", relationship: "Internal Partner" },
        { name: "Board Member", relationship: "Board Advisor" },
      ],
      overallScores: {
        self: 4.1,
        referee: 4.0,
        combined: 4.1,
      },
      domainScores: {
        "openness-to-feedback": { self: 4.3, referee: 4.1 },
        "self-awareness": { self: 4.5, referee: 4.2 },
        "learning-orientation": { self: 4.2, referee: 4.0 },
        "change-readiness": { self: 4.4, referee: 4.3 },
        "emotional-regulation": { self: 3.8, referee: 3.9 },
        "goal-orientation": { self: 4.6, referee: 4.4 },
        resilience: { self: 4.2, referee: 4.1 },
        "communication-skills": { self: 4.0, referee: 3.8 },
        "relationship-building": { self: 4.3, referee: 4.2 },
        accountability: { self: 4.7, referee: 4.5 },
        "growth-mindset": { self: 4.1, referee: 3.9 },
        "action-orientation": { self: 4.5, referee: 4.3 },
      },
      coachFit: {
        self: 4.2,
        referee: 4.0,
        description: "Your readiness and preferences for executive coaching relationships",
        preferredStyle:
          "As an executive leader, you demonstrate strong readiness for high-level coaching engagement. You show excellent accountability and goal orientation, making you well-suited for strategic coaching focused on organizational leadership and personal effectiveness. Your openness to feedback and strong action orientation indicate you'll implement coaching insights effectively.",
      },
      recommendations: [
        {
          text: "Leverage your exceptional accountability and goal orientation to drive organizational transformation initiatives.",
          domain: "Accountability",
          relatedQuestions: [
            {
              id: "q37",
              text: "I take responsibility for my actions.",
              selfScore: 4.8,
              refereeScore: 4.6,
              gap: -0.2,
            },
            {
              id: "q38",
              text: "I follow through on my commitments.",
              selfScore: 4.7,
              refereeScore: 4.5,
              gap: -0.2,
            },
          ],
          priority: "Low",
        },
        {
          text: "Your strong action orientation is a key leadership asset - continue to model decisive leadership for your organization.",
          domain: "Action Orientation",
          relatedQuestions: [
            {
              id: "q45",
              text: "I take initiative to get things done.",
              selfScore: 4.6,
              refereeScore: 4.4,
              gap: -0.2,
            },
            {
              id: "q46",
              text: "I act decisively when needed.",
              selfScore: 4.5,
              refereeScore: 4.3,
              gap: -0.2,
            },
          ],
          priority: "Low",
        },
        {
          text: "Focus on enhancing emotional regulation to better manage stress and model resilience during organizational challenges.",
          domain: "Emotional Regulation",
          relatedQuestions: [
            {
              id: "q17",
              text: "I stay calm under pressure.",
              selfScore: 3.7,
              refereeScore: 3.8,
              gap: 0.1,
            },
            {
              id: "q18",
              text: "I manage my emotions effectively in difficult situations.",
              selfScore: 3.8,
              refereeScore: 3.9,
              gap: 0.1,
            },
          ],
          priority: "Medium",
        },
        {
          text: "Consider developing your growth mindset further to foster innovation and continuous learning within your organization.",
          domain: "Growth Mindset",
          relatedQuestions: [
            {
              id: "q41",
              text: "I believe I can improve my abilities through effort.",
              selfScore: 4.0,
              refereeScore: 3.8,
              gap: -0.2,
            },
            {
              id: "q42",
              text: "I view challenges as opportunities to grow.",
              selfScore: 4.1,
              refereeScore: 3.9,
              gap: -0.2,
            },
          ],
          priority: "Medium",
        },
      ],
    },
    // ADDED: Mike Chen (admin) assessment data
    "mike.chen@example.com": {
      participant: {
        name: "Mike Chen",
        email: "mike.chen@example.com",
        assessmentDate: "January 25, 2024",
      },
      referees: [
        { name: "Team Lead", relationship: "Direct Manager" },
        { name: "Project Manager", relationship: "Colleague" },
        { name: "Senior Developer", relationship: "Peer" },
      ],
      overallScores: {
        self: 4.0,
        referee: 3.9,
        combined: 4.0,
      },
      domainScores: {
        "openness-to-feedback": { self: 4.1, referee: 4.0 },
        "self-awareness": { self: 4.2, referee: 4.1 },
        "learning-orientation": { self: 4.7, referee: 4.5 },
        "change-readiness": { self: 4.3, referee: 4.2 },
        "emotional-regulation": { self: 3.9, referee: 3.8 },
        "goal-orientation": { self: 4.0, referee: 3.9 },
        resilience: { self: 4.1, referee: 4.0 },
        "communication-skills": { self: 3.8, referee: 3.7 },
        "relationship-building": { self: 3.9, referee: 3.8 },
        accountability: { self: 4.2, referee: 4.1 },
        "growth-mindset": { self: 4.6, referee: 4.4 },
        "action-orientation": { self: 3.7, referee: 3.6 },
      },
      coachFit: {
        self: 4.1,
        referee: 3.9,
        description: "Your readiness and preferences for technical leadership coaching",
        preferredStyle:
          "You demonstrate strong learning orientation and growth mindset, making you an excellent candidate for coaching focused on technical leadership and career development. Your openness to feedback and systematic approach to improvement indicate you'll benefit greatly from structured coaching relationships.",
      },
      recommendations: [
        {
          text: "Your exceptional learning orientation is a tremendous asset - leverage this for continuous skill development and knowledge sharing.",
          domain: "Learning Orientation",
          relatedQuestions: [
            {
              id: "q9",
              text: "I actively seek out learning opportunities.",
              selfScore: 4.8,
              refereeScore: 4.6,
              gap: -0.2,
            },
            {
              id: "q12",
              text: "I enjoy tackling challenging learning experiences.",
              selfScore: 4.7,
              refereeScore: 4.5,
              gap: -0.2,
            },
          ],
          priority: "Low",
        },
        {
          text: "Focus on enhancing action orientation to complement your strong analytical and learning capabilities.",
          domain: "Action Orientation",
          relatedQuestions: [
            {
              id: "q45",
              text: "I take initiative to get things done.",
              selfScore: 3.8,
              refereeScore: 3.7,
              gap: -0.1,
            },
            {
              id: "q46",
              text: "I act decisively when needed.",
              selfScore: 3.6,
              refereeScore: 3.5,
              gap: -0.1,
            },
          ],
          priority: "Medium",
        },
        {
          text: "Work on developing communication skills to better share your technical expertise and insights with diverse audiences.",
          domain: "Communication Skills",
          relatedQuestions: [
            {
              id: "q29",
              text: "I communicate my ideas clearly.",
              selfScore: 3.7,
              refereeScore: 3.6,
              gap: -0.1,
            },
            {
              id: "q31",
              text: "I adapt my communication style to different audiences.",
              selfScore: 3.8,
              refereeScore: 3.7,
              gap: -0.1,
            },
          ],
          priority: "Medium",
        },
      ],
    },
  }

  const userData = userDataMap[userEmail]
  console.log("Found assessment data:", userData ? "Yes" : "No", "for user:", userEmail)
  return userData || null
}

export default function ReportPreviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [assessmentData, setAssessmentData] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const domainsPerPage = 4
  const totalPages = Math.ceil(COACHABILITY_DOMAINS.length / domainsPerPage)

  useEffect(() => {
    console.log("Report page loaded, user:", user)

    if (!user) {
      console.log("No user found, redirecting to login")
      router.push("/login")
      return
    }

    // Get assessment data for the CURRENT authenticated user
    const userData = getUserAssessmentData(user.email)

    if (!userData) {
      console.error("No assessment data found for user:", user.email)
      console.log(
        "Available user emails in data:",
        Object.keys({
          "sarah.wilson@example.com": true,
          "alex.johnson@example.com": true,
          "employer@example.com": true,
          "mike.chen@example.com": true,
        }),
      )
      setAssessmentData(null)
    } else {
      console.log("Assessment data loaded successfully for:", user.email)
      setAssessmentData(userData)
    }

    setIsLoading(false)
  }, [user, router])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading your comprehensive assessment report...</p>
          <p className="text-sm text-muted-foreground mt-2">User: {user?.email || "Not logged in"}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Please log in to view your assessment report.</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!assessmentData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Assessment Data Found</h1>
            <p className="text-muted-foreground mb-4">
              No completed assessment found for {user.name} ({user.email}).
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Debug Info:</strong> User email: {user.email}
              </p>
              <p className="text-sm text-yellow-800">
                Available data for: sarah.wilson@example.com, alex.johnson@example.com, employer@example.com,
                mike.chen@example.com
              </p>
            </div>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/*  Banner */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        
        recommendations
      </div>

      <div className="container py-8">
        {/* Navigation Header */}
        <div className="mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Coachability Assessment Report</h1>
            <p className="text-lg text-muted-foreground">
              <strong>{assessmentData.participant.name}</strong> - Generated on{" "}
              {assessmentData.participant.assessmentDate}
            </p>
            <p className="text-sm text-muted-foreground">
              Viewing as: {user.name} ({user.email})
            </p>
          </div>
          <div className="flex gap-2">
            <ShareReportDialog
              assessmentId="sample-assessment"
              assessmentName="Coachability Assessment Report"
              participantName={user?.name || "Alex Johnson"}
            />
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
                      <span>{assessmentData.participant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{assessmentData.participant.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Assessment Date:</span>
                      <span>{assessmentData.participant.assessmentDate}</span>
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
                    {assessmentData.referees.map((referee: any) => (
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
                        <div className="text-3xl font-bold text-blue-600">{assessmentData.overallScores.self}</div>
                        <div className="text-sm text-muted-foreground">Self Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{assessmentData.overallScores.referee}</div>
                        <div className="text-sm text-muted-foreground">Referee Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {assessmentData.overallScores.combined}
                        </div>
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
                    <CardDescription>
                      Detailed scores for each coachability domain
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">
                        Page {currentPage + 1} of {totalPages}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getCurrentPageDomains().map((domain, index) => (
                    <div className="space-y-2" key={domain.id}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-lg">{domain.name}</h3>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <span className="font-medium">Self: {assessmentData.domainScores[domain.id].self}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <span className="font-medium">
                              Referees: {assessmentData.domainScores[domain.id].referee}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-600 w-12">Self:</span>
                          <div className="h-3 flex-1 rounded-full bg-muted">
                            <div
                              className="h-3 rounded-full bg-blue-500"
                              style={{ width: `${(assessmentData.domainScores[domain.id].self / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600 w-12">Refs:</span>
                          <div className="h-3 flex-1 rounded-full bg-muted">
                            <div
                              className="h-3 rounded-full bg-green-500"
                              style={{ width: `${(assessmentData.domainScores[domain.id].referee / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{domain.description}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 0}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                  <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === totalPages - 1}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-1 rounded-full"
                      style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coach-fit">
            <Card>
              <CardHeader>
                <CardTitle>Coach-Client Fit Profile</CardTitle>
                <CardDescription>Your readiness and preferences for coaching relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Display like other domains */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Coach-Client Fit</h3>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          <span>Self: {assessmentData.coachFit.self}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span>Referees: {assessmentData.coachFit.referee}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${(assessmentData.coachFit.self / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${(assessmentData.coachFit.referee / 5) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">{assessmentData.coachFit.description}</p>
                  </div>

                  {/* Individual Coach-Client Fit Questions */}
                  <div className="space-y-4 border-l-4 border-blue-200 pl-4 ml-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Individual Question Scores
                    </h4>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          "I am open to receiving direct feedback about my performance"
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span>
                              Self: <strong>4.0</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>
                              Referees: <strong>3.7</strong>
                            </span>
                          </div>
                          <span className="text-red-600 font-medium">Gap: -0.3</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">"I am willing to try new approaches suggested by a coach"</p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span>
                              Self: <strong>4.2</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>
                              Referees: <strong>3.8</strong>
                            </span>
                          </div>
                          <span className="text-red-600 font-medium">Gap: -0.4</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">"I prefer a coach who challenges me to think differently"</p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span>
                              Self: <strong>3.5</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>
                              Referees: <strong>3.3</strong>
                            </span>
                          </div>
                          <span className="text-red-600 font-medium">Gap: -0.2</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          "I work best with a coach who provides structured guidance"
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span>
                              Self: <strong>3.8</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>
                              Referees: <strong>3.7</strong>
                            </span>
                          </div>
                          <span className="text-red-600 font-medium">Gap: -0.1</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="mb-2 font-medium">Coaching Style Analysis</h3>
                    <p>{assessmentData.coachFit.preferredStyle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Suggestions to improve your coachability with supporting evidence from your responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {assessmentData.recommendations.map((recommendation: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-white ${
                            recommendation.priority === "High"
                              ? "bg-red-500"
                              : recommendation.priority === "Medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                recommendation.priority === "High"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                  : recommendation.priority === "Medium"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              }`}
                            >
                              {recommendation.priority} Priority
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {recommendation.domain}
                            </span>
                          </div>
                          <p className="font-medium mb-3">{recommendation.text}</p>

                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Supporting Evidence:
                            </h4>
                            <div className="space-y-2">
                              {recommendation.relatedQuestions.map((question: any) => (
                                <div key={question.id} className="text-sm">
                                  <p className="text-gray-800 dark:text-gray-200 mb-1 italic">"{question.text}"</p>
                                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                    <span>
                                      Self-rated:{" "}
                                      <strong className="text-blue-600 dark:text-blue-400">
                                        {question.selfScore.toFixed(1)}
                                      </strong>
                                    </span>
                                    <span>
                                      Colleague-rated:{" "}
                                      <strong className="text-green-600 dark:text-green-400">
                                        {question.refereeScore.toFixed(1)}
                                      </strong>
                                    </span>
                                    <span
                                      className={`font-medium ${
                                        question.gap > 0
                                          ? "text-green-600 dark:text-green-400"
                                          : question.gap < 0
                                            ? "text-red-600 dark:text-red-400"
                                            : "text-gray-600 dark:text-gray-400"
                                      }`}
                                    >
                                      Gap: {question.gap > 0 ? "+" : ""}
                                      {question.gap.toFixed(1)}
                                      {question.gap > 0 && " (colleagues rate you higher)"}
                                      {question.gap < 0 && " (you rate yourself higher)"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Link href="/dashboard/settings">
            <Button>Explore Settings</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
