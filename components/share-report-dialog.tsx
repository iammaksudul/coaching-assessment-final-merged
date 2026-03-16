"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, Eye, Trash2, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareReportDialogProps {
  assessmentId: string
  assessmentName: string
  participantName: string
}

export function ShareReportDialog({ assessmentId, assessmentName, participantName }: ShareReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    organizationName: "",
    contactPerson: "",
    contactEmail: "",
    accessLevel: "full",
    expirationDays: "30",
    personalMessage: "",
  })
  const { toast } = useToast()

  // Mock sharing history data
  const [sharingHistory] = useState([
    {
      id: "1",
      organizationName: "TechCorp Solutions",
      contactPerson: "Sarah Wilson",
      contactEmail: "sarah@techcorp.com",
      accessLevel: "full",
      sharedDate: "2024-01-15",
      expirationDate: "2024-02-14",
      status: "active",
      viewCount: 3,
      lastViewed: "2024-01-20",
    },
    {
      id: "2",
      organizationName: "Innovation Labs",
      contactPerson: "Mike Chen",
      contactEmail: "mike@innovationlabs.com",
      accessLevel: "summary",
      sharedDate: "2024-01-10",
      expirationDate: "2024-01-17",
      status: "expired",
      viewCount: 1,
      lastViewed: "2024-01-12",
    },
  ])

  const handleShare = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Report Shared Successfully",
        description: `Your assessment report has been shared with ${formData.organizationName}. They will receive an email with access instructions.`,
      })

      // Reset form
      setFormData({
        organizationName: "",
        contactPerson: "",
        contactEmail: "",
        accessLevel: "full",
        expirationDays: "30",
        personalMessage: "",
      })

      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Sharing Failed",
        description: "There was an error sharing your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevoke = async (shareId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Access Revoked",
        description: "The organization can no longer access your report.",
      })
    } catch (error) {
      toast({
        title: "Revoke Failed",
        description: "There was an error revoking access. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "expired":
        return <Badge variant="secondary">Expired</Badge>
      case "revoked":
        return <Badge variant="destructive">Revoked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAccessLevelDescription = (level: string) => {
    switch (level) {
      case "full":
        return "Complete report with all details, recommendations, and analysis"
      case "summary":
        return "Key insights, overall scores, and main recommendations only"
      case "scores":
        return "Domain scores and basic information without detailed analysis"
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Assessment Report</DialogTitle>
          <DialogDescription>Share your "{assessmentName}" with an organization or employer</DialogDescription>
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
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    placeholder="e.g., TechCorp Solutions"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    placeholder="e.g., Sarah Wilson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="e.g., sarah@techcorp.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Select
                    value={formData.accessLevel}
                    onValueChange={(value) => setFormData({ ...formData, accessLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Access</SelectItem>
                      <SelectItem value="summary">Summary Only</SelectItem>
                      <SelectItem value="scores">Scores Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{getAccessLevelDescription(formData.accessLevel)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expirationDays">Access Duration</Label>
                  <Select
                    value={formData.expirationDays}
                    onValueChange={(value) => setFormData({ ...formData, expirationDays: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                <Label htmlFor="personalMessage">Personal Message (Optional)</Label>
                <Textarea
                  id="personalMessage"
                  placeholder="Add a personal note to accompany your report..."
                  value={formData.personalMessage}
                  onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={!formData.organizationName || !formData.contactPerson || !formData.contactEmail || isLoading}
              >
                {isLoading ? "Sharing..." : "Share Report"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-4">
              {sharingHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reports shared yet</p>
                </div>
              ) : (
                sharingHistory.map((share) => (
                  <Card key={share.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{share.organizationName}</CardTitle>
                          <CardDescription>
                            {share.contactPerson} • {share.contactEmail}
                          </CardDescription>
                        </div>
                        {getStatusBadge(share.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Access Level</p>
                          <p className="font-medium capitalize">{share.accessLevel}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Shared Date</p>
                          <p className="font-medium">{new Date(share.sharedDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expires</p>
                          <p className="font-medium">{new Date(share.expirationDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Views</p>
                          <p className="font-medium flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {share.viewCount}{" "}
                            {share.lastViewed && `• Last: ${new Date(share.lastViewed).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>

                      {share.status === "active" && (
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Shared Report
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRevoke(share.id)}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Revoke Access
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
