"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, Eye, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface ShareReportDialogProps {
  assessmentId: string
  assessmentName: string
  participantName: string
}

interface ShareRecord {
  id: string
  organization_name: string | null
  shared_with_name: string | null
  shared_with_email: string | null
  access_level: string
  granted_at: string
  expires_at: string | null
  revoked_at: string | null
}

export function ShareReportDialog({ assessmentId, assessmentName, participantName }: ShareReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sharingHistory, setSharingHistory] = useState<ShareRecord[]>([])
  const [formData, setFormData] = useState({
    organizationName: "", contactPerson: "", contactEmail: "",
    accessLevel: "full", expirationDays: "30", personalMessage: "",
  })
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen && assessmentId) fetchHistory()
  }, [isOpen, assessmentId])

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/sharing`, {
        headers: { "x-user-id": user?.id || "" },
      })
      if (res.ok) {
        const data = await res.json()
        setSharingHistory(data.history || [])
      }
    } catch {}
  }

  const handleShare = async () => {
    if (!formData.contactEmail || !formData.organizationName) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/sharing`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Report Shared", description: `Shared with ${formData.organizationName}.` })
      setFormData({ organizationName: "", contactPerson: "", contactEmail: "", accessLevel: "full", expirationDays: "30", personalMessage: "" })
      fetchHistory()
    } catch {
      toast({ title: "Error", description: "Failed to share report.", variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  const handleRevoke = async (shareId: string) => {
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/sharing`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify({ shareId }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Access Revoked" })
      fetchHistory()
    } catch {
      toast({ title: "Error", description: "Failed to revoke.", variant: "destructive" })
    }
  }

  const getStatus = (r: ShareRecord) => {
    if (r.revoked_at) return <Badge variant="destructive">Revoked</Badge>
    if (r.expires_at && new Date(r.expires_at) < new Date()) return <Badge variant="secondary">Expired</Badge>
    return <Badge className="bg-green-100 text-green-800">Active</Badge>
  }

  const isActive = (r: ShareRecord) => !r.revoked_at && (!r.expires_at || new Date(r.expires_at) >= new Date())

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-2" />Share Report</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Assessment Report</DialogTitle>
          <DialogDescription>Share your &ldquo;{assessmentName}&rdquo; with an organization or employer</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">Share Report</TabsTrigger>
            <TabsTrigger value="history">Sharing History</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Name *</Label>
                  <Input placeholder="e.g., Acme Corp" value={formData.organizationName} onChange={e => setFormData({ ...formData, organizationName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person *</Label>
                  <Input placeholder="e.g., Jane Smith" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contact Email *</Label>
                <Input type="email" placeholder="e.g., jane@acme.com" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Access Level</Label>
                  <Select value={formData.accessLevel} onValueChange={v => setFormData({ ...formData, accessLevel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Access</SelectItem>
                      <SelectItem value="summary">Summary Only</SelectItem>
                      <SelectItem value="scores">Scores Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Access Duration</Label>
                  <Select value={formData.expirationDays} onValueChange={v => setFormData({ ...formData, expirationDays: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Personal Message (Optional)</Label>
                <Textarea placeholder="Add a note..." value={formData.personalMessage} onChange={e => setFormData({ ...formData, personalMessage: e.target.value })} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleShare} disabled={!formData.organizationName || !formData.contactEmail || isLoading}>
                {isLoading ? "Sharing..." : "Share Report"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {sharingHistory.length === 0 ? (
              <div className="text-center py-8"><p className="text-muted-foreground">No reports shared yet</p></div>
            ) : (
              sharingHistory.map(share => (
                <Card key={share.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{share.organization_name || "Individual"}</CardTitle>
                        <CardDescription>{share.shared_with_name || share.shared_with_email || "—"}</CardDescription>
                      </div>
                      {getStatus(share)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><p className="text-muted-foreground">Access Level</p><p className="font-medium capitalize">{share.access_level}</p></div>
                      <div><p className="text-muted-foreground">Shared</p><p className="font-medium">{new Date(share.granted_at).toLocaleDateString()}</p></div>
                      <div><p className="text-muted-foreground">Expires</p><p className="font-medium">{share.expires_at ? new Date(share.expires_at).toLocaleDateString() : "Never"}</p></div>
                    </div>
                    {isActive(share) && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => handleRevoke(share.id)}>
                        <Trash2 className="h-3 w-3 mr-1" />Revoke Access
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
