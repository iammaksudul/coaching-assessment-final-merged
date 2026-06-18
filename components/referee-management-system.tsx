"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Clock, CheckCircle, AlertCircle, Mail, UserCheck, Calendar, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Referee {
  id: string
  name: string
  email: string
  relationship: string
  status: "PENDING" | "COMPLETED" | "EXPIRED"
  invited_at: string
  completed_at?: string
  expires_at?: string
  survey_token: string
}

interface RefereeManagementSystemProps {
  assessmentId: string
  assessmentName: string
  candidateName: string
  referees?: Referee[]
  onRefereeUpdate?: () => void
}

export function RefereeManagementSystem({
  assessmentId,
  assessmentName,
  candidateName,
  referees = [],
  onRefereeUpdate,
}: RefereeManagementSystemProps) {
  const { toast } = useToast()
  const [reminderDialog, setReminderDialog] = useState<{
    open: boolean
    referee: Referee | null
  }>({
    open: false,
    referee: null,
  })
  const [customMessage, setCustomMessage] = useState("")
  const [sendingReminder, setSendingReminder] = useState(false)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { variant: "default" as const, className: "bg-green-600 text-white", label: "Completed" },
      PENDING: { variant: "secondary" as const, className: "bg-amber-100 text-amber-800", label: "Pending" },
      EXPIRED: { variant: "outline" as const, className: "text-gray-600 border-gray-300", label: "Expired" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "outline" as const,
      className: "text-gray-600 border-gray-300",
      label: status,
    }

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "PENDING":
        return <Clock className="w-4 h-4 text-amber-600" />
      case "EXPIRED":
        return <AlertCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const handleSendReminder = (referee: Referee) => {
    setReminderDialog({
      open: true,
      referee,
    })
    setCustomMessage("")
  }

  const sendReminderEmail = async () => {
    if (!reminderDialog.referee) return

    setSendingReminder(true)

    try {
      const response = await fetch("/api/referees/send-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refereeId: reminderDialog.referee.id,
          refereeEmail: reminderDialog.referee.email,
          refereeName: reminderDialog.referee.name,
          assessmentName,
          candidateName,
          customMessage: customMessage.trim() || undefined,
          surveyToken: reminderDialog.referee.survey_token,
        }),
      })

      if (response.ok) {
        toast({
          title: "Reminder sent",
          description: `Email reminder sent to ${reminderDialog.referee.name}`,
        })

        setReminderDialog({ open: false, referee: null })
        setCustomMessage("")

        // Trigger refresh if callback provided
        if (onRefereeUpdate) {
          onRefereeUpdate()
        }
      } else {
        throw new Error("Failed to send reminder")
      }
    } catch (error) {
      console.error("Error sending reminder:", error)
      toast({
        title: "Error",
        description: "Failed to send reminder email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingReminder(false)
    }
  }

  const pendingReferees = referees.filter((r) => r.status === "PENDING")
  const completedReferees = referees.filter((r) => r.status === "COMPLETED")
  const expiredReferees = referees.filter((r) => r.status === "EXPIRED")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referee Management</h1>
        <p className="text-muted-foreground">
          Manage referees for <span className="font-medium">{assessmentName}</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referees.length}</div>
            <p className="text-xs text-muted-foreground">Invited referees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedReferees.length}</div>
            <p className="text-xs text-muted-foreground">Responses received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingReferees.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{expiredReferees.length}</div>
            <p className="text-xs text-muted-foreground">Past deadline</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {pendingReferees.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {pendingReferees.length} referee{pendingReferees.length > 1 ? "s" : ""} haven't completed their assessment
            yet. You can send reminder emails to encourage completion.
          </AlertDescription>
        </Alert>
      )}

      {/* Referees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referee Status</CardTitle>
          <CardDescription>Track the progress of referee invitations and responses</CardDescription>
        </CardHeader>
        <CardContent>
          {referees.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No referees have been invited yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Referee Details</TableHead>
                  <TableHead className="w-[150px]">Relationship</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[140px]">Invited</TableHead>
                  <TableHead className="w-[140px]">Response</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referees.map((referee) => (
                  <TableRow key={referee.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold">{referee.name}</p>
                        <p className="text-sm text-muted-foreground">{referee.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {referee.relationship}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(referee.status)}
                        {getStatusBadge(referee.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(referee.invited_at)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {referee.status === "COMPLETED" && referee.completed_at && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          {formatDate(referee.completed_at)}
                        </div>
                      )}
                      {referee.status === "PENDING" && referee.expires_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className={isExpired(referee.expires_at) ? "text-red-600" : "text-muted-foreground"}>
                            Expires {formatDate(referee.expires_at)}
                          </span>
                        </div>
                      )}
                      {referee.status === "EXPIRED" && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          Expired
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {referee.status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendReminder(referee)}
                            className="flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            Send Reminder
                          </Button>
                        )}
                        {referee.status === "COMPLETED" && (
                          <Badge variant="outline" className="px-3 py-1">
                            Complete
                          </Badge>
                        )}
                        {referee.status === "EXPIRED" && (
                          <Badge variant="destructive" className="px-3 py-1">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialog.open} onOpenChange={(open) => setReminderDialog({ open, referee: null })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Reminder Email</DialogTitle>
            <DialogDescription>
              Send a reminder email to {reminderDialog.referee?.name} to complete their referee assessment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to encourage completion..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                A standard reminder will be sent. Your custom message will be included if provided.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderDialog({ open: false, referee: null })}>
              Cancel
            </Button>
            <Button onClick={sendReminderEmail} disabled={sendingReminder} className="flex items-center gap-2">
              {sendingReminder ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  Send Reminder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
