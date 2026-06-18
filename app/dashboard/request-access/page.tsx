"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, User, FileText, Calendar, Send, AlertCircle, Building2, Mail, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface CandidateAssessment {
  id: string
  candidate_name: string
  candidate_email: string
  assessment_name: string
  completed_date: string
  overall_score: number
  status: string
  can_request_access: boolean
  existing_request_status?: string
}

export default function RequestAccessPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<CandidateAssessment[]>([])
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([])
  const [requestMessage, setRequestMessage] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    setIsSearching(true)

    try {
      const res = await fetch("/api/candidates/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: [{ email: searchTerm.trim() }] }),
      })
      if (res.ok) {
        const data = await res.json()
        const results: CandidateAssessment[] = []
        for (const v of (data.validations || [])) {
          if (v.exists && v.existingAssessments) {
            for (const a of v.existingAssessments) {
              results.push({
                id: a.id,
                candidate_name: v.name || v.email,
                candidate_email: v.email,
                assessment_name: a.name || "Assessment",
                completed_date: a.created_at,
                overall_score: 0,
                status: a.status || "COMPLETED",
                can_request_access: a.status === "COMPLETED",
              })
            }
          }
        }
        setSearchResults(results)
      }
    } catch {}
    setIsSearching(false)
  }

  const handleSelectAssessment = (assessmentId: string) => {
    setSelectedAssessments((prev) =>
      prev.includes(assessmentId) ? prev.filter((id) => id !== assessmentId) : [...prev, assessmentId],
    )
  }

  const handleSubmitRequests = async () => {
    if (selectedAssessments.length === 0) return

    setIsSubmitting(true)

    try {
      const requestData = selectedAssessments.map((assessmentId) => {
        const assessment = searchResults.find((r) => r.id === assessmentId)
        return {
          assessmentId,
          candidateEmail: assessment?.candidate_email,
          message: requestMessage,
        }
      })
      for (const rd of requestData) {
        await fetch("/api/employer/assessment-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rd),
        })
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to main dashboard with shared tab active
      router.push("/dashboard?tab=shared&newRequests=" + selectedAssessments.length)
    } catch (error) {
      console.error("Error submitting access requests:", error)
      alert("Error submitting requests. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return <Badge className="bg-green-100 text-green-800">Excellent ({score})</Badge>
    if (score >= 4.0) return <Badge className="bg-blue-100 text-blue-800">Good ({score})</Badge>
    if (score >= 3.5) return <Badge className="bg-yellow-100 text-yellow-800">Average ({score})</Badge>
    return <Badge className="bg-red-100 text-red-800">Below Average ({score})</Badge>
  }

  const getStatusBadge = (status: string, canRequest: boolean, existingStatus?: string) => {
    if (!canRequest && existingStatus) {
      return (
        <Badge variant="outline" className="text-yellow-600">
          Request {existingStatus}
        </Badge>
      )
    }
    if (status === "COMPLETED") {
      return <Badge className="bg-green-100 text-green-800">Available</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Request Assessment Access</h1>
            <p className="text-muted-foreground">
              Search for candidates with existing assessments and request access to their results
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Candidate Assessments
          </CardTitle>
          <CardDescription>Search by candidate name, email, or assessment name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Term</Label>
              <Input
                id="search"
                placeholder="Enter candidate name, email, or assessment name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Search Results ({searchResults.length})</h3>
                {selectedAssessments.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-800">{selectedAssessments.length} selected</Badge>
                )}
              </div>

              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAssessments.includes(result.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${!result.can_request_access ? "opacity-60" : ""}`}
                    onClick={() => result.can_request_access && handleSelectAssessment(result.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {result.can_request_access ? (
                            <input
                              type="checkbox"
                              checked={selectedAssessments.includes(result.id)}
                              onChange={() => handleSelectAssessment(result.id)}
                              className="w-4 h-4"
                            />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">{result.candidate_name}</span>
                            <span className="text-sm text-muted-foreground">({result.candidate_email})</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="font-medium">{result.assessment_name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Completed {formatDistanceToNow(new Date(result.completed_date), { addSuffix: true })}
                            </div>
                            <div>Overall Score: {getScoreBadge(result.overall_score)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(result.status, result.can_request_access, result.existing_request_status)}
                        {!result.can_request_access && result.existing_request_status && (
                          <span className="text-xs text-muted-foreground">Request already submitted</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && searchTerm && !isSearching && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No assessments found matching "{searchTerm}". Try a different search term.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Request Details */}
      {selectedAssessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Request Details
            </CardTitle>
            <CardDescription>
              Provide context for your access request to help candidates make informed decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="message">Request Message</Label>
              <Textarea
                id="message"
                placeholder="Explain why you need access to these assessments (e.g., hiring evaluation, performance review, team development)..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message will be sent to the candidate(s) along with your access request
              </p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                <strong>What will be shared:</strong> If approved, you'll receive access to the complete assessment
                report including scores, referee feedback, and recommendations. Individual response data remains
                confidential.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                Requesting access to {selectedAssessments.length} assessment
                {selectedAssessments.length === 1 ? "" : "s"}
              </div>
              <Button onClick={handleSubmitRequests} disabled={isSubmitting || !requestMessage.trim()} size="lg">
                {isSubmitting ? (
                  "Submitting Requests..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Access Request{selectedAssessments.length === 1 ? "" : "s"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
