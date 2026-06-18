"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface RefereeInvitation {
  name: string
  email: string
  relationship: string
  status: string
  created_at: string
}

export default function RefereesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [refereeInvitations, setRefereeInvitations] = useState<RefereeInvitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/login"); return }

    const fetchReferees = async () => {
      try {
        const res = await fetch("/api/referees/pool")
        if (res.ok) {
          const data = await res.json()
          setRefereeInvitations(data)
        }
      } catch (error) {
        console.error("Error fetching referees:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchReferees()
  }, [user, authLoading, router])

  if (authLoading || !user || loading) {
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
              {refereeInvitations.map((invitation, i) => (
                <div key={i} className="grid grid-cols-5 gap-4 border-t p-4">
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
