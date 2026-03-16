import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function DashboardPreview() {
  // Mock data for preview
  const assessments = [
    {
      id: "1",
      name: "Leadership Development Assessment",
      status: "COMPLETED",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-20T15:30:00Z",
    },
    {
      id: "2",
      name: "Q1 Performance Review",
      status: "IN_PROGRESS",
      created_at: "2024-01-25T09:00:00Z",
      updated_at: "2024-01-25T09:00:00Z",
    },
  ]

  const refereeInvitations = [
    { id: "1", status: "PENDING" },
    { id: "2", status: "COMPLETED" },
    { id: "3", status: "PENDING" },
  ]

  const completedAssessments = assessments.filter((a) => a.status === "COMPLETED").length
  const pendingReferees = refereeInvitations.filter((r) => r.status === "PENDING").length
  const completedReferees = refereeInvitations.filter((r) => r.status === "COMPLETED").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case "IN_PROGRESS":
        return <Badge variant="secondary">In Progress</Badge>
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDistanceToNow = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "today"
    if (diffInDays === 1) return "yesterday"
    return `${diffInDays} days ago`
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Preview User!</p>
      </div>

      {/* Getting Started - Now at the top */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to complete your coachability assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">1</div>
              <div>
                <h3 className="font-medium">Create & Name Your Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new assessment and give it a meaningful name (e.g., "Q1 Performance Review")
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">2</div>
              <div>
                <h3 className="font-medium">Complete Self-Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Answer questions about your coachability across 12 dimensions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">3</div>
              <div>
                <h3 className="font-medium">Select Referees</h3>
                <p className="text-sm text-muted-foreground">
                  Choose at least 2 people from your referee pool (or add new ones) for this assessment
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">
                {completedReferees >= 2 ? "✓" : "4"}
              </div>
              <div>
                <h3 className="font-medium">View Your Report</h3>
                <p className="text-sm text-muted-foreground">
                  Once referees complete their assessments, view your comprehensive report
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Assessments - Central focus */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Self-Assessments</CardTitle>
            <CardDescription>Manage your coachability assessments</CardDescription>
          </div>
          <Button>Create New Assessment</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">{assessment.name || "Untitled Assessment"}</TableCell>
                  <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(assessment.created_at))}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(assessment.updated_at || assessment.created_at))}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {assessment.status === "COMPLETED" ? (
                        <Button variant="outline" size="sm">
                          View Report
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          Continue
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        Manage Referees
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stats Overview - Secondary position */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssessments}</div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Referees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReferees}</div>
            <p className="text-xs text-muted-foreground">Awaiting responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referee Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refereeInvitations.length}</div>
            <p className="text-xs text-muted-foreground">Total referees</p>
            <div className="mt-4">
              <Button variant="outline" size="sm">
                Manage Pool
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
