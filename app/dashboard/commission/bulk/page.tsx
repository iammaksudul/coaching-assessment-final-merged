"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Upload, Download, CheckCircle, AlertTriangle, XCircle, FileText, Users } from "lucide-react"
import Link from "next/link"
import { ExistingUserDialog } from "@/components/existing-user-dialog"

interface CandidateRow {
  name: string
  email: string
  assessmentName?: string
  personalMessage?: string
  status: "pending" | "validated" | "existing" | "error" | "invited" | "failed"
  error?: string
  existingAssessments?: any[]
}

interface ValidationResult {
  valid: CandidateRow[]
  existing: CandidateRow[]
  errors: CandidateRow[]
}

export default function BulkUploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationComplete, setValidationComplete] = useState(false)
  const [processProgress, setProcessProgress] = useState(0)
  const [globalMessage, setGlobalMessage] = useState("")

  // Existing user dialog state
  const [showExistingUserDialog, setShowExistingUserDialog] = useState(false)
  const [currentExistingUser, setCurrentExistingUser] = useState<any>(null)
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(-1)

  const downloadTemplate = () => {
    const csvContent = `Name,Email,Assessment Name (Optional),Personal Message (Optional)
John Smith,john.smith@company.com,Leadership Assessment,Welcome to our development program
Jane Doe,jane.doe@company.com,,
Mike Johnson,mike.johnson@company.com,Q1 Performance Review,Looking forward to your feedback`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bulk_assessment_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const parseCSV = (text: string): CandidateRow[] => {
    const lines = text.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    return lines
      .slice(1)
      .map((line, index) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))

        if (values.length < 2 || !values[0] || !values[1]) {
          return {
            name: values[0] || `Row ${index + 2}`,
            email: values[1] || "",
            status: "error" as const,
            error: "Name and email are required",
          }
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(values[1])) {
          return {
            name: values[0],
            email: values[1],
            status: "error" as const,
            error: "Invalid email format",
          }
        }

        return {
          name: values[0],
          email: values[1],
          assessmentName: values[2] || undefined,
          personalMessage: values[3] || undefined,
          status: "pending" as const,
        }
      })
      .filter((candidate) => candidate.name && candidate.email)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      try {
        const parsed = parseCSV(text)
        setCandidates(parsed)
        setValidationComplete(false)
        toast({
          title: "File uploaded",
          description: `Loaded ${parsed.length} candidates`,
        })
      } catch (error) {
        toast({
          title: "Parse error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const validateCandidates = async () => {
    if (candidates.length === 0) return

    setIsValidating(true)

    try {
      const response = await fetch("/api/candidates/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: candidates.map((c) => ({ name: c.name, email: c.email })),
        }),
      })

      if (!response.ok) {
        throw new Error("Validation failed")
      }

      const result = await response.json()

      // Update candidates with validation results
      const updatedCandidates = candidates.map((candidate) => {
        const validation = result.validations.find((v: any) => v.email === candidate.email)

        if (!validation) {
          return { ...candidate, status: "error" as const, error: "Validation failed" }
        }

        if (validation.exists) {
          return {
            ...candidate,
            status: "existing" as const,
            existingAssessments: validation.existingAssessments || [],
          }
        }

        return { ...candidate, status: "validated" as const }
      })

      setCandidates(updatedCandidates)
      setValidationComplete(true)

      const existingCount = updatedCandidates.filter((c) => c.status === "existing").length
      const validCount = updatedCandidates.filter((c) => c.status === "validated").length
      const errorCount = updatedCandidates.filter((c) => c.status === "error").length

      toast({
        title: "Validation complete",
        description: `${validCount} new, ${existingCount} existing, ${errorCount} errors`,
      })
    } catch (error) {
      toast({
        title: "Validation failed",
        description: "Failed to validate candidates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleExistingUser = (candidate: CandidateRow, index: number) => {
    setCurrentExistingUser({
      name: candidate.name,
      email: candidate.email,
      existingAssessments: candidate.existingAssessments || [],
    })
    setCurrentCandidateIndex(index)
    setShowExistingUserDialog(true)
  }

  const handleRequestAccess = (assessmentId: string) => {
    // Update the candidate to request access to existing assessment
    const updatedCandidates = [...candidates]
    updatedCandidates[currentCandidateIndex] = {
      ...updatedCandidates[currentCandidateIndex],
      status: "validated",
      assessmentName: `Access Request: ${assessmentId}`,
    }
    setCandidates(updatedCandidates)
    setShowExistingUserDialog(false)
  }

  const handleCreateNew = () => {
    // Update the candidate to create new assessment
    const updatedCandidates = [...candidates]
    updatedCandidates[currentCandidateIndex] = {
      ...updatedCandidates[currentCandidateIndex],
      status: "validated",
    }
    setCandidates(updatedCandidates)
    setShowExistingUserDialog(false)
  }

  const processBulkInvitations = async () => {
    const validCandidates = candidates.filter((c) => c.status === "validated")

    if (validCandidates.length === 0) {
      toast({
        title: "No candidates to process",
        description: "Please validate candidates first",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProcessProgress(0)

    try {
      for (let i = 0; i < validCandidates.length; i++) {
        const candidate = validCandidates[i]

        try {
          const response = await fetch("/api/assessments/commission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              candidateName: candidate.name,
              candidateEmail: candidate.email,
              assessmentName: candidate.assessmentName || `Coachability Assessment for ${candidate.name}`,
              message: candidate.personalMessage || globalMessage,
            }),
          })

          if (response.ok) {
            // Update candidate status to invited
            setCandidates((prev) =>
              prev.map((c) => (c.email === candidate.email ? { ...c, status: "invited" as const } : c)),
            )
          } else {
            // Update candidate status to failed
            setCandidates((prev) =>
              prev.map((c) =>
                c.email === candidate.email ? { ...c, status: "failed" as const, error: "Invitation failed" } : c,
              ),
            )
          }
        } catch (error) {
          setCandidates((prev) =>
            prev.map((c) =>
              c.email === candidate.email ? { ...c, status: "failed" as const, error: "Network error" } : c,
            ),
          )
        }

        setProcessProgress(((i + 1) / validCandidates.length) * 100)

        // Small delay to prevent overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      const invitedCount = candidates.filter((c) => c.status === "invited").length
      const failedCount = candidates.filter((c) => c.status === "failed").length

      toast({
        title: "Bulk processing complete",
        description: `${invitedCount} invitations sent, ${failedCount} failed`,
      })

      // Redirect after successful processing
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Failed to process bulk invitations",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: CandidateRow["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "validated":
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>
      case "existing":
        return <Badge className="bg-yellow-100 text-yellow-800">Existing User</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "invited":
        return <Badge className="bg-blue-100 text-blue-800">Invited</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: CandidateRow["status"]) => {
    switch (status) {
      case "validated":
      case "invited":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "existing":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "error":
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const validatedCount = candidates.filter((c) => c.status === "validated").length
  const existingCount = candidates.filter((c) => c.status === "existing").length
  const errorCount = candidates.filter((c) => c.status === "error").length
  const invitedCount = candidates.filter((c) => c.status === "invited").length

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/commission"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Commission Assessment
        </Link>
        <h1 className="text-3xl font-bold">Bulk Upload Candidates</h1>
        <p className="text-muted-foreground mt-2">
          Upload a CSV file to invite multiple candidates to complete coachability assessments
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Candidate List
          </CardTitle>
          <CardDescription>
            Upload a CSV file with candidate information. Download our template to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <div className="flex-1">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>
          </div>

          {candidates.length > 0 && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Loaded {candidates.length} candidates.{" "}
                {!validationComplete && "Click 'Validate Candidates' to check for existing users."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Global Message */}
      {candidates.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Global Settings</CardTitle>
            <CardDescription>
              These settings apply to all candidates (individual messages in CSV take precedence)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="globalMessage">Default Personal Message</Label>
              <Textarea
                id="globalMessage"
                placeholder="This message will be included in all invitation emails unless overridden in the CSV..."
                value={globalMessage}
                onChange={(e) => setGlobalMessage(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidates Table */}
      {candidates.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Candidate List ({candidates.length})
                </CardTitle>
                <CardDescription>Review and validate candidates before sending invitations</CardDescription>
              </div>
              <div className="flex gap-2">
                {!validationComplete && (
                  <Button onClick={validateCandidates} disabled={isValidating} variant="outline">
                    {isValidating ? "Validating..." : "Validate Candidates"}
                  </Button>
                )}
                {validationComplete && validatedCount > 0 && (
                  <Button onClick={processBulkInvitations} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : `Send ${validatedCount} Invitations`}
                  </Button>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            {validationComplete && (
              <div className="flex gap-4 mt-4">
                <Badge className="bg-green-100 text-green-800">{validatedCount} Ready</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">{existingCount} Existing</Badge>
                <Badge className="bg-red-100 text-red-800">{errorCount} Errors</Badge>
                {invitedCount > 0 && <Badge className="bg-blue-100 text-blue-800">{invitedCount} Invited</Badge>}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {/* Processing Progress */}
            {isProcessing && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processing invitations...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(processProgress)}%</span>
                </div>
                <Progress value={processProgress} className="w-full" />
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assessment Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.assessmentName || `Coachability Assessment for ${candidate.name}`}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(candidate.status)}
                        {getStatusBadge(candidate.status)}
                      </div>
                      {candidate.error && <p className="text-xs text-red-600 mt-1">{candidate.error}</p>}
                    </TableCell>
                    <TableCell>
                      {candidate.status === "existing" && (
                        <Button variant="outline" size="sm" onClick={() => handleExistingUser(candidate, index)}>
                          Review Options
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Existing User Dialog */}
      {showExistingUserDialog && currentExistingUser && (
        <ExistingUserDialog
          isOpen={showExistingUserDialog}
          onClose={() => setShowExistingUserDialog(false)}
          onRequestAccess={handleRequestAccess}
          onCreateNew={handleCreateNew}
          candidateData={currentExistingUser}
          organizationName="Your Organization"
        />
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Required Columns:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  • <strong>Name:</strong> Full name of the candidate
                </li>
                <li>
                  • <strong>Email:</strong> Valid email address
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Optional Columns:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  • <strong>Assessment Name:</strong> Custom name for the assessment
                </li>
                <li>
                  • <strong>Personal Message:</strong> Individual message for each candidate
                </li>
              </ul>
            </div>
          </div>

          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Existing Users:</strong> If a candidate already has an account, you'll be prompted to either
              request access to their existing assessments (no cost) or commission a new assessment (counts toward
              usage).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
