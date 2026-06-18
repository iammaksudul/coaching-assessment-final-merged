"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"

// Complete assessment data - all 12 domains with 4 questions each
const ASSESSMENT_DOMAINS = [
  {
    id: "d1",
    name: "Openness to Feedback",
    description: "Your ability to receive and act on feedback from others.",
    questions: [
      { id: "q1", text: "I ask for feedback to help me improve." },
      { id: "q2", text: "I stay calm and listen carefully when receiving feedback." },
      { id: "q3", text: "I take action based on feedback I receive." },
      { id: "q4", text: "I welcome constructive criticism without becoming defensive." },
    ],
  },
  {
    id: "d2",
    name: "Self-Awareness",
    description: "Your understanding of your own strengths and areas for development.",
    questions: [
      { id: "q5", text: "I have a realistic understanding of my strengths." },
      { id: "q6", text: "I acknowledge my areas for development." },
      { id: "q7", text: "I reflect on my behavior and its impact on others." },
      { id: "q8", text: "I demonstrate insight into how others perceive me." },
    ],
  },
  {
    id: "d3",
    name: "Learning Orientation",
    description: "Your enthusiasm for acquiring new skills and knowledge.",
    questions: [
      { id: "q9", text: "I actively seek out learning opportunities." },
      { id: "q10", text: "I show curiosity about new approaches and methods." },
      { id: "q11", text: "I apply new knowledge and skills in my work." },
      { id: "q12", text: "I enjoy tackling challenging learning experiences." },
    ],
  },
  {
    id: "d4",
    name: "Change Readiness",
    description: "Your ability to adapt to new situations and approaches.",
    questions: [
      { id: "q13", text: "I adapt well to changing circumstances." },
      { id: "q14", text: "I embrace new ways of doing things." },
      { id: "q15", text: "I remain positive during periods of change." },
      { id: "q16", text: "I help others navigate through changes." },
    ],
  },
  {
    id: "d5",
    name: "Emotional Regulation",
    description: "Your ability to manage emotions effectively in challenging situations.",
    questions: [
      { id: "q17", text: "I stay calm under pressure." },
      { id: "q18", text: "I manage my emotions effectively in difficult situations." },
      { id: "q19", text: "I recover quickly from setbacks." },
      { id: "q20", text: "I maintain composure during conflicts." },
    ],
  },
  {
    id: "d6",
    name: "Goal Orientation",
    description: "Your focus on setting and achieving meaningful objectives.",
    questions: [
      { id: "q21", text: "I set clear and achievable goals." },
      { id: "q22", text: "I stay focused on my objectives." },
      { id: "q23", text: "I persist in working toward my goals." },
      { id: "q24", text: "I regularly review and adjust my goals as needed." },
    ],
  },
  {
    id: "d7",
    name: "Resilience",
    description: "Your ability to bounce back from setbacks and maintain performance.",
    questions: [
      { id: "q25", text: "I bounce back quickly from disappointments." },
      { id: "q26", text: "I maintain performance during challenging times." },
      { id: "q27", text: "I learn from failures and setbacks." },
      { id: "q28", text: "I stay optimistic even when facing difficulties." },
    ],
  },
  {
    id: "d8",
    name: "Communication Skills",
    description: "Your effectiveness in expressing ideas and listening to others.",
    questions: [
      { id: "q29", text: "I communicate my ideas clearly." },
      { id: "q30", text: "I listen actively to others." },
      { id: "q31", text: "I adapt my communication style to different audiences." },
      { id: "q32", text: "I ask thoughtful questions to understand others better." },
    ],
  },
  {
    id: "d9",
    name: "Relationship Building",
    description: "Your ability to develop and maintain positive working relationships.",
    questions: [
      { id: "q33", text: "I build rapport easily with others." },
      { id: "q34", text: "I maintain positive relationships even during conflicts." },
      { id: "q35", text: "I show genuine interest in others." },
      { id: "q36", text: "I create an inclusive environment for team members." },
    ],
  },
  {
    id: "d10",
    name: "Accountability",
    description: "Your willingness to take ownership of your actions and commitments.",
    questions: [
      { id: "q37", text: "I take responsibility for my actions." },
      { id: "q38", text: "I follow through on my commitments." },
      { id: "q39", text: "I admit when I make mistakes." },
      { id: "q40", text: "I hold myself to high standards." },
    ],
  },
  {
    id: "d11",
    name: "Growth Mindset",
    description: "Your belief that abilities can be developed through dedication and hard work.",
    questions: [
      { id: "q41", text: "I believe I can improve my abilities through effort." },
      { id: "q42", text: "I view challenges as opportunities to grow." },
      { id: "q43", text: "I see effort as a path to mastery." },
      { id: "q44", text: "I embrace the learning process, even when it's difficult." },
    ],
  },
  {
    id: "d12",
    name: "Action Orientation",
    description: "Your tendency to take initiative and follow through on commitments.",
    questions: [
      { id: "q45", text: "I take initiative to get things done." },
      { id: "q46", text: "I act decisively when needed." },
      { id: "q47", text: "I follow through on my plans." },
      { id: "q48", text: "I proactively address problems before they escalate." },
    ],
  },
]

const likertOptions = [
  { value: "1", label: "Never" },
  { value: "2", label: "Rarely" },
  { value: "3", label: "Sometimes" },
  { value: "4", label: "Often" },
  { value: "5", label: "Always" },
]

export default function TakeAssessmentPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Initialize assessment and load existing responses
  useEffect(() => {
    const initializeAssessment = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        // Create new assessment
        const assessmentResponse = await fetch("/api/assessments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user?.id || "",
          },
          body: JSON.stringify({ name: "Coachability Assessment" }),
        })

        if (assessmentResponse.ok) {
          const assessment = await assessmentResponse.json()
          setAssessmentId(assessment.id)
        }
      } catch (error) {
        console.error("Failed to initialize assessment:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAssessment()
  }, [user, router])

  const currentDomain = ASSESSMENT_DOMAINS[currentDomainIndex]

  const saveResponses = useCallback(
    async (responsesToSave: Record<string, string>) => {
      if (!assessmentId || !user) return

      setIsSaving(true)
      try {
        const responsesArray = Object.entries(responsesToSave).map(([questionId, value]) => ({
          questionId,
          value: Number.parseInt(value),
        }))

        await fetch(`/api/assessments/${assessmentId}/responses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user?.id || "",
          },
          body: JSON.stringify({ responses: responsesArray }),
        })
      } catch (error) {
        console.error("Failed to save responses:", error)
      } finally {
        setIsSaving(false)
      }
    },
    [assessmentId, user],
  )

  const handleResponseChange = (questionId: string, value: string) => {
    const newResponses = {
      ...responses,
      [questionId]: value,
    }
    setResponses(newResponses)

    // Auto-save after a short delay
    setTimeout(() => {
      saveResponses(newResponses)
    }, 1000)
  }

  const isDomainComplete = (domainIndex: number) => {
    const domain = ASSESSMENT_DOMAINS[domainIndex]
    return domain.questions.every((q) => responses[q.id])
  }

  const handleDomainClick = async (domainIndex: number) => {
    // Save current responses before switching domains
    await saveResponses(responses)
    setCurrentDomainIndex(domainIndex)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!allDomainsComplete) return

    setIsSubmitting(true)
    try {
      // Save all responses one final time
      await saveResponses(responses)

      // Mark assessment as completed via API
      if (assessmentId) {
        await fetch(`/api/assessments/${assessmentId}/responses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user?.id || "",
          },
          body: JSON.stringify({
            responses: Object.entries(responses).map(([questionId, value]) => ({
              questionId,
              value: Number.parseInt(value),
            })),
            status: "COMPLETED",
          }),
        })
      }

      // Redirect to referee nomination for this assessment
      router.push(`/dashboard/referees/nominate?assessmentId=${assessmentId || `temp-${Date.now()}`}`)
    } catch (error) {
      console.error("Failed to submit assessment:", error)
      // Still redirect even if save fails -- responses were auto-saved along the way
      router.push(`/dashboard/referees/nominate?assessmentId=${assessmentId || `temp-${Date.now()}`}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const allDomainsComplete = ASSESSMENT_DOMAINS.every((_, index) => isDomainComplete(index))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Coachability Assessment</h1>
          <p className="text-muted-foreground">Complete all 12 domains by answering 4 questions in each domain.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                Domain {currentDomainIndex + 1}
              </span>
              {currentDomain.name}
              {isDomainComplete(currentDomainIndex) && <Check className="h-5 w-5 text-green-600" />}
            </CardTitle>
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                Saving...
              </div>
            )}
            <CardDescription>{currentDomain.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {currentDomain.questions.map((question, questionIndex) => (
                <div key={question.id} className="space-y-4">
                  <Label className="text-base font-medium">
                    {questionIndex + 1}. {question.text}
                  </Label>
                  <RadioGroup
                    value={responses[question.id] || ""}
                    onValueChange={(value) => handleResponseChange(question.id, value)}
                    className={`flex ${isMobile ? "flex-col space-y-3" : "flex-row space-x-6"}`}
                  >
                    {likertOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center ${isMobile ? "p-3 border rounded-lg hover:bg-muted/50" : "space-x-2"}`}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`${question.id}-${option.value}`}
                          className={isMobile ? "w-5 h-5" : ""}
                        />
                        <Label
                          htmlFor={`${question.id}-${option.value}`}
                          className={`cursor-pointer ${isMobile ? "ml-3 text-base" : "text-sm"}`}
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Domain Navigation - 3 across cards */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Assessment Domains</h3>
            <span className="text-sm text-muted-foreground">
              {ASSESSMENT_DOMAINS.filter((_, index) => isDomainComplete(index)).length}/12 completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {ASSESSMENT_DOMAINS.map((domain, index) => {
              const isActive = index === currentDomainIndex
              const isComplete = isDomainComplete(index)
              const answeredInDomain = domain.questions.filter((q) => responses[q.id]).length

              return (
                <div
                  key={domain.id}
                  onClick={() => handleDomainClick(index)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all hover:shadow-md ${
                    isActive
                      ? "bg-primary/10 border-primary ring-2 ring-primary"
                      : isComplete
                        ? "border-green-300 bg-green-50/50"
                        : "bg-muted/50 hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{domain.name}</h4>
                    {isComplete ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {answeredInDomain}/{domain.questions.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{domain.description}</p>
                  {isActive && (
                    <div className="mt-2">
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Current Domain
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {allDomainsComplete && (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
