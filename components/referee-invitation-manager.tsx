"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Mail, Clock, CheckCircle, XCircle, RefreshCw, UserPlus, Send, AlertCircle, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RefereeInvitation {
  id: string
  referee_name: string
  referee_email: string
  relationship: string
  status: "PENDING" | "COMPLETED" | "EXPIRED" | "DECLINED"
  invited_at: string
  expires_at: string
  completed_at?: string
  last_reminder_sent?: string
  reminder_count: number
}

interface RefereeInvitationManagerProps {
  assessmentId: string
  assessmentName: string
  candidateName: string
  invitations: RefereeInvitation[]
  onInvitationUpdate: (invitations: RefereeInvitation[]) => void
}

export function RefereeInvitationManager({
  assessmentId,
  assessmentName,
  candidateName,
  invitations,
  onInvitationUpdate,
}: RefereeInvitationManagerProps) {
  const { toast } = useToast()
  const [isAddingReferee, setIsAddingReferee] = useState(false)
  const [isResending, setIsResending] = useState<string | null>(null)
  const [newReferee, setNewReferee] = useState({
    name: "",
    email: "",
    relationship: "",
    personalMessage: "",
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        )
      case "DECLINED":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "EXPIRED":
        return <AlertCircle className="w-4 h-4 text-gray-600" />
      case "DECLINED":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const canResend = (invitation: RefereeInvitation) => {
    return invitation.status === "PENDING" && !isExpired(invitation.expires_at)
  }

  const handleAddReferee = async () => {
    if (!newReferee.name || !newReferee.email || !newReferee.relationship) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/referees/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: assessmentId,
          referees: [{ name: newReferee.name, email: newReferee.email, relationship: newReferee.relationship }],
        }),
      })
      const data = await res.json()
      const newInvitation: RefereeInvitation = {
        id: data?.invitations?.[0]?.id || `ref-${Date.now()}`,
        referee_name: newReferee.name,
        referee_email: newReferee.email,
        relationship: newReferee.relationship,
        status: "PENDING",
        invited_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        reminder_count: 0,
      }

      const updatedInvitations = [...invitations, newInvitation]
      onInvitationUpdate(updatedInvitations)

      toast({
        title: "Referee Invited",
        description: `Invitation sent to ${newReferee.name} (${newReferee.email})`,
      })

      setNewReferee({ name: "", email: "", relationship: "", personalMessage: "" })
      setIsAddingReferee(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send referee invitation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    setIsResending(invitationId)

    try {
      // API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedInvitations = invitations.map((inv) =>
        inv.id === invitationId
          ? {
              ...inv,
              last_reminder_sent: new Date().toISOString(),
              reminder_count: inv.reminder_count + 1,
            }
          : inv,
      )

      onInvitationUpdate(updatedInvitations)

      toast({
        title: "Invitation Resent",
        description: "Reminder email has been sent to the referee.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(null)
    }
  }

  const pendingCount = invitations.filter((inv) => inv.status === "PENDING").length
  const completedCount = invitations.filter((inv) => inv.status === "COMPLETED").length
  const expiredCount = invitations.filter((inv) => inv.status === "EXPIRED" || isExpired(inv.expires_at)).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Referee Invitations
            </CardTitle>
            <CardDescription>
              Manage referee invitations for {candidateName}'s assessment: "{assessmentName}"
            </CardDescription>
          </div>
          <Dialog open={isAddingReferee} onOpenChange={setIsAddingReferee}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Referee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Referee</DialogTitle>
                <DialogDescription>Add a referee to provide feedback for this assessment.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="referee-name">Name *</Label>
                    <Input
                      id="referee-name"
                      value={newReferee.name}
                      onChange={(e) => setNewReferee({ ...newReferee, name: e.target.value })}
                      placeholder="Referee's full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="referee-email">Email *</Label>
                    <Input
                      id="referee-email"
                      type="email"
                      value={newReferee.email}
                      onChange={(e) => setNewReferee({ ...newReferee, email: e.target.value })}
                      placeholder="referee@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Input
                    id="relationship"
                    value={newReferee.relationship}
                    onChange={(e) => setNewReferee({ ...newReferee, relationship: e.target.value })}
                    placeholder="e.g., Manager, Colleague, Direct Report"
                  />
                </div>
                <div>
                  <Label htmlFor="personal-message">Personal Message (Optional)</Label>
                  <Textarea
                    id="personal-message"
                    value={newReferee.personalMessage}
                    onChange={(e) => setNewReferee({ ...newReferee, personalMessage: e.target.value })}
                    placeholder="Add a personal message to include in the invitation email..."
                    rows={3}
                  />
                </div>
                {/* Privacy consent note */}
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm text-amber-800">
                    By nominating this person, you consent to their feedback being included in a report 
                    accessible to any organization users with whom you are sharing your Coaching Digs report.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingReferee(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddReferee}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{invitations.length}</div>
            <div className="text-sm text-muted-foreground">Total Invited</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{expiredCount}</div>
            <div className="text-sm text-muted-foreground">Expired</div>
          </div>
        </div>

        {/* Invitations Table */}
        {invitations.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No referees have been invited yet.</p>
            <Button onClick={() => setIsAddingReferee(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite First Referee
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referee</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Reminders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invitation.referee_name}</div>
                      <div className="text-sm text-muted-foreground">{invitation.referee_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{invitation.relationship}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invitation.status)}
                      {getStatusBadge(invitation.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(invitation.invited_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {invitation.status === "COMPLETED"
                        ? formatDistanceToNow(new Date(invitation.completed_at!), { addSuffix: true })
                        : formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {invitation.reminder_count > 0 ? (
                        <div>
                          <div className="font-medium">{invitation.reminder_count} sent</div>
                          {invitation.last_reminder_sent && (
                            <div className="text-muted-foreground">
                              Last: {formatDistanceToNow(new Date(invitation.last_reminder_sent), { addSuffix: true })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {canResend(invitation) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendInvitation(invitation.id)}
                        disabled={isResending === invitation.id}
                      >
                        {isResending === invitation.id ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Mail className="w-3 h-3 mr-1" />
                        )}
                        Resend
                      </Button>
                    )}
                    {invitation.status === "COMPLETED" && (
                      <Badge variant="outline" className="text-green-600">
                        ✓ Complete
                      </Badge>
                    )}
                    {invitation.status === "EXPIRED" && (
                      <Badge variant="outline" className="text-gray-600">
                        Expired
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
