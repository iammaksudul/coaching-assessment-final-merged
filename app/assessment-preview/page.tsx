import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Complete assessment data - all 12 domains with 4 questions each
const COMPLETE_ASSESSMENT_DATA = [
  {
    id: "d1",
    name: "Openness to Feedback",
    description: "Your ability to receive and act on feedback from others.",
    order: 1,
    questions: [
      { id: "q1", text: "I ask for feedback to help me improve.", order: 1 },
      { id: "q2", text: "I stay calm and listen carefully when receiving feedback.", order: 2 },
      { id: "q3", text: "I take action based on feedback I receive.", order: 3 },
      { id: "q4", text: "I welcome constructive criticism without becoming defensive.", order: 4 },
    ],
  },
  {
    id: "d2",
    name: "Self-Awareness",
    description: "Your understanding of your own strengths and areas for development.",
    order: 2,
    questions: [
      { id: "q5", text: "I have a realistic understanding of my strengths.", order: 1 },
      { id: "q6", text: "I acknowledge my areas for development.", order: 2 },
      { id: "q7", text: "I reflect on my behavior and its impact on others.", order: 3 },
      { id: "q8", text: "I demonstrate insight into how others perceive me.", order: 4 },
    ],
  },
  {
    id: "d3",
    name: "Learning Orientation",
    description: "Your enthusiasm for acquiring new skills and knowledge.",
    order: 3,
    questions: [
      { id: "q9", text: "I actively seek out learning opportunities.", order: 1 },
      { id: "q10", text: "I show curiosity about new approaches and methods.", order: 2 },
      { id: "q11", text: "I apply new knowledge and skills in my work.", order: 3 },
      { id: "q12", text: "I enjoy tackling challenging learning experiences.", order: 4 },
    ],
  },
  {
    id: "d4",
    name: "Change Readiness",
    description: "Your ability to adapt to new situations and approaches.",
    order: 4,
    questions: [
      { id: "q13", text: "I adapt well to changing circumstances.", order: 1 },
      { id: "q14", text: "I embrace new ways of doing things.", order: 2 },
      { id: "q15", text: "I remain positive during periods of change.", order: 3 },
      { id: "q16", text: "I help others navigate through changes.", order: 4 },
    ],
  },
  {
    id: "d5",
    name: "Emotional Regulation",
    description: "Your ability to manage emotions effectively in challenging situations.",
    order: 5,
    questions: [
      { id: "q17", text: "I stay calm under pressure.", order: 1 },
      { id: "q18", text: "I manage my emotions effectively in difficult situations.", order: 2 },
      { id: "q19", text: "I recover quickly from setbacks.", order: 3 },
      { id: "q20", text: "I maintain composure during conflicts.", order: 4 },
    ],
  },
  {
    id: "d6",
    name: "Goal Orientation",
    description: "Your focus on setting and achieving meaningful objectives.",
    order: 6,
    questions: [
      { id: "q21", text: "I set clear and achievable goals.", order: 1 },
      { id: "q22", text: "I stay focused on my objectives.", order: 2 },
      { id: "q23", text: "I persist in working toward my goals.", order: 3 },
      { id: "q24", text: "I regularly review and adjust my goals as needed.", order: 4 },
    ],
  },
  {
    id: "d7",
    name: "Resilience",
    description: "Your ability to bounce back from setbacks and maintain performance.",
    order: 7,
    questions: [
      { id: "q25", text: "I bounce back quickly from disappointments.", order: 1 },
      { id: "q26", text: "I maintain performance during challenging times.", order: 2 },
      { id: "q27", text: "I learn from failures and setbacks.", order: 3 },
      { id: "q28", text: "I stay optimistic even when facing difficulties.", order: 4 },
    ],
  },
  {
    id: "d8",
    name: "Communication Skills",
    description: "Your effectiveness in expressing ideas and listening to others.",
    order: 8,
    questions: [
      { id: "q29", text: "I communicate my ideas clearly.", order: 1 },
      { id: "q30", text: "I listen actively to others.", order: 2 },
      { id: "q31", text: "I adapt my communication style to different audiences.", order: 3 },
      { id: "q32", text: "I ask thoughtful questions to understand others better.", order: 4 },
    ],
  },
  {
    id: "d9",
    name: "Relationship Building",
    description: "Your ability to develop and maintain positive working relationships.",
    order: 9,
    questions: [
      { id: "q33", text: "I build rapport easily with others.", order: 1 },
      { id: "q34", text: "I maintain positive relationships even during conflicts.", order: 2 },
      { id: "q35", text: "I show genuine interest in others.", order: 3 },
      { id: "q36", text: "I create an inclusive environment for team members.", order: 4 },
    ],
  },
  {
    id: "d10",
    name: "Accountability",
    description: "Your willingness to take ownership of your actions and commitments.",
    order: 10,
    questions: [
      { id: "q37", text: "I take responsibility for my actions.", order: 1 },
      { id: "q38", text: "I follow through on my commitments.", order: 2 },
      { id: "q39", text: "I admit when I make mistakes.", order: 3 },
      { id: "q40", text: "I hold myself to high standards.", order: 4 },
    ],
  },
  {
    id: "d11",
    name: "Growth Mindset",
    description: "Your belief that abilities can be developed through dedication and hard work.",
    order: 11,
    questions: [
      { id: "q41", text: "I believe I can improve my abilities through effort.", order: 1 },
      { id: "q42", text: "I view challenges as opportunities to grow.", order: 2 },
      { id: "q43", text: "I see effort as a path to mastery.", order: 3 },
      { id: "q44", text: "I embrace the learning process, even when it's difficult.", order: 4 },
    ],
  },
  {
    id: "d12",
    name: "Action Orientation",
    description: "Your tendency to take initiative and follow through on commitments.",
    order: 12,
    questions: [
      { id: "q45", text: "I take initiative to get things done.", order: 1 },
      { id: "q46", text: "I act decisively when needed.", order: 2 },
      { id: "q47", text: "I follow through on my plans.", order: 3 },
      { id: "q48", text: "I proactively address problems before they escalate.", order: 4 },
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

export default function AssessmentPreviewPage() {
  // For preview, we'll show the first domain but indicate there are 12 total
  const currentDomain = COMPLETE_ASSESSMENT_DATA[0]
  const totalDomains = COMPLETE_ASSESSMENT_DATA.length
  const totalQuestions = COMPLETE_ASSESSMENT_DATA.reduce((sum, domain) => sum + domain.questions.length, 0)

  // Calculate progress as if we're on domain 1 of 12
  const progress = (1 / totalDomains) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Mode Banner */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        <strong>Preview Mode:</strong> This is a demonstration of the assessment experience
      </div>

      <div className="container py-8">
        <div className="mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Self-Assessment</h1>
          <h2 className="text-xl text-muted-foreground font-medium">Coachability Assessment - February 2024</h2>
          <p className="text-muted-foreground">
            Complete the assessment by answering questions about your coachability.
          </p>

          {/* Assessment Overview */}
          <div className="bg-muted/50 p-4 rounded-lg mt-2">
            <p className="text-sm text-muted-foreground">
              <strong>Complete Assessment:</strong> {totalDomains} domains • {totalQuestions} total questions
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This preview shows Domain 1. The full assessment includes all {totalDomains} domains.
            </p>
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2 w-full" />
            <p className="mt-2 text-sm text-muted-foreground">
              Domain 1 of {totalDomains}: {currentDomain.name}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentDomain.name}</CardTitle>
            <CardDescription>{currentDomain.description}</CardDescription>
            <div className="text-sm text-muted-foreground">
              {currentDomain.questions.length} questions in this domain
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
                    defaultValue={questionIndex === 0 ? "3" : questionIndex === 1 ? "4" : ""}
                    className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0"
                  >
                    {likertOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                        <Label htmlFor={`${question.id}-${option.value}`} className="font-normal">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Next: {COMPLETE_ASSESSMENT_DATA[1].name}</span>
              <Link href="/dashboard/referees">
                <Button>Next Domain</Button>
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Domain Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Complete Assessment Overview</CardTitle>
            <CardDescription>All {totalDomains} domains in the full assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMPLETE_ASSESSMENT_DATA.map((domain, index) => (
                <div
                  key={domain.id}
                  className={`p-3 rounded-lg border ${index === 0 ? "bg-primary/10 border-primary" : "bg-muted/50"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{domain.name}</h4>
                    <span className="text-xs text-muted-foreground">{domain.questions.length} questions</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{domain.description}</p>
                  {index === 0 && (
                    <div className="mt-2">
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Current Domain
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
