"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, CreditCard, TrendingUp, Calendar, Info, Zap } from "lucide-react"
import Link from "next/link"

interface UsageLimitWarningProps {
  organizationId?: string
  currentUsage: number
  planLimit: number
  planName: string
  billingPeriodEnd: string
  gracePeriodDays?: number
  isInGracePeriod?: boolean
  gracePeriodEnd?: string
}

export function UsageLimitWarning({
  organizationId,
  currentUsage,
  planLimit,
  planName,
  billingPeriodEnd,
  gracePeriodDays = 7,
  isInGracePeriod = false,
  gracePeriodEnd,
}: UsageLimitWarningProps) {
  const [showDetails, setShowDetails] = useState(false)

  const usagePercentage = (currentUsage / planLimit) * 100
  const remainingAssessments = Math.max(0, planLimit - currentUsage)
  const isOverLimit = currentUsage > planLimit
  const isNearLimit = usagePercentage >= 80 && !isOverLimit
  const isCritical = usagePercentage >= 95 || isOverLimit

  // Don't show warning if usage is low
  if (usagePercentage < 80 && !isInGracePeriod) {
    return null
  }

  const getWarningLevel = () => {
    if (isInGracePeriod) return "grace"
    if (isOverLimit) return "critical"
    if (usagePercentage >= 95) return "critical"
    if (usagePercentage >= 90) return "high"
    return "medium"
  }

  const getWarningConfig = () => {
    const level = getWarningLevel()

    switch (level) {
      case "grace":
        return {
          variant: "destructive" as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "Grace Period Active",
          description: `You've exceeded your plan limit. Service will be suspended on ${new Date(gracePeriodEnd!).toLocaleDateString()}.`,
          bgColor: "bg-red-50 border-red-200",
          textColor: "text-red-800",
        }
      case "critical":
        return {
          variant: "destructive" as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "Plan Limit Exceeded",
          description: "You cannot commission new assessments until you upgrade your plan.",
          bgColor: "bg-red-50 border-red-200",
          textColor: "text-red-800",
        }
      case "high":
        return {
          variant: "destructive" as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "Plan Limit Almost Reached",
          description: `Only ${remainingAssessments} assessments remaining this billing period.`,
          bgColor: "bg-orange-50 border-orange-200",
          textColor: "text-orange-800",
        }
      default:
        return {
          variant: "default" as const,
          icon: <Info className="h-4 w-4" />,
          title: "Approaching Plan Limit",
          description: `${remainingAssessments} assessments remaining this billing period.`,
          bgColor: "bg-blue-50 border-blue-200",
          textColor: "text-blue-800",
        }
    }
  }

  const config = getWarningConfig()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDaysUntil = (dateString: string) => {
    const targetDate = new Date(dateString)
    const today = new Date()
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Alert className={`${config.bgColor} ${config.textColor} border-l-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {config.icon}
          <div className="space-y-1">
            <AlertTitle className="text-sm font-semibold">{config.title}</AlertTitle>
            <AlertDescription className="text-sm">{config.description}</AlertDescription>

            {/* Usage Progress Bar */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>
                  Usage: {currentUsage} of {planLimit} assessments
                </span>
                <span>{Math.round(usagePercentage)}%</span>
              </div>
              <Progress
                value={Math.min(usagePercentage, 100)}
                className={`h-2 ${isCritical ? "bg-red-100" : isNearLimit ? "bg-orange-100" : "bg-blue-100"}`}
              />
            </div>

            {/* Grace Period Countdown */}
            {isInGracePeriod && gracePeriodEnd && (
              <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span className="font-medium">{getDaysUntil(gracePeriodEnd)} days remaining in grace period</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Usage Details
                </DialogTitle>
                <DialogDescription>Current usage and billing information for your organization</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Plan:</span>
                      <Badge variant="outline">{planName}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Limit:</span>
                      <span className="font-medium">{planLimit} assessments</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Used:</span>
                      <span className="font-medium">{currentUsage} assessments</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Remaining:</span>
                      <span className={`font-medium ${remainingAssessments <= 0 ? "text-red-600" : "text-green-600"}`}>
                        {remainingAssessments} assessments
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Billing Period</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Period ends:</span>
                      <span className="font-medium">{formatDate(billingPeriodEnd)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Days remaining:</span>
                      <span className="font-medium">{getDaysUntil(billingPeriodEnd)} days</span>
                    </div>
                    {isInGracePeriod && gracePeriodEnd && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Grace period ends:</span>
                        <span className="font-medium text-red-600">{formatDate(gracePeriodEnd)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {(isOverLimit || isInGracePeriod) && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Zap className="h-4 w-4" />
                    <AlertTitle className="text-sm">Action Required</AlertTitle>
                    <AlertDescription className="text-sm">
                      {isInGracePeriod
                        ? "Upgrade your plan to avoid service suspension."
                        : "Upgrade your plan to commission new assessments."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
                <Link href="/subscription/manage">
                  <Button>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Plan
                  </Button>
                </Link>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {(isOverLimit || isInGracePeriod) && (
            <Link href="/subscription/manage">
              <Button size="sm">
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Alert>
  )
}
