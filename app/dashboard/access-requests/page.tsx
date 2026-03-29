"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type AccessRequest = {
  id: string
  organizationName: string
  requestedByName: string
  requestedAt: string
  assessmentName: string
  requestMessage: string
  expiresAt: string
  status: string
}

export default function AccessRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/user/access-requests")
        if (res.ok) {
          const data = await res.json()
          const incoming = (data.incoming || data || []).map((r: any) => ({
            id: r.id,
            organizationName: r.organization_name || r.organizationName || "Unknown",
            requestedByName: r.requested_by_name || r.requestedByName || "Unknown",
            requestedAt: r.requested_at || r.requestedAt || r.created_at,
            assessmentName: r.assessment_name || r.assessmentName || "Assessment",
            requestMessage: r.request_message || r.requestMessage || "",
            expiresAt: r.expires_at || r.expiresAt,
            status: r.status || "PENDING",
          }))
          setRequests(incoming)
        }
      } catch {}
    }
    fetchRequests()
  }, [user])

  const handleRequestClick = (request: AccessRequest) => {
    setSelectedRequest(request)
    setShowDialog(true)
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    setRequests((prev) => prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: "APPROVED" } : r)))
    setShowDialog(false)
    setSelectedRequest(null)
  }

  const handleDeny = async () => {
    if (!selectedRequest) return

    setRequests((prev) => prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: "DENIED" } : r)))
    setShowDialog(false)
    setSelectedRequest(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "DENIED":
        return <Badge variant="destructive">Denied</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assessment Access Requests</h1>
        <p className="text-muted-foreground">Manage requests from employers to access your assessment data</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No access requests at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{request.organizationName}</CardTitle>
                    <CardDescription>
                      Requested by {request.requestedByName} • {new Date(request.requestedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Assessment:</span> {request.assessmentName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Expires:</span> {new Date(request.expiresAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{request.requestMessage}</p>
                  {request.status === "PENDING" && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => handleRequestClick(request)}>
                        Review Request
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Request Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Access Request</DialogTitle>
            <DialogDescription>Decide whether to grant access to your assessment data</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Organization:</span>
                  <p>{selectedRequest.organizationName}</p>
                </div>
                <div>
                  <span className="font-medium">Requested by:</span>
                  <p>{selectedRequest.requestedByName}</p>
                </div>
                <div>
                  <span className="font-medium">Assessment:</span>
                  <p>{selectedRequest.assessmentName}</p>
                </div>
                <div>
                  <span className="font-medium">Expires:</span>
                  <p>{new Date(selectedRequest.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <span className="font-medium text-sm">Request Message:</span>
                <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded">
                  {selectedRequest.requestMessage}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">What will be shared:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete assessment results and scores</li>
                  <li>• Referee feedback and evaluations</li>
                  <li>• Assessment completion date and status</li>
                  <li>• Coachability profile and recommendations</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleDeny}>
              Deny Access
            </Button>
            <Button onClick={handleApprove}>Approve Access</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
