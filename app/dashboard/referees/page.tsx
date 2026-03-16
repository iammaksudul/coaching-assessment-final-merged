"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface RefereeInvitation {
  id: string
  name: string
  email: string
  relationship: string
  status: string
  created_at: string
}

// Preview referee data keyed by user id, matching the pattern in the dashboard page
const userRefereeData: Record<string, RefereeInvitation[]> = {
  "alex-johnson-preview": [
    {
      id: "ref-1",
      name: "Maria Lopez",
      email: "maria.lopez@preview.com",
      relationship: "Manager",
      status: "COMPLETED",
      created_at: "2024-01-16T10:00:00Z",
    },
    {
      id: "ref-2",
      name: "Tom Harris",
      email: "tom.harris@preview.com",
      relationship: "Colleague",
      status: "PENDING",
      created_at: "2024-01-17T14:30:00Z",
    },
    {
      id: "ref-3",
      name: "Priya Patel",
      email: "priya.patel@preview.com",
      relationship: "Direct Report",
      status: "COMPLETED",
      created_at: "2024-01-18T09:15:00Z",
    },
  ],
  "sarah-wilson-preview": [
    {
      id: "ref-4",
      name: "James Okafor",
      email: "james.okafor@preview.com",
      relationship: "Mentor",
      status: "COMPLETED",
      created_at: "2024-01-12T11:00:00Z",
    },
    {
      id: "ref-5",
      name: "Lena Kim",
      email: "lena.kim@preview.com",
      relationship: "Colleague",
      status: "PENDING",
      created_at: "2024-01-14T08:45:00Z",
    },
  ],
}

export default function RefereesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [refereeInvitations, setRefereeInvitations] = useState<RefereeInvitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    // Load referee data for this user
    const data = userRefereeData[user.id] || []
    setRefereeInvitations(data)
    setLoading(false)
  }, [user, authLoading, router])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading referees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Referees</h1>
        <Link href="/dashboard/referees/nominate">
          <Button>Add Referees</Button>
        </Link>
      </div>
      <p className="text-muted-foreground">
        Manage the people you have invited to provide feedback on your coachability.
      </p>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Your Referees</CardTitle>
          <CardDescription>Track the status of your referee invitations and responses.</CardDescription>
        </CardHeader>
        <CardContent>
          {refereeInvitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">You have not added any referees yet.</p>
              <Link href="/dashboard/referees/nominate" className="mt-4">
                <Button>Add Referees</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                <div>Name</div>
                <div>Email</div>
                <div>Relationship</div>
                <div>Status</div>
                <div>Invited</div>
              </div>
              {refereeInvitations.map((invitation) => (
                <div key={invitation.id} className="grid grid-cols-5 gap-4 border-t p-4">
                  <div>{invitation.name}</div>
                  <div className="text-muted-foreground">{invitation.email}</div>
                  <div>{invitation.relationship}</div>
                  <div>
                    <Badge
                      variant={invitation.status === "COMPLETED" ? "default" : "secondary"}
                      className={
                        invitation.status === "COMPLETED"
                          ? "bg-green-600 text-white"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {invitation.status}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
