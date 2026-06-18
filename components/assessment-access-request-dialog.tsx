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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle, XCircle, Eye, Shield } from "lucide-react"

interface AssessmentAccessRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  onApprove: () => void
  onDeny: () => void
  request: {
    id: string
    organizationName: string
    requesterName: string
    requesterTitle: string
    requestMessage: string
    assessmentName: string
    assessmentCompletedDate: string
    requestedDate: string
  }
}

export function AssessmentAccessRequestDialog({
  isOpen,
  onClose,
  onApprove,
  onDeny,
  request,
}: AssessmentAccessRequestDialogProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleApprove = () => {
    onApprove()
    onClose()
  }

  const handleDeny = () => {
    onDeny()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Assessment Access Request
          </DialogTitle>
          <DialogDescription>
            An organization has requested access to one of your completed assessments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Organization:</span>
                  <p className="text-muted-foreground">{request.organizationName}</p>
                </div>
                <div>
                  <span className="font-medium">Requested by:</span>
                  <p className="text-muted-foreground">
                    {request.requesterName} ({request.requesterTitle})
                  </p>
                </div>
                <div>
                  <span className="font-medium">Assessment:</span>
                  <p className="text-muted-foreground">{request.assessmentName}</p>
                </div>
                <div>
                  <span className="font-medium">Completed:</span>
                  <p className="text-muted-foreground">{formatDate(request.assessmentCompletedDate)}</p>
                </div>
              </div>

              <div>
                <span className="font-medium">Message from {request.organizationName}:</span>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md mt-1">{request.requestMessage}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5" />
                What Will Be Shared
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Your coachability scores and domain analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Referee feedback and ratings (anonymized)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Gap analysis and development recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Complete assessment report and insights</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Your individual response data and referee identities will remain confidential.
                  Only the aggregated results and analysis will be shared.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Your Rights:
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• You can approve or deny this request</li>
                <li>• You can revoke access at any time after approval</li>
                <li>• You maintain full ownership of your assessment data</li>
                <li>• This decision won't affect your account or future assessments</li>
                <li>• You can set time limits on data access (if approved)</li>
              </ul>
            </CardContent>
          </Card>

          {showDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Overall Coachability Score:</span>
                    <Badge className="bg-green-100 text-green-800">4.2/5.0 (High)</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Referee Responses:</span>
                    <span>3 completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assessment Date:</span>
                    <span>{formatDate(request.assessmentCompletedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Report Pages:</span>
                    <span>12 pages</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "Hide" : "Show"} Assessment Details
            </Button>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Decide Later
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDeny} className="text-red-600 border-red-200 hover:bg-red-50">
              <XCircle className="w-4 h-4 mr-2" />
              Deny Access
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Access
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
