"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CreateAssessmentPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isCreated, setIsCreated] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert("Please provide a name for your assessment.")
      return
    }

    setIsCreating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsCreating(false)
    setIsCreated(true)

    // Redirect after showing success
    setTimeout(() => {
      router.push("/dashboard/assessments/new")
    }, 2000)
  }

  if (isCreated) {
    return (
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>Assessment Created Successfully!</CardTitle>
            <CardDescription>"{name}" has been created and is ready for you to begin.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Redirecting you to the assessment...</p>
            <Button asChild>
              <Link href="/dashboard/assessments/new">Start Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Badge variant="secondary">Preview Mode</Badge>
        </div>
        <h1 className="text-3xl font-bold">Create New Assessment</h1>
        <p className="text-muted-foreground">Give your assessment a meaningful name to help you track your progress.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
          <CardDescription>
            Choose a name that will help you identify this assessment later (e.g., "Q1 Performance Review", "Leadership
            Development")
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Assessment Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q1 Performance Review"
                maxLength={100}
                required
              />
              <p className="text-sm text-muted-foreground">This name will appear in your dashboard and reports.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any notes about the purpose or context of this assessment..."
                maxLength={500}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">{description.length}/500 characters</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Complete your self-assessment questionnaire</li>
                <li>• Invite colleagues to provide 360-degree feedback</li>
                <li>• Receive comprehensive coachability insights</li>
                <li>• Get personalized development recommendations</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isCreating || !name.trim()}>
                {isCreating ? "Creating..." : "Create Assessment"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
