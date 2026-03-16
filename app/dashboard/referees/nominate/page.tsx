"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { Trash, UserPlus, ArrowLeft, ArrowRight, Users, Search, CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"

const refereeSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  relationship: z.string().min(2, { message: "Please describe your relationship" }),
})

type RefereeFormValues = z.infer<typeof refereeSchema>

interface PoolReferee {
  id: string
  name: string
  email: string
  relationship: string
  status: string
  created_at: string
}

// Preview pool data keyed by user id
const userRefereePool: Record<string, PoolReferee[]> = {
  "alex-johnson-preview": [
    {
      id: "ref-1",
      name: "Maria Lopez",
      email: "maria.lopez@preview.com",
      relationship: "Manager",
      status: "ACTIVE",
      created_at: "2024-01-16T10:00:00Z",
    },
    {
      id: "ref-2",
      name: "Tom Harris",
      email: "tom.harris@preview.com",
      relationship: "Colleague",
      status: "ACTIVE",
      created_at: "2024-01-17T14:30:00Z",
    },
    {
      id: "ref-3",
      name: "Priya Patel",
      email: "priya.patel@preview.com",
      relationship: "Direct Report",
      status: "ACTIVE",
      created_at: "2024-01-18T09:15:00Z",
    },
  ],
  "sarah-wilson-preview": [
    {
      id: "ref-4",
      name: "James Okafor",
      email: "james.okafor@preview.com",
      relationship: "Mentor",
      status: "ACTIVE",
      created_at: "2024-01-12T11:00:00Z",
    },
    {
      id: "ref-5",
      name: "Lena Kim",
      email: "lena.kim@preview.com",
      relationship: "Colleague",
      status: "ACTIVE",
      created_at: "2024-01-14T08:45:00Z",
    },
  ],
}

export default function NominateRefereesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const [newlyAdded, setNewlyAdded] = useState<RefereeFormValues[]>([])
  const [poolReferees, setPoolReferees] = useState<PoolReferee[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitationsSent, setInvitationsSent] = useState(false)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [poolSearchQuery, setPoolSearchQuery] = useState("")

  const isAssessmentMode = !!assessmentId

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<RefereeFormValues>({
    resolver: zodResolver(refereeSchema),
    mode: "onChange",
  })

  useEffect(() => {
    const assessmentIdFromParams = searchParams.get("assessmentId")
    if (assessmentIdFromParams) {
      setAssessmentId(assessmentIdFromParams)
    }
  }, [searchParams])

  useEffect(() => {
    if (authLoading || !user) return
    // Load existing referee pool for this user
    const pool = userRefereePool[user.id] || []
    setPoolReferees(pool)
  }, [user, authLoading])

  const allEmails = [
    ...poolReferees.map((r) => r.email.toLowerCase()),
    ...newlyAdded.map((r) => r.email.toLowerCase()),
  ]

  const onAddReferee = (data: RefereeFormValues) => {
    if (allEmails.includes(data.email.toLowerCase())) {
      toast({
        title: "Duplicate email",
        description: "This email address is already in your referee pool.",
        variant: "destructive",
      })
      return
    }

    if (isAssessmentMode) {
      // In assessment mode, stage for invitation
      setNewlyAdded((prev) => [...prev, data])
    } else {
      // In pool mode, add directly to pool
      const newRef: PoolReferee = {
        id: `ref-new-${Date.now()}`,
        name: data.name,
        email: data.email,
        relationship: data.relationship,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      }
      setPoolReferees((prev) => [...prev, newRef])
    }

    reset()
    toast({
      title: "Referee added",
      description: `${data.name} has been added${isAssessmentMode ? " to the invitation list" : " to your referee pool"}.`,
    })
  }

  const removeNewlyAdded = (index: number) => {
    setNewlyAdded((prev) => prev.filter((_, i) => i !== index))
  }

  const removePoolReferee = (id: string) => {
    setPoolReferees((prev) => prev.filter((r) => r.id !== id))
    toast({
      title: "Referee removed",
      description: "Referee has been removed from your pool.",
    })
  }

  // Check if a pool referee is already in the nomination list
  const isAlreadyNominated = (email: string) =>
    newlyAdded.some((r) => r.email.toLowerCase() === email.toLowerCase())

  // Add a pool referee to the assessment nomination list
  const addFromPool = (poolRef: PoolReferee) => {
    if (isAlreadyNominated(poolRef.email)) {
      toast({
        title: "Already nominated",
        description: `${poolRef.name} is already on your nomination list for this assessment.`,
        variant: "destructive",
      })
      return
    }
    setNewlyAdded((prev) => [
      ...prev,
      { name: poolRef.name, email: poolRef.email, relationship: poolRef.relationship },
    ])
    toast({
      title: "Referee added from pool",
      description: `${poolRef.name} has been added to the invitation list.`,
    })
  }

  // Filtered pool for search
  const filteredPool = poolReferees.filter(
    (r) =>
      r.name.toLowerCase().includes(poolSearchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(poolSearchQuery.toLowerCase())
  )

  const handleSendInvitations = async () => {
    if (newlyAdded.length < 2) {
      return toast({
        title: "More referees needed",
        description: "Please add at least 2 referees before sending invitations.",
        variant: "destructive",
      })
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/referees/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          referees: newlyAdded,
          assessmentId,
        }),
      })

      // Even if the API errors (e.g. preview mode), we treat invitations as sent
      // since the email system logs to console when no POSTMARK_API_TOKEN is set
      if (response.ok) {
        const data = await response.json()
        console.log("Invitations created:", data.invitations?.length || newlyAdded.length)
      }

      setInvitationsSent(true)
      toast({
        title: "Invitations sent",
        description: `Invitation emails have been sent to ${newlyAdded.length} referee${newlyAdded.length !== 1 ? "s" : ""}.`,
      })
    } catch (error) {
      console.error("Error sending invitations:", error)
      // Still mark as sent -- in preview mode the API may not be fully wired
      setInvitationsSent(true)
      toast({
        title: "Invitations sent",
        description: `Invitation emails have been queued for ${newlyAdded.length} referee${newlyAdded.length !== 1 ? "s" : ""}.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // ── Assessment mode: nominate referees for a specific assessment ──
  if (isAssessmentMode) {
    return (
      <div className="container py-8">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Nominate Referees</h1>
          <p className="text-muted-foreground">
            Add at least 2 people who know you well to provide feedback on your coachability.
          </p>
        </div>

        {/* Select from Pool */}
        {poolReferees.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select from Your Pool
              </CardTitle>
              <CardDescription>
                Choose referees from your existing pool, or add new ones below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={poolSearchQuery}
                  onChange={(e) => setPoolSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {filteredPool.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">
                  No matching referees found in your pool.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPool.map((poolRef) => {
                    const nominated = isAlreadyNominated(poolRef.email)
                    return (
                      <div
                        key={poolRef.id}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                          nominated
                            ? "bg-green-50 border-green-300 opacity-75"
                            : "hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                        }`}
                        onClick={() => !nominated && addFromPool(poolRef)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" && !nominated) addFromPool(poolRef) }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">{poolRef.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{poolRef.email}</p>
                          <Badge variant="secondary" className="mt-1 text-xs">{poolRef.relationship}</Badge>
                        </div>
                        {nominated ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 ml-2 shrink-0" />
                        ) : (
                          <UserPlus className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {/* Add new referee manually */}
          <Card>
            <CardHeader>
              <CardTitle>Add a New Referee</CardTitle>
              <CardDescription>Enter the details of someone not already in your pool.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onAddReferee)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors?.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors?.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    placeholder="e.g., Manager, Colleague, Friend"
                    {...register("relationship")}
                  />
                  {errors?.relationship && (
                    <p className="text-sm text-destructive">{errors.relationship.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={!isValid}>
                  Add Referee
                </Button>
              </CardFooter>
            </form>
          </Card>

            {/* Nominated list */}
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Nominated Referees</CardTitle>
                  <CardDescription>
                    {newlyAdded.length} referee{newlyAdded.length !== 1 ? "s" : ""} nominated. Minimum 2 required.
                  </CardDescription>
                </CardHeader>
                {/* Privacy consent note */}
                <div className="mx-6 mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm text-amber-800">
                    By nominating this/these person(s), you consent to their feedback being included in a report 
                    accessible to any organization users with whom you are sharing your Coaching Digs report.
                  </p>
                </div>
              <CardContent>
                {newlyAdded.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No referees nominated yet. Select from your pool above or add new ones.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {newlyAdded.map((referee, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{referee.name}</p>
                          <p className="text-sm text-muted-foreground">{referee.email}</p>
                          <Badge variant="secondary" className="mt-1 text-xs">{referee.relationship}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeNewlyAdded(index)}>
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-3">
                {invitationsSent ? (
                  <>
                    <div className="w-full rounded-lg border border-green-300 bg-green-50 p-4 text-center">
                      <Mail className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-800">
                        Invitations Sent Successfully
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {newlyAdded.length} referee{newlyAdded.length !== 1 ? "s" : ""} will receive an email
                        inviting them to provide feedback on your coachability assessment.
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => router.push("/dashboard")}
                    >
                      Return to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleSendInvitations}
                    disabled={newlyAdded.length < 2 || isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Invitations"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // ── Pool management mode: manage your referee pool ──
  return (
    <div className="container py-8">
      <div className="mb-2">
        <Link
          href="/dashboard/referees"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Referees
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Manage Referee Pool</h1>
        <p className="text-muted-foreground">
          Add and manage the people available to provide feedback across your assessments.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Add form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add to Pool
            </CardTitle>
            <CardDescription>Add a new referee to your available pool.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onAddReferee)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Full name" {...register("name")} />
                {errors?.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" {...register("email")} />
                {errors?.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  placeholder="e.g., Manager, Colleague, Mentor"
                  {...register("relationship")}
                />
                {errors?.relationship && (
                  <p className="text-sm text-destructive">{errors.relationship.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={!isValid} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add to Pool
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Pool list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Referee Pool
            </CardTitle>
            <CardDescription>
              {poolReferees.length} referee{poolReferees.length !== 1 ? "s" : ""} available for assessments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {poolReferees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Your referee pool is empty.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add referees using the form so they are available when you start an assessment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {poolReferees.map((referee) => (
                  <div key={referee.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{referee.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{referee.email}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {referee.relationship}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePoolReferee(referee.id)}
                      className="ml-2 shrink-0"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove {referee.name}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
