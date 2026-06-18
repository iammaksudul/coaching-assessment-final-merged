"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Eye, Lock, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function TestSharedReportsPage() {
  const reportVariants = [
    {
      id: "full-access",
      title: "Full Access Report",
      description: "Complete report with all details, analysis, and recommendations",
      token: "full-access-token-123",
      icon: Eye,
      badge: "Full Access",
      badgeClass: "bg-blue-100 text-blue-800",
      features: [
        "Complete domain scores breakdown",
        "Detailed analysis and insights",
        "Coach-client fit profile",
        "Personalized recommendations",
        "All assessment data",
      ],
    },
    {
      id: "summary-only",
      title: "Summary Only Report",
      description: "Key insights, overall scores, and main recommendations",
      token: "summary-only-token-456",
      icon: BarChart3,
      badge: "Summary Only",
      badgeClass: "bg-green-100 text-green-800",
      features: [
        "Overall coachability score",
        "Key strengths and development areas",
        "High-level coaching recommendations",
        "Success factors summary",
        "No detailed domain breakdown",
      ],
    },
    {
      id: "scores-only",
      title: "Scores Only Report",
      description: "Domain scores and basic information without detailed analysis",
      token: "scores-only-token-789",
      icon: Lock,
      badge: "Scores Only",
      badgeClass: "bg-yellow-100 text-yellow-800",
      features: [
        "Overall coachability score",
        "All 12 domain scores",
        "Self vs referee comparison",
        "Basic participant information",
        "No analysis or recommendations",
      ],
    },
  ]

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shared Report Access Levels</h1>
        <p className="text-muted-foreground">
          View the different access levels that organizations see when viewing shared reports
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {reportVariants.map((variant) => {
          const Icon = variant.icon
          return (
            <Card key={variant.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className="w-8 h-8 text-muted-foreground" />
                  <Badge className={variant.badgeClass}>{variant.badge}</Badge>
                </div>
                <CardTitle className="text-xl">{variant.title}</CardTitle>
                <CardDescription>{variant.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">What's Included:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {variant.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={`/shared-report/${variant.token}`} className="block">
                  <Button className="w-full" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View {variant.badge}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Shared Reports Work</CardTitle>
          <CardDescription>Understanding the organization-level view of shared assessments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">1. Individual Shares</h4>
              <p className="text-sm text-muted-foreground">
                Participants use the "Share Report" button to send their assessment to organizations with specific
                access levels and expiration dates.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">2. Organization Receives</h4>
              <p className="text-sm text-muted-foreground">
                Organizations receive an email with a secure link to view the shared report based on the access level
                granted by the participant.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-700">3. Controlled Access</h4>
              <p className="text-sm text-muted-foreground">
                Access is tracked, time-limited, and can be revoked by the participant at any time. Organizations see
                only what was explicitly shared.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
