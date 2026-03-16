"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, CheckCircle, Clock, AlertTriangle, Building2 } from "lucide-react"

interface ExistingUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onRequestAccess: (assessmentId: string) => void
  onCreateNew: () => void
  candidateData: {
    name: string
    email: string
    existingAssessments: Array<{
      id: string
      name: string
      status: string
      created_at: string
      completed_at?: string
      sponsored_by?: string
      type: string
    }>
  }
  organizationName: string
}

export function ExistingUserDialog({
  isOpen,
  onClose,
  onRequestAccess,
  onCreateNew,
  candidateData,
  organizationName,
}: ExistingUserDialogProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case "PENDING_CONSENT":
        return (
          <Badge variant="outline" className="border-orange-200 text-orange-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Pending Consent
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAssessmentAge = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 30) return `${diffInDays} days ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const handleRequestAccess = () => {
    if (selectedAssessment) {
      onRequestAccess(selectedAssessment)
      onClose()
    }
  }

  const completedAssessments = candidateData.existingAssessments.filter((a) => a.status === "COMPLETED")
  const inProgressAssessments = candidateData.existingAssessments.filter((a) => a.status === "IN_PROGRESS")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Existing User Found
          </DialogTitle>
          <DialogDescription>
            {candidateData.name} ({candidateData.email}) already has an account with existing assessments. You can
            request access to a completed assessment or commission a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Recommendation:</strong> If there's a recent completed assessment (within 6 months), consider
              requesting access instead of commissioning a new one. Coachability traits typically remain stable over
              short periods.
            </AlertDescription>
          </Alert>

          {/* Completed Assessments */}
          {completedAssessments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Completed Assessments Available for Sharing</h3>
              <div className="grid gap-4">
                {completedAssessments.map((assessment) => (
                  <Card
                    key={assessment.id}
                    className={`cursor-pointer transition-all ${
                      selectedAssessment === assessment.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedAssessment(assessment.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <input
                            type="radio"
                            name="selectedAssessment"
                            checked={selectedAssessment === assessment.id}
                            onChange={() => setSelectedAssessment(assessment.id)}
                            className="mr-2"
                          />
                          {assessment.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(assessment.status)}
                          {assessment.type === "EMPLOYER_COMMISSIONED" && (
                            <Badge variant="outline" className="text-blue-700 border-blue-200">
                              <Building2 className="w-3 h-3 mr-1" />
                              Employer
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Completed:</span>
                          <p className="text-muted-foreground">
                            {assessment.completed_at
                              ? getAssessmentAge(assessment.completed_at)
                              : getAssessmentAge(assessment.created_at)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <p className="text-muted-foreground">
                            {assessment.type === "EMPLOYER_COMMISSIONED" ? "Employer Commissioned" : "Self-Initiated"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Previous Sponsor:</span>
                          <p className="text-muted-foreground">{assessment.sponsored_by || "Self-initiated"}</p>
                        </div>
                      </div>

                      {selectedAssessment === assessment.id && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-2">What happens when you request access:</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• {candidateData.name} will receive a notification about your access request</li>
                            <li>• They can choose to share this specific assessment with {organizationName}</li>
                            <li>• If approved, you'll gain immediate access to the completed report</li>
                            <li>• If declined, you can still commission a new assessment</li>
                            <li>• The candidate maintains full control over their data sharing</li>
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* In Progress Assessments */}
          {inProgressAssessments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">In-Progress Assessments</h3>
              <div className="grid gap-4">
                {inProgressAssessments.map((assessment) => (
                  <Card key={assessment.id} className="border-gray-200 opacity-60">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{assessment.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(assessment.status)}
                          {assessment.type === "EMPLOYER_COMMISSIONED" && (
                            <Badge variant="outline" className="text-blue-700 border-blue-200">
                              <Building2 className="w-3 h-3 mr-1" />
                              Employer
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Started:</span>
                          <p className="text-muted-foreground">{getAssessmentAge(assessment.created_at)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <p className="text-muted-foreground">
                            {assessment.type === "EMPLOYER_COMMISSIONED" ? "Employer Commissioned" : "Self-Initiated"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Sponsor:</span>
                          <p className="text-muted-foreground">{assessment.sponsored_by || "Self-initiated"}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        This assessment is still in progress and cannot be shared until completed.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Assessments */}
          {candidateData.existingAssessments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {candidateData.name} has an account but no completed assessments available for sharing.
              </p>
            </div>
          )}

          {/* Alternative Option */}
          <Card className="border-gray-300">
            <CardHeader>
              <CardTitle className="text-base">Alternative: Commission New Assessment</CardTitle>
              <CardDescription>Create a fresh assessment specifically for your organization's needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">• Tailored to your current evaluation needs</p>
                <p className="text-sm text-muted-foreground">• Most recent data and insights</p>
                <p className="text-sm text-muted-foreground">• Candidate selects referees relevant to your context</p>
                <p className="text-sm text-muted-foreground">• Full control over assessment timing and process</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCreateNew}>
              Commission New Assessment
            </Button>
            <Button
              onClick={handleRequestAccess}
              disabled={!selectedAssessment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Request Access to Selected Assessment
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
