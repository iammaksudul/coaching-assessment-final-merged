"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

export default function RefereePreviewPage() {
  // Simulate different assessment states - in real app this would come from URL params or API
  const [assessmentStatus] = useState<"PENDING" | "IN_PROGRESS" | "COMPLETED">("COMPLETED") // Change this to test different states

  const isPending = assessmentStatus === "PENDING"
  const isCompleted = assessmentStatus === "COMPLETED"
  const isInProgress = assessmentStatus === "IN_PROGRESS"

  const getPageTitle = () => {
    if (isPending) return "Manage Referees"
    return "View Referees"
  }

  const getPageDescription = () => {
    if (isPending) return "Add at least 2 people who know you well to provide feedback on your coachability."
    if (isInProgress) return "Assessment is in progress. Referee list is now finalized."
    return "Assessment completed. Your referees have provided their feedback."
  }

  return (
    <div className="min-h-screen bg-background">
      {/*  Banner */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        
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
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Add Referee Form - Only show for PENDING assessments */}
          {isPending && (
            <Card>
              <CardHeader>
                <CardTitle>Add a Referee</CardTitle>
                <CardDescription>Enter the details of someone who can provide feedback about you.</CardDescription>
              </CardHeader>
              <form>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jane.smith@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input id="relationship" placeholder="e.g., Manager, Colleague, Friend" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Add Referee</Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Referee List */}
          <div className={`flex flex-col gap-4 ${isPending ? "" : "md:col-span-2"}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Your Referees</CardTitle>
                </div>
                <CardDescription>
                  {isPending && "You have added 3 referees. You need at least 2 referees."}
                  {isInProgress && "Assessment is in progress. Referee responses are being collected."}
                  {isCompleted && "Assessment completed. All referee feedback has been collected."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Jane Smith</p>
                      <p className="text-sm text-muted-foreground">jane.smith@example.com</p>
                      <p className="text-sm text-muted-foreground">Manager</p>
                      {!isPending && (
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Response Completed
                          </span>
                        </div>
                      )}
                    </div>
                    {isPending && (
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                      <p className="text-sm text-muted-foreground">Colleague</p>
                      {!isPending && (
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Response Completed
                          </span>
                        </div>
                      )}
                    </div>
                    {isPending && (
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Sarah Williams</p>
                      <p className="text-sm text-muted-foreground">sarah.williams@example.com</p>
                      <p className="text-sm text-muted-foreground">Mentor</p>
                      {isInProgress && (
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            Response Pending
                          </span>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Response Completed
                          </span>
                        </div>
                      )}
                    </div>
                    {isPending && (
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>

              {/* Action buttons only for PENDING status */}
              {isPending && (
                <CardFooter>
                  <Button className="w-full">Launch Assessment</Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
