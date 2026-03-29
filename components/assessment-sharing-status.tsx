"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Share2, Eye, Building2, User, Shield, AlertTriangle, Clock, FileText } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface AccessLogEntry {
  id: string
  accessedAt: string
  accessedByName: string
  accessedByEmail: string
  accessedByRole: string
  accessType: "VIEW_REPORT" | "VIEW_SUMMARY"
  ipAddress: string
  userAgent: string
  sessionDuration?: number // in minutes
}

interface SharedAssessment {
  id: string
  organizationName: string
  sharedWith: string
  sharedAt: string
  expiresAt: string
  accessLevel: "FULL" | "SUMMARY_ONLY" | "SCORES_ONLY"
  lastAccessedAt?: string
  accessCount: number
  status: "ACTIVE" | "EXPIRED" | "REVOKED"
  accessLog?: AccessLogEntry[]
}

interface AssessmentSharingStatusProps {
  assessmentId: string
  assessmentName: string
}

export function AssessmentSharingStatus({ assessmentId, assessmentName }: AssessmentSharingStatusProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [accessLogOpen, setAccessLogOpen] = useState(false)
  const [selectedShare, setSelectedShare] = useState<SharedAssessment | null>(null)
  const [sharedAssessments, setSharedAssessments] = useState<SharedAssessment[]>([])
  const [loading, setLoading] = useState(false)
  const [accessLogLoading, setAccessLogLoading] = useState(false)

  // Generate access log data
  const generateAccessLog = (shareId: string, accessCount: number): AccessLogEntry[] => {
    const accessTypes: AccessLogEntry["accessType"][] = ["VIEW_REPORT", "VIEW_SUMMARY"]
    const users = [
      { name: "John Smith", email: "john.smith@example.com", role: "Hiring Manager" },
      { name: "Sarah Wilson", email: "sarah.wilson@techinnovations.com", role: "HR Director" },
      { name: "Michael Chen", email: "michael.chen@globalconsulting.com", role: "Senior Partner" },
      { name: "Emily Rodriguez", email: "emily.rodriguez@startuphub.com", role: "Talent Acquisition" },
      { name: "David Thompson", email: "david.thompson@enterprise.com", role: "VP of People" },
    ]

    const log: AccessLogEntry[] = []
    const now = new Date()

    for (let i = 0; i < accessCount; i++) {
      const daysAgo = Math.floor(Math.random() * 14) + 1 // 1-14 days ago
      const accessDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      const user = users[Math.floor(Math.random() * users.length)]

      log.push({
        id: `access-${shareId}-${i}`,
        accessedAt: accessDate.toISOString(),
        accessedByName: user.name,
        accessedByEmail: user.email,
        accessedByRole: user.role,
        accessType: accessTypes[Math.floor(Math.random() * accessTypes.length)],
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionDuration: Math.floor(Math.random() * 45) + 5, // 5-50 minutes
      })
    }

    return log.sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime())
  }

  const loadSharingData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/access-requests")
      if (res.ok) {
        const data = await res.json()
        const shares = (data.outgoing || data || []).map((r: any, i: number) => ({
          id: r.id || `share-${i}`,
          organizationName: r.organization_name || "Unknown",
          sharedWithName: r.requested_by_name || "Unknown",
          sharedWithEmail: r.candidate_email || "",
          permissionLevel: r.permission_level || "VIEW_REPORT",
          status: (r.status || "PENDING").toUpperCase(),
          sharedAt: r.created_at || r.requested_at,
          expiresAt: r.expires_at,
          accessCount: 0,
          lastAccessedAt: r.responded_at,
        }))
        setSharedAssessments(shares)
      }
    } catch {}
    setLoading(false)
  }

  const handleOpen = () => {
    setIsOpen(true)
    loadSharingData()
  }

  const handleViewAccessLog = (share: SharedAssessment) => {
    setSelectedShare(share)
    setAccessLogOpen(true)
  }

  const handleRevokeAccess = (shareId: string) => {
    setSharedAssessments((prev) =>
      prev.map((share) => (share.id === shareId ? { ...share, status: "REVOKED" as const } : share)),
    )
    alert("Access has been revoked successfully.")
  }

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case "FULL":
        return <Badge className="bg-blue-100 text-blue-800">Full Access</Badge>
      case "SUMMARY_ONLY":
        return <Badge className="bg-green-100 text-green-800">Summary Only</Badge>
      case "SCORES_ONLY":
        return <Badge className="bg-yellow-100 text-yellow-800">Scores Only</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "EXPIRED":
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>
      case "REVOKED":
        return <Badge className="bg-red-100 text-red-800">Revoked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAccessTypeIcon = (type: string) => {
    switch (type) {
      case "VIEW_REPORT":
        return <Eye className="w-4 h-4 text-blue-600" />
      case "VIEW_SUMMARY":
        return <FileText className="w-4 h-4 text-purple-600" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const getAccessTypeLabel = (type: string) => {
    switch (type) {
      case "VIEW_REPORT":
        return "Viewed Report"
      case "VIEW_SUMMARY":
        return "Viewed Summary"
      default:
        return type
    }
  }

  const activeShares = sharedAssessments.filter((s) => s.status === "ACTIVE").length
  const hasShares = sharedAssessments.length > 0

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="relative" onClick={handleOpen}>
            <Share2 className="w-4 h-4 mr-1" />
            Sharing
            {activeShares > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeShares}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Assessment Sharing Status
            </DialogTitle>
            <DialogDescription>Manage who has access to "{assessmentName}" and monitor usage</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : !hasShares ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Sharing Activity</h3>
                  <p className="text-muted-foreground">
                    This assessment hasn't been shared with any organizations yet.
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Shares</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeShares}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{sharedAssessments.length}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {sharedAssessments.reduce((sum, s) => sum + s.accessCount, 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {new Set(sharedAssessments.map((s) => s.organizationName)).size}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Shared Access List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Shared Access Details</h3>
                      <Badge variant="outline" className="text-sm">
                        {sharedAssessments.length} {sharedAssessments.length === 1 ? "share" : "shares"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {sharedAssessments.map((share, index) => (
                        <Card
                          key={share.id}
                          className={`border-l-4 ${
                            share.status === "ACTIVE"
                              ? "border-l-green-500"
                              : share.status === "EXPIRED"
                                ? "border-l-gray-400"
                                : "border-l-red-500"
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                  <Building2 className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{share.organizationName}</span>
                                  {getStatusBadge(share.status)}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-3 h-3" />
                                  <span>Shared with: {share.sharedWith}</span>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">{getAccessLevelBadge(share.accessLevel)}</div>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">Shared:</span>
                                <p className="text-foreground">
                                  {formatDistanceToNow(new Date(share.sharedAt), { addSuffix: true })}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Expires:</span>
                                <p className="text-foreground">
                                  {formatDistanceToNow(new Date(share.expiresAt), { addSuffix: true })}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Last Accessed:</span>
                                <p className="text-foreground">
                                  {share.lastAccessedAt
                                    ? formatDistanceToNow(new Date(share.lastAccessedAt), { addSuffix: true })
                                    : "Never"}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Views:</span>
                                <p className="text-foreground font-medium">{share.accessCount} times</p>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t">
                              {share.status === "ACTIVE" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRevokeAccess(share.id)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Shield className="w-3 h-3 mr-1" />
                                    Revoke Access
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleViewAccessLog(share)}>
                                    <Eye className="w-3 h-3 mr-1" />
                                    View Access Log ({share.accessCount})
                                  </Button>
                                </>
                              )}

                              {(share.status === "EXPIRED" || share.status === "REVOKED") && share.accessCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={() => handleViewAccessLog(share)}>
                                  <Eye className="w-3 h-3 mr-1" />
                                  View Access Log ({share.accessCount})
                                </Button>
                              )}

                              {share.status === "REVOKED" && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>Access has been revoked</span>
                                </div>
                              )}

                              {share.status === "EXPIRED" && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>Access has expired</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Access Log Dialog */}
      <Dialog open={accessLogOpen} onOpenChange={setAccessLogOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Access Log - {selectedShare?.organizationName}
            </DialogTitle>
            <DialogDescription>
              Detailed access history for "{assessmentName}" shared with {selectedShare?.sharedWith}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {accessLogLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-6">
                  {selectedShare?.accessLog && selectedShare.accessLog.length > 0 ? (
                    <div className="space-y-4">
                      {/* Summary */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Access Events</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{selectedShare.accessLog.length}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {new Set(selectedShare.accessLog.map((log) => log.accessedByEmail)).size}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {Math.round(
                                selectedShare.accessLog.reduce((sum, log) => sum + (log.sessionDuration || 0), 0) /
                                  selectedShare.accessLog.length,
                              )}
                              m
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Access Log Table */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Access History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>IP Address</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedShare.accessLog.map((log) => (
                                <TableRow key={log.id}>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="font-medium">
                                        {format(new Date(log.accessedAt), "MMM dd, yyyy")}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {format(new Date(log.accessedAt), "h:mm a")}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="font-medium">{log.accessedByName}</div>
                                      <div className="text-sm text-muted-foreground">{log.accessedByEmail}</div>
                                      <Badge variant="outline" className="text-xs">
                                        {log.accessedByRole}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {getAccessTypeIcon(log.accessType)}
                                      <span>{getAccessTypeLabel(log.accessType)}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-muted-foreground" />
                                      <span>{log.sessionDuration || 0}m</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{log.ipAddress}</code>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Access History</h3>
                      <p className="text-muted-foreground">This assessment hasn't been accessed yet.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setAccessLogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
