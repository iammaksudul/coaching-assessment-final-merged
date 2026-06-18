"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, CheckCircle, Mail, User, Calendar, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface CompletionNotification {
  id: string
  type: "REFEREE_COMPLETED" | "ASSESSMENT_COMPLETED" | "ALL_REFEREES_COMPLETED"
  assessment_id: string
  assessment_name: string
  referee_name?: string
  referee_email?: string
  completed_at: string
  read: boolean
  candidate_name?: string
  organization_name?: string
}

interface CompletionNotificationSystemProps {
  notifications: CompletionNotification[]
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  userRole: "CANDIDATE" | "EMPLOYER" | "ADMIN"
}

export function CompletionNotificationSystem({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  userRole,
}: CompletionNotificationSystemProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length)
  }, [notifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "REFEREE_COMPLETED":
        return <User className="w-4 h-4 text-blue-600" />
      case "ASSESSMENT_COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "ALL_REFEREES_COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getNotificationTitle = (notification: CompletionNotification) => {
    switch (notification.type) {
      case "REFEREE_COMPLETED":
        return `${notification.referee_name} completed their feedback`
      case "ASSESSMENT_COMPLETED":
        return userRole === "EMPLOYER"
          ? `${notification.candidate_name} completed their assessment`
          : "Your assessment is complete"
      case "ALL_REFEREES_COMPLETED":
        return "All referees have completed their feedback"
      default:
        return "Assessment update"
    }
  }

  const getNotificationDescription = (notification: CompletionNotification) => {
    switch (notification.type) {
      case "REFEREE_COMPLETED":
        return `Referee feedback has been submitted for "${notification.assessment_name}"`
      case "ASSESSMENT_COMPLETED":
        return `The assessment "${notification.assessment_name}" has been completed and the report is ready`
      case "ALL_REFEREES_COMPLETED":
        return `All referee feedback has been collected for "${notification.assessment_name}". Your report is being generated.`
      default:
        return notification.assessment_name
    }
  }

  const getNotificationBadge = (notification: CompletionNotification) => {
    if (!notification.read) {
      return <Badge className="bg-blue-100 text-blue-800">New</Badge>
    }
    return null
  }

  const handleNotificationClick = (notification: CompletionNotification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Assessment Notifications
              {unreadCount > 0 && <Badge className="bg-red-100 text-red-800 ml-2">{unreadCount} new</Badge>}
            </CardTitle>
            <CardDescription>Updates on your assessments and referee feedback</CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Alert for Unread Notifications */}
        {unreadCount > 0 && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Bell className="h-4 w-4" />
            <AlertTitle>
              You have {unreadCount} new notification{unreadCount === 1 ? "" : "s"}
            </AlertTitle>
            <AlertDescription>
              {notifications.filter((n) => !n.read && n.type === "ASSESSMENT_COMPLETED").length > 0 &&
                "Some assessments are ready for review. "}
              {notifications.filter((n) => !n.read && n.type === "REFEREE_COMPLETED").length > 0 &&
                "New referee feedback has been submitted."}
            </AlertDescription>
          </Alert>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications
            .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
            .map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  notification.read ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100 border-blue-200"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{getNotificationTitle(notification)}</h4>
                        {getNotificationBadge(notification)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{getNotificationDescription(notification)}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notification.completed_at), { addSuffix: true })}
                        </div>
                        {notification.organization_name && (
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>{notification.organization_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.type === "ASSESSMENT_COMPLETED" && (
                      <Link href="/dashboard?tab=reports">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Report
                        </Button>
                      </Link>
                    )}
                    {notification.type === "ALL_REFEREES_COMPLETED" && (
                      <Link href="/dashboard?tab=reports">
                        <Button size="sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          View Complete Report
                        </Button>
                      </Link>
                    )}
                    {notification.type === "REFEREE_COMPLETED" && (
                      <Link href="/dashboard/referees">
                        <Button size="sm" variant="outline">
                          <User className="w-3 h-3 mr-1" />
                          View Referees
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Email Notification Settings */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Email Notifications</h4>
              <p className="text-xs text-muted-foreground">
                You'll receive email notifications for important assessment updates
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Mail className="w-3 h-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
