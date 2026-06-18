"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Clock, AlertTriangle, RefreshCw, Archive, RotateCcw, CheckCircle, XCircle, Info } from "lucide-react"
import { formatDistanceToNow, differenceInDays, addDays } from "date-fns"

interface AssessmentExpiration {
  id: string
  name: string
  type: "DRAFT" | "IN_PROGRESS" | "REFEREE_INVITATION" | "COMMISSIONED"
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "EXTENDED" | "REACTIVATED"
  created_at: string
  expires_at: string
  last_activity_at: string
  expiration_reason: string
  can_extend: boolean
  can_reactivate: boolean
  extension_count: number
  max_extensions: number
  sponsored_by_organization?: string
  counts_toward_limit: boolean
}

interface AssessmentExpirationManagerProps {
  assessments: AssessmentExpiration[]
  onAssessmentUpdate: (assessments: AssessmentExpiration[]) => void
  userRole: "CANDIDATE" | "EMPLOYER" | "ADMIN"
}

export function AssessmentExpirationManager({
  assessments,
  onAssessmentUpdate,
  userRole,
}: AssessmentExpirationManagerProps) {
  const { toast } = useToast()
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentExpiration | null>(null)
  const [extensionReason, setExtensionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const getExpirationStatus = (assessment: AssessmentExpiration) => {
    const now = new Date()
    const expiresAt = new Date(assessment.expires_at)
    const daysUntilExpiration = differenceInDays(expiresAt, now)

    if (assessment.status === "EXPIRED") return "EXPIRED"
    if (daysUntilExpiration <= 0) return "EXPIRED"
    if (daysUntilExpiration <= 3) return "CRITICAL"
    if (daysUntilExpiration <= 7) return "WARNING"
    return "ACTIVE"
  }

  const getStatusBadge = (assessment: AssessmentExpiration) => {
    const status = getExpirationStatus(assessment)

    switch (status) {
      case "EXPIRED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        )
      case "CRITICAL":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expires in {differenceInDays(new Date(assessment.expires_at), new Date())} days
          </Badge>
        )
      case "WARNING":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            Expires in {differenceInDays(new Date(assessment.expires_at), new Date())} days
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
    }
  }

  const getExpirationAlert = (assessment: AssessmentExpiration) => {
    const status = getExpirationStatus(assessment)
    const daysUntil = differenceInDays(new Date(assessment.expires_at), new Date())

    if (status === "EXPIRED") {
      return {
        variant: "destructive" as const,
        title: "Assessment Expired",
        description: `This assessment expired ${formatDistanceToNow(new Date(assessment.expires_at), {
          addSuffix: true,
        })}. ${assessment.can_reactivate ? "You can reactivate it within 30 days." : "It cannot be reactivated."}`,
        icon: <XCircle className="h-4 w-4" />,
      }
    }

    if (status === "CRITICAL") {
      return {
        variant: "destructive" as const,
        title: "Assessment Expiring Soon",
        description: `This assessment will expire in ${daysUntil} day${daysUntil === 1 ? "" : "s"}. ${
          assessment.can_extend ? "Consider extending the deadline." : "Extension is not available."
        }`,
        icon: <AlertTriangle className="h-4 w-4" />,
      }
    }

    if (status === "WARNING") {
      return {
        variant: "default" as const,
        title: "Assessment Expiring",
        description: `This assessment will expire in ${daysUntil} days. ${
          assessment.can_extend ? "You can extend the deadline if needed." : ""
        }`,
        icon: <Clock className="h-4 w-4" />,
      }
    }

    return null
  }

  const handleExtendAssessment = async (assessmentId: string) => {
    setIsProcessing(assessmentId)

    try {
      // API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedAssessments = assessments.map((assessment) =>
        assessment.id === assessmentId
          ? {
              ...assessment,
              expires_at: addDays(new Date(assessment.expires_at), 30).toISOString(),
              extension_count: assessment.extension_count + 1,
              can_extend: assessment.extension_count + 1 < assessment.max_extensions,
              status: "EXTENDED" as const,
            }
          : assessment,
      )

      onAssessmentUpdate(updatedAssessments)

      toast({
        title: "Assessment Extended",
        description: "The assessment deadline has been extended by 30 days.",
      })

      setSelectedAssessment(null)
      setExtensionReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extend assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReactivateAssessment = async (assessmentId: string) => {
    setIsProcessing(assessmentId)

    try {
      // API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedAssessments = assessments.map((assessment) =>
        assessment.id === assessmentId
          ? {
              ...assessment,
              expires_at: addDays(new Date(), 30).toISOString(),
              status: "REACTIVATED" as const,
              counts_toward_limit: true, // Reactivated assessments count toward limits again
            }
          : assessment,
      )

      onAssessmentUpdate(updatedAssessments)

      toast({
        title: "Assessment Reactivated",
        description: "The assessment has been reactivated with a new 30-day deadline.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reactivate assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleArchiveAssessment = async (assessmentId: string) => {
    setIsProcessing(assessmentId)

    try {
      // API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedAssessments = assessments.filter((assessment) => assessment.id !== assessmentId)
      onAssessmentUpdate(updatedAssessments)

      toast({
        title: "Assessment Archived",
        description: "The expired assessment has been permanently archived.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Filter assessments that need attention
  const expiringAssessments = assessments.filter((assessment) => {
    const status = getExpirationStatus(assessment)
    return status === "EXPIRED" || status === "CRITICAL" || status === "WARNING"
  })

  const expiredCount = assessments.filter((a) => getExpirationStatus(a) === "EXPIRED").length
  const criticalCount = assessments.filter((a) => getExpirationStatus(a) === "CRITICAL").length
  const warningCount = assessments.filter((a) => getExpirationStatus(a) === "WARNING").length

  if (expiringAssessments.length === 0) {
    return null // Don't show the component if no assessments need attention
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Calendar className="w-5 h-5" />
          Assessment Expiration Management
        </CardTitle>
        <CardDescription>
          {expiringAssessments.length} assessment{expiringAssessments.length === 1 ? "" : "s"} require{" "}
          {expiringAssessments.length === 1 ? "s" : ""} attention
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          {expiredCount > 0 && (
            <div className="text-center p-3 bg-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
              <div className="text-sm text-red-800">Expired</div>
            </div>
          )}
          {criticalCount > 0 && (
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
              <div className="text-sm text-red-800">Critical (≤3 days)</div>
            </div>
          )}
          {warningCount > 0 && (
            <div className="text-center p-3 bg-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
              <div className="text-sm text-orange-800">Warning (≤7 days)</div>
            </div>
          )}
        </div>

        {/* Assessment List */}
        <div className="space-y-3">
          {expiringAssessments.map((assessment) => {
            const alert = getExpirationAlert(assessment)
            const status = getExpirationStatus(assessment)

            return (
              <div key={assessment.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{assessment.name}</h4>
                      {getStatusBadge(assessment)}
                      {assessment.sponsored_by_organization && (
                        <Badge variant="outline" className="text-xs">
                          Commissioned
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Type: {assessment.type.replace("_", " ")} • Created:{" "}
                      {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
                    </div>
                    {assessment.extension_count > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        Extended {assessment.extension_count} time{assessment.extension_count === 1 ? "" : "s"}
                      </div>
                    )}
                  </div>
                </div>

                {alert && (
                  <Alert className="mb-3" variant={alert.variant}>
                    {alert.icon}
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                  </Alert>
                )}

                {/* Progress Bar for Time Remaining */}
                {status !== "EXPIRED" && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Time remaining</span>
                      <span>{differenceInDays(new Date(assessment.expires_at), new Date())} days left</span>
                    </div>
                    <Progress
                      value={Math.max(
                        0,
                        100 -
                          (differenceInDays(new Date(), new Date(assessment.created_at)) /
                            differenceInDays(new Date(assessment.expires_at), new Date(assessment.created_at))) *
                            100,
                      )}
                      className="h-2"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {status === "EXPIRED" && assessment.can_reactivate && (
                    <Button
                      size="sm"
                      onClick={() => handleReactivateAssessment(assessment.id)}
                      disabled={isProcessing === assessment.id}
                    >
                      {isProcessing === assessment.id ? (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3 h-3 mr-1" />
                      )}
                      Reactivate
                    </Button>
                  )}

                  {status !== "EXPIRED" && assessment.can_extend && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedAssessment(assessment)}>
                          <Calendar className="w-3 h-3 mr-1" />
                          Extend Deadline
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Extend Assessment Deadline</DialogTitle>
                          <DialogDescription>Extend the deadline for "{assessment.name}" by 30 days.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm">
                              <div className="font-medium">Current deadline:</div>
                              <div>{new Date(assessment.expires_at).toLocaleDateString()}</div>
                            </div>
                            <div className="text-sm mt-2">
                              <div className="font-medium">New deadline:</div>
                              <div>{addDays(new Date(assessment.expires_at), 30).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="extension-reason">Reason for Extension (Optional)</Label>
                            <Textarea
                              id="extension-reason"
                              value={extensionReason}
                              onChange={(e) => setExtensionReason(e.target.value)}
                              placeholder="Provide a reason for the extension..."
                              rows={3}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Extensions remaining: {assessment.max_extensions - assessment.extension_count}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedAssessment(null)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleExtendAssessment(assessment.id)}
                            disabled={isProcessing === assessment.id}
                          >
                            {isProcessing === assessment.id ? (
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Calendar className="w-3 h-3 mr-1" />
                            )}
                            Extend Deadline
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {status === "EXPIRED" && !assessment.can_reactivate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleArchiveAssessment(assessment.id)}
                      disabled={isProcessing === assessment.id}
                    >
                      {isProcessing === assessment.id ? (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Archive className="w-3 h-3 mr-1" />
                      )}
                      Archive
                    </Button>
                  )}
                </div>

                {/* Plan Limit Impact Notice */}
                {assessment.sponsored_by_organization && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                    <Info className="w-3 h-3 inline mr-1" />
                    {status === "EXPIRED"
                      ? "This expired commissioned assessment no longer counts toward your plan limits."
                      : "This commissioned assessment counts toward your organization's plan limits."}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
