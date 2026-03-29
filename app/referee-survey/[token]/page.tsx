"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Complete 12 coachability domains - 48 questions total
const COACHABILITY_DOMAINS = [
  {
    id: "openness-to-feedback",
    name: "Openness to Feedback",
    description: "Their ability to receive and act on feedback from others",
    questions: [
      { id: "q1", text: "asks for feedback to help them improve" },
      { id: "q2", text: "stays calm and listens carefully when receiving feedback" },
      { id: "q3", text: "takes action based on feedback they receive" },
      { id: "q4", text: "welcomes constructive criticism without becoming defensive" },
    ],
  },
  {
    id: "self-awareness",
    name: "Self-Awareness",
    description: "Their understanding of their own strengths and areas for development",
    questions: [
      { id: "q5", text: "has a realistic understanding of their strengths" },
      { id: "q6", text: "acknowledges their areas for development" },
      { id: "q7", text: "reflects on their behavior and its impact on others" },
      { id: "q8", text: "demonstrates insight into how others perceive them" },
    ],
  },
  {
    id: "learning-orientation",
    name: "Learning Orientation",
    description: "Their enthusiasm for acquiring new skills and knowledge",
    questions: [
      { id: "q9", text: "actively seeks out learning opportunities" },
      { id: "q10", text: "shows curiosity about new approaches and methods" },
      { id: "q11", text: "applies new knowledge and skills in their work" },
      { id: "q12", text: "enjoys tackling challenging learning experiences" },
    ],
  },
  {
    id: "change-readiness",
    name: "Change Readiness",
    description: "Their ability to adapt to new situations and approaches",
    questions: [
      { id: "q13", text: "adapts well to changing circumstances" },
      { id: "q14", text: "embraces new ways of doing things" },
      { id: "q15", text: "remains positive during periods of change" },
      { id: "q16", text: "helps others navigate through changes" },
    ],
  },
  {
    id: "emotional-regulation",
    name: "Emotional Regulation",
    description: "Their ability to manage emotions effectively in challenging situations",
    questions: [
      { id: "q17", text: "stays calm under pressure" },
      { id: "q18", text: "manages their emotions effectively in difficult situations" },
      { id: "q19", text: "recovers quickly from setbacks" },
      { id: "q20", text: "maintains composure during conflicts" },
    ],
  },
  {
    id: "goal-orientation",
    name: "Goal Orientation",
    description: "Their focus on setting and achieving meaningful objectives",
    questions: [
      { id: "q21", text: "sets clear and achievable goals" },
      { id: "q22", text: "stays focused on their objectives" },
      { id: "q23", text: "persists in working toward their goals" },
      { id: "q24", text: "regularly reviews and adjusts their goals as needed" },
    ],
  },
  {
    id: "resilience",
    name: "Resilience",
    description: "Their ability to bounce back from setbacks and maintain performance",
    questions: [
      { id: "q25", text: "bounces back quickly from disappointments" },
      { id: "q26", text: "maintains performance during challenging times" },
      { id: "q27", text: "learns from failures and setbacks" },
      { id: "q28", text: "stays optimistic even when facing difficulties" },
    ],
  },
  {
    id: "communication-skills",
    name: "Communication Skills",
    description: "Their effectiveness in expressing ideas and listening to others",
    questions: [
      { id: "q29", text: "communicates their ideas clearly" },
      { id: "q30", text: "listens actively to others" },
      { id: "q31", text: "adapts their communication style to different audiences" },
      { id: "q32", text: "asks thoughtful questions to understand others better" },
    ],
  },
  {
    id: "relationship-building",
    name: "Relationship Building",
    description: "Their ability to develop and maintain positive working relationships",
    questions: [
      { id: "q33", text: "builds rapport easily with others" },
      { id: "q34", text: "maintains positive relationships even during conflicts" },
      { id: "q35", text: "shows genuine interest in others" },
      { id: "q36", text: "creates an inclusive environment for team members" },
    ],
  },
  {
    id: "accountability",
    name: "Accountability",
    description: "Their willingness to take ownership of their actions and commitments",
    questions: [
      { id: "q37", text: "takes responsibility for their actions" },
      { id: "q38", text: "follows through on their commitments" },
      { id: "q39", text: "admits when they make mistakes" },
      { id: "q40", text: "holds themselves to high standards" },
    ],
  },
  {
    id: "growth-mindset",
    name: "Growth Mindset",
    description: "Their belief that abilities can be developed through dedication and hard work",
    questions: [
      { id: "q41", text: "believes they can improve their abilities through effort" },
      { id: "q42", text: "views challenges as opportunities to grow" },
      { id: "q43", text: "sees effort as a path to mastery" },
      { id: "q44", text: "embraces the learning process, even when it's difficult" },
    ],
  },
  {
    id: "action-orientation",
    name: "Action Orientation",
    description: "Their tendency to take initiative and follow through on commitments",
    questions: [
      { id: "q45", text: "takes initiative to get things done" },
      { id: "q46", text: "acts decisively when needed" },
      { id: "q47", text: "follows through on their plans" },
      { id: "q48", text: "proactively addresses problems before they escalate" },
    ],
  },
]

const getSurveyData = (token: string) => {
  // Will be replaced by API fetch in useEffect
  return null as any
}

// Save/load responses from localStorage (offline-friendly, submitted to API on final submit)
const saveResponses = async (token: string, responses: Record<string, string>) => {
  localStorage.setItem(
    `referee-responses-${token}`,
    JSON.stringify({
      responses,
      lastSaved: new Date().toISOString(),
      totalQuestions: 48,
      completedDomains: getCompletedDomains(responses),
    }),
  )
}

const loadResponses = async (token: string) => {
  const raw = localStorage.getItem(`referee-responses-${token}`)
  if (!raw) return { responses: {}, lastSaved: null, completedDomains: [] }
  const data = JSON.parse(raw)
  return {
    responses: data.responses || {},
    lastSaved: data.lastSaved ? new Date(data.lastSaved) : null,
    completedDomains: data.completedDomains || [],
  }
}

const getCompletedDomains = (responses: Record<string, string>) => {
  return COACHABILITY_DOMAINS.filter((domain) => domain.questions.every((q) => responses[q.id])).map((d) => d.id)
}

const likertOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
]

export default function RefereeSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const token = params.token as string

  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [responses, setResponses] = useState<Record<string, string>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [currentDomainIdx, setCurrentDomainIdx] = useState(0)
  const [completedDomains, setCompletedDomains] = useState<string[]>([])
  const [hasShownFinalNotification, setHasShownFinalNotification] = useState(false)
  const [surveyData, setSurveyData] = useState<any>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)

  // Derived data
  const currentDomain = surveyData?.domains[currentDomainIdx] ?? null
  const totalQuestions = 48 // Fixed total for all surveys
  const answeredCount = Object.keys(responses).length
  const progressPct = totalQuestions ? (answeredCount / totalQuestions) * 100 : 0
  const isLastDomain = currentDomainIdx === surveyData?.domains.length - 1

  // Screen size listener
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Load saved responses and validate token via API
  useEffect(() => {
    const init = async () => {
      // Validate token and get survey metadata from API
      try {
        const res = await fetch(`/api/referee-survey?token=${encodeURIComponent(token)}`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          setTokenError(err.error || "Invalid or expired token")
          setIsLoading(false)
          return
        }
        const data = await res.json()
        setSurveyData({
          candidate_name: data.candidate_name,
          assessment_name: data.assessment_name,
          organization_name: data.organization_name,
          domains: COACHABILITY_DOMAINS,
        })
      } catch {
        setTokenError("Unable to validate survey token")
        setIsLoading(false)
        return
      }

      const { responses: saved, lastSaved, completedDomains } = await loadResponses(token)
      setResponses(saved)
      setLastSaved(lastSaved)
      setCompletedDomains(completedDomains)
      setIsLoading(false)
    }
    init()
  }, [token])

  // Debounced auto-save - with special handling for final domain
  const autoSave = useCallback(async () => {
    if (!surveyData || !currentDomain) return

    const domainComplete = currentDomain.questions.every((q: any) => responses[q.id])
    if (!domainComplete || Object.keys(responses).length === 0) return

    // For the final domain, only save once
    if (isLastDomain && hasShownFinalNotification) return

    setIsSaving(true)
    try {
      await saveResponses(token, responses)
      setLastSaved(new Date())
      setCompletedDomains(getCompletedDomains(responses))

      if (isLastDomain) {
        setHasShownFinalNotification(true)
      }
    } catch (error) {
      console.error("Failed to save responses:", error)
    } finally {
      setIsSaving(false)
    }
  }, [responses, currentDomain, surveyData, token, isLastDomain, hasShownFinalNotification])

  // Trigger auto-save when domain is completed
  useEffect(() => {
    if (!currentDomain) return
    const domainComplete = currentDomain.questions.every((q: any) => responses[q.id])
    if (domainComplete) {
      const timeoutId = setTimeout(autoSave, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [responses, currentDomain, autoSave])

  // Reset final notification flag when moving to a new domain
  useEffect(() => {
    setHasShownFinalNotification(false)
  }, [currentDomainIdx])

  // Event handlers
  const setAnswer = (qid: string, value: string) => {
    setResponses((prev) => ({ ...prev, [qid]: value }))
  }

  const nextDomain = async () => {
    if (!surveyData) return

    // Save current progress
    if (currentDomain && currentDomain.questions.every((q: any) => responses[q.id])) {
      setIsSaving(true)
      await saveResponses(token, responses)
      setLastSaved(new Date())
      setIsSaving(false)
    }

    if (currentDomainIdx < surveyData.domains.length - 1) {
      setCurrentDomainIdx((i) => i + 1)
    }
  }

  const prevDomain = () => {
    setCurrentDomainIdx((i) => Math.max(i - 1, 0))
  }

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      toast({
        title: "Incomplete Survey",
        description: `Please answer all ${totalQuestions} questions before submitting. You have completed ${answeredCount} questions.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Save to localStorage as backup
      await saveResponses(token, responses)
      // Submit to server DB
      const res = await fetch("/api/referee-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, responses }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Submission failed")
      }
      toast({
        title: "Survey Submitted Successfully!",
        description: `Thank you for providing feedback about ${surveyData.candidate_name}. Your responses have been recorded.`,
      })
      // Redirect to dashboard with referee tab active
      router.push("/dashboard?tab=referee")
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try submitting again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    )
  }

  // Invalid or expired token
  if (!surveyData || tokenError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-semibold">Survey Not Available</h1>
        <p className="text-muted-foreground">{tokenError || "The survey token may be invalid or expired."}</p>
        <Button onClick={() => router.push("/")}>Return Home</Button>
      </div>
    )
  }

  const isFirst = currentDomainIdx === 0
  const canNext = currentDomain ? currentDomain.questions.every((q: any) => responses[q.id]) : false

  return (
    <main className={`min-h-screen bg-background ${isMobile ? "px-2 py-4" : ""}`}>
      <div className={`container py-8 ${isMobile ? "max-w-full" : "max-w-4xl"}`}>
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>

          <h1 className="text-3xl font-bold">Referee Assessment</h1>
          <p className="text-lg text-muted-foreground">
            Providing feedback about <strong>{surveyData.candidate_name}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            {surveyData.assessment_name} • {surveyData.organization_name || "Personal Assessment"}
          </p>
          {lastSaved && answeredCount > 0 && (
            <p className="text-sm text-blue-600 font-medium">
              ✓ Resuming from previous session - {answeredCount} of {totalQuestions} questions completed
            </p>
          )}
        </div>

        {/* Mobile domain indicator */}
        {isMobile && (
          <div className="mb-6 text-center">
            <div className="text-lg font-semibold mb-2">
              Domain {currentDomainIdx + 1} of {surveyData.domains.length}
            </div>
            <div className="text-sm text-muted-foreground">{currentDomain?.name}</div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">
              {answeredCount} of {totalQuestions} questions completed
            </span>
          </div>
          <Progress value={progressPct} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>
              {completedDomains.length} of {surveyData.domains.length} domains completed
            </span>
            <span>{Math.round(progressPct)}%</span>
          </div>
        </div>

        {/* Save status */}
        {(isSaving || lastSaved) && (
          <div className="mb-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-muted-foreground">Saving progress...</span>
                </>
              ) : lastSaved ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : null}
            </div>
            {lastSaved && <span className="text-xs text-muted-foreground">Auto-saves after each domain</span>}
          </div>
        )}

        {/* Domain Card with Questions */}
        {currentDomain && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{currentDomain.name}</CardTitle>
                  <CardDescription className="text-base mt-2">{currentDomain.description}</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  Domain {currentDomainIdx + 1} of {surveyData.domains.length}
                  {isLastDomain && <div className="text-xs text-orange-600 mt-1">Final Domain</div>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scale Legend */}
              <div className={`bg-muted/50 p-4 rounded-lg ${isMobile ? "mb-6" : ""}`}>
                <h4 className="font-medium mb-2">Rating Scale:</h4>
                <div className={`grid grid-cols-5 gap-2 text-sm ${isMobile ? "text-center" : ""}`}>
                  <div className="text-center">
                    <div className={`font-medium ${isMobile ? "text-lg mb-1" : ""}`}>1</div>
                    <div className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Strongly Disagree</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${isMobile ? "text-lg mb-1" : ""}`}>2</div>
                    <div className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Disagree</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${isMobile ? "text-lg mb-1" : ""}`}>3</div>
                    <div className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${isMobile ? "text-lg mb-1" : ""}`}>4</div>
                    <div className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Agree</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${isMobile ? "text-lg mb-1" : ""}`}>5</div>
                    <div className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Strongly Agree</div>
                  </div>
                </div>
              </div>

              {/* Questions */}
              {currentDomain.questions.map((question: any, index: number) => (
                <div key={question.id} className="space-y-3">
                  <Label className="text-base font-medium block">
                    {index + 1}. {surveyData.candidate_name} {question.text}
                  </Label>

                  <RadioGroup
                    value={responses[question.id] || ""}
                    onValueChange={(value) => setAnswer(question.id, value)}
                    className={isMobile ? "grid grid-cols-5 gap-3 justify-center" : "flex justify-center gap-8"}
                  >
                    {likertOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex flex-col items-center ${isMobile ? "space-y-1" : "space-y-2"}`}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`${question.id}-${option.value}`}
                          className={isMobile ? "w-6 h-6" : "w-5 h-5"}
                        />
                        <Label
                          htmlFor={`${question.id}-${option.value}`}
                          className={`text-sm font-medium cursor-pointer text-center ${isMobile ? "text-lg" : ""}`}
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className={`flex ${isMobile ? "flex-col space-y-4" : "justify-between items-center"}`}>
          <Button
            variant="outline"
            disabled={isFirst}
            onClick={prevDomain}
            className={`${isMobile ? "w-full h-12 text-lg" : "flex items-center gap-2"}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Domain
          </Button>

          {!isMobile && (
            <div className="text-sm text-muted-foreground text-center">
              <div>
                Domain {currentDomainIdx + 1} of {surveyData.domains.length}
              </div>
              <div className="text-xs mt-1">
                {canNext
                  ? isLastDomain
                    ? "✓ Ready to submit"
                    : "✓ Domain complete"
                  : `${currentDomain?.questions.filter((q: any) => responses[q.id]).length || 0} of 4 questions answered`}
              </div>
            </div>
          )}

          {!isLastDomain ? (
            <Button disabled={!canNext} onClick={nextDomain} className={`${isMobile ? "w-full h-12 text-lg" : ""}`}>
              Next Domain
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              disabled={!canNext || isSubmitting}
              onClick={handleSubmit}
              className={`${isMobile ? "w-full h-12 text-lg" : ""} ${answeredCount === totalQuestions ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              {isSubmitting
                ? "Submitting..."
                : answeredCount === totalQuestions
                  ? "Submit Complete Assessment"
                  : "Submit Assessment"}
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
