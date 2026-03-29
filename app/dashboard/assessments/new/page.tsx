"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Define the Likert scale options
const likertOptions = [
  { value: "1", label: "Never" },
  { value: "2", label: "Rarely" },
  { value: "3", label: "Sometimes" },
  { value: "4", label: "Often" },
  { value: "5", label: "Always" },
]

interface Question {
  id: string
  text: string
  order: number
  type: string
  forType: string
}

interface Domain {
  id: string
  name: string
  description: string
  order: number
  questions: Question[]
}

export default function NewAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [domains, setDomains] = useState<Domain[]>([])
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [assessmentName, setAssessmentName] = useState<string>("")

  // Add mobile detection
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        // Always fetch domains first - this is critical for rendering the survey
        const domainsResponse = await fetch("/api/domains?includeQuestions=true")

        if (!domainsResponse.ok) {
          throw new Error("Failed to fetch domains")
        }

        const { domains: fetchedDomains } = await domainsResponse.json()

        if (fetchedDomains.length === 0) {
          throw new Error("No domains received from API")
        }

        setDomains(fetchedDomains)

        // Now handle assessment ID
        const existingAssessmentId = searchParams.get("assessmentId")
        let currentAssessmentId = existingAssessmentId

        if (currentAssessmentId) {
          setAssessmentName("Coachability Assessment - In Progress")
        } else if (user?.id) {
          // Create a new assessment only if we have a user
          const assessmentResponse = await fetch("/api/assessments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": user.id,
            },
            body: JSON.stringify({}),
          })

          if (assessmentResponse.ok) {
            const { assessment } = await assessmentResponse.json()
            currentAssessmentId = assessment.id
            setAssessmentName(assessment.name || "Coachability Assessment")
          } else {
            // Assessment creation failed but we still have domains - use a temporary ID
            currentAssessmentId = `temp-assessment-${Date.now()}`
            setAssessmentName("Coachability Assessment")
          }
        } else {
          currentAssessmentId = `temp-assessment-${Date.now()}`
          setAssessmentName("Coachability Assessment")
        }

        setAssessmentId(currentAssessmentId)
      } catch (error) {
        console.error("Error initializing assessment:", error)
        toast({
          title: "Error",
          description: "Failed to initialize assessment. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeAssessment()
  }, [toast, searchParams, user])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading assessment...</p>
          </div>
        </div>
      </div>
    )
  }

  if (domains.length === 0) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">
            No assessment questions available. Please contact support.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry Loading
          </Button>
        </div>
      </div>
    )
  }

  const currentDomain = domains[currentDomainIndex]
  const progress = ((currentDomainIndex + 1) / domains.length) * 100

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const isDomainComplete = (domainIndex: number) => {
    const domain = domains[domainIndex]
    return domain.questions.every((q) => responses[q.id])
  }

  const isCurrentDomainComplete = () => {
    return isDomainComplete(currentDomainIndex)
  }

  const handleDomainClick = (domainIndex: number) => {
    setCurrentDomainIndex(domainIndex)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNext = () => {
    if (currentDomainIndex < domains.length - 1) {
      setCurrentDomainIndex(currentDomainIndex + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentDomainIndex > 0) {
      setCurrentDomainIndex(currentDomainIndex - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = async () => {
    if (!assessmentId) {
      toast({
        title: "Error",
        description: "Assessment ID not found. Please try again.",
        variant: "destructive",
      })
      return
    }

    // Check if all domains are complete
    const incompletedomains = domains.filter((_, index) => !isDomainComplete(index))
    if (incompletedomains.length > 0) {
      toast({
        title: "Assessment Incomplete",
        description: `Please complete all domains before submitting. ${incompletedomains.length} domains remaining.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formattedResponses = Object.entries(responses).map(([questionId, value]) => ({
        questionId,
        value,
      }))

      const response = await fetch(`/api/assessments/${assessmentId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({ responses: formattedResponses }),
      })

      if (!response.ok) {
        throw new Error("Failed to save responses")
      }

      toast({
        title: "Assessment completed",
        description: "Your self-assessment has been saved successfully.",
      })

      router.push(`/dashboard/referees/nominate?assessmentId=${assessmentId}`)
    } catch (error) {
      console.error("Error submitting assessment:", error)
      toast({
        title: "Something went wrong",
        description: "Your assessment could not be submitted. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalQuestions = domains.reduce((sum, domain) => sum + domain.questions.length, 0)
  const answeredQuestions = Object.keys(responses).length
  const completedDomains = domains.filter((_, index) => isDomainComplete(index)).length

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Self-Assessment</h1>
          <h2 className="text-xl text-muted-foreground font-medium">{assessmentName}</h2>
          <p className="text-muted-foreground">
            Complete the assessment by answering questions about your coachability.
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedDomains}/{domains.length} domains completed
            </span>
          </div>
          <Progress value={(completedDomains / domains.length) * 100} className="h-2 w-full" />
        </div>

      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Domain {currentDomainIndex + 1}</Badge>
                  {currentDomain.name}
                </CardTitle>
                <CardDescription className="mt-2">{currentDomain.description}</CardDescription>
              </div>
              {isDomainComplete(currentDomainIndex) && <CheckCircle2 className="h-6 w-6 text-green-600" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {currentDomain.questions.map((question, questionIndex) => (
                <div key={question.id} className="space-y-4">
                  <div>
                    <Label className="text-base">
                      {questionIndex + 1}. {question.text}
                    </Label>
                  </div>
                  <RadioGroup
                    value={responses[question.id] || ""}
                    onValueChange={(value) => handleResponseChange(question.id, value)}
                    className={`flex ${isMobile ? "flex-col space-y-4" : "flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0"}`}
                  >
                    {likertOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center ${isMobile ? "justify-center p-4 border rounded-lg hover:bg-muted/50 transition-colors" : "space-x-2"}`}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`${question.id}-${option.value}`}
                          className={isMobile ? "w-6 h-6" : ""}
                        />
                        <Label
                          htmlFor={`${question.id}-${option.value}`}
                          className={`font-normal cursor-pointer ${isMobile ? "text-lg ml-3" : ""}`}
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

        <div className={`flex ${isMobile ? "flex-col space-y-3" : "justify-between"} px-4`}>
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentDomainIndex === 0}
            className={isMobile ? "w-full h-12 text-lg" : ""}
          >
            Previous Domain
          </Button>
          <div className="flex items-center gap-4">
            {currentDomainIndex < domains.length - 1 && (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isCurrentDomainComplete()}
                className={isMobile ? "w-full h-12 text-lg" : ""}
              >
                Next Domain ({currentDomainIndex + 2}/{domains.length})
              </Button>
            )}
            {currentDomainIndex === domains.length - 1 && (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || completedDomains !== domains.length}
                className={isMobile ? "w-full h-12 text-lg" : ""}
              >
                {isSubmitting ? "Submitting..." : "Submit Assessment"}
              </Button>
            )}
          </div>
        </div>

        {/* Domain Cards - 3 across */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Assessment Domains</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain, index) => {
              const isActive = index === currentDomainIndex
              const isComplete = isDomainComplete(index)
              const answeredInDomain = domain.questions.filter((q) => responses[q.id]).length

              return (
                <Card
                  key={domain.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isActive
                      ? "ring-2 ring-primary border-primary"
                      : isComplete
                        ? "border-green-300 bg-green-50/50"
                        : "hover:border-muted-foreground/30"
                  }`}
                  onClick={() => handleDomainClick(index)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={isActive ? "default" : "outline"} className="text-xs">
                        Domain {index + 1}
                      </Badge>
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {answeredInDomain}/{domain.questions.length}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-sm mt-1">{domain.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2">{domain.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
