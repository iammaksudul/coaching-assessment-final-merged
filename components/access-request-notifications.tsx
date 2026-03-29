"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { ScrollArea } from "@/components/ui/scroll-area"

type AccessRequest = {
  id: string
  organizationName: string
  requestedByName: string
  requestedAt: string
  assessmentName: string
  requestMessage: string
  expiresAt: string
}

export function AccessRequestNotifications() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/user/access-requests")
        if (res.ok) {
          const data = await res.json()
          const pending = (data.incoming || data || [])
            .filter((r: any) => (r.status || "").toUpperCase() === "PENDING")
            .map((r: any) => ({
              id: r.id,
              organizationName: r.organization_name || r.organizationName || "Unknown",
              requestedByName: r.requested_by_name || r.requestedByName || "Unknown",
              requestedAt: r.requested_at || r.created_at,
              assessmentName: r.assessment_name || r.assessmentName || "Assessment",
              requestMessage: r.request_message || r.requestMessage || "",
              expiresAt: r.expires_at,
            }))
          setRequests(pending)
        }
      } catch {}
      setLoading(false)
    }
    fetchRequests()
  }, [user])

  const handleRequestClick = (request: AccessRequest) => {
    setSelectedRequest(request)
    setShowDialog(true)
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    // In a real app, this would call the API
    console.log("Approving request:", selectedRequest.id)

    // Remove from pending requests
    setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
    setShowDialog(false)
    setSelectedRequest(null)

    // Show success message
    alert("Access approved! The employer can now view your assessment.")
  }

  const handleDeny = async () => {
    if (!selectedRequest) return

    // In a real app, this would call the API
    console.log("Denying request:", selectedRequest.id)

    // Remove from pending requests
    setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
    setShowDialog(false)
    setSelectedRequest(null)

    // Show success message
    alert("Access denied. The employer has been notified.")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {requests.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {requests.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Assessment Access Requests</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : requests.length > 0 ? (
            <>
              {requests.map((request) => (
                <DropdownMenuItem
                  key={request.id}
                  className="cursor-pointer flex flex-col items-start p-3 hover:bg-muted"
                  onClick={() => handleRequestClick(request)}
                >
                  <div className="font-medium text-sm">{request.organizationName}</div>
                  <div className="text-xs text-muted-foreground">Requested by: {request.requestedByName}</div>
                  <div className="text-xs text-muted-foreground mt-1">Assessment: {request.assessmentName}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.requestedAt).toLocaleDateString()} • Expires:{" "}
                    {new Date(request.expiresAt).toLocaleDateString()}
                  </div>
                  <div className="mt-2 text-xs font-medium text-blue-600">Click to review request</div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center">
                <span className="text-sm font-medium">View All Requests</span>
              </DropdownMenuItem>
            </>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No pending requests</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Request Review Dialog with Scrollable Content */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Assessment Access Request</DialogTitle>
            <DialogDescription>Review this request to share your assessment data</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 pb-4">
                {/* Request Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Organization:</span>
                    <p className="text-muted-foreground">{selectedRequest.organizationName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Requested by:</span>
                    <p className="text-muted-foreground">{selectedRequest.requestedByName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Assessment:</span>
                    <p className="text-muted-foreground">{selectedRequest.assessmentName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Expires:</span>
                    <p className="text-muted-foreground">{new Date(selectedRequest.expiresAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Request Message */}
                <div>
                  <span className="font-medium text-sm">Request Message:</span>
                  <div className="text-sm text-muted-foreground mt-2 p-4 bg-muted rounded-lg max-h-32 overflow-y-auto">
                    {selectedRequest.requestMessage}
                  </div>
                </div>

                {/* What Will Be Shared */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-3 text-blue-900">What will be shared:</h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Your complete assessment results and coachability scores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Referee feedback and evaluations (anonymized)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Assessment completion date and status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Coachability profile and development recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Gap analysis and improvement suggestions</span>
                    </li>
                  </ul>
                </div>

                {/* Your Rights */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-3 text-green-900">Your Rights & Protections:</h4>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>You can revoke access at any time after approval</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>Access will automatically expire in 90 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>You'll be notified when your data is accessed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>No personal contact information will be shared</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>Data usage is limited to hiring evaluation only</span>
                    </li>
                  </ul>
                </div>

                {/* Privacy Notice */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-sm mb-2 text-amber-900">Privacy Notice:</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    By approving this request, you consent to sharing your assessment data with{" "}
                    {selectedRequest.organizationName}
                    for hiring evaluation purposes only. The data will be handled according to their privacy policy and
                    applicable data protection laws. You maintain ownership of your data and can withdraw consent at any
                    time.
                  </p>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleDeny} className="flex-1">
              Deny Access
            </Button>
            <Button onClick={handleApprove} className="flex-1">
              Approve Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
